# Econova Backend

Backend para una aplicación de comercio electrónico construida con NestJS, Prisma y PostgreSQL. Gestiona la autenticación de usuarios, el catálogo de productos y el procesamiento de pagos.

## Características Principales

- **Autenticación y Autorización:**
  - Registro de nuevos usuarios.
  - Inicio de sesión con credenciales (email y contraseña).
  - Cierre de sesión.
  - Protección de rutas mediante JSON Web Tokens (JWT).
  - Roles de usuario (ADMIN, USER) para control de acceso.
- **Gestión de Productos:**
  - Operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para productos.
  - Carga de imágenes de productos a Cloudinary.
  - Acceso restringido a endpoints de creación, actualización y eliminación solo para administradores.
- **Procesamiento de Pagos:**
  - Endpoint para crear intentos de pago.

## Tecnologías Utilizadas

- **Framework:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org/)
- **Autenticación:** [Passport](http://www.passportjs.org/) con estrategia JWT.
- **Validación:** [class-validator](https://github.com/typestack/class-validator) y [class-transformer](https://github.com/typestack/class-transformer).
- **Carga de Archivos:** Integración con [Cloudinary](https://cloudinary.com/) para el almacenamiento de imágenes.
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)

## Estructura del Proyecto

```
/src
├── /auth           # Lógica de autenticación y autorización
│   ├── /decorators # Decoradores personalizados
│   ├── /dto        # Data Transfer Objects para auth
│   ├── /guards     # Guardianes de rutas
│   ├── /interfaces # Interfaces y enums
│   └── /strategies # Estrategias de Passport.js
├── /cloudinary     # Servicio para la carga de imágenes
├── /payments       # Lógica para el procesamiento de pagos
├── /prisma         # Servicio y módulo de Prisma
└── /products       # Lógica para la gestión de productos
```

## Esquema de la Base de Datos

El esquema de la base de datos se define en `prisma/schema.prisma`.

### Modelo `User`

| Campo      | Tipo     | Descripción                           |
| ---------- | -------- | ------------------------------------- |
| `id`       | `Int`    | Identificador único (autoincremental) |
| `name`     | `String` | Nombre del usuario.                   |
| `email`    | `String` | Email del usuario (único).            |
| `password` | `String` | Contraseña hasheada.                  |
| `address`  | `String` | Dirección del usuario.                |
| `phone`    | `String` | Teléfono del usuario.                 |
| `role`     | `Role`   | Rol del usuario (`USER` o `ADMIN`).   |

### Modelo `Product`

| Campo         | Tipo       | Descripción                               |
| ------------- | ---------- | ----------------------------------------- |
| `id`          | `String`   | Identificador único (UUID).               |
| `name`        | `String`   | Nombre del producto.                      |
| `slug`        | `String`   | Slug único para URL amigable.             |
| `description` | `String?`  | Descripción del producto (opcional).      |
| `price`       | `Int`      | Precio del producto.                      |
| `image`       | `String?`  | URL de la imagen del producto (opcional). |
| `stock`       | `Int`      | Cantidad de stock disponible.             |
| `sku`         | `String`   | SKU (Stock Keeping Unit) del producto.    |
| `category`    | `Category` | Categoría del producto.                   |

## Documentación de la API

### Módulo de Autenticación (`/auth`)

#### `POST /auth/register`

Registra un nuevo usuario.

- **Body:** `RegisterAuthDto`
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "address": "123 Main St",
    "phone": "555-1234"
  }
  ```
- **Respuesta Exitosa (201):**
  ```json
  {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "USER"
    },
    "token": "jwt.token.here"
  }
  ```

#### `POST /auth/login`

Inicia sesión para un usuario existente.

- **Body:** `LoginAuthDto`
  ```json
  {
    "email": "john.doe@example.com",
    "password": "password123"
  }
  ```
- **Respuesta Exitosa (201):** Devuelve el usuario y un token JWT, además de establecer una cookie `access_token`.

#### `POST /auth/logout`

Cierra la sesión del usuario.

- **Respuesta Exitosa (201):** Limpia la cookie `access_token`.

### Módulo de Productos (`/products`)

#### `POST /products`

Crea un nuevo producto.

- **Rol Requerido:** `ADMIN`
- **Body:** `CreateProductDto` (form-data)
  - `name`: `String`
  - `description`: `String` (opcional)
  - `price`: `Number`
  - `stock`: `Number`
  - `sku`: `String`
  - `category`: `Enum`
  - `file`: `File` (imagen del producto)
- **Respuesta Exitosa (201):** El objeto del producto creado.

#### `GET /products`

Obtiene una lista de todos los productos.

- **Respuesta Exitosa (200):** Un array de objetos de productos.

#### `GET /products/:id`

Obtiene un producto por su ID.

- **Respuesta Exitosa (200):** El objeto del producto.

#### `PATCH /products/:id`

Actualiza un producto existente.

- **Rol Requerido:** `ADMIN`
- **Body:** `UpdateProductDto` (form-data, opcional) y/o `file` (imagen).
- **Respuesta Exitosa (200):** El objeto del producto actualizado.

#### `DELETE /products/:id`

Elimina un producto.

- **Rol Requerido:** `ADMIN`
- **Respuesta Exitosa (200):** Un mensaje de confirmación.

### Módulo de Pagos (`/payments`)

#### `POST /payments/checkout`

Crea una intención de pago.

- **Body:** `CreatePaymentDto`
  ```json
  {
    "amount": 2000,
    "currency": "usd"
  }
  ```
- **Respuesta Exitosa (201):** Devuelve un `client_secret` para ser usado en el frontend.

## Guía de Inicio Rápido

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/download/)

### Instalación

1.  **Clona el repositorio:**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd econova-backend
    ```

2.  **Instala las dependencias:**

    ```bash
    npm install
    ```

3.  **Configura las variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:

    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    JWT_SECRET="TU_SECRET_JWT"

    CLOUDINARY_CLOUD_NAME="TU_CLOUD_NAME"
    CLOUDINARY_API_KEY="TU_API_KEY"
    CLOUDINARY_API_SECRET="TU_API_SECRET"
    ```

4.  **Aplica las migraciones de la base de datos:**

    ```bash
    npx prisma migrate dev
    ```

5.  **Inicia la aplicación en modo de desarrollo:**
    ```bash
    npm run start:dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

## Scripts Disponibles

- `npm run build`: Compila el proyecto a JavaScript.
- `npm run format`: Formatea el código con Prettier.
- `npm run start`: Inicia la aplicación en modo producción.
- `npm run start:dev`: Inicia la aplicación en modo desarrollo con recarga automática.
- `npm run lint`: Analiza el código con ESLint.
- `npm test`: Ejecuta las pruebas unitarias.
