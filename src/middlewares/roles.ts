import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { Role } from "../types/domain";

export const roles = (requiredRoles: Role[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError("UNAUTHENTICATED", 401, "Usuario no autenticado"));
        }

        if (!requiredRoles.includes(req.user.role)) {
            return next(new AppError("FORBIDDEN", 403, "No tienes permisos para acceder a este recurso"));
        }

        next();
    };
};
