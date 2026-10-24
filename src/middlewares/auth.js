const jwt = require("jwt-simple");
const moment = require("moment");
const { secret } = require("../services/jwt");
const AppError = require("../utils/AppError");

exports.auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new AppError("UNAUTHENTICATED", 401, "Falta el token de autenticación"));
    }

    // Extraer token del formato "Bearer <token>"
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

    try {
        const payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()) {
            return next(new AppError("TOKEN_EXPIRED", 401, "El token ha expirado"));
        }

        // Payload mínimo: { id, role, iat, exp }
        req.user = {
            id: payload.id,
            role: payload.role
        };

        next();
    } catch (error) {
        return next(new AppError("UNAUTHENTICATED", 401, "Token inválido"));
    }
};
