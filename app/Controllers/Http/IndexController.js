'use strict'

const Product = use('App/Models/Product')
const Category = use('App/Models/Category')

class IndexController {
  formatCurrency (locales, currency, fractionDigits, number) {
    return new Intl.NumberFormat(locales, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: fractionDigits
    }).format(number || 0)
  }

  async index ({ view }) {
    // 5 Featured Fitness product categories for the storefront carousels
    const fetchCategoryProducts = async (term) => {
      let prods = await Product.query()
        .where('category', 'LIKE', `%${term}%`)
        .orWhere('father', 'LIKE', `%${term}%`)
        .limit(8)
        .fetch()

      // Fallback if specific category has no products
      if (prods.rows.length === 0) {
        prods = await Product.query().limit(8).fetch()
      }

      return prods.toJSON().map((prod) => ({
        ...prod,
        price: this.formatCurrency('es-CO', 'COP', 0, prod.price)
      }))
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
