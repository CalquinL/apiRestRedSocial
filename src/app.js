const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cargar rutas (estarán bajo /api/v1)
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const ReservationRoutes = require("./routes/reservation");

app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/publications", PublicationRoutes);
app.use("/api/v1/reservations", ReservationRoutes);

// Soporte para la ruta anidada /users/{id}/publications
app.use("/api/v1", PublicationRoutes);

// Middleware de manejo de errores (DEBE ir al final)
app.use(errorHandler);

module.exports = app;
