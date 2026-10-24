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

app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/publications", PublicationRoutes);

// Soporte para la ruta anidada /users/{id}/publications
// Como el router de publication ya define /users/:id/publications,
// lo montamos así para que coincida con la tabla de la API.
app.use("/api/v1", PublicationRoutes);

// Middleware de manejo de errores (DEBE ir al final)
app.use(errorHandler);

module.exports = app;
