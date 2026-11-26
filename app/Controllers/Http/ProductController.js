'use strict'

const axios = require('axios')
const FormData = require('form-data')

const Product = use('App/Models/Product')
const Client = use('App/Models/Client')
const Category = use('App/Models/Category')
const Order = use('App/Models/Order')
const OrderProduct = use('App/Models/OrderProduct')
const Env = use('Env')
const Logger = use('Logger')
const { formatCop, withCopPrices } = use('App/Services/Money')
const { resolveCartLines } = use('App/Services/Cart')
const { customerFromRequest } = use('App/Services/Customer')

const GATEWAY_TIMEOUT_MS = 10000

const SORTS = {
  pricedesc: ['price', 'desc'],
  priceasc: ['price', 'asc'],
  alphadesc: ['name', 'desc'],
  alphaasc: ['name', 'asc']
}

const PRICE_RANGES = {
  1: [0, 50000],
  2: [50000, 150000],
  3: [150000, 300000]
}

function safeDecode (value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

class ProductController {
  async index ({ params, view }) {
    const product = await Product.findOrFail(params.id)

    const [relateds, categories] = await Promise.all([
      Product.query()
        .where('category', '=', product.category)
        .where('id', '!=', product.id)
        .limit(6)
        .fetch(),
      Category.all()
    ])

    return view.render('product_detail', {
      product: { ...product.toJSON(), price: formatCop(product.price) },
      relateds: withCopPrices(relateds.toJSON()),
      categories: categories.toJSON()
    })
  }

  async bycat ({ params, view }) {
    const category = await Category.find(params.id)
    const categoryName = category ? category.name : ''

    const products = await Product.query()
      .where('father', '=', categoryName)
      .orWhere('category', 'LIKE', `%${categoryName}%`)
      .fetch()

    return this.renderList(view, products, category ? category.toJSON() : { name: 'Catálogo' })
  }

  async bycatmenu ({ params, view }) {
    const categoryName = safeDecode(params.name || '')

    const products = await Product.query()
      .where('category', 'LIKE', `%${categoryName}%`)
      .orWhere('father', 'LIKE', `%${categoryName}%`)
      .fetch()

    const category = await Category.query()
      .where('name', 'LIKE', `%${categoryName}%`)
      .first()

    return this.renderList(view, products, category ? category.toJSON() : { name: categoryName })
  }

  async search ({ request, view }) {
    const { sort, name, category, prices } = request.get()
    const [sortColumn, sortDirection] = SORTS[sort] || SORTS.alphaasc

    const query = Product.query().orderBy(sortColumn, sortDirection)

    if (name) {
      query.where('name', 'LIKE', `%${name}%`)
    }

    if (category) {
      query.where('category', '=', category)
    }

    const priceFilter = parseInt(prices, 10)
    if (PRICE_RANGES[priceFilter]) {
      query.whereBetween('price', PRICE_RANGES[priceFilter])
    } else if (priceFilter === 4) {
      query.where('price', '>', 300000)
    }

    const products = await query.fetch()

    return this.renderList(view, products, { name: name ? `Búsqueda: "${name}"` : 'Todos los productos' })
  }

  async get ({ request, response }) {
    const product = await Product.find(request.input('id'))
    if (!product) {
      return response.status(404).json({ error: 'Producto no encontrado' })
    }

    return response.json(product)
  }

  async cart ({ view }) {
    return view.render('cart')
  }

  async checkout ({ request, view }) {
    const rawCart = request.input('CART') || '{"cart":[]}'
    const lines = await resolveCartLines(rawCart)
    const total = lines.reduce((sum, line) => sum + line.total, 0)
    const shipping = 0

    return view.render('checkout', {
      cart: lines.map(({ product, quantity, total: lineTotal }) => ({
        id: product.id,
        name: product.name,
        code: product.code,
        quantity,
        price: lineTotal,
        prettyprice: formatCop(lineTotal)
      })),
      prices: { subtotal: total, shipping, total: total + shipping },
      prettyprices: {
        subtotal: formatCop(total),
        shipping: formatCop(shipping),
        total: formatCop(total + shipping)
      },
      originalcart: rawCart
    })
  }

  async pay ({ request, response, session }) {
    const customer = customerFromRequest(request)
    const lines = await resolveCartLines(request.input('CART'))

    if (!customer || lines.length === 0) {
      session.flash({ error: 'Completa tus datos de envío y agrega al menos un producto al carrito.' })

      return response.redirect('/cart')
    }

    const client = await this.upsertClient(customer)

    const order = await Order.create({
      client_id: client.id,
      status: 'pending',
      value: '0',
      gateway: 'Contraentrega'
    })

    let orderTotal = 0
    let summary = ''
    for (const line of lines) {
      await OrderProduct.create({ order_id: order.id, product_id: line.product.id, quantity: line.quantity })
      orderTotal += line.total
      summary += `${line.product.name} (x${line.quantity}) - `
    }

    order.value = String(orderTotal)
    await order.save()

    await this.sendConfirmation(customer.email, order, summary)

    if (Env.get('ENABLE_PAYMENT_GATEWAY') === 'true') {
      const formUrl = await this.registerGatewayPayment(order, summary)
      if (formUrl) {
        return response.redirect(formUrl)
      }
    }

    return response.redirect('/confirm')
  }

  async pay2 ({ view }) {
    return view.render('order_completed')
  }

  async renderList (view, products, category) {
    const categories = await Product.query().pluck('father').groupBy('father')

    return view.render('products_list', {
      products: withCopPrices(products.toJSON()),
      category,
      categories
    })
  }

  async upsertClient (customer) {
    const client = await Client.findBy('email', customer.email)
    if (!client) {
      return Client.create(customer)
    }

    client.merge(customer)
    await client.save()

    return client
  }

  async sendConfirmation (email, order, summary) {
    try {
      const Mail = use('Mail')
      await Mail.send('emails.order', { order: order.toJSON(), prods: summary }, (message) => {
        message
          .to(email)
          .from(Env.get('MAIL_FROM', 'no-reply@example.com'))
          .subject(`Confirmación de pedido #${order.id}`)
      })
    } catch (error) {
      Logger.warning('order confirmation email not sent: %s', error.message)
    }
  }

  async registerGatewayPayment (order, summary) {
    try {
      const form = new FormData()
      form.append('userName', Env.getOrFail('GATEWAY_USERNAME'))
      form.append('password', Env.getOrFail('GATEWAY_PASSWORD'))
      form.append('orderNumber', String(order.id))
      form.append('amount', `${order.value}00`)
      form.append('returnUrl', `${Env.get('APP_URL', 'http://127.0.0.1:3333')}/confirm`)
      form.append('description', summary)

      const { data } = await axios.post(
        Env.get('GATEWAY_URL', 'https://ecouat.credibanco.com/payment/rest/register.do'),
        form,
        { headers: form.getHeaders(), timeout: GATEWAY_TIMEOUT_MS }
      )
      if (!data || !data.orderId || !data.formUrl) {
        Logger.warning('payment gateway registration rejected for order %s', order.id)

        return null
      }

      order.gateway = data.orderId
      await order.save()

      return data.formUrl
    } catch (error) {
      Logger.warning('payment gateway registration: %s', error.message)

      return null
    }
  }
}

module.exports = ProductController
