'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Order extends Model {
  client () {
    return this.belongsTo('App/Models/Client')
  }

  Client () {
    return this.client()
  }

  products () {
    return this.hasMany('App/Models/OrderProduct')
  }

  Products () {
    return this.products()
  }
}

module.exports = Order
