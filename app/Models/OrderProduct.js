'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class OrderProduct extends Model {
  product () {
    return this.belongsTo('App/Models/Product')
  }

  Product () {
    return this.product()
  }

  order () {
    return this.belongsTo('App/Models/Order')
  }

  Order () {
    return this.order()
  }
}

module.exports = OrderProduct
