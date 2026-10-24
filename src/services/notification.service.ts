import NotificationModel, { INotification } from "../models/notification";
import { NotificationType } from "../types/domain";

class NotificationService {
    async createNotification(userId: string, type: NotificationType, message: string): Promise<INotification | null> {
        try {
            const notification = new NotificationModel({
                user_id: userId,
                type,
                message
            });
            return await notification.save();
        } catch (error) {
            console.error(`[Notification Error]: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
}

export default new NotificationService();
