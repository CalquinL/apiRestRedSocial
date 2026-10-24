# Robin · Back end (Hito 2)

## 1. Contexto
Robin es una plataforma web de wishlist solidaria: personas naturales publican su historia y una lista de necesidades concretas (bienes, NO dinero). Un admin/moderador verifica cada publicación antes de que sea visible. Los donantes reservan ítems y la entrega se confirma de forma MANUAL (no hay confirmación fotográfica).

Este repositorio es SOLO el back end (API REST). El frontend (React) se integra en el Hito 3: no se toca ahora.

- Entrega: viernes 30 de octubre de 2026, 23:59. Presentación en vivo del 2 al 6 de noviembre (7 min + preguntas a un integrante sorteado). La demo es en vivo contra el servicio corriendo.
- Stack: Node.js + Express + MongoDB (Mongoose) + JWT.
- Lenguaje: TypeScript, con migración gradual desde el código JavaScript base. La migración es la ÚLTIMA fase y tiene fecha límite de decisión (ver sección 16).
- Base de código: mi API REST de red social (`CalquinL/apiRestRedSocial`), solo como punto de partida. La API de Robin se rediseña según este documento.
- Follow (de la red social) NO pertenece a Robin, se elimina.

## 2. Qué se evalúa (prioridades)
1. Diseño de la API REST: tabla completa, códigos de estado, ejemplos y criterio de versionado (14 pts).
2. Separación de responsabilidades y capas (12 pts).
3. Persistencia real, script de creación reproducible y credenciales fuera del repo (10 pts).
4. Trazabilidad con el Hito 1 y sección de cambios documentada (8 pts).
5. Demo en vivo con al menos 4 peticiones reales (crear, leer, actualizar, borrar) mostrando código de estado y dato guardado.
6. El equipo debe poder explicar POR QUÉ está escrito así. Prefiere código simple y legible sobre código ingenioso.

## 3. Arquitectura (regla obligatoria)
```
routes → middlewares / controllers → services → repositories → models (Mongoose) → MongoDB
```
Las dependencias solo van hacia abajo. Ninguna capa se salta a la siguiente ni depende de una superior.

| Capa | Puede | NO puede |
|---|---|---|
| routes | Declarar endpoint y verbo; encadenar middlewares y controller | Contener lógica o consultas |
| middlewares | Verificar token, rol y forma de los datos; usar `req`, `res`, `next` | Reglas de negocio o consultas a la base |
| controllers | Leer `req`, llamar a UN service y responder con `utils/response` | Importar repositories o models; decidir reglas; armar el sobre de respuesta a mano |
| services | Aplicar reglas (estados, propiedad, transiciones); llamar a repositories y a otros services; lanzar `AppError` | Conocer `req`/`res`/Express; importar Mongoose o models |
| repositories | Ejecutar consultas y operaciones atómicas sobre los models | Reglas de negocio; conocer HTTP |
| models | Definir esquema, tipos, enums e índices | Lógica de negocio o consultas |

Si una tarea mezcla capas, avísame ANTES de escribir código.

### Estructura de carpetas
```
robin-api/
├── src/
│   ├── server.js              # arranque: conecta la base y escucha el puerto
│   ├── app.js                 # Express, middlewares globales, monta /api/v1
│   ├── config/                # env.js, database.js
│   ├── routes/                # index.js y un archivo *.routes.js por recurso
│   ├── middlewares/           # auth.js, roles.js, validate.js, upload.js, errorHandler.js
│   ├── controllers/           # *.controller.js
│   ├── services/              # *.service.js
│   ├── repositories/          # *.repository.js
│   ├── models/                # User, Publication, Reservation, Notification
│   ├── validators/            # esquemas de validación por recurso
│   └── utils/                 # response.js, AppError.js, jwt.js
├── db/                        # script de creación de la base desde cero + diagrama del modelo
├── docs/                      # api.md (tabla de la API), modelo-datos.md, informe
├── uploads/publications/      # imágenes subidas (ignorada por git)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```
- Nombres de archivo y carpetas en minúsculas (en Linux importan las mayúsculas y el servicio debe levantar en otro equipo).
- Un service, un repository y un controller por recurso: `auth`, `user`, `publication`, `reservation`, `notification`.

