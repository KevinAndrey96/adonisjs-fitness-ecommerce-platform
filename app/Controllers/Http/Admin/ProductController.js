'use strict'

const Product = use('App/Models/Product')
const Category = use('App/Models/Category')
const Helpers = use('Helpers')
const { formatCop } = use('App/Services/Money')

class ProductController {
  async index ({ view }) {
    const products = await Product.all()
    const formatted = products.toJSON().map((prod) => ({
      ...prod,
      formatted_price: formatCop(prod.price)
    }))

    return view.render('admin.products', { products: formatted })
  }

  async new ({ view }) {
    const categories = await Category.all()
    return view.render('admin.add-product', { categories: categories.toJSON() })
  }

  async create ({ request, response, session }) {
    const data = request.only([
      'name',
      'code',
      'category',
      'price',
      'short_description',
      'long_description',
      'father'
    ])

    const product = await Product.create(data)

    const photo = request.file('image', {
      types: ['image'],
      size: '10mb',
      extnames: ['png', 'gif', 'jpg', 'jpeg', 'PNG', 'GIF', 'JPG', 'JPEG']
    })

    if (photo) {
      const filename = `${product.id}.png`
      await photo.move(Helpers.publicPath('uploads/products'), {
        name: filename,
        overwrite: true
      })

      if (photo.moved()) {
        product.image = `/uploads/products/${filename}`
        await product.save()
      }
    }

    session.flash({ notification: 'Producto agregado correctamente' })
    return response.redirect('/admin/products')
  }

  async edit ({ params, view }) {
    const product = await Product.find(params.id)
    const categories = await Category.all()
    return view.render('admin.edit-product', {
      product: product ? product.toJSON() : {},
      categories: categories.toJSON()
    })
  }

  async update ({ request, response, session }) {
    const id = request.input('id')
    const product = await Product.findOrFail(id)

    product.name = request.input('name')
    product.code = request.input('code')
    product.category = request.input('category')
    product.price = request.input('price')
    product.short_description = request.input('short_description')
    product.long_description = request.input('long_description')
    product.father = request.input('father') || product.father

    const photo = request.file('image', {
      types: ['image'],
      size: '10mb',
      extnames: ['png', 'gif', 'jpg', 'jpeg', 'PNG', 'GIF', 'JPG', 'JPEG']
    })

    if (photo) {
      const filename = `${product.id}.png`
      await photo.move(Helpers.publicPath('uploads/products'), {
        name: filename,
        overwrite: true
      })

      if (photo.moved()) {
        product.image = `/uploads/products/${filename}`
      }
    }

    await product.save()

    session.flash({ notification: 'Producto actualizado correctamente' })
    return response.redirect('/admin/products')
  }

  async destroy ({ request, response, session }) {
    const id = request.input('id')
    const product = await Product.find(id)
    if (product) {
      await product.delete()
      session.flash({ notification: 'Producto eliminado correctamente' })
    }
    return response.redirect('/admin/products')
  }
}

module.exports = ProductController
