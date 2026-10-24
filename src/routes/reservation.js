const express = require("express");
const router = express.Router();
const ReservationController = require("../controllers/reservation");
const { auth } = require("../middlewares/auth");

// Rutas de Reservas
router.post("/", auth, ReservationController.create);
router.get("/", auth, ReservationController.list);
router.get("/:id", auth, ReservationController.getById);
router.patch("/:id/status", auth, ReservationController.updateStatus);

module.exports = router;
