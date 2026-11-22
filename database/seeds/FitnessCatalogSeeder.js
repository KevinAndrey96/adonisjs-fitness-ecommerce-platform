'use strict'

/*
|--------------------------------------------------------------------------
| FitnessCatalogSeeder
|--------------------------------------------------------------------------
|
| Seeds categories, products, admin user, and sample orders for the
| fitness e-commerce platform & backoffice inventory showcase.
|
*/

const Factory = use('Factory')
const Database = use('Database')
const Hash = use('Hash')
const User = use('App/Models/User')
const Category = use('App/Models/Category')
const Product = use('App/Models/Product')
const Client = use('App/Models/Client')
const Order = use('App/Models/Order')
const OrderProduct = use('App/Models/OrderProduct')

class FitnessCatalogSeeder {
  async run () {
    // 1. Seed Admin User
    const adminExists = await User.findBy('email', 'admin@fitness-platform.com')
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@fitness-platform.com',
        password: 'FitnessAdmin2026!'
      })
    }

    // 2. Seed Categories
    const categoriesData = [
      { name: 'Ropa Deportiva', image: '/img/cat_ropa.jpg' },
      { name: 'Fuerza y Pesas', image: '/img/cat_pesas.jpg' },
      { name: 'Cardio y Resistencia', image: '/img/cat_cardio.jpg' },
      { name: 'Nutrición y Suplementos', image: '/img/cat_nutricion.jpg' },
      { name: 'Accesorios y Protección', image: '/img/cat_accesorios.jpg' }
    ]

    for (const cat of categoriesData) {
      const exists = await Category.findBy('name', cat.name)
      if (!exists) {
        await Category.create(cat)
      }
    }

    // 3. Seed Realistic Fitness Products
    const productsData = [
      // Sportswear (Matches homepage carousel categories)
      {
        name: 'Mini Short Deportivo Flex Pro',
        code: 'FIT-SH-001',
        category: 'Mini Shorts',
        price: 75000,
        short_description: 'Mini short transpirable con tecnología de compresión para entrenamiento de alta intensidad.',
        long_description: 'Confeccionado en tela elastano de secado rápido, costuras planas anti-rozaduras y pretina alta que brinda soporte lumbar en sentadillas y sprints.',
        image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&auto=format&fit=crop&q=80',
        father: 'Ropa Deportiva'
      },
      {
        name: 'Top Deportivo Seamless Crossfit',
        code: 'FIT-TP-002',
        category: 'Top',
        price: 68000,
        short_description: 'Top sin costuras con copas removibles y soporte medio-alto para entrenamientos intensos.',
        long_description: 'Tejido circular seamless que abraza el torso sin oprimir. Tirantes cruzados en la espalda para máxima ventilación y rango de movimiento.',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80',
        father: 'Ropa Deportiva'
      },
      {
        name: 'Conjunto Deportivo Active Wear',
        code: 'FIT-CJ-003',
        category: 'Conjuntos Casuales',
        price: 145000,
        short_description: 'Conjunto coordinado de 2 piezas (top + legging) de alto rendimiento.',
        long_description: 'Diseño ergonómico ideal tanto para el gimnasio como para uso casual deportivo. Tejido resistente a transparencias (squat proof) con acabado suave al tacto.',
        image: 'https://images.unsplash.com/photo-1483721074574-e3a518005b82?w=500&auto=format&fit=crop&q=80',
        father: 'Ropa Deportiva'
      },
      {
        name: 'Buzo Térmico Hoodie Heavy Weight',
        code: 'FIT-BZ-004',
        category: 'Buzos',
        price: 120000,
        short_description: 'Buzo con capota fabricado en algodón perchado para calentamiento y días fríos.',
        long_description: 'Corte oversize moderno con bolsillo canguro frontal, cordón ajustable en capota y puños reforzados en rib para mantener el calor corporal durante la previa.',
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80',
        father: 'Ropa Deportiva'
      },
      {
        name: 'Camisilla Esqueleto Tank Top Gold Gym',
        code: 'FIT-ES-005',
        category: 'Esqueletos',
        price: 52000,
        short_description: 'Camisilla clásica de corte abierto para entrenamiento de fuerza e hipertrofia.',
        long_description: '100% algodón peinado ultrasuave con sisa amplia que permite máxima ventilación y visibilidad muscular durante ejercicios de torso.',
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=80',
        father: 'Ropa Deportiva'
      },

      // Gym Equipment & Strength
      {
        name: 'Mancuernas Ajustables SelectTech 24kg (Par)',
        code: 'FIT-MC-006',
        category: 'Mancuernas',
        price: 890000,
        short_description: 'Sistema selector de peso rápido de 2.5kg a 24kg por mancuerna en un solo dial.',
        long_description: 'Reemplaza hasta 15 pares de mancuernas tradicionales con un sistema compacto de platos de acero recubiertos en polímero anti-ruido.',
        image: 'https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?w=500&auto=format&fit=crop&q=80',
        father: 'Fuerza y Pesas'
      },
      {
        name: 'Barra Olímpica de Levantamiento 20kg 2.2m',
        code: 'FIT-BR-007',
        category: 'Barras',
        price: 450000,
        short_description: 'Barra de acero cromado con rodamientos de aguja para levantamiento olímpico y powerlifting.',
        long_description: 'Capacidad nominal de carga de 1500 lbs (680kg), moleteado estándar antideslizante con marcas IPF/IWF y mangas con casquillos giratorios de precisión.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80',
        father: 'Fuerza y Pesas'
      },
      {
        name: 'Kettlebell de Hierro Fundido Powder Coat 16kg',
        code: 'FIT-KB-008',
        category: 'Kettlebells',
        price: 185000,
        short_description: 'Pesa rusa monobloque con acabado powder coat que mejora el agarre y la tiza.',
        long_description: 'Base plana maquinada para evitar balanceos en el suelo durante flexiones o renegade rows. Código de color amarillo reglamentario en asas.',
        image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&auto=format&fit=crop&q=80',
        father: 'Fuerza y Pesas'
      },

      // Cardio & Resistance
      {
        name: 'Kit de Bandas Elásticas de Resistencia Tubular (11 Piezas)',
        code: 'FIT-BD-009',
        category: 'Bandas Elásticas',
        price: 95000,
        short_description: 'Set completo de 5 tubos de resistencia combinables con manijas, anclaje de puerta y correas de tobillo.',
        long_description: 'Látex 100% natural de grado médico que resiste hasta 150 lbs de resistencia combinada. Incluye bolso de transporte impermeable para entrenar en casa o viaje.',
        image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=500&auto=format&fit=crop&q=80',
        father: 'Cardio y Resistencia'
      },
      {
        name: 'Cuerda de Salto Speed Rope Alta Velocidad',
        code: 'FIT-CR-010',
        category: 'Cuerdas',
        price: 45000,
        short_description: 'Cuerda con cable de acero recubierto y doble rodamiento de bolas para saltos dobles (double unders).',
        long_description: 'Mangos ergonómicos ultraligeros de aluminio anodizado con ajuste de longitud sin herramientas, diseñada para Crossfit y acondicionamiento cardiovascular.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80',
        father: 'Cardio y Resistencia'
      },

      // Sports Nutrition
      {
        name: 'Proteína 100% Whey Isolate 5 lbs (Sabor Chocolate Belga)',
        code: 'FIT-PR-011',
        category: 'Proteínas',
        price: 285000,
        short_description: 'Aislado de proteína de suero microfiltrado de flujo cruzado (CFM) con 27g de proteína por servicio.',
        long_description: 'Cero azúcar añadida, menos de 1g de grasa y 5.5g de BCAAs naturales. Rápida absorción ideal para la ventana anabólica post-entreno.',
        image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=500&auto=format&fit=crop&q=80',
        father: 'Nutrición y Suplementos'
      },
      {
        name: 'Creatina Creapure Monohidrato Micronizada 300g',
        code: 'FIT-CR-012',
        category: 'Creatina',
        price: 110000,
        short_description: '100% Creapure certificada de máxima pureza para potencia muscular y recuperación de ATP.',
        long_description: 'Polvo neutro sin sabor, altamente soluble y testeado contra sustancias prohibidas. Contiene 60 servicios de 5g para ciclos de fuerza y volumen.',
        image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&auto=format&fit=crop&q=80',
        father: 'Nutrición y Suplementos'
      },

      // Accessories
      {
        name: 'Cinturón Lumbar de Cuero Powerlifting 10mm',
        code: 'FIT-CT-013',
        category: 'Cinturones',
        price: 175000,
        short_description: 'Cinturón de cuero vacuno de 10mm de espesor con hebilla de palanca de liberación rápida.',
        long_description: 'Aprobado para competencias de levantamiento de potencia. Proporciona soporte intra-abdominal uniforme en sentadillas pesadas y peso muerto.',
        image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=80',
        father: 'Accesorios y Protección'
      },
      {
        name: 'Rodilleras de Compresión Neopreno 7mm (Par)',
        code: 'FIT-RD-014',
        category: 'Rodilleras',
        price: 135000,
        short_description: 'Rodilleras de alta densidad para estabilidad articular y calor en levantamiento olímpico.',
        long_description: 'Costura reforzada de cuatro hilos, compresión graduada que reduce la tensión sobre los tendones patelares y estimula el flujo sanguíneo.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80',
        father: 'Accesorios y Protección'
      },
      {
        name: 'Shaker Botella Mezcladora Pro 700ml Acero Inoxidable',
        code: 'FIT-SK-015',
        category: 'Shakers',
        price: 49000,
        short_description: 'Vaso mezclador térmico libre de BPA con batidor esférico antigrumos.',
        long_description: 'Tapa a rosca con cierre hermético 100% a prueba de fugas y base de silicona silenciosa. Conserva bebidas frías hasta por 12 horas.',
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
        father: 'Accesorios y Protección'
      }
    ]

    for (const prod of productsData) {
      const exists = await Product.findBy('code', prod.code)
      if (!exists) {
        await Product.create(prod)
      }
    }

    // 4. Seed Demo Client
    let client = await Client.findBy('email', 'cliente@fitness-platform.com')
    if (!client) {
      client = await Client.create({
        name: 'Carlos Mendoza',
        email: 'cliente@fitness-platform.com',
        phone: '+57 310 987 6543',
        address: 'Calle 100 # 15-20, Apto 502',
        city: 'Bogotá',
        country: 'Colombia'
      })
    }

    // 5. Seed Sample Orders
    const existingOrders = await Order.all()
    if (existingOrders.rows.length === 0) {
      const allProducts = await Product.all()
      const prodsList = allProducts.toJSON()

      if (prodsList.length >= 3) {
        // Sample Order 1: Delivered
        const order1 = await Order.create({
          client_id: client.id,
          status: 'delivered',
          value: String(prodsList[0].price * 2 + prodsList[1].price),
          gateway: 'credibanco_uat_demo'
        })
        await OrderProduct.create({ order_id: order1.id, product_id: prodsList[0].id, quantity: 2 })
        await OrderProduct.create({ order_id: order1.id, product_id: prodsList[1].id, quantity: 1 })

        // Sample Order 2: Processing
        const order2 = await Order.create({
          client_id: client.id,
          status: 'processing',
          value: String(prodsList[5].price + prodsList[10].price),
          gateway: 'sandbox'
        })
        await OrderProduct.create({ order_id: order2.id, product_id: prodsList[5].id, quantity: 1 })
        await OrderProduct.create({ order_id: order2.id, product_id: prodsList[10].id, quantity: 1 })
      }
    }

    console.log('Fitness catalog seeded successfully.')
  }
}

module.exports = FitnessCatalogSeeder
