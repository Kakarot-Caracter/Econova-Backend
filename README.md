<div align="center">
  <br />
  <h1>Econova API</h1>
  <p>
    Backend para una plataforma de e-commerce, construido con NestJS, Prisma y SQLite.
  </p>
</div>

<p align="center">
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-11.x-red?style=for-the-badge&logo=nestjs"/>
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-6.x-blue?style=for-the-badge&logo=prisma"/>
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-blue?style=for-the-badge&logo=sqlite&logoColor=white"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript"/>
  <img alt="Stripe" src="https://img.shields.io/badge/Stripe-purple?style=for-the-badge&logo=stripe"/>
</p>

---

## ✨ Características

- **Autenticación JWT**: Sistema seguro basado en cookies `HttpOnly`.
- **Gestión de Usuarios**: Registro, login, logout y gestión de perfiles con roles (Admin/User).
- **Gestión de Productos (CRUD)**: Administración completa de productos, incluyendo subida de imágenes a Cloudinary.
- **Gestión de Órdenes**: Creación y consulta de órdenes por usuario.
- **Procesamiento de Pagos**: Integración con Stripe para procesar pagos de manera segura.
- **Base de Datos Tipada**: Conexión segura y tipada a SQLite usando Prisma ORM.
- **Documentación Automática**: Endpoints documentados con Swagger (OpenAPI).
- **Validación de Datos**: DTOs con `class-validator` para asegurar la integridad de los datos.

---

## ⚙️ Stack de Tecnologías

- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Base de Datos**: [SQLite](https://www.sqlite.org/index.html)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Autenticación**: [Passport.js](http://www.passportjs.org/) (JWT Strategy)
- **Pagos**: [Stripe](https://stripe.com)
- **Almacenamiento de Archivos**: [Cloudinary](https://cloudinary.com)
- **Documentación**: [Swagger](https://swagger.io/)

---

## 🚀 Cómo Empezar

Sigue estos pasos para tener una copia del proyecto funcionando localmente.

### Requisitos Previos

- [Node.js](https://nodejs.org/) (v18+ recomendado)

### 1. Clona el Repositorio

```bash
git clone https://github.com/tu-usuario/econova-backend.git
cd econova-backend
```

### 2. Configura las Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables. Puedes usar el siguiente template:

```env
# Aplicación
PORT=3001
JWT_SECRET=tu_super_secreto_jwt
FRONTEND_URL=http://localhost:3000

# Base de Datos (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Instala Dependencias y Ejecuta las Migraciones

```bash
# Instala los paquetes de Node.js
npm install

# Genera el cliente de Prisma
npx prisma generate

# Aplica las migraciones para crear la base de datos SQLite
npx prisma migrate dev
```

### 4. ¡Inicia la Aplicación!

```bash
# Inicia el servidor en modo de desarrollo (con hot-reload)
npm run start:dev
```

¡Listo! La API estará disponible en `http://localhost:3001/api/v1` y la documentación de Swagger en `http://localhost:3001/docs`.

---

## 🔌 Uso de la API

- **URL Base**: `http://localhost:3001/api/v1`
- **Documentación Interactiva**: `http://localhost:3001/docs`

### Autenticación

La autenticación se maneja a través de una cookie `HttpOnly`. El endpoint de `login` la establece automáticamente y el de `logout` la elimina. Las peticiones a endpoints protegidos deben incluir esta cookie.

### Resumen de Endpoints

| Método | Ruta | Descripción | Requiere Auth | Rol | 
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/auth/register` | Registra un nuevo usuario. | ❌ | | 
| `POST` | `/auth/login` | Inicia sesión y obtiene la cookie de auth. | ❌ | | 
| `POST` | `/auth/logout` | Cierra la sesión del usuario. | ❌ | | 
| `GET` | `/users` | Obtiene los datos del usuario actual. | ✅ | User | 
| `GET` | `/users/all` | Obtiene todos los usuarios. | ✅ | Admin | 
| `PATCH` | `/users` | Actualiza los datos del usuario actual. | ✅ | User | 
| `DELETE`| `/users/:id` | Elimina la cuenta del usuario actual. | ✅ | User | 
| `GET` | `/products` | Lista todos los productos. | ❌ | | 
| `GET` | `/products/:id` | Obtiene un producto por su ID. | ❌ | | 
| `POST` | `/products` | Crea un nuevo producto (incluye imagen). | ✅ | Admin | 
| `PATCH` | `/products/:id` | Actualiza un producto (incluye imagen). | ✅ | Admin | 
| `DELETE`| `/products/:id` | Elimina un producto. | ✅ | Admin | 
| `GET` | `/orders` | Lista las órdenes del usuario actual. | ✅ | User | 
| `GET` | `/orders/all` | Lista todas las órdenes del sistema. | ✅ | Admin | 
| `POST` | `/payments/checkout` | Crea una sesión de pago con Stripe. | ✅ | User | 

---

## 🛠️ Scripts Útiles

| Script | Descripción |
| :--- | :--- |
| `npm run start:dev` | Inicia la app en modo desarrollo con `watch`. |
| `npm run build` | Compila el proyecto para producción. |
| `npm run start:prod` | Inicia la app en modo producción (requiere `build`). |
| `npm run lint` | Analiza el código con ESLint y corrige errores. |
| `npm run format` | Formatea el código con Prettier. |
| `npm run test` | Ejecuta las pruebas unitarias. |
| `npm run test:e2e` | Ejecuta las pruebas end-to-end. |
| `npx prisma generate` | Genera el cliente de Prisma según tu `schema.prisma`. |
| `npx prisma migrate dev`| Crea y aplica nuevas migraciones de Prisma en desarrollo. |

---

## 📄 Licencia

Este proyecto es de código privado y no tiene una licencia pública. (Actualmente `UNLICENSED`).