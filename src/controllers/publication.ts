import { Request, Response, NextFunction } from "express";
import publicationService from "../services/publication.service";
import { sendSuccess } from "../utils/response";
import AppError from "../utils/AppError";

class PublicationController {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Usuario no autenticado");

            const publication = await publicationService.createPublication(userId, req.body);
            sendSuccess(res, publication, 201);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const publication = await publicationService.getPublicationById(id);
            sendSuccess(res, publication, 200);
        } catch (error) {
            next(error);
        }
    }

    async listApproved(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(String(req.query.page)) || 1;
            const limit = Math.min(parseInt(String(req.query.limit)) || 10, 50);

            const options = {
                page,
                limit,
                sort: { created_at: -1 }
            };

            const result = await publicationService.listApprovedPublications(options);

            sendSuccess(res, result.docs, 200, {
                page: result.page,
                limit: result.limit,
                total: result.totalDocs,
                pages: result.totalPages
            });
        } catch (error) {
            next(error);
        }
    }

    async listByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = String(req.params.id);
            const page = parseInt(String(req.query.page)) || 1;
            const limit = Math.min(parseInt(String(req.query.limit)) || 10, 50);

            const options = {
                page,
                limit,
                sort: { created_at: -1 }
            };

            const result = await publicationService.listUserPublications(userId, options);

            sendSuccess(res, result.docs, 200, {
                page: result.page,
                limit: result.limit,
                total: result.totalDocs,
                pages: result.totalPages
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Usuario no autenticado");

            const id = String(req.params.id);
            const updated = await publicationService.updatePublication(id, userId, req.body);
            sendSuccess(res, updated, 200);
        } catch (error) {
            next(error);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Usuario no autenticado");

            const id = String(req.params.id);
            await publicationService.deletePublication(id, userId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async moderate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { status } = req.body;
            const id = String(req.params.id);
            const moderated = await publicationService.moderatePublication(id, status);
            sendSuccess(res, moderated, 200);
        } catch (error) {
            next(error);
        }
    }

    async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!(req as any).file) {
                throw new AppError("BAD_REQUEST", 400, "No se ha subido ninguna imagen");
            }
            const userId = req.user?.id;
            if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Usuario no autenticado");

            const id = String(req.params.id);
            const fileName = (req as any).file.filename;
            const updated = await publicationService.updatePublicationImage(id, userId, fileName);
            sendSuccess(res, updated, 200);
        } catch (error) {
            next(error);
        }
    }
}

export default new PublicationController();
