# Robin · Back end (Hito 2)

API REST desarrollada con Node.js, Express y MongoDB para gestionar una plataforma de wishlist solidaria, permitiendo a beneficiarios publicar necesidades y a donantes reservarlas.

## 🚀 Tecnologías

- **Node.js** y **Express** — servidor y enrutamiento
- **MongoDB** con **Mongoose** — base de datos
- **JWT** — autenticación mediante tokens
- **TypeScript** — lenguaje de programación (migración gradual)

## 📁 Estructura del proyecto

```
src/
├── config/       # Configuración de entorno y base de datos
├── controllers/  # Manejadores de peticiones HTTP
├── middlewares/  # Filtros de auth, roles y errores
├── models/       # Definiciones de esquemas Mongoose
├── repositories/ # Operaciones atómicas de base de datos
├── routes/      # Definición de endpoints (/api/v1)
├── services/     # Reglas de negocio y lógica de dominio
├── utils/        # Respuestas estandarizadas y AppError
└── validators/   # Esquemas de validación de datos
```

## ⚙️ Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd ApiRest_Node
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno creando un archivo `.env` basado en `.env.example`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/robin
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*
UPLOAD_DIR=uploads/
```

4. Inicia el servidor:
```bash
npm run dev
```

## 📌 Endpoints principales (v1)

Todas las rutas parten de `/api/v1`.

### Auth (`/auth`)
- `POST /register`: Registro de usuario.
- `POST /login`: Inicio de sesión.

### Users (`/users`)
- `GET /me`: Ver perfil propio.
- `PATCH /me`: Actualizar perfil propio.
- `GET /users/{id}`: Ver perfil de otro usuario.

### Publications (`/publications`)
- `POST /publications`: Crear publicación (beneficiario).
- `GET /publications`: Listar aprobadas (paginado).
- `GET /publications/{id}`: Detalle de publicación.
- `PATCH /publications/{id}`: Editar publicación.
- `DELETE /publications/{id}`: Eliminar publicación.
- `PATCH /publications/{id}/status`: Moderar estado (admin).
- `PUT /publications/{id}/image`: Subir imagen.

### Reservations (`/reservations`)
- `POST /reservations`: Reservar un ítem (donante).
- `GET /reservations`: Mis reservaciones (paginado).
- `GET /reservations/{id}`: Detalle de reservación.
- `PATCH /reservations/{id}/status`: Cancelar o confirmar entrega.

## 🔐 Autenticación
La API utiliza JWT. Debes incluir el token en el header de las peticiones protegidas:
`Authorization: Bearer <token>`

## 👤 Autor
Lucas Calquín — Estudiante de Ing. Civil en Computación e Informática, Universidad Mayor
