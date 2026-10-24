const AppError = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Traducción de errores de Mongoose
    if (err.name === "ValidationError") {
        const details = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        error = new AppError("VALIDATION_ERROR", 400, "Datos de entrada inválidos", details);
    }

    if (err.code === 11000) {
        error = new AppError("CONFLICT", 409, "El recurso ya existe (duplicado)");
    }

    if (err.name === "CastError") {
        error = new AppError("BAD_REQUEST", 400, "Formato de identificador inválido");
    }

    // Si el error no es un AppError, lo convertimos en uno genérico 500
    if (!(err instanceof AppError) && !error.code) {
        error = new AppError("INTERNAL_ERROR", 500, "Falla inesperada del servidor");
    }

    const statusCode = error.statusCode || 500;
    const response = {
        status: "error",
        statusCode,
        error: {
            code: error.code || "INTERNAL_ERROR",
            message: error.message || "Falla inesperada del servidor",
            details: error.details || []
        }
    };

    // Registro del error técnico en el servidor (no al cliente)
    if (statusCode === 500) {
        console.error(`[ERROR 500]: ${err.stack}`);
    }

    return res.status(statusCode).json(response);
};

module.exports = errorHandler;
