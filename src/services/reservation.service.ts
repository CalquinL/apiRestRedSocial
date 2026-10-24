import ReservationRepository from "../repositories/reservation.repository";
import PublicationRepository from "../repositories/publication.repository";
import NotificationService from "./notification.service";
import AppError from "../utils/AppError";
import { IPublication, IReservation } from "../models/publication"; // Note: IReservation actually comes from reservation.ts
import { ReservationStatus } from "../types/domain";

// Fixing the import for IReservation
const { default: ReservationModel } = require("../models/reservation");
interface IReservation extends Document {
    publication_id: any;
    item_id: any;
    donor_id: any;
    status: ReservationStatus;
    reserved_at: Date;
    delivered_at?: Date;
}

class ReservationService {
    async createReservation(donorId: string, publicationId: string, itemId: string): Promise<any> {
        const publication = await PublicationRepository.atomicReserveItem(publicationId, itemId);

        if (!publication) {
            throw new AppError("NEED_NOT_AVAILABLE", 409, "La necesidad ya fue reservada o la publicación no está aprobada");
        }

        try {
            const reservation = await ReservationRepository.create({
                publication_id: publicationId,
                item_id: itemId,
                donor_id: donorId,
                status: "reservado"
            });

            const beneficiaryId = publication.user_id;
            await NotificationService.createNotification(
                beneficiaryId,
                "confirmación",
                `Un donante ha reservado el ítem: ${publication.necesidades.find((n: any) => n._id.toString() === itemId).name}`
            );

            return reservation;
        } catch (error) {
            await PublicationRepository.updateItemStatus(publicationId, itemId, "disponible");
            throw error;
        }
    }

    async cancelReservation(reservationId: string, donorId: string): Promise<any> {
        const reservation = await ReservationRepository.findById(reservationId);

        if (!reservation) {
            throw new AppError("NOT_FOUND", 404, "La reserva no existe");
        }

        if (reservation.donor_id.toString() !== donorId) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para cancelar esta reserva");
        }

        if (reservation.status !== "reservado") {
            throw new AppError("INVALID_STATE_TRANSITION", 409, "Solo se pueden cancelar reservas en estado 'reservado'");
        }

        const updatedReservation = await ReservationRepository.update(reservationId, { status: "cancelada" });
        await PublicationRepository.updateItemStatus(reservation.publication_id, reservation.item_id, "disponible");

        const publication = await PublicationRepository.findById(reservation.publication_id);
        await NotificationService.createNotification(
            publication.user_id,
            "alerta pendiente",
            `Se ha cancelado la reserva del ítem: ${publication.necesidades.find((n: any) => n._id.toString() === reservation.item_id).name}`
        );

        return updatedReservation;
    }

    async confirmDelivery(reservationId: string, userId: string): Promise<any> {
        const reservation = await ReservationRepository.findById(reservationId);

        if (!reservation) {
            throw new AppError("NOT_FOUND", 404, "La reserva no existe");
        }

        const publication = await PublicationRepository.findById(reservation.publication_id);
        const isParticipant = (reservation.donor_id.toString() === userId ||
                             publication.user_id.toString() === userId);

        if (!isParticipant) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para confirmar esta entrega");
        }

        if (reservation.status !== "reservado") {
            throw new AppError("INVALID_STATE_TRANSITION", 409, "La reserva no está en estado 'reservado'");
        }

        const updatedReservation = await ReservationRepository.update(reservationId, {
            status: "entregado",
            delivered_at: new Date()
        });

        await PublicationRepository.updateItemStatus(reservation.publication_id, reservation.item_id, "entregado");

        await NotificationService.createNotification(
            publication.user_id,
            "confirmación",
            `Se ha confirmado la entrega del ítem: ${publication.necesidades.find((n: any) => n._id.toString() === reservation.item_id).name}`
        );

        return updatedReservation;
    }

    async getReservationById(id: string): Promise<any> {
        const reservation = await ReservationRepository.findById(id);
        if (!reservation) throw new AppError("NOT_FOUND", 404, "La reserva no existe");
        return reservation;
    }

    async listUserReservations(userId: string, options: any): Promise<any> {
        return await ReservationRepository.findByDonor(userId, options);
    }
}

export default new ReservationService();
