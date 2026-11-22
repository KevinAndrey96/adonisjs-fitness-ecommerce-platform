'use strict'

const Category = use('App/Models/Category')
const Helpers = use('Helpers')

class CategoryController {
  async index ({ view }) {
    const categories = await Category.all()
    return view.render('admin.categories', { categories: categories.toJSON() })
  }

  async new ({ view }) {
    return view.render('admin.add-category')
  }

  async create ({ request, response, session }) {
    const data = request.only(['name'])
    const category = await Category.create(data)

    const photo = request.file('image', {
      types: ['image'],
      size: '10mb',
      extnames: ['png', 'gif', 'jpg', 'jpeg', 'PNG', 'GIF', 'JPG', 'JPEG']
    })

    if (photo) {
      const filename = `${category.id}.png`
      await photo.move(Helpers.publicPath('uploads/categories'), {
        name: filename,
        overwrite: true
      })

      if (photo.moved()) {
        category.image = `/uploads/categories/${filename}`
        await category.save()
      }
    }

    session.flash({ notification: 'Categoría agregada correctamente' })
    return response.redirect('/admin/categories')
  }

  async edit ({ params, view }) {
    const category = await Category.findOrFail(params.id)
    return view.render('admin.edit-category', { category: category.toJSON() })
  }

  async update ({ request, response, session }) {
    const id = request.input('id')
    const category = await Category.findOrFail(id)
    category.name = request.input('name')

    const photo = request.file('image', {
      types: ['image'],
      size: '10mb',
      extnames: ['png', 'gif', 'jpg', 'jpeg', 'PNG', 'GIF', 'JPG', 'JPEG']
    })

    if (photo) {
      const filename = `${category.id}.png`
      await photo.move(Helpers.publicPath('uploads/categories'), {
        name: filename,
        overwrite: true
      })

      if (photo.moved()) {
        category.image = `/uploads/categories/${filename}`
      }
    }

    await category.save()
    session.flash({ notification: 'Categoría actualizada correctamente' })
    return response.redirect('/admin/categories')
  }

  async destroy ({ request, response, session }) {
    const id = request.input('id')
    const category = await Category.find(id)
    if (category) {
      await category.delete()
      session.flash({ notification: 'Categoría eliminada correctamente' })
    }
    return response.redirect('/admin/categories')
  }
}

module.exports = CategoryController