### Manejo de errores
- Los services lanzan `AppError(code, statusCode, message, details?)`.
- `middlewares/errorHandler.js` es el ÚNICO punto que convierte errores en respuesta. Traduce además errores de Mongoose: `ValidationError` y `CastError` → 400; clave duplicada (código 11000) → 409; cualquier otro → 500 con mensaje genérico (el detalle técnico solo se registra en el servidor, nunca se devuelve al cliente).
- Express 5 propaga solos los errores de handlers `async`; en Express 4 hace falta un envoltorio.

## 4. Convenciones de la API
- Prefijo y versión: TODAS las rutas bajo `/api/v1`. `v1` es la versión mayor del contrato; el release de esta entrega es `1.0.0` (versionado semántico).
  - Cambios compatibles (nuevo endpoint, campo opcional) → versión menor, misma ruta.
  - Cambios incompatibles (renombrar o quitar un campo, cambiar un código de estado o la forma de un error) → `/api/v2`.
- Recursos como sustantivos en PLURAL (`/publications`, `/reservations`), a lo más dos niveles de anidación. La acción la expresa el verbo HTTP, no la ruta. Esto coincide con la pluralización automática de Mongoose (modelo `Publication` → colección `publications`).
- Verbos con su semántica estándar (RFC 9110): GET consulta sin efectos; POST crea; PUT reemplaza; PATCH modifica parcialmente; DELETE elimina.
- Las acciones de dominio se modelan como estado (`PATCH /publications/{id}/status`) o como recurso nuevo (`POST /reservations`), NO como verbos en la URL (`/approve`, `/reserve`, `/save`, `/remove`).
- JSON en entrada y salida (`Content-Type: application/json`); excepción: subida de imagen (`multipart/form-data`).
- Nombres de campo en snake_case, iguales a los del modelo de datos (`user_id`, `created_at`, `necesidades`). Fechas en ISO 8601 UTC.
- Paginación por query params: `?page=1&limit=10` (valores por defecto page=1, limit=10; `limit` máximo 50). Respuesta con `meta`.
- Un listado sin resultados responde 200 con lista vacía, nunca 404.
- Nunca devolver `password`. Excluirlo siempre en el repository (`select("-password")`).
- Rutas de prueba (`/prueba-*`) NO existen.

### Formato de respuesta (SIEMPRE, sin excepciones)
Toda respuesta lleva `status` ("success" | "error") y `statusCode` (idéntico al código HTTP real).

Éxito:
```json
{ "status": "success", "statusCode": 200, "data": { }, "meta": { "page": 1, "limit": 10, "total": 1, "pages": 1 } }
```
(`meta` solo en listados paginados; `204 No Content` no lleva cuerpo.)

Error:
```json
{ "status": "error", "statusCode": 409,
  "error": { "code": "NEED_NOT_AVAILABLE", "message": "La necesidad ya fue reservada", "details": [] } }
```
`details` es opcional y lista errores de validación: `[{ "field": "text", "message": "El texto es obligatorio" }]`.

El sobre se construye SOLO en `utils/response.js` (éxito) y en `middlewares/errorHandler.js` (error). NUNCA a mano en un controlador. Así `statusCode` no puede contradecir el código HTTP.

Ojo: los campos `status` dentro de `data` (p. ej. `"reservado"`, `"aprobada"`) son del dominio y no se confunden con el `status` del sobre.

