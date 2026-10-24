# API Robin - Documentación Técnica (v1.0.0)

Esta API gestiona una plataforma de wishlist solidaria. Todas las rutas comienzan con `/api/v1`.

## Formato de Respuesta
Todas las respuestas siguen el sobre estándar:
- **Éxito**: `{ "status": "success", "statusCode": 200, "data": { }, "meta": { ... } }`
- **Error**: `{ "status": "error", "statusCode": 400, "error": { "code": "...", "message": "...", "details": [] } }`

## Endpoints

### Auth
| Verbo | Ruta | Acceso | Éxito | Errores Comunes | Descripción |
|---|---|---|---|---|---|
| POST | `/auth/register` | Público | 201 | 400, 409 | Registro de usuario (beneficiario/donante) |
| POST | `/auth/login` | Público | 200 | 400, 401 | Login y obtención de JWT token |

### Users
| Verbo | Ruta | Acceso | Éxito | Errores Comunes | Descripción |
|---|---|---|---|---|---|
| GET | `/users/me` | Autenticado | 200 | — | Datos del usuario actual |
| PATCH | `/users/me` | Autenticado | 200 | 400, 409 | Actualización de perfil |
| GET | `/users/{id}` | Autenticado | 200 | 400, 404 | Perfil de un usuario específico |

### Publications
| Verbo | Ruta | Acceso | Éxito | Errores Comunes | Descripción |
|---|---|---|---|---|---|
| POST | `/publications` | beneficiario | 201 | 400, 403 | Crear publicación (estado: pendiente) |
| GET | `/publications` | Autenticado | 200 | 400 | Feed de publicaciones aprobadas (paginado) |
| GET | `/publications/{id}` | Autenticado | 200 | 400, 404 | Detalle de una publicación |
| GET | `/users/{id}/publications` | Autenticado | 200 | 400, 404 | Publicaciones de un usuario específico |
| PATCH | `/publications/{id}` | Dueño | 200 | 400, 403, 404 | Editar datos de la publicación |
| DELETE | `/publications/{id}` | Dueño | 204 | 403, 404, 409 | Eliminar publicación (409 si hay reservas) |
| PATCH | `/publications/{id}/status` | admin | 200 | 400, 403, 404, 409 | Moderar: aprobar o rechazar publicación |
| PUT | `/publications/{id}/image` | Dueño | 200 | 400, 403, 404, 415 | Subir imagen (multipart/form-data) |

### Reservations
| Verbo | Ruta | Acceso | Éxito | Errores Comunes | Descripción |
|---|---|---|---|---|---|
| POST | `/reservations` | donante | 201 | 400, 403, 404, 409 | Reservar un ítem (Reserva Atómica) |
| GET | `/reservations` | Autenticado | 200 | 400 | Listar reservas del usuario autenticado |
| GET | `/reservations/{id}` | Participante | 200 | 403, 404 | Detalle de una reserva |
| PATCH | `/reservations/{id}/status` | Participante | 200 | 400, 403, 404, 409 | Cancelar o confirmar entrega |

### Notifications
| Verbo | Ruta | Acceso | Éxito | Errores Comunes | Descripción |
|---|---|---|---|---|---|
| GET | `/notifications` | Autenticado | 200 | 400 | Listar notificaciones del usuario |
| PATCH | `/notifications/{id}` | Dueño | 200 | 400, 403, 404 | Marcar notificación como leída |
