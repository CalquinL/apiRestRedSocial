const AppError = require("../utils/AppError");

exports.roles = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError("UNAUTHENTICATED", 401, "Usuario no autenticado"));
        }

        if (!requiredRoles.includes(req.user.role)) {
            return next(new AppError("FORBIDDEN", 403, "No tienes permisos para acceder a este recurso"));
        }

        next();
    };
};