### Códigos de estado
| Código | Uso |
|---|---|
| 200 | Consulta o modificación exitosa (también lista vacía) |
| 201 | Recurso creado (usuario, publicación, reserva) |
| 204 | Eliminación exitosa, sin cuerpo |
| 400 | Cuerpo, parámetros o identificador mal formados |
| 401 | Falta el token, es inválido o expiró (NUNCA 403 ni 404 para esto) |
| 403 | Autenticado pero sin permiso (rol o propiedad) |
| 404 | El recurso no existe |
| 409 | Conflicto de estado (necesidad ya reservada, correo repetido, transición no permitida) |
| 415 | Archivo de tipo no permitido |
| 500 | Falla inesperada del servidor |

Códigos de error (`error.code`): `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `TOKEN_EXPIRED` (401), `INVALID_CREDENTIALS` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `EMAIL_ALREADY_EXISTS` (409), `NICK_ALREADY_EXISTS` (409), `NEED_NOT_AVAILABLE` (409), `INVALID_STATE_TRANSITION` (409), `PUBLICATION_HAS_ACTIVE_RESERVATIONS` (409), `UNSUPPORTED_MEDIA_TYPE` (415), `INTERNAL_ERROR` (500).

Casos que NO deben repetirse del código base: token ausente → 401 (no 403); token inválido → 401 (no 404); crear → 201 (no 200); eliminar → 204; lista vacía → 200 (no 404); id mal formado → 400 (no 404); falta archivo en subida → 400; eliminar sin ser dueño → 403 (404 solo si no existe); error de guardado → 400 solo si es validación, 500 si es falla del servidor.

## 5. Autenticación y autorización
- JWT en la cabecera `Authorization: Bearer <token>` (RFC 6750).
- Payload mínimo: identificador del usuario y rol (más `iat`/`exp`). NO incluir correo, nombre ni imagen.
- Clave y expiración desde variables de entorno (`JWT_SECRET`, `JWT_EXPIRES_IN`, por defecto 24 h).
- El middleware `auth.js` deja `req.user = { id, role }`.
- Autorización por rol: middleware `roles.js`. Verificación de propiedad del recurso ("es el dueño"): en el service.
- El rol `admin` NO se puede asignar en el registro (solo `beneficiario` o `donante`); el admin se crea con un script de datos iniciales en `db/`.
- Contraseñas siempre hasheadas (bcrypt o la librería que ya use la base); nunca se devuelven.

## 6. Modelo de datos
Enfoque mixto: las necesidades van EMBEBIDAS en la publicación; usuarios, reservas y notificaciones son colecciones independientes referenciadas por ObjectId. Colecciones (nombres Mongoose, plural en inglés): `users`, `publications`, `reservations`, `notifications`. Modelos en singular: `User`, `Publication`, `Reservation`, `Notification`.

Mantener los nombres de campo del Hito 1 (trazabilidad). Si hay que cambiar uno, avísame para documentarlo en la sección de cambios del informe.

```js
// users
{ _id: ObjectId, name: String, surname: String, nick: String, email: String,
  password: String,        // hasheada; nunca se devuelve
  role: String,            // beneficiario | donante | admin
  image: String, address: String, phone: String,
  verified: Boolean, created_at: Date }

// publications
{ _id: ObjectId, user_id: ObjectId, text: String, file: String,
  status: String,          // pendiente | aprobada | rechazada
  created_at: Date,
  necesidades: [           // subdocumentos embebidos
    { _id: ObjectId, name: String,
      status: String }     // disponible | reservado | entregado
  ] }

// reservations
{ _id: ObjectId, publication_id: ObjectId,
  item_id: ObjectId,       // _id de la necesidad embebida
  donor_id: ObjectId,
  status: String,          // reservado | entregado | cancelada
  reserved_at: Date, delivered_at: Date }
// SIN proof_image: la confirmación fotográfica se eliminó (confirmación manual).
// [definir: si la entrega exige confirmación de ambas partes, agregar donor_confirmed_at y beneficiary_confirmed_at]

// notifications
{ _id: ObjectId, user_id: ObjectId,
  type: String,            // confirmación | alerta pendiente | conflicto [confirmar valores]
  message: String, read: Boolean, created_at: Date }
