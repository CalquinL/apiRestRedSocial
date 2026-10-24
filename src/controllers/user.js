const authService = require("../services/auth.service");
const { sendSuccess } = require("../utils/response");
const AppError = require("../utils/AppError");

class UserController {
    async register(req, res, next) {
        try {
            const user = await authService.register(req.body);
            return sendSuccess(res, user, 201);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const result = await authService.login(req.body.email, req.body.password);
            return sendSuccess(res, result, 200);
        } catch (error) {
            next(error);
        }
    }

    // Los demás métodos (profile, list, update, upload) se refactorizarán en la Fase 3 y 4
    async profile(req, res, next) {
        // Temporalmente mantenemos el comportamiento antiguo pero llamando al error handler
        try {
            // Lógica provisional
            return sendSuccess(res, { message: "Perfil en construcción" });
        } catch (error) {
            next(error);
        }
    }

    async list(req, res, next) {
        try {
            return sendSuccess(res, [], 200);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            return sendSuccess(res, { message: "Actualización en construcción" });
        } catch (error) {
            next(error);
        }
    }

    async upload(req, res, next) {
        try {
            return sendSuccess(res, { message: "Subida en construcción" });
        } catch (error) {
            next(error);
        }
    }

    async avatar(req, res, next) {
        try {
            return sendSuccess(res, { message: "Avatar en construcción" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
