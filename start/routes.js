'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

/*
|--------------------------------------------------------------------------
| Storefront Routes (B2C Fitness E-Commerce)
|--------------------------------------------------------------------------
*/
Route.get('/', 'IndexController.index')
Route.get('categories', 'IndexController.categories')
Route.get('product_detail/:id', 'ProductController.index')
Route.get('products_list/:id', 'ProductController.bycat')
Route.get('products_list_menu/:name', 'ProductController.bycatmenu')
Route.get('cart', 'ProductController.cart')
Route.post('checkout', 'ProductController.checkout')
Route.post('pay', 'ProductController.pay')
Route.get('pay', 'ProductController.pay2')
Route.get('search', 'ProductController.search')
Route.get('getProduct', 'ProductController.get')
Route.get('confirm', ({ view }) => view.render('order_completed'))

/*
|--------------------------------------------------------------------------
| Admin Backoffice Routes - Public
|--------------------------------------------------------------------------
*/
Route.group(() => {
  Route.get('/', ({ response }) => response.redirect('/admin/dashboard'))
  Route.get('login', ({ view }) => view.render('admin.login')).as('admin.login')
  Route.post('login', 'Admin/UserController.login').as('UserController.login')
  Route.get('logout', 'Admin/UserController.logout').as('UserController.logout')

  // Utility error views
  Route.get('404', ({ view }) => view.render('admin.404'))
  Route.get('500', ({ view }) => view.render('admin.500'))
  Route.get('restore-pass', ({ view }) => view.render('admin.restore-pass'))
  Route.get('restore-pass-c', ({ view }) => view.render('admin.restore-pass-c'))
}).prefix('admin')

/*
|--------------------------------------------------------------------------
| Admin Backoffice Routes - Authenticated
|--------------------------------------------------------------------------
*/
Route.group(() => {
  Route.get('dashboard', ({ view }) => view.render('admin.dashboard')).as('admin.dashboard')

  // Products Management
  Route.get('products', 'Admin/ProductController.index').as('admin.products.index')
  Route.get('add-product', 'Admin/ProductController.new').as('admin.products.new')
  Route.post('add-product', 'Admin/ProductController.create').as('ProductController.create')
  Route.get('edit-product/:id', 'Admin/ProductController.edit').as('admin.products.edit')
  Route.post('edit-product', 'Admin/ProductController.update').as('ProductController.update')
  Route.delete('products', 'Admin/ProductController.destroy').as('ProductController.destroy')

  // Categories Management
  Route.get('categories', 'Admin/CategoryController.index').as('admin.categories.index')
  Route.get('add-category', 'Admin/CategoryController.new').as('admin.categories.new')
  Route.post('add-category', 'Admin/CategoryController.create').as('CategoryController.create')
  Route.get('edit-category/:id', 'Admin/CategoryController.edit').as('admin.categories.edit')
  Route.post('edit-category', 'Admin/CategoryController.update').as('CategoryController.update')
  Route.delete('categories', 'Admin/CategoryController.destroy').as('CategoryController.destroy')

  // Orders Management
  Route.get('orders', 'Admin/OrderController.index').as('admin.orders.index')
  Route.get('order-detail/:id', 'Admin/OrderController.details').as('admin.orders.detail')

  // Clients & Profile
  Route.get('clients', 'Admin/ClientController.index').as('admin.clients.index')
  Route.get('edit-client', ({ view }) => view.render('admin.edit-client'))
  Route.get('profile', ({ view }) => view.render('admin.profile'))
}).prefix('admin').middleware(['auth'])