```
- Usar enums de Mongoose para `role`, `status` y `type`.
- Un `item_id` tiene UNA sola reserva activa a la vez.
- El script de creación de la base desde cero va en `db/` (incluye índices y el admin inicial) y debe poder ejecutarse en otro equipo.

## 7. Endpoints (fuente de verdad: este bloque y `docs/api.md` deben coincidir)
Todas las rutas parten de `/api/v1`. Acceso: Público, Autenticado, o el rol requerido. `401` y `500` aplican a todo endpoint autenticado y no se repiten.

**Auth**
| Verbo | Ruta | Parámetros / cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/auth/register` | `name, surname, nick, email, password, role` | Público | 201 | 400, 409 |
| POST | `/auth/login` | `email, password` | Público | 200 | 400, 401 |

**Users**
| Verbo | Ruta | Parámetros / cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| GET | `/users/me` | — | Autenticado | 200 | — |
| PATCH | `/users/me` | `name, surname, nick, address, phone` | Autenticado | 200 | 400, 409 |
| GET | `/users/{id}` | `id` en la ruta | Autenticado | 200 | 400, 404 |

**Publications** (las necesidades se crean y editan dentro de la publicación)
| Verbo | Ruta | Parámetros / cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/publications` | `text, necesidades[{name}]` (nace `pendiente`) | beneficiario | 201 | 400, 403 |
| GET | `/publications` | Query: `page, limit` (SOLO aprobadas) | Autenticado | 200 | 400 |
| GET | `/publications/{id}` | `id` en la ruta | Autenticado | 200 | 400, 404 |
| GET | `/users/{id}/publications` | Query: `page, limit` | Autenticado | 200 | 400, 404 |
| PATCH | `/publications/{id}` | `text, necesidades` | Dueño | 200 | 400, 403, 404 |
| DELETE | `/publications/{id}` | `id` en la ruta | Dueño | 204 | 403, 404, 409 (reservas activas) |
| PATCH | `/publications/{id}/status` | `status`: `aprobada` o `rechazada` | admin | 200 | 400, 403, 404, 409 (ya moderada) |
| PUT | `/publications/{id}/image` | `multipart/form-data`, campo `file` | Dueño | 200 | 400, 403, 404, 415 |

**Reservations**
| Verbo | Ruta | Parámetros / cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/reservations` | `publication_id, item_id` (el donante sale del token) | donante | 201 | 400, 403, 404, 409 |
| GET | `/reservations` | Query: `status, page, limit` (las del usuario autenticado) | Autenticado | 200 | 400 |
| GET | `/reservations/{id}` | `id` en la ruta | Participante (donante de la reserva o dueño de la publicación) | 200 | 403, 404 |
| PATCH | `/reservations/{id}/status` | `status`: `cancelada` o `entregado` | Participante | 200 | 400, 403, 404, 409 |

**Notifications**
| Verbo | Ruta | Parámetros / cuerpo | Acceso | Éxito | Errores |
|---|---|---|---|---|---|
| GET | `/notifications` | Query: `read, page, limit` | Autenticado | 200 | 400 |
| PATCH | `/notifications/{id}` | `read: true` | Dueño | 200 | 400, 403, 404 |

Prioridad si el tiempo aprieta: 1) auth, 2) publications, 3) reservations (ahí está el CRUD que exige el hito), 4) users, 5) notifications e imagen. Lo que no se implemente se QUITA de este bloque y de `docs/api.md`.

