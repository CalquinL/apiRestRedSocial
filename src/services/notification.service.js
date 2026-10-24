const Notification = require("../models/notification");

class NotificationService {
    async createNotification(userId, type, message) {
        try {
            const notification = new Notification({
                user_id: userId,
                type,
                message
            });
            return await notification.save();
        } catch (error) {
            console.error(`[Notification Error]: ${error.message}`);
            // No lanzamos el error para evitar que un fallo en la notificación
            // detenga la acción principal del usuario (ej. una reserva)
        }
    }
}

module.exports = new NotificationService();
