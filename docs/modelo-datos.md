# Modelo de Datos - Robin API

El sistema utiliza MongoDB con un enfoque mixto de persistencia (referencias y embebido).

## Colecciones

### 1. Users (`users`)
Almacena la información de los usuarios y sus credenciales.
- **Campos**: `name`, `surname`, `nick` (único), `email` (único), `password`, `role` (enum), `image`, `address`, `phone`, `verified`, `created_at`.
- **Roles**: `beneficiario`, `donante`, `admin`.

### 2. Publications (`publications`)
Almacena las historias y las listas de necesidades.
- **Campos**: `user_id` (ref User), `text`, `file` (ruta imagen), `status` (enum), `created_at`.
- **Estado**: `pendiente`, `aprobada`, `rechazada`.
- **Subdocumentos (Embebidos)**: `necesidades`
    - `name`: Nombre del objeto.
    - `status`: `disponible`, `reservado`, `entregado`.

### 3. Reservations (`reservations`)
Vincula un donante con una necesidad específica de una publicación.
- **Campos**: `publication_id` (ref Publication), `item_id` (ObjectId de la necesidad), `donor_id` (ref User), `status` (enum), `reserved_at`, `delivered_at`.
- **Estado**: `reservado`, `entregado`, `cancelada`.

### 4. Notifications (`notifications`)
Alertas del sistema para los usuarios.
- **Campos**: `user_id` (ref User), `type` (enum), `message`, `read`, `created_at`.
- **Tipos**: `confirmación`, `alerta pendiente`, `conflicto`.

## Relaciones y Flujos
- **Publicación $\rightarrow$ Necesidad**: Relación 1:N embebida. Permite consultas rápidas del estado de los ítems.
- **Reserva $\rightarrow$ Publicación/Usuario**: Relación de referencia.
- **Reserva Atómica**: El flujo de reserva actualiza primero el estado de la necesidad embebida en `publications` y luego crea el documento en `reservations`.