## 8. Reglas de negocio (van en los services)
- Registro: `role` solo `beneficiario` o `donante`. Correo y nick únicos (409).
- Publicación: solo el `beneficiario` crea; nace `pendiente`; el feed devuelve solo `aprobada`; editar y eliminar son solo del dueño. Eliminar con reservas activas → 409.
- Moderación: solo `admin` cambia el estado a `aprobada` o `rechazada`; si ya fue moderada → 409.
- Reserva de una necesidad: solo `donante`; la publicación debe existir y estar `aprobada` (404 si no); la necesidad debe existir (404) y estar `disponible` (409 si no).
- La reserva debe ser ATÓMICA: actualización condicionada en una sola consulta del repository. Ejemplo:
  ```js
  Publication.findOneAndUpdate(
    { _id: publicationId, status: "aprobada",
      necesidades: { $elemMatch: { _id: itemId, status: "disponible" } } },
    { $set: { "necesidades.$.status": "reservado" } },
    { returnDocument: "after" });
  ```
  Si no devuelve documento → 409 `NEED_NOT_AVAILABLE`. Sin réplicas no hay transacciones: si falla la creación de la reserva después de marcar la necesidad, el service revierte la necesidad a `disponible`.
- Cancelar una reserva (solo el donante): la reserva pasa a `cancelada` y la necesidad vuelve a `disponible`.
- Entrega: confirmación MANUAL desde la plataforma; al confirmarse, reserva y necesidad pasan a `entregado` y se registra `delivered_at` [definir: confirma una parte o ambas].
- Transiciones inválidas (p. ej. entregar una reserva cancelada) → 409 `INVALID_STATE_TRANSITION`.
- Notificaciones (las crea el service que produce el evento): reserva creada o cancelada (al beneficiario), publicación aprobada o rechazada (al beneficiario), entrega confirmada.

