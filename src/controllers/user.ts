import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import userService from "../services/user.service";
import { sendSuccess } from "../utils/response";
import AppError from "../utils/AppError";
import path from "path";
import fs from "fs";

class UserController {
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await authService.register(req.body);
            sendSuccess(res, user, 201);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await authService.login(req.body.email, req.body.password);
            sendSuccess(res, result, 200);
        } catch (error) {
            next(error);
        }
    }

    async profile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Usamos el ID del usuario autenticado que el middleware de auth deja en req.user
            const userId = req.user?.id || req.params.id;
            const user = await userService.getUserById(userId);
            sendSuccess(res, user, 200);
        } catch (error) {
            next(error);
        }
    }

    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            let limit = parseInt(req.query.limit as string) || 10;

            // Validar límite máximo según CLAUDE.md (máximo 50)
            if (limit > 50) limit = 50;
            if (limit < 1) limit = 1;

            const { users, total } = await userService.getAllUsers(page, limit);

            const meta = {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            };

            sendSuccess(res, users, 200, meta);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id || req.params.id;
            const updatedUser = await userService.updateProfile(userId, req.body);
            sendSuccess(res, updatedUser, 200);
        } catch (error) {
            next(error);
        }
    }

    async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.file) {
                throw new AppError("VALIDATION_ERROR", 400, "No se ha subido ningún archivo");
            }

            const userId = req.user?.id;
            if (!userId) {
                throw new AppError("UNAUTHENTICATED", 401, "Usuario no autenticado");
            }

            const fileName = req.file.filename;

            // Llamamos al servicio sin asignar el resultado a una variable no utilizada
            await userService.updateProfile(userId, { image: fileName });

            sendSuccess(res, {
                message: "Imagen subida con éxito",
                image: fileName
            }, 200);
        } catch (error) {
            next(error);
        }
    }

    async avatar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const fileName = req.params.file;
            const filePath = path.join(process.cwd(), "uploads", "users", fileName);

            console.log("Buscando archivo de avatar en:", filePath);

            if (!fs.existsSync(filePath)) {
                throw new AppError("NOT_FOUND", 404, `La imagen solicitada no existe en la ruta: ${filePath}`);
            }

            res.sendFile(filePath);
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
