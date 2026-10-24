const reservationRepository = require("../repositories/reservation.repository");
const publicationRepository = require("../repositories/publication.repository");
const notificationService = require("./notification.service");
const AppError = require("../utils/AppError");

class ReservationService {
    async createReservation(donorId, publicationId, itemId) {
        // 1. Intentar la reserva atómica del ítem en la publicación
        // Si el documento no se encuentra o no cumple (aprobada y disponible), devuelve null
        const publication = await publicationRepository.atomicReserveItem(publicationId, itemId);

        if (!publication) {
            throw new AppError("NEED_NOT_AVAILABLE", 409, "La necesidad ya fue reservada o la publicación no está aprobada");
        }

        try {
            // 2. Crear el registro de la reserva
            const reservation = await reservationRepository.create({
                publication_id: publicationId,
                item_id: itemId,
                donor_id: donorId,
                status: "reservado"
            });

            // 3. Notificar al beneficiario
            const beneficiaryId = publication.user_id;
            await notificationService.createNotification(
                beneficiaryId,
                "confirmación",
                `Un donante ha reservado el ítem: ${publication.necesidades.find(n => n._id.toString() === itemId.toString()).name}`
            );

            return reservation;
        } catch (error) {
            // Reversión: Si falla la creación de la reserva, devolvemos la necesidad a 'disponible'
            await publicationRepository.updateItemStatus(publicationId, itemId, "disponible");
            throw error;
        }
    }

    async cancelReservation(reservationId, donorId) {
        const reservation = await reservationRepository.findById(reservationId);

        if (!reservation) {
            throw new AppError("NOT_FOUND", 404, "La reserva no existe");
        }

        if (reservation.donor_id.toString() !== donorId.toString()) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para cancelar esta reserva");
        }

        if (reservation.status !== "reservado") {
            throw new AppError("INVALID_STATE_TRANSITION", 409, "Solo se pueden cancelar reservas en estado 'reservado'");
        }

        // 1. Actualizar estado de la reserva
        const updatedReservation = await reservationRepository.update(reservationId, { status: "cancelada" });

        // 2. Devolver el ítem a 'disponible'
        await publicationRepository.updateItemStatus(reservation.publication_id, reservation.item_id, "disponible");

        // 3. Notificar al beneficiario
        const publication = await publicationRepository.findById(reservation.publication_id);
        await notificationService.createNotification(
            publication.user_id,
            "alerta pendiente",
            `Se ha cancelado la reserva del ítem: ${publication.necesidades.find(n => n._id.toString() === reservation.item_id.toString()).name}`
        );

        return updatedReservation;
    }

    async confirmDelivery(reservationId, userId) {
        const reservation = await reservationRepository.findById(reservationId);

        if (!reservation) {
            throw new AppError("NOT_FOUND", 404, "La reserva no existe");
        }

        // Validar que quien confirma sea el donante o el beneficiario
        const publication = await publicationRepository.findById(reservation.publication_id);
        const isParticipant = (reservation.donor_id.toString() === userId.toString() ||
                             publication.user_id.toString() === userId.toString());

        if (!isParticipant) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para confirmar esta entrega");
        }

        if (reservation.status !== "reservado") {
            throw new AppError("INVALID_STATE_TRANSITION", 409, "La reserva no está en estado 'reservado'");
        }

        // 1. Actualizar reserva a 'entregado'
        const updatedReservation = await reservationRepository.update(reservationId, {
            status: "entregado",
            delivered_at: new Date()
        });

        // 2. Actualizar necesidad a 'entregado'
        await publicationRepository.updateItemStatus(reservation.publication_id, reservation.item_id, "entregado");

        // 3. Notificar a las partes
        await notificationService.createNotification(
            publication.user_id,
            "confirmación",
            `Se ha confirmado la entrega del ítem: ${publication.necesidades.find(n => n._id.toString() === reservation.item_id.toString()).name}`
        );

        return updatedReservation;
    }

    async getReservationById(id) {
        const reservation = await reservationRepository.findById(id);
        if (!reservation) throw new AppError("NOT_FOUND", 404, "La reserva no existe");
        return reservation;
    }

    async listUserReservations(userId, options) {
        return await reservationRepository.findByDonor(userId, options);
    }
}

module.exports = new ReservationService();
