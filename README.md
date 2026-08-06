# API REST - Red Social

API REST desarrollada con Node.js, Express y MongoDB para gestionar usuarios, publicaciones y relaciones de seguimiento (follow) de una red social.

## 🚀 Tecnologías

- **Node.js** y **Express** — servidor y enrutamiento
- **MongoDB** con **Mongoose** — base de datos
- **JWT (jwt-simple)** — autenticación mediante tokens
- **Moment.js** — manejo de fechas

## 📁 Estructura del proyecto
├── controllers/ # Lógica de negocio
├── database/ # Conexión a MongoDB
├── helpers/ # Funciones de validación
├── middlewares/ # Autenticación (JWT)
├── models/ # Esquemas de Mongoose
├── routes/ # Endpoints de la API
├── services/ # Servicios (JWT, follow)
└── uploads/ # Archivos subidos por usuarios

## ⚙️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/CalquinL/apiRestRedSocial.git
cd apiRestRedSocial
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz con las siguientes variables:
JWT_SECRET=tu_clave_secreta
MONGO_URI=mongodb://localhost:27017/red_social

4. Inicia el servidor:
```bash
npm start
```

## 📌 Endpoints principales

### Usuarios (`/api/user`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/prueba-user` | ✅ | Ruta de prueba |
| POST | `/register` | ❌ | Registro de usuario |
| POST | `/login` | ❌ | Inicio de sesión |
| GET | `/profile/:id` | ✅ | Ver perfil de un usuario |
| GET | `/list` | ✅ | Listar usuarios |
| GET | `/list/:page` | ✅ | Listar usuarios (paginado) |
| PUT | `/update` | ✅ | Actualizar datos del usuario |
| POST | `/upload` | ✅ | Subir avatar |
| GET | `/avatar/:file` | ❌ | Obtener imagen de avatar |

### Publicaciones (`/api/publication`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/prueba-publication` | ❌ | Ruta de prueba |
| POST | `/save` | ✅ | Crear publicación |
| GET | `/detail/:id` | ✅ | Ver detalle de una publicación |
| DELETE | `/remove/:id` | ✅ | Eliminar publicación |
| GET | `/user/:id/:page` | ✅ | Publicaciones de un usuario (paginado) |
| POST | `/upload/:id` | ✅ | Subir imagen a una publicación |
| GET | `/media/:file` | ❌ | Obtener imagen de una publicación |
| GET | `/feed/:page` | ✅ | Feed de publicaciones (paginado) |

### Follow (`/api/follow`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/prueba-follow` | ❌ | Ruta de prueba |
| POST | `/save` | ✅ | Seguir a un usuario |
| DELETE | `/unfollow/:id` | ✅ | Dejar de seguir |
| GET | `/following/:id` | ✅ | Usuarios que sigo |
| GET | `/followers/:id` | ✅ | Usuarios que me siguen |

## 🔐 Autenticación
La API utiliza JWT. Debes incluir el token en el header de las peticiones protegidas:


## 👤 Autor
Lucas Calquín — Estudiante de Ing. Civil en Computación e Informática, Universidad Mayor