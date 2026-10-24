import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import { sendSuccess } from "../utils/response";

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

    async profile(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            sendSuccess(res, { message: "Perfil en construcción" });
        } catch (error) {
            next(error);
        }
    }

    async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            sendSuccess(res, [], 200);
        } catch (error) {
            next(error);
        }
    }

    async update(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            sendSuccess(res, { message: "Actualización en construcción" });
        } catch (error) {
            next(error);
        }
    }

    async upload(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            sendSuccess(res, { message: "Subida en construcción" });
        } catch (error) {
            next(error);
        }
    }

    async avatar(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            sendSuccess(res, { message: "Avatar en construcción" });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
