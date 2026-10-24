const reservationService = require("../services/reservation.service");
const { sendSuccess } = require("../utils/response");

class ReservationController {
    async create(req, res, next) {
        try {
            const { publication_id, item_id } = req.body;
            const donorId = req.user.id;

            const reservation = await reservationService.createReservation(donorId, publication_id, item_id);
            return sendSuccess(res, reservation, 201);
        } catch (error) {
            next(error);
        }
    }

    async list(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);

            const options = {
                page,
                limit,
                sort: { reserved_at: -1 }
            };

            const result = await reservationService.listUserReservations(req.user.id, options);

            return sendSuccess(res, result.docs, 200, {
                page: result.page,
                limit: result.limit,
                total: result.totalDocs,
                pages: result.totalPages
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const reservation = await reservationService.getReservationById(req.params.id);
            return sendSuccess(res, reservation, 200);
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { status } = req.body;
            const userId = req.user.id;

            if (status === "cancelada") {
                const result = await reservationService.cancelReservation(req.params.id, userId);
                return sendSuccess(res, result, 200);
            } else if (status === "entregado") {
                const result = await reservationService.confirmDelivery(req.params.id, userId);
                return sendSuccess(res, result, 200);
            } else {
                throw new AppError("BAD_REQUEST", 400, "Estado de reserva no válido");
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ReservationController();
