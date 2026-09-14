# 🍰 Papita Dulce

Sitio web de pastelería **Papita Dulce**: catálogo de productos, carrito de compras, checkout con distintos métodos de pago y entrega, autenticación de clientes, y un panel de administración para gestionar productos, usuarios y órdenes.

Este proyecto fue desarrollado como parte de un ramo de la carrera (Fullstack), por lo que **no procesa pagos reales**: la pasarela de pago es una simulación educativa que valida los datos ingresados (número de tarjeta, vencimiento, etc.) pero no se conecta a ningún banco.

## 📁 Estructura del proyecto

```
├── papitadulce/          # Sitio público de la tienda (landing + tienda + checkout)
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── auth.js       # Autenticación de clientes (login, registro, sesión)
│       └── main.js       # Menú, carrito, checkout, pagos y notificaciones
├── admin/                # Panel de administración (productos, usuarios, órdenes)
├── src/                  # Vistas adicionales del panel administrativo
├── assets/               # Imágenes y estilos compartidos
├── css/ · javascript/    # Recursos del panel de administración
└── Documentation/        # Documentación de los íconos utilizados (Font Awesome)
```

## ✨ Funcionalidades principales

### Tienda (`papitadulce/`)
- Catálogo de productos filtrable por categoría, con buscador y vista de detalle por producto (incluye variantes como "torta completa" / "trozo").
- Carrito de compras persistente (se guarda en el navegador).
- **Checkout mejorado**:
  - Datos de contacto (nombre, correo, teléfono).
  - Método de entrega: retiro en tienda o despacho a domicilio (con dirección).
  - Método de pago: tarjeta de crédito/débito (con validación de número mediante algoritmo de Luhn y verificación de vencimiento), transferencia bancaria (con datos de la cuenta) o efectivo al momento de recibir el pedido.
- **Notificación de confirmación de pago**: al finalizar la compra se muestra una notificación en pantalla (y, si el navegador lo permite, una notificación nativa del sistema) indicando el número de pedido y el correo al que se envió la confirmación.
- **Autenticación de clientes** (`js/auth.js`): módulo independiente de `main.js` que gestiona registro, inicio de sesión, cierre de sesión y recuperación de contraseña. Las cuentas creadas quedan guardadas y se validan de verdad contra lo registrado (a diferencia de un simple mensaje simulado).

### Panel de administración (`admin/`)
- Gestión de productos (alta, edición, listado).
- Gestión de usuarios y roles (Administrador, Vendedor, Cliente).
- Gestión de órdenes.

## ⚠️ Notas importantes

- Todo el almacenamiento (usuarios, carrito, pedidos, sesión) se guarda en `localStorage` del navegador, ya que el proyecto no cuenta con un backend ni base de datos real.
- Las contraseñas se ofuscan antes de guardarse en `localStorage`, pero esto **no reemplaza** un hash de seguridad real (bcrypt, argon2, etc.); en un entorno de producción la autenticación debe resolverse en un servidor.
- El checkout no se conecta a Webpay, Mercado Pago ni ningún medio de pago real: es una simulación con fines académicos.

## 🚀 Cómo ejecutarlo

No requiere instalación ni dependencias. Basta con abrir `papitadulce/index.html` en un navegador, o servir la carpeta con un servidor estático simple, por ejemplo:

```bash
npx serve .
```

## 🛠️ Tecnologías utilizadas

- HTML5, CSS3, JavaScript 
- Bootstrap 5
- Font Awesome
- AOS (animaciones al hacer scroll)
- Swiper (carruseles)
