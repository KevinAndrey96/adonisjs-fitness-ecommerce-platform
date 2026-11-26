'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DropUniqueClientPhoneSchema extends Schema {
  up () {
    this.table('clients', (table) => {
      table.dropUnique(['phone'])
    })
  }

  down () {
    this.table('clients', (table) => {
      table.unique(['phone'])
    })
  }
}

module.exports = DropUniqueClientPhoneSchema
