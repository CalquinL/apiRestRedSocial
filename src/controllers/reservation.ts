import { Request, Response, NextFunction } from "express";
import reservationService from "../services/reservation.service";
import { sendSuccess } from "../utils/response";
import AppError from "../utils/AppError";

class ReservationController {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { publication_id, item_id } = req.body;

            if (!publication_id || !item_id) {
                throw new AppError("VALIDATION_ERROR", 400, "El publication_id y el item_id son obligatorios");
            }

            const donorId = req.user!.id;

            const reservation = await reservationService.createReservation(donorId, publication_id, item_id);

            const filteredReservation = {
                _id: reservation._id,
                publication_id: reservation.publication_id,
                item_id: reservation.item_id,
                status: reservation.status,
                reserved_at: reservation.reserved_at
            };

            sendSuccess(res, filteredReservation, 201);
        } catch (error) {
            next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

            const options = {
                page,
                limit,
                sort: { reserved_at: -1 }
            };

            const result = await reservationService.listUserReservations(req.user!.id, options);

            sendSuccess(res, result.docs, 200, {
                page: result.page,
                limit: result.limit,
                total: result.totalDocs,
                pages: result.totalPages
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reservation = await reservationService.getReservationById(req.params.id, req.user!.id, req.user!.role);
            sendSuccess(res, reservation, 200);
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { status } = req.body;
            const userId = req.user!.id;

            let result;
            if (status === "cancelada") {
                result = await reservationService.cancelReservation(req.params.id, userId);
            } else if (status === "entregado") {
                result = await reservationService.confirmDelivery(req.params.id, userId);
            } else {
                throw new AppError("BAD_REQUEST", 400, "Estado de reserva no válido");
            }

            const filteredResult = {
                _id: result._id,
                publication_id: result.publication_id,
                item_id: result.item_id,
                status: result.status,
                reserved_at: result.reserved_at,
                delivered_at: result.delivered_at
            };

            sendSuccess(res, filteredResult, 200);
        } catch (error) {
            next(error);
        }
    }
}

export default new ReservationController();
