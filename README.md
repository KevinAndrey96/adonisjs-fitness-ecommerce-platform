# 🏋️‍♂️ Fitness E-Commerce Platform & Backoffice Inventory System

[![CI - Build, Test & Verify](https://github.com/KevinAndrey96/fitness-ecommerce-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/KevinAndrey96/fitness-ecommerce-platform/actions/workflows/ci.yml)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![AdonisJS](https://img.shields.io/badge/framework-AdonisJS%20v4.1-5A45FF.svg)](https://adonisjs.com/)
[![Database](https://img.shields.io/badge/database-MySQL%208.0%20%7C%20SQLite3-00758F.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack e-commerce platform and inventory management backoffice for fitness apparel, gym equipment, and sports nutrition, built with **Node.js**, **AdonisJS**, **Lucid ORM**, **Edge Templates**, and **MySQL/SQLite**.

---

## 🏛️ Architecture Overview

The system consolidates a customer-facing storefront and an administrative backoffice into a cohesive monorepo:

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Presentation Layer"]
        A["Customer Web Storefront<br/>(Bootstrap, OwlCarousel, Edge Views)"]
        B["Admin Backoffice Portal<br/>(Morris.js, DataTables, Admin Views)"]
    end

    subgraph RoutingLayer["AdonisJS Routing & Middleware"]
        C["Storefront Routes (/)"]
        D["Admin Routes (/admin/*)"]
        AUTH["Auth Middleware (Sessions & CSRF)"]
    end

    subgraph ControllersLayer["HTTP Controllers & Services"]
        E["Storefront Controllers<br/>IndexController, ProductController, ClientController"]
        F["Admin Controllers<br/>UserController, ProductController, CategoryController, OrderController"]
    end

    subgraph DataLayer["Persistence & Infrastructure"]
        G["Lucid ORM Models<br/>(User, Product, Category, Order, OrderProduct, Client)"]
        H[("Database Engine<br/>MySQL 8.0 / SQLite 3")]
        I["Mailpit SMTP (Order Confirmations)"]
        J["Payment Gateway Service (Sandbox / Credibanco)"]
    end

    A --> C
    B --> AUTH --> D
    C --> E
    D --> F
    E --> G
    F --> G
    G --> H
    E -.-> I
    E -.-> J
```

---

## ✨ Features

### 🛒 Customer Storefront (`/`)
- **Responsive Catalog:** Browse sports apparel, dumbbells, kettlebells, and nutrition supplements with smooth carousel carousels.
- **Search & Filtering:** Real-time search by name, category, and price range.
- **Shopping Cart & Checkout:** Persistent client-side cart with dynamic subtotal and shipping calculations.
- **Order Placement:** Automatic customer creation/updating, transaction records, and order confirmation emails via SMTP.
- **Payment Gateway Integration:** Modular payment gateway adapter with test sandbox mode.

### 📊 Admin Backoffice (`/admin`)
- **Secured Authentication:** Role-based session authentication with bcrypt hashing.
- **Dashboard & Analytics:** Sales metrics, conversion rates, and category distribution charts via Morris.js.
- **Product Management:** Full CRUD with multi-part image uploads, SKU/code tracking, prices, and parent categories.
- **Category Hierarchy:** Manage root and nested category trees.
- **Order Tracking:** Detailed order history with customer info, line items, quantities, and totals.
- **Client Registry:** Centralized customer database with contact records.

---

## 🚀 Quickstart

### Option 1: Docker Compose (Recommended)

Run the full stack (Application, MySQL 8.0, and Mailpit) in seconds:

```bash
# 1. Clone the repository
git clone git@github.com:KevinAndrey96/fitness-ecommerce-platform.git
cd fitness-ecommerce-platform

# 2. Start services via Docker Compose
docker compose up -d --build

# 3. Access endpoints
# Storefront:        http://localhost:3333
# Admin Backoffice:  http://localhost:3333/admin/login
# Mailpit Web UI:    http://localhost:8025
```

---

### Option 2: Local Development (Zero-Config SQLite)

```bash
# 1. Setup environment & install dependencies
make setup

# 2. Run database migrations
make migrate

# 3. Seed realistic fitness catalog & test accounts
make seed

# 4. Start the development server
make dev
```

Visit [http://127.0.0.1:3333](http://127.0.0.1:3333) in your browser.

---

## 🔐 Demo Credentials

When running `make seed`, the following default test accounts are available:

| Role | Email | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@fitness-platform.com` | `FitnessAdmin2026!` | `/admin/login` |
| **Customer** | `cliente@fitness-platform.com` | *(N/A - Direct Checkout)* | `/` |

---

## 📁 Project Structure

```
fitness-ecommerce-platform/
├── app/
│   ├── Controllers/
│   │   └── Http/
│   │       ├── IndexController.js        # Storefront home & categories
│   │       ├── ProductController.js      # Storefront products & checkout
│   │       ├── ClientController.js       # Storefront client lookup
│   │       └── Admin/                    # Admin Backoffice Controllers
│   │           ├── UserController.js     # Admin auth (login/logout)
│   │           ├── ProductController.js  # Product inventory CRUD & uploads
│   │           ├── CategoryController.js # Category management
│   │           ├── OrderController.js    # Order tracking & invoice detail
│   │           └── ClientController.js   # Customer directory
│   ├── Middleware/                       # Framework & auth middleware
│   └── Models/                           # Lucid ORM Entity Models
│       ├── User.js
│       ├── Product.js
│       ├── Category.js
│       ├── Order.js
│       ├── OrderProduct.js
│       └── Client.js
├── config/                               # AdonisJS service configurations
├── database/
│   ├── migrations/                       # DDL schema migrations (7 tables)
│   └── seeds/                            # Realistic fitness catalog seeders
├── public/                               # Public assets (Storefront & Admin)
├── resources/
│   └── views/
│       ├── layouts/                      # Storefront master layout
│       ├── admin/                        # Admin backoffice templates
│       │   ├── layouts/                  # Admin master layout & navigation
│       │   ├── dashboard.edge            # Metrics & performance charts
│       │   ├── products.edge             # Product table & actions
│       │   └── orders.edge               # Orders management
│       └── *.edge                        # Storefront views (index, cart, checkout)
├── start/
│   └── routes.js                         # Unified route definitions
├── docker-compose.yml                    # Multi-container orchestration
├── Dockerfile                            # Optimized Node.js Alpine image
├── Makefile                              # Developer convenience targets
└── README.md
```

---

## 🧪 Testing & Verification

Run syntax and static verification across all models, controllers, and routes:

```bash
make test
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

**Developed & Architected by [Kevin Andrey Herrera Silva](https://github.com/KevinAndrey96)**
