'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')

/**
 * Sends guests that hit the backoffice to the login page instead of a bare 401.
 */
class ExceptionHandler extends BaseExceptionHandler {
  async handle (error, { request, response }) {
    if (error.name === 'InvalidSessionException' && request.url().startsWith('/admin')) {
      return response.redirect('/admin/login')
    }

    return super.handle(...arguments)
  }
}

module.exports = ExceptionHandler
