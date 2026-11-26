'use strict'

/*
 * HTTP smoke test: boots the real AdonisJS server against the migrated and
 * seeded SQLite database and checks the storefront, the JSON endpoints used
 * by the cart and the protection of the backoffice.
 */

const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const net = require('node:net')
const path = require('node:path')

let server
let baseUrl

function freePort () {
  return new Promise((resolve, reject) => {
    const probe = net.createServer().listen(0, '127.0.0.1', () => {
      const { port } = probe.address()
      probe.close(() => resolve(port))
    })
    probe.on('error', reject)
  })
}

async function waitUntilReady (url, deadline) {
  while (Date.now() < deadline) {
    try {
      await fetch(url)

      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
  throw new Error(`server not ready at ${url}`)
}

function get (pathname) {
  return fetch(`${baseUrl}${pathname}`, { redirect: 'manual' })
}

before(async () => {
  const port = await freePort()
  baseUrl = `http://127.0.0.1:${port}`
  server = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    stdio: ['ignore', 'ignore', 'inherit']
  })
  await waitUntilReady(baseUrl, Date.now() + 20000)
})

after(() => {
  server.kill()
})

for (const page of ['/', '/categories', '/cart', '/search?name=short&sort=pricedesc&prices=2', '/product_detail/1', '/products_list/1', '/products_list_menu/Ropa%20Deportiva', '/admin/login', '/confirm']) {
  test(`GET ${page} renders`, async () => {
    const response = await get(page)

    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), /text\/html/)
  })
}

test('getProduct returns the product as JSON', async () => {
  const response = await get('/getProduct?id=1')
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.id, 1)
  assert.ok(Number(body.price) > 0)
})

test('getProduct returns 404 for an unknown product', async () => {
  const response = await get('/getProduct?id=999999')

  assert.equal(response.status, 404)
})

test('an unknown product page is not found', async () => {
  const response = await get('/product_detail/999999')

  assert.equal(response.status, 404)
})

for (const page of ['/admin/dashboard', '/admin/products', '/admin/orders', '/admin/clients']) {
  test(`GET ${page} sends guests to the login page`, async () => {
    const response = await get(page)

    assert.equal(response.status, 302)
    assert.equal(response.headers.get('location'), '/admin/login')
  })
}

function cookieJar () {
  const cookies = new Map()

  return {
    store (response) {
      for (const header of response.headers.getSetCookie()) {
        const [pair] = header.split(';')
        const index = pair.indexOf('=')
        cookies.set(pair.slice(0, index), pair.slice(index + 1))
      }
    },
    header () {
      return [...cookies].map(([name, value]) => `${name}=${value}`).join('; ')
    }
  }
}

function csrfToken (html) {
  const match = html.match(/name="_csrf" value="([^"]+)"/)
  assert.ok(match, 'csrf field present')

  return match[1]
}

async function post (jar, pathname, fields) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: jar.header() },
    body: new URLSearchParams(fields).toString(),
    redirect: 'manual'
  })
  jar.store(response)

  return response
}

function queryOne (sql) {
  const sqlite3 = require('sqlite3')
  const db = new sqlite3.Database(path.join(__dirname, '..', 'database', 'development.sqlite'))

  return new Promise((resolve, reject) => {
    db.get(sql, (error, row) => {
      db.close()
      if (error) {
        reject(error)
      } else {
        resolve(row)
      }
    })
  })
}

test('a guest buys with prices from the catalog and a clamped quantity', async () => {
  const jar = cookieJar()
  const cartPage = await get('/cart')
  jar.store(cartPage)

  const product = await (await get('/getProduct?id=1')).json()
  const cart = JSON.stringify({ cart: [{ Product: 1, Quantity: 500, Price: 1 }, { Product: 999999, Quantity: 1 }] })

  const checkout = await post(jar, '/checkout', { _csrf: csrfToken(await cartPage.text()), CART: cart })
  assert.equal(checkout.status, 200)
  const checkoutHtml = await checkout.text()

  const pay = await post(jar, '/pay', {
    _csrf: csrfToken(checkoutHtml),
    CART: cart,
    EMAIL: 'Compradora@Example.com',
    NAME: 'Compradora de prueba',
    PHONE: '3000000000',
    ADDRESS: 'Calle 1 # 2-3',
    CITY: 'Bogotá',
    COUNTRY: 'Colombia'
  })

  assert.equal(pay.status, 302)
  assert.equal(pay.headers.get('location'), '/confirm')

  const order = await queryOne('SELECT * FROM orders ORDER BY id DESC LIMIT 1')
  assert.equal(Number(order.value), Number(product.price) * 20)
  assert.equal(order.gateway, 'Contraentrega')
  assert.equal(order.status, 'pending')

  const line = await queryOne(`SELECT * FROM order_products WHERE order_id = ${order.id}`)
  assert.equal(line.quantity, 20)
})

test('checkout without a CSRF token is rejected', async () => {
  const response = await fetch(`${baseUrl}/pay`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: 'EMAIL=a%40example.com&CART=%7B%22cart%22%3A%5B%5D%7D',
    redirect: 'manual'
  })

  assert.equal(response.status, 403)
})
