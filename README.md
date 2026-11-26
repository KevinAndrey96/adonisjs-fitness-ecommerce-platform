# Tienda en línea de artículos deportivos con backoffice (AdonisJS)

[![CI](https://github.com/KevinAndrey96/adonisjs-fitness-ecommerce-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/KevinAndrey96/adonisjs-fitness-ecommerce-platform/actions/workflows/ci.yml)
![Node.js 18 a 22](https://img.shields.io/badge/Node.js-18%20%7C%2020%20%7C%2022-339933?logo=nodedotjs&logoColor=white)
![AdonisJS 4](https://img.shields.io/badge/AdonisJS-4.1-5A45FF?logo=adonisjs&logoColor=white)
![MySQL y SQLite](https://img.shields.io/badge/MySQL%208.0%20%7C%20SQLite-4479A1?logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

Tienda en línea para una marca colombiana de ropa deportiva, con equipos de gimnasio y suplementos, y su backoffice de inventario y pedidos. Se construyó en 2020 con AdonisJS 4, Edge y Lucid; los clientes compran sin crear cuenta y pagan contraentrega o con la pasarela de Credibanco.

## Funcionalidades

**Tienda**

- Portada con colecciones (shorts, tops, conjuntos, buzos y esqueletos), categorías y detalle de producto con relacionados.
- Búsqueda por nombre y categoría, filtros por rango de precio y orden por precio o nombre.
- Carrito en el navegador. El checkout recalcula cada línea con el precio de la base de datos, nunca con el que envía el navegador, y limita las cantidades a 1..20.
- Pedido contraentrega por defecto. Con `ENABLE_PAYMENT_GATEWAY=true` el pedido se registra en Credibanco y el cliente pasa a su formulario de pago; si la pasarela no responde en 10 segundos, el pedido queda pendiente y el error se registra en el log.
- Correo de confirmación del pedido.

**Backoffice** (`/admin`, con sesión)

- Productos y categorías con imagen; solo se aceptan PNG, JPG o GIF de hasta 10 MB, guardadas con nombre fijo por id.
- Pedidos con detalle de productos y cliente, y listado de clientes.
- Los visitantes sin sesión se redirigen al login, y todos los formularios llevan token CSRF (Shield).

## Arquitectura

```mermaid
flowchart LR
    Cliente -->|tienda| Rutas[start/routes.js]
    Admin[Administrador] -->|/admin con sesión| Rutas
    Rutas --> Tienda[Index, Product, Client]
    Rutas --> Backoffice[Admin: Product, Category, Order, Client, User]
    Tienda --> Servicios[Services: Cart y Money]
    Tienda --> Modelos[Lucid: Product, Category, Order, OrderProduct, Client]
    Backoffice --> Modelos
    Modelos --> BD[(MySQL 8.0 o SQLite)]
    Tienda -.->|correo| SMTP[Mailpit o SMTP]
    Tienda -.->|registro del pago| Credibanco
```

- `app/Services/Cart.js` interpreta el carrito y lo resuelve contra el catálogo.
- `app/Services/Money.js` formatea pesos colombianos para todas las vistas.
- `app/Exceptions/Handler.js` redirige al login cuando falta la sesión en el backoffice.

## Puesta en marcha

### Local con SQLite

```bash
npm ci --legacy-peer-deps
cp .env.example .env
sed -i.bak "s/^APP_KEY=.*/APP_KEY=$(openssl rand -hex 16)/" .env && rm .env.bak
node ace migration:run
node ace seed
npm run dev        # http://127.0.0.1:3333
```

### Docker Compose (MySQL y Mailpit)

```bash
export APP_KEY=$(openssl rand -hex 16)
docker compose up -d --build
docker compose exec app node ace migration:run --force
docker compose exec app node ace seed --force
```

- Tienda: http://localhost:3333
- Mailpit: http://localhost:8025

La imagen corre como el usuario `node`, sin privilegios, y tiene healthcheck. El compose exige `APP_KEY`: no trae una clave por defecto.

### Pasarela de pago

| Variable | Uso |
| --- | --- |
| `ENABLE_PAYMENT_GATEWAY` | `true` para registrar el pago en Credibanco; cualquier otro valor deja el pedido contraentrega. |
| `GATEWAY_USERNAME`, `GATEWAY_PASSWORD` | Credenciales del comercio. Son obligatorias si la pasarela está activa. |
| `GATEWAY_URL` | Endpoint `register.do`; por defecto, el ambiente de pruebas de Credibanco. |

### Datos de demostración

El seeder crea categorías, productos y el usuario `admin@example.com` con la contraseña `FitnessAdmin2026!`, solo para el entorno local.

## Calidad

```bash
npm run lint   # ESLint
npm test       # pruebas HTTP con node:test
```

Las pruebas levantan el servidor real sobre la base SQLite sembrada y revisan:

- que las páginas de la tienda carguen;
- los endpoints JSON del carrito;
- los 404;
- la redirección del backoffice al login;
- el rechazo de un POST sin token CSRF;
- una compra completa con token CSRF, que confirma que el pedido usa el precio de la base, limita la cantidad e ignora productos inexistentes.

El CI corre lint y pruebas en Node 18, 20 y 22, construye la imagen Docker y espera a que el contenedor quede saludable.

## Historia

Proyecto de 2020 y 2021 para una tienda de ropa deportiva de Bogotá, hecho con Camilo Gamba. En noviembre de 2026 se ordenó sin cambiar el stack:

- el servidor ya no intenta leer certificados inexistentes al arrancar (fallaba con ENOENT);
- la pasarela queda apagada de verdad cuando `ENABLE_PAYMENT_GATEWAY` no es `true` (antes la cadena `"false"` la activaba);
- las cantidades negativas o enormes ya no alteran el total;
- los pedidos quedan `pending` hasta el pago, en lugar de marcarse confirmados al crearse;
- los errores de correo y de pasarela quedan registrados en el log en lugar de silenciarse;
- la lógica repetida de carrito y moneda pasó a dos servicios;
- se eliminaron dependencias sin uso;
- el lockfile se regeneró, la imagen Docker corre sin root y se agregaron ESLint, pruebas y CI.

Las credenciales que alguna vez estuvieron en el código se purgaron del historial.

## Licencia

Sin licencia de código abierto. El proyecto nació como trabajo para un cliente y se publica como muestra de portafolio: todos los derechos reservados.
