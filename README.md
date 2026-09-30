# ShipNow API

API REST para gestionar **productos** y **usuarios**, con cálculo de costo de envío. El proyecto está organizado en una **arquitectura por capas** (Controller → Service → Repository) para separar responsabilidades.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| [Node.js](https://nodejs.org/) | Entorno de ejecución (módulos ES) |
| [Express 4](https://expressjs.com/) | Servidor HTTP y ruteo |
| [MongoDB](https://www.mongodb.com/) + [Mongoose 8](https://mongoosejs.com/) | Base de datos y modelado de esquemas |
| [dotenv](https://github.com/motdotla/dotenv) | Carga de variables de entorno desde `.env` |
| [cors](https://github.com/expressjs/cors) | Habilita peticiones desde otros orígenes |
| [nodemon](https://nodemon.io/) | Reinicio automático en desarrollo |

## Cómo correrlo localmente

Requisitos: Node.js 18 o superior y una base MongoDB (local o Atlas).

```bash

npm install

npm run dev                 # desarrollo (nodemon)
npm start                   # producción
```

### Variables de entorno

Las tres son obligatorias. Si falta alguna, la app **no arranca** y muestra un error indicando cuál falta.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `8080` |
| `MONGO_URI` | URI de conexión a MongoDB | `mongodb+srv://<usuario>:<password>@<cluster>/<base>` |
| `NODE_ENV` | Entorno de ejecución | `development` o `production` |

El archivo `.env` está en `.gitignore` y no se sube al repositorio; solo se versiona `.env.example`.

## Estructura del proyecto

```
Backend_III/
├── app.js                      Configuración de Express: middlewares, rutas y manejo de errores
├── .env.example                Plantilla de variables de entorno
├── package.json
└── src/
    ├── server.js               Punto de entrada: conecta a MongoDB y levanta el servidor
    ├── config/
    │   ├── env.config.js       Carga y valida las variables de entorno (único lugar con process.env)
    │   └── dataBase.js         Conexión a MongoDB
    ├── constants/
    │   └── index.js            Constantes congeladas: roles, estados de producto, costos de envío
    ├── models/
    │   ├── product.model.js    Esquema de productos (solo esquema, sin lógica)
    │   └── user.model.js       Esquema de usuarios (solo esquema, sin lógica)
    ├── repositories/
    │   ├── products.repository.js   Único lugar que consulta Mongoose para productos
    │   └── users.repository.js      Único lugar que consulta Mongoose para usuarios
    ├── services/
    │   ├── products.service.js      Reglas de negocio de productos
    │   ├── users.service.js         Reglas de negocio de usuarios
    │   └── email.service.js         Simulación de envío de emails (log por consola)
    ├── controllers/
    │   ├── products.controller.js   Manejo de req/res para productos
    │   └── users.controller.js      Manejo de req/res para usuarios
    ├── routes/
    │   ├── products.router.js       Conecta cada path con su método del controller
    │   └── users.router.js
    ├── middlewares/
    │   └── error.middleware.js      Respuestas 404 y manejo centralizado de errores
    └── utils/
        ├── errors.js                Clase AppError (mensaje + código HTTP)
        └── pick.js                  Filtra del body solo los campos permitidos
```

## Flujo de una petición

```
Request → Router → Controller → Service → Repository → MongoDB
                                                         │
Response ← Controller ← Service ← Repository ←───────────┘
```

Si en cualquier punto se lanza un error, el controller lo pasa con `next(error)` y el middleware de errores lo convierte en una respuesta HTTP.

## Por qué separé la lógica entre Service y Repository

- **Repository**: sabe *cómo* se guardan y buscan los datos. Encapsula los filtros por defecto y las proyecciones para que el resto de la app no dependa de Mongoose. Por ejemplo, `findAvailable()` aplica el filtro "disponible y con stock", y el repositorio de usuarios nunca devuelve el campo `password`.
- **Service**: sabe *qué reglas* aplica el negocio: qué campos son obligatorios, que el estado del producto se deriva del stock, que no se pueden crear admins desde el endpoint público, cómo se calcula el costo de envío y cuándo corresponde un 404 o un 409. Decide qué pedirle al Repository, pero no conoce Mongoose.
- **Controller**: solo traduce HTTP (lee `req`, llama al Service, responde con el código de estado). No conoce la base de datos.

Así, cambiar la base de datos solo afecta a los repositories, y las reglas de negocio pueden probarse sin levantar MongoDB.

## Formato de respuestas

Respuesta exitosa:

```json
{
  "status": "success",
  "payload": { }
}
```

Respuesta con error:

```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

| Código | Cuándo ocurre |
|---|---|
| `200` | Consulta, actualización o eliminación correcta |
| `201` | Recurso creado |
| `400` | Faltan campos, datos inválidos, ID con formato incorrecto o violación de una regla |
| `403` | Intento de asignar el rol `admin` mediante una actualización |
| `404` | El recurso o la ruta no existen |
| `409` | Conflicto por duplicado (código de producto o email ya registrados) |
| `500` | Error interno del servidor |

## Endpoints

### Health check

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Verifica que el servidor está activo |

### Productos — `/api/products`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/products` | Lista los productos **disponibles y con stock** |
| GET | `/api/products?all=true` | Lista **todos** los productos, sin filtrar |
| GET | `/api/products/:id` | Devuelve un producto por ID |
| GET | `/api/products/:id/shipping-cost` | Calcula el costo de envío del producto |
| POST | `/api/products` | Crea un producto |
| PUT | `/api/products/:id` | Actualiza un producto |
| DELETE | `/api/products/:id` | Elimina un producto |

**Crear producto** (`POST /api/products`)

```json
{
  "title": "Zapatillas Runner",
  "code": "ZAP-001",
  "price": 45000,
  "stock": 10,
  "description": "Zapatillas livianas para running",
  "category": "calzado"
}
```

- Obligatorios: `title`, `code` y `price`. Opcionales: `description`, `category` y `stock` (por defecto `0`).
- `price` y `stock` no pueden ser negativos.
- El `code` es único; si ya existe responde `409`.
- El `status` **no se envía**: se calcula solo. Con `stock > 0` queda `available`; con `stock = 0` queda `out_of_stock`.
- Al crearlo se simula el envío de un email de notificación (se imprime en consola).

**Actualizar producto** (`PUT /api/products/:id`)

```json
{ "price": 50000, "stock": 0 }
```

- Se puede enviar cualquiera de los campos: `title`, `description`, `code`, `price`, `stock`, `category`, `status`.
- Si se modifica el `stock`, el `status` se recalcula automáticamente.
- Si se envía `status` directamente, debe ser `available` o `out_of_stock`.
- Si el body no trae ningún campo válido responde `400`.

**Costo de envío** (`GET /api/products/:id/shipping-cost`)

```json
{
  "status": "success",
  "payload": {
    "product": "665f1c2e8a1b2c3d4e5f6a7b",
    "declaredValue": 45000,
    "shippingCost": 10
  }
}
```

- En `development` el costo es fijo: **10**.
- En `production` es **50 + 1% del precio** del producto, redondeado a 2 decimales.

### Usuarios — `/api/users`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users` | Lista todos los usuarios |
| GET | `/api/users/:id` | Devuelve un usuario por ID |
| POST | `/api/users` | Crea un usuario |
| PUT | `/api/users/:id` | Actualiza un usuario |
| DELETE | `/api/users/:id` | Elimina un usuario |

**Crear usuario** (`POST /api/users`)

```json
{
  "firstName": "Enzo",
  "lastName": "Pérez",
  "email": "enzo@mail.com",
  "password": "123456",
  "documents": [
    { "name": "DNI", "reference": "https://ejemplo.com/docs/dni.pdf" }
  ]
}
```

- Obligatorios: `firstName`, `lastName`, `email` y `password`.
- `documents` es opcional: una lista de objetos con `name` y `reference` (ambos texto). Si no se envía, queda vacía.
- El `role` no hace falta enviarlo: por defecto es `user`. Si se envía `admin`, responde `400`, ya que no se pueden crear administradores desde este endpoint.
- El email se guarda en minúsculas y debe ser único; si ya está registrado responde `409`.

**Actualizar usuario** (`PUT /api/users/:id`)

- Campos permitidos: `firstName`, `lastName`, `email`, `password`, `role` y `documents`.
- Intentar asignar el rol `admin` responde `403`.
- `documents` se **reemplaza completo**: hay que enviar la lista entera, no solo el elemento nuevo.

**Sobre la contraseña:** ninguna respuesta de la API incluye el campo `password`; el repositorio lo excluye en todas las consultas.

## Constantes del dominio

Definidas en `src/constants/index.js` con `Object.freeze`, para evitar strings sueltos en el código:

| Constante | Valores |
|---|---|
| `USER_ROLES` | `ADMIN` (`admin`), `USER` (`user`) |
| `PRODUCT_STATUS` | `AVAILABLE` (`available`), `OUT_OF_STOCK` (`out_of_stock`) |
| `RESPONSE_STATUS` | `SUCCESS` (`success`), `ERROR` (`error`) |
| `SHIPPING` | Costos usados en el cálculo de envío |

