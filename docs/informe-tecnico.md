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
```text
src/
├── server.ts                  # 🚀 Arranque (Entry Point)
├── app.ts                     # ⚙️ Configuración Global (Express, Middlewares Globales)
│
├── routes/                    # 🟢 CAPA: ROUTES (Asocia Verbo/Ruta → Controller)
│   ├── user.ts                # Rutas de usuarios
│   ├── publication.ts         # Rutas de publicaciones
│   └── reservation.ts        # Rutas de reservas
│
├── middlewares/               # 🌑 CAPA: MIDDLEWARES (Validación de Token, Rol y Payload)
│   ├── auth.ts                # Verificación de JWT
│   ├── roles.ts              # Control de acceso por rol
│   ├── upload.ts              # Manejo de archivos (Multer)
│   └── errorHandler.ts       # Manejador global de errores
│
├── controllers/               # 🟢 CAPA: CONTROLLERS (HTTP → Servicio → Respuesta)
│   ├── user.ts                # Lógica de entrada/salida de Usuarios
│   ├── publication.ts         # Lógica de entrada/salida de Publicaciones
│   └── reservation.ts        # Lógica de entrada/salida de Reservas
│
├── services/                  # 🟠 CAPA: SERVICES (Lógica de Negocio y Permisos de Propiedad)
│   ├── auth.service.ts        # Lógica de autenticación
│   ├── user.service.ts        # Reglas de negocio de Usuarios
│   ├── publication.service.ts # Reglas de negocio de Publicaciones
│   ├── reservation.service.ts  # Reglas de negocio de Reservas
│   ├── notification.service.ts # Reglas de negocio de Notificaciones
│   └── jwt.ts                 # Gestión de tokens (Lógica de servicio)
│
├── repositories/               # 🌑 CAPA: REPOSITORIES (Consultas Atómicas y Persistencia)
│   ├── user.repository.ts      # Consultas MongoDB de Usuarios
│   ├── publication.repository.ts # Consultas MongoDB de Publicaciones
│   └── reservation.repository.ts # Consultas MongoDB de Reservas
│
├── models/                    # 🌑 CAPA: MODELS / MongoDB (Esquemas y Tipos)
│   ├── user.ts                # Esquema de Usuario
│   ├── publication.ts         # Esquema de Publicación
│   ├── reservation.ts          # Esquema de Reserva
│   └── notification.ts         # Esquema de Notificación
│
├── types/                     # 🛠️ TIPADO (Específico de TypeScript)
│   ├── domain.ts              # Tipos y Enums del dominio (Roles, Estados)
│   └── express.d.ts           # Extensión de Request para incluir req.user
│
├── utils/                     # 🛠️ Soporte: Utilidades transversales
│   ├── response.ts            # Constructor del sobre de respuesta
│   └── AppError.ts            # Clase de errores de negocio
│
├── validators/                # 🛠️ Soporte: Validaciones de entrada
│
├── database/                  # ⚙️ Configuración de Base de Datos
│   └── connection.ts           # Gestión de conexión a MongoDB
│
└── helpers/                   # 🛠️ Soporte: Ayudantes generales
    └── validate.ts           # Lógica auxiliar de validación
```

### 🔄 Recorrido de una Petición (Ejemplo: Reservar Ítem)

A continuación se describe la travesía de una petición `POST /api/v1/reservations`.

| Capa | Archivo | ¿Qué ocurre? | Si falla... |
| :--- | :--- | :--- | :--- |
| **Routes** | `routes/reservation.ts` | Recibe la petición y verifica que el verbo sea `POST`. Delega al middleware de auth y luego al controlador. | **404 Not Found**: Si la ruta no existe. |
| **Middleware**| `middlewares/auth.ts` | Extrae el token Bearer, lo valida y adjunta el usuario al objeto `req.user`. | **401 Unauthorized**: Token inválido o ausente. |
| **Controller**| `controllers/reservation.ts` | Extrae `publication_id` e `item_id` del cuerpo. Llama al servicio de reservas. | **400 Bad Request**: Si faltan campos obligatorios (lanza `AppError`). |
| **Service** | `services/reservation.service.ts`| Valida que la publicación esté aprobada y el ítem disponible. Orquestra la reserva atómica. | **409 Conflict**: Si el ítem ya está reservado o la publicación fue rechazada. |
| **Repository**| `repositories/reservation.repository.ts`| Ejecuta el `findOneAndUpdate` atómico en MongoDB y crea el documento de reserva. | **500 Internal Error**: Fallo de conexión o error de base de datos. |
| **Models** | `models/reservation.ts` | Valida que los datos cumplan el esquema (ObjectId, Enums de estado). | **400 Validation Error**: Datos incompatibles con el esquema. |
| **Response** | `utils/response.ts` | El controlador recibe el resultado y usa `sendSuccess` para envolver la data en el sobre estándar. | — |

#### 💻 Fragmentos Relevantes del Flujo

```typescript
// 1. ROUTE: Definición del endpoint
// src/routes/reservation.ts
router.post("/", auth, ReservationController.create); // Enlace: Ruta -> Auth -> Controller

// 2. CONTROLLER: Traducción HTTP -> Servicio
// src/controllers/reservation.ts
async create(req: Request, res: Response, next: NextFunction) {
    try {
        const { publication_id, item_id } = req.body;
        // Llama al servicio pasando el ID del usuario autenticado (req.user)
        const reservation = await reservationService.createReservation(req.user!.id, publication_id, item_id);
        sendSuccess(res, reservation, 201); // Respuesta estandarizada
    } catch (error) {
        next(error); // Propaga el error al errorHandler
    }
}

// 3. SERVICE: Reglas de negocio y validación de estado
// src/services/reservation.service.ts
async createReservation(donorId, pubId, itemId) {
    // Lógica: Verificar que el ítem esté "disponible" antes de intentar reservar
    // Lanza AppError si no se cumple la regla de negocio
    if (!isAvailable) throw new AppError("NEED_NOT_AVAILABLE", 409, "El ítem ya está reservado");
    return await reservationRepository.save(donorId, pubId, itemId);
}

// 4. REPOSITORY: Operación atómica en MongoDB
// src/repositories/reservation.repository.ts
async save(donorId, pubId, itemId) {
    // Actualización condicionada: Solo marca como 'reservado' si sigue 'disponible'
    return await Publication.findOneAndUpdate(
        { _id: pubId, "necesidades": { $elemMatch: { _id: itemId, status: "disponible" } } },
        { $set: { "necesidades.$.status": "reservado" } }
    );
}
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
