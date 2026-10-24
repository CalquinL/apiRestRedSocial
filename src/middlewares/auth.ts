import { Request, Response, NextFunction } from "express";
import { secret } from "../services/jwt";
import jwt from "jwt-simple";
import moment from "moment";
import AppError from "../utils/AppError";

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new AppError("UNAUTHENTICATED", 401, "Falta el token de autenticación"));
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

    try {
        const payload = jwt.decode(token, secret) as any;

        if (payload.exp <= moment().unix()) {
            return next(new AppError("TOKEN_EXPIRED", 401, "El token ha expirado"));
        }

        req.user = {
            id: payload.id,
            role: payload.role
        };

        next();
    } catch (error) {
        return next(new AppError("UNAUTHENTICATED", 401, "Token inválido"));
    }
};
