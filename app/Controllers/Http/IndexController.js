'use strict'

const Product = use('App/Models/Product')
const Category = use('App/Models/Category')
const { withCopPrices } = use('App/Services/Money')

class IndexController {
  async index ({ view }) {
    const fetchCategoryProducts = async (term) => {
      let prods = await Product.query()
        .where('category', 'LIKE', `%${term}%`)
        .orWhere('father', 'LIKE', `%${term}%`)
        .limit(8)
        .fetch()

      if (prods.rows.length === 0) {
        prods = await Product.query().limit(8).fetch()
      }

      return withCopPrices(prods.toJSON())
    }

    const [cats1, cats2, cats3, cats4, cats5, categories] = await Promise.all([
      fetchCategoryProducts('Short'),
      fetchCategoryProducts('Top'),
      fetchCategoryProducts('Conjunto'),
      fetchCategoryProducts('Buzo'),
      fetchCategoryProducts('Esqueleto'),
      Category.all()
    ])

    return view.render('index', {
      cats1,
      cats2,
      cats3,
      cats4,
      cats5,
      categories: categories.toJSON()
    })
  }

  async categories ({ view }) {
    const categories = await Category.all()
    return view.render('categories', { categories: categories.toJSON() })
  }
}

module.exports = IndexController
