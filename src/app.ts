import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler";
import UserRoutes from "./routes/user";
import PublicationRoutes from "./routes/publication";
import ReservationRoutes from "./routes/reservation";

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cargar rutas (bajo /api/v1)
app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/publications", PublicationRoutes);
app.use("/api/v1/reservations", ReservationRoutes);

// Soporte para la ruta anidada /users/{id}/publications
app.use("/api/v1", PublicationRoutes);

// Middleware de manejo de errores (DEBE ir al final)
app.use(errorHandler);

export default app;
