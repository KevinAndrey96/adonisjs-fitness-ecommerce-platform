'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Product extends Model {
  categoryRef () {
    return this.belongsTo('App/Models/Category', 'father', 'name')
  }

  orderProducts () {
    return this.hasMany('App/Models/OrderProduct')
  }

  Order () {
    return this.orderProducts()
  }
}

module.exports = Product
