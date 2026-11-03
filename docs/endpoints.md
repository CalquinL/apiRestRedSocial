# Documentación de Endpoints - API Robin (v1.0.0)

Esta documentación detalla la totalidad de los endpoints disponibles en la API de Robin. 
**URL Base:** `http://localhost:3900/api/v1`

## 📋 Estándar de Respuesta

Toda respuesta de la API sigue una estructura uniforme:

### Respuesta Exitosa
```json
{
  "status": "success",
  "statusCode": 200,
  "data": { }, 
  "meta": { "page": 1, "limit": 10, "total": 1, "pages": 1 }
}
```
*`meta` solo está presente en endpoints con paginación.*

### Respuesta de Error
```json
{
  "status": "error",
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El campo X es obligatorio",
    "details": []
  }
}
```

---

## 🔐 Autenticación
La mayoría de los endpoints requieren un token JWT enviado en la cabecera:
`Authorization: Bearer <token>`

---

## 🚀 Endpoints

### 1. Autenticación (`/auth`)

#### Registrar Usuario
- **Ruta**: `POST http://localhost:3900/api/v1/auth/register`
- **Acceso**: Público
- **Cuerpo**:
```json
{
  "name": "Juan",
  "surname": "Pérez",
  "nick": "juanp",
  "email": "juan@example.com",
  "password": "password123",
  "role": "donante" 
}
```
- **Éxito**: `201 Created`
- **Errores**: `400` (Datos inválidos), `409` (Email o Nick duplicado).

#### Iniciar Sesión
- **Ruta**: `POST http://localhost:3900/api/v1/auth/login`
- **Acceso**: Público
- **Cuerpo**:
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```
- **Éxito**: `200 OK`
- **Errores**: `400` (Datos faltantes), `401` (Credenciales inválidas).

---

### 2. Usuarios (`/users`)

#### Ver Perfil de Usuario
- **Ruta**: `GET http://localhost:3900/api/v1/users/profile/{id}`
- **Parámetros**: `{id}` (ID del usuario).
- **Acceso**: Autenticado (Token)
- **Éxito**: `200 OK`
- **Errores**: `400` (ID mal formado), `404` (Usuario no encontrado).

#### Listar Usuarios
- **Ruta**: `GET http://localhost:3900/api/v1/users/list`
- **Acceso**: Autenticado (Token)
- **Éxito**: `200 OK`
- **Errores**: `400`.

#### Listar Usuarios (Paginado)
- **Ruta**: `GET http://localhost:3900/api/v1/users/list/{page}`
- **Parámetros**: `{page}` (Número de página).
- **Acceso**: Autenticado (Token)
- **Éxito**: `200 OK`
- **Errores**: `400`.

#### Actualizar Perfil
- **Ruta**: `PATCH http://localhost:3900/api/v1/users/update`
- **Acceso**: Autenticado (Token)
- **Cuerpo**:
```json
{
  "address": "Calle Falsa 123",
  "phone": "+5912345678"
}
```
- **Éxito**: `200 OK`
- **Errores**: `400` (Datos inválidos), `409` (Nick ya usado).

#### Subir Avatar
- **Ruta**: `POST http://localhost:3900/api/v1/users/upload`
- **Acceso**: Autenticado (Token)
- **Cuerpo**: `multipart/form-data` (campo `file`).
- **Éxito**: `200 OK`
- **Errores**: `400` (Sin archivo), `415` (Tipo no permitido).

#### Obtener Imagen de Avatar
- **Ruta**: `GET http://localhost:3900/api/v1/users/avatar/{file}`
- **Parámetros**: `{file}` (Nombre del archivo).
- **Acceso**: Público
- **Éxito**: `200 OK` (Archivo imagen).
- **Errores**: `404` (Imagen no encontrada).

---

### 3. Publicaciones (`/publications`)

#### Crear Publicación
- **Ruta**: `POST http://localhost:3900/api/v1/publications`
- **Acceso**: Rol `beneficiario` (Token)
- **Cuerpo**:
```json
{
  "text": "Necesito ayuda para mis estudios",
  "necesidades": [
    { "name": "Cuadernos" },
    { "name": "Lápices" }
  ]
}
```
- **Éxito**: `201 Created`
- **Errores**: `400` (Faltan datos), `403` (Solo beneficiarios).