## 9. Seguridad y configuración
- Nunca escribir, leer ni commitear credenciales. Todo va en variables de entorno (`.env`, ignorado por git; no lo abras ni lo muestres).
- `.env.example` con TODAS las variables y valores de ejemplo sin datos reales:
  `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `UPLOAD_DIR`.
- La URI de MongoDB NUNCA va escrita en el código (hoy lo está en el código base): usar `MONGODB_URI`.
- CORS habilitado con el paquete `cors`, limitado al origen indicado en `CORS_ORIGIN`.
- Subida de imágenes con Multer: validar el tipo por MIME y extensión (415 si no es válido), limitar el tamaño y no confiar en el nombre original del archivo.
- Si alguna vez se subió una credencial al repositorio, hay que ROTARLA, no solo borrarla.

## 10. Código base (punto de partida) y qué corregir
Estado del repo base (JavaScript, Express, Mongoose, `jwt-simple`, `moment`, Multer, subida a `uploads/`): carpetas `Routes`, `controllers`, `database`, `helpers`, `middlewares`, `models`, `services` (solo JWT y follow), `uploads`.

Se rescata: paginación con `mongoose-paginate-v2`, clave JWT desde variable de entorno, exclusión de campos sensibles (`-password`), propiedad del recurso en la consulta (`findOneAndDelete({user, _id})`).

Se corrige:
1. Lógica de negocio y consultas dentro de los controladores → mover a `services` y `repositories`.
2. Rutas con verbos y en singular (`/save`, `/remove/:id`, `/detail/:id`, `/feed/:page`) → recursos en plural con el verbo HTTP.
3. Paginación en la ruta y tamaño fijo → query params `page` y `limit`.
4. Token sin esquema y limpiado con expresión regular → `Bearer`.
5. Payload del token con datos personales y 30 días de expiración → payload mínimo y expiración configurable.
6. Sobre `status/message` libre por controlador → sobre único (sección 4).
7. Se devuelve `error.message` del sistema al cliente → mensaje controlado.
8. Códigos de estado incorrectos (ver sección 4).
9. URI de MongoDB en el código → `MONGODB_URI`.
10. Carpeta `Routes` en mayúscula → `routes`.
11. Eliminar rutas de prueba y todo lo de follow.

## 11. Cómo trabajar conmigo
- Antes de editar, propón un plan breve y espera mi aprobación.
- Trabaja en pasos pequeños (un cambio de capa o un recurso a la vez).

### Protocolo de sesión
Este archivo se carga completo al iniciar. NO repitas su contenido ni lo resumas al empezar. En cada sesión:
1. Yo te indico la FASE (ver abajo) y tú trabajas SOLO en esa fase.
2. Relee las secciones que la fase indica antes de proponer el plan.
3. Propón el plan, espera mi aprobación y trabaja por pasos con un commit por paso (solo cuando yo lo pida).
4. Al terminar, ejecuta la verificación de la fase y dime qué quedó pendiente. No avances a la siguiente fase por tu cuenta.

### Fases (en este orden)
| Fase | Qué se hace | Secciones a leer |
|---|---|---|
| 0 | Repo base listo: copiar el código base, `.gitignore`, `.env.example`, quitar follow y rutas de prueba, renombrar `Routes` a `routes` | 1, 3, 9, 10 |
| 1 | Estructura de capas, sobre de respuesta (`utils/response.js`), `AppError` y `errorHandler` | 3, 4 |
| 2 | Models, script de `db/`, auth (registro y login), middlewares `auth` y `roles` | 5, 6 |
| 3 | Publications: CRUD, feed paginado, moderación e imagen | 7, 8 |
| 4 | Reservations (reserva atómica con 409, cancelación y entrega) y Notifications | 7, 8 |
| 5 | Verificación completa, README, `docs/api.md` y colección del cliente de pruebas. Al terminar: commit y tag `baseline-js` | 13, 14 |
| 6 | Migración a TypeScript | 16 |

Las fases 0 a 5 se hacen en JavaScript. Mientras no esté cerrada la fase 5, NO se migra a TypeScript.
- No hagas `git commit` ni `git push` sin que yo lo pida.
- Al terminar cada paso, explícame qué cambiaste y por qué, en lenguaje simple: tengo que poder defenderlo en la presentación.
- No instales dependencias nuevas sin preguntar y justificar.
- Si el código y este documento (o `docs/api.md`) difieren, avísame y actualizamos el documento primero.
- Si una decisión marcada con [definir] o [confirmar] bloquea el trabajo, pregúntame; no la inventes.

## 12. Comandos
- Instalar: `npm install`
- Desarrollo: `npm run dev` [ajustar]
- Pruebas: `npm test` [ajustar]
- Crear la base desde cero: [script en `db/`, completar]

## 13. Verificación antes de entregar
- Capas: estas búsquedas deben quedar vacías.
  ```
  grep -rnE "mongoose|models/|repositories/" src/controllers
  grep -rnE "req\.|res\.|mongoose" src/services
  ```
- El servicio levanta en otro equipo siguiendo solo el README, sin credenciales en el código ni en el historial.
- La colección del cliente de pruebas (Postman o similar) está exportada en el repo con las 4 peticiones de la demo, en orden y con datos listos.
- Cada endpoint implementado responde con el código y el sobre de las secciones 4 y 7.

## 14. Entregables del hito (en el repositorio, rama principal)
Código del servicio; documento técnico en PDF en `docs/` (máx. 30 páginas sin anexos, con la sección de cambios respecto del Hito 1); tabla de la API dentro del documento y en el repo; modelo de datos y script de creación en `db/`; colección del cliente de pruebas exportada; `.env.example` en la raíz.

## 15. Fuera de alcance
Frontend, despliegue en la nube, pagos o manejo de dinero, confirmación fotográfica de entregas, plan de empresa, certificado de donación, comisión de afiliado, panel de impacto, logros y estadísticas globales, y cualquier funcionalidad que no esté en la sección 7.

## 16. Migración a TypeScript (fase 6)
Vocabulario: lo que hacemos es una MIGRACIÓN de JavaScript a TypeScript (reescribir los archivos con tipos). "Transpilar" es el paso posterior de compilar TypeScript a JavaScript con `tsc`, que genera `dist/`. Ambos se documentan.

### 16.1 Cuándo y cómo
- Solo se empieza cuando la versión JS cumple las secciones 7 y 8, pasó la verificación de la sección 13 y tiene el tag `baseline-js`.
- Se trabaja en una rama `ts-migration`. `main` siempre debe levantar. Se une a `main` solo cuando pasa la verificación de 16.6.
- La migración NO cambia el comportamiento: ningún endpoint, código de estado ni formato de respuesta se modifica. Solo se agregan tipos.

### 16.2 Configuración
Instalar como dependencias de desarrollo: `typescript`, los `@types/*` de cada librería que lo necesite (`node`, `express`, `cors`, `multer`, etc.) y una herramienta para desarrollo (`tsx` o `ts-node-dev`: elegir una y justificarla). Mongoose ya trae sus propios tipos. Mantener el sistema de módulos que ya use el proyecto (CommonJS o ESM) sin mezclarlos.

`tsconfig.json` de partida [ajustar `module` según el proyecto]:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "allowJs": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```
`allowJs: true` permite que archivos `.js` y `.ts` convivan durante la migración. Al terminar, se pone en `false`.

### 16.3 Orden de migración (de abajo hacia arriba)
Se migra primero lo que no depende de nada superior, para que cada paso compile. Una capa por commit, usando `git mv` para conservar el historial (`archivo.js` → `archivo.ts`).
1. Tipos del dominio en `src/types/` y `utils/` (`AppError`, `response`, `jwt`) y `config/`.
2. `models/`: tipos de dominio y schemas tipados con ellos.
3. `repositories/`
4. `services/`
5. `middlewares/` (incluida la extensión del tipo `Request` con `user`)
6. `validators/`
7. `controllers/`
8. `routes/`, `app.ts` y `server.ts`
Al final: poner `allowJs` en `false` y confirmar que no queda ningún `.js` en `src/`.

### 16.4 Tipos del dominio
Los valores permitidos se definen UNA vez y se reutilizan en el schema de Mongoose y en los tipos:
```ts
// src/types/domain.ts
export const ROLES = ["beneficiario", "donante", "admin"] as const;
export type Role = (typeof ROLES)[number];
// igual para PublicationStatus, NeedStatus, ReservationStatus y NotificationType
```
En el schema se usa `enum: ROLES`. Para que `req.user` tenga tipo:
```ts
// src/types/express.d.ts
import type { Role } from "./domain";
declare global {
  namespace Express {
    interface Request { user?: { id: string; role: Role } }
  }
}
export {};
```

### 16.5 Reglas
- `strict: true` siempre. Prohibido `any`. Si un valor es desconocido se usa `unknown` y se acota (narrowing). Una excepción puntual exige un comentario que la justifique.
- Prohibido `@ts-ignore`; si es inevitable, `@ts-expect-error` con una explicación.
- Los cuerpos de petición se tipan con interfaces (por ejemplo `CreateReservationBody`); los repositories y services devuelven tipos del dominio, no documentos de Mongoose sin tipar.
- Las reglas de capas de la sección 3 se mantienen idénticas.
- Cada commit debe pasar `npm run typecheck`.
- Explícame cada tipo importante en lenguaje simple: tengo que poder justificar la elección de TypeScript y qué problema evita.

### 16.6 Scripts, compilación y verificación
```json
"dev": "tsx watch src/server.ts",
"build": "tsc",
"start": "node dist/server.js",
"typecheck": "tsc --noEmit"
```
`dist/` va en `.gitignore`. El README debe explicar cómo levantar el servicio en otro equipo: `npm install`, `npm run build` y `npm start`.

Verificación antes de unir a `main`:
- `npm run typecheck` sin errores y `npm run build` genera `dist/`.
- `grep -rnE ": any|as any|@ts-ignore" src` devuelve vacío.
- La colección del cliente de pruebas, ejecutada contra la versión compilada (`npm start`), da los mismos resultados que en `baseline-js`.
- Las verificaciones de capas de la sección 13 siguen vacías.

### 16.7 Qué actualizar al terminar

- `CLAUDE.md`: los nombres de archivo de la sección 3 pasan de `.js` a `.ts` y los comandos de la sección 12 pasan a los scripts de 16.6.