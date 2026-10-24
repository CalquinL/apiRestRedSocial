import { Router } from "express";
import ReservationController from "../controllers/reservation";
import { auth } from "../middlewares/auth";

const router = Router();

// Rutas de Reservas
router.post("/", auth, ReservationController.create);
router.get("/", auth, ReservationController.list);
router.get("/:id", auth, ReservationController.getById);
router.patch("/:id/status", auth, ReservationController.updateStatus);

export default router;
