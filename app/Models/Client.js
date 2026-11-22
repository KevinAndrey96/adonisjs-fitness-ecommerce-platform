'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Client extends Model {
  orders () {
    return this.hasMany('App/Models/Order')
  }

  Orders () {
    return this.orders()
  }
}

module.exports = Client