#### Listar Publicaciones Aprobadas
- **Ruta**: `GET http://localhost:3900/api/v1/publications`
- **Acceso**: Autenticado (Token)
- **Params**: `page`, `limit` (opcionales).
- **Éxito**: `200 OK`
- **Errores**: `400`.

#### Detalle de Publicación
- **Ruta**: `GET http://localhost:3900/api/v1/publications/{id}`
- **Parámetros**: `{id}` (ID de publicación).
- **Acceso**: Autenticado (Token)
- **Éxito**: `200 OK`
- **Errores**: `400` (ID mal formado), `404` (No encontrada).

#### Editar Publicación
- **Ruta**: `PATCH http://localhost:3900/api/v1/publications/{id}`
- **Parámetros**: `{id}` (ID de publicación).
- **Acceso**: Dueño de la publicación (Token)
- **Cuerpo**: `{ "text": "Nuevo texto..." }`
- **Éxito**: `200 OK`
- **Errores**: `400`, `403` (No autorizado), `404`.

#### Eliminar Publicación
- **Ruta**: `DELETE http://localhost:3900/api/v1/publications/{id}`
- **Parámetros**: `{id}` (ID de publicación).
- **Acceso**: Dueño de la publicación (Token)
- **Éxito**: `204 No Content`
- **Errores**: `403` (No autorizado), `404`, `409` (Reservas activas).

#### Moderar Publicación
- **Ruta**: `PATCH http://localhost:3900/api/v1/publications/{id}/status`
- **Parámetros**: `{id}` (ID de publicación).
- **Acceso**: Rol `admin` (Token)
- **Cuerpo**: `{ "status": "aprobada" }` o `{ "status": "rechazada" }`
- **Éxito**: `200 OK`
- **Errores**: `400`, `403`, `404`, `409` (Ya moderada).

#### Subir Imagen de Publicación
- **Ruta**: `PUT http://localhost:3900/api/v1/publications/{id}/image`
- **Parámetros**: `{id}` (ID de publicación).
- **Acceso**: Dueño de la publicación (Token)
- **Cuerpo**: `multipart/form-data` (campo `file`).
- **Éxito**: `200 OK`
- **Errores**: `400`, `403`, `404`, `415` (Tipo no permitido).

#### Publicaciones de un Usuario
- **Ruta**: `GET http://localhost:3900/api/v1/publications/users/{id}/publications`
- **Parámetros**: `{id}` (ID del usuario).
- **Acceso**: Autenticado (Token)
- **Params**: `page`, `limit` (opcionales).
- **Éxito**: `200 OK`
- **Errores**: `400`, `404`.

---

### 4. Reservaciones (`/reservations`)

#### Reservar un Ítem
- **Ruta**: `POST http://localhost:3900/api/v1/reservations`
- **Acceso**: Rol `donante` (Token)
- **Cuerpo**:
```json
{
  "publication_id": "6ae5b687461f2637882e28ca",
  "item_id": "6ae7b8b9f598b91e5c8cad76"
}
```
- **Éxito**: `201 Created`
- **Errores**: `400`, `403`, `404`, `409` (Ítem ya reservado).

#### Mis Reservaciones
- **Ruta**: `GET http://localhost:3900/api/v1/reservations`
- **Acceso**: Autenticado (Token)
- **Params**: `page`, `limit`, `status` (opcionales).
- **Éxito**: `200 OK`
- **Errores**: `400`.

#### Detalle de Reservación
- **Ruta**: `GET http://localhost:3900/api/v1/reservations/{id}`
- **Parámetros**: `{id}` (ID de reserva).
- **Acceso**: Participante (Donante/Beneficiario) o Admin (Token)
- **Éxito**: `200 OK`
- **Errores**: `403` (No autorizado), `404`.

#### Cambiar Estado de Reserva
- **Ruta**: `PATCH http://localhost:3900/api/v1/reservations/{id}/status`
- **Parámetros**: `{id}` (ID de reserva).
- **Acceso**: Participante (Donante/Beneficiario) (Token)
- **Cuerpo**: `{ "status": "cancelada" }` o `{ "status": "entregado" }`
- **Éxito**: `200 OK`
- **Errores**: `400`, `403`, `404`, `409` (Transición inválida).
