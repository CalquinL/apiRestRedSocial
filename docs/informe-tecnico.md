# Informe Técnico de la API - Robin (v1.0.0)

Este documento describe la arquitectura, el contrato de la API y los estándares de implementación del backend de la plataforma Robin.

---

## 1. Especificación de Endpoints

### 🔐 Autenticación (`/auth`)
| Verbo | Ruta | Cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/auth/register` | `{name, surname, nick, email, password, role}` | Público | 201 | 400, 409 |
| POST | `/auth/login` | `{email, password}` | Público | 200 | 400, 401 |

### 👤 Usuarios (`/users`)
| Verbo | Ruta | Cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| GET | `/users/me` | — | Autenticado | 200 | 401 |
| PATCH | `/users/me` | `{name, surname, nick, address, phone}` | Autenticado | 200 | 400, 409 |
| GET | `/users/{id}` | — | Autenticado | 200 | 400, 404 |

### 📦 Publicaciones (`/publications`)
| Verbo | Ruta | Cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/publications` | `{text, necesidades: [{name}]}` | Beneficiario | 201 | 400, 403 |
| GET | `/publications` | — | Autenticado | 200 | 400 |
| GET | `/publications/{id}` | — | Autenticado | 200 | 400, 404 |
| PATCH | `/publications/{id}` | `{text, necesidades}` | Dueño | 200 | 400, 403, 404 |
| DELETE | `/publications/{id}` | — | Dueño | 204 | 403, 404, 409 |
| PATCH | `/publications/{id}/status` | `{status}` | Admin | 200 | 400, 403, 404, 409 |
| PUT | `/publications/{id}/image` | `multipart/form-data` | Dueño | 200 | 400, 403, 404, 415 |

### 🤝 Reservaciones (`/reservations`)
| Verbo | Ruta | Cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/reservations` | `{publication_id, item_id}` | Donante | 201 | 400, 403, 404, 409 |
| GET | `/reservations` | — | Autenticado | 200 | 400 |
| GET | `/reservations/{id}` | — | Participante/Admin | 200 | 403, 404 |
| PATCH | `/reservations/{id}/status` | `{status}` | Participante | 200 | 400, 403, 404, 409 |

---

## 2. Gestión de Respuestas y Errores

### Tabla de Códigos de Estado
| Código | Uso en la API |
|---|---|
| **200** | Consulta o modificación exitosa. |
| **201** | Recurso creado exitosamente (User, Publication, Reservation). |
| **204** | Recurso eliminado exitosamente (sin cuerpo). |
| **400** | Petición mal formada, campos faltantes o IDs inválidos. |
| **401** | Token ausente, inválido o expirado. |
| **403** | Usuario autenticado pero sin permisos (Rol o Propiedad). |
| **404** | Recurso no encontrado. |
| **409** | Conflicto de estado (Ej: Ítem ya reservado o transición inválida). |
| **415** | Tipo de archivo no permitido en subidas. |
| **500** | Error inesperado del servidor. |

### Formato de Respuesta Estándar
Todas las respuestas utilizan un "sobre" JSON para consistencia:

**Éxito:**
```json
{ 
  "status": "success", 
  "statusCode": 200, 
  "data": { ... }, 
  "meta": { "page": 1, "limit": 10, "total": 100, "pages": 10 } 
}
```

**Error:**
```json
{ 
  "status": "error", 
  "statusCode": 409, 
  "error": { "code": "NEED_NOT_AVAILABLE", "message": "...", "details": [] } 
}
```

---

## 3. Ejemplos de Carga Útil (Payloads)

### Caso: Reservar un ítem (Éxito)
**Petición:** `POST /api/v1/reservations`
```json
{
  "publication_id": "6ae5b687461f2637882e28ca",
  "item_id": "6ae7b8b9f598b91e5c8cad76"
}
```
**Respuesta:** `201 Created`
```json
{
  "status": "success",
  "statusCode": 201,
  "data": {
    "_id": "6ae8fc710a6623739cc888ff",
    "publication_id": "6ae5b687461f2637882e28ca",
    "item_id": "6ae7b8b9f598b91e5c8cad76",
    "status": "reservado",
    "reserved_at": "2026-11-02T21:11:13.743Z"
  }
}
```

### Caso: Error de Permisos (Forbidden)
**Petición:** `DELETE /api/v1/publications/{id}` (Siendo un usuario que no es el dueño).
**Respuesta:** `403 Forbidden`
```json
{
  "status": "error",
  "statusCode": 403,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para eliminar esta publicación",
    "details": []
  }
}
```

---

## 4. Arquitectura y Responsabilidades

### Diagrama de Flujo de Capas
`routes` $\rightarrow$ `middlewares` $\rightarrow$ `controllers` $\rightarrow$ `services` $\rightarrow$ `repositories` $\rightarrow$ `models` $\rightarrow$ `MongoDB`

### Estructura de Carpetas
```
src/
├── config/       # Variables de entorno y conexión DB
├── controllers/   # Manejo de req/res y llamadas a servicios
├── middlewares/   # Auth, Roles, Validación, ErrorHandler
├── models/        # Definiciones de Esquemas Mongoose
├── repositories/  # Consultas atómicas a MongoDB
├── routes/        # Definición de endpoints y verbos
├── services/      # Lógica de negocio y reglas de dominio
└── utils/        # Clases de apoyo (AppError, response)
```

### Reglas de Oro de la Arquitectura
1. **Dependencia Unidireccional**: Las capas solo pueden llamar a la capa inmediatamente inferior.
2. **Aislamiento de Express**: Los `services` y `repositories` no conocen `req` ni `res`.
3. **Centralización de Errores**: Solo el `errorHandler` middleware construye la respuesta de error final.
4. **Capa de Persistencia**: Los controladores nunca acceden a los modelos; deben pasar por el servicio y el repositorio.

---

## 5. Persistencia y Credenciales

### Modelo de Datos
- **Usuarios**: Colección independiente.
- **Publicaciones**: Colección con necesidades **embebidas** (para optimizar lecturas del feed).
- **Reservaciones**: Colección independiente vinculando Donante e Ítem.
- **Notificaciones**: Colección independiente para alertas.

### Manejo de Credenciales
- **Cero Hardcoding**: Todas las credenciales (`MONGODB_URI`, `JWT_SECRET`) residen en el archivo `.env`.
- **Seguridad**: El archivo `.env` está incluido en `.gitignore`.
- **Reproducibilidad**: Se proporciona un archivo `.env.example` con las claves necesarias para el despliegue.
