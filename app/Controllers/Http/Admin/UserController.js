'use strict'

class UserController {
  async login ({ request, auth, response, session }) {
    const { email, password } = request.all()
    try {
      await auth.attempt(email, password)
      return response.redirect('/admin/dashboard')
    } catch (error) {
      session.flash({ error: 'Credenciales inválidas. Por favor verifique el correo y la contraseña.' })
      return response.redirect('/admin/login')
    }
  }

  async logout ({ auth, response }) {
    await auth.logout()
    return response.redirect('/admin/login')
  }

  show ({ auth, params }) {
    if (auth.user.id !== Number(params.id)) {
      return 'No tienes permiso para ver este perfil'
    }
    return auth.user
  }
}

module.exports = UserController
