'use strict'

const Order = use('App/Models/Order')
const Product = use('App/Models/Product')

class OrderController {
  formatCurrency (locales, currency, fractionDigits, number) {
    return new Intl.NumberFormat(locales, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: fractionDigits
    }).format(number || 0)
  }

  async index ({ view }) {
    const orders = await Order.query()
      .with('client')
      .orderBy('id', 'desc')
      .fetch()

    return view.render('admin.orders', { orders: orders.toJSON() })
  }

  async details ({ params, view }) {
    const order = await Order.findOrFail(params.id)
    const client = await order.client().fetch()
    const orderProducts = await order.products().fetch()

    const products = []
    for (const item of orderProducts.toJSON()) {
      const prod = await Product.find(item.product_id)
      if (prod) {
        products.push({
          id: prod.id,
          order_id: item.order_id,
          product_id: item.product_id,
          name: prod.name,
          price: prod.price,
          quantity: item.quantity,
          total: this.formatCurrency(
            'es-CO',
            'COP',
            0,
            parseInt(prod.price, 10) * parseInt(item.quantity, 10)
          )
        })
      }
    }

    return view.render('admin.order-detail', {
      order: order.toJSON(),
      client: client ? client.toJSON() : {},
      products: products
    })
  }
}

module.exports = OrderController
