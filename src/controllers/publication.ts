import { Request, Response, NextFunction } from "express";
import publicationService from "../services/publication.service";
import { sendSuccess } from "../utils/response";
import AppError from "../utils/AppError";

class PublicationController {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const publication = await publicationService.createPublication(req.user!.id, req.body);
            sendSuccess(res, publication, 201);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const publication = await publicationService.getPublicationById(req.params.id);
            sendSuccess(res, publication, 200);
        } catch (error) {
            next(error);
        }
    }

    async listApproved(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

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
            const userId = req.params.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

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
            const updated = await publicationService.updatePublication(req.params.id, req.user!.id, req.body);
            sendSuccess(res, updated, 200);
        } catch (error) {
            next(error);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await publicationService.deletePublication(req.params.id, req.user!.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async moderate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { status } = req.body;
            const moderated = await publicationService.moderatePublication(req.params.id, status);
            sendSuccess(res, moderated, 200);
        } catch (error) {
            next(error);
        }
    }

    async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.file) {
                throw new AppError("BAD_REQUEST", 400, "No se ha subido ninguna imagen");
            }
            const updated = await publicationService.updatePublicationImage(req.params.id, req.user!.id, req.file.filename);
            sendSuccess(res, updated, 200);
        } catch (error) {
            next(error);
        }
    }
}

export default new PublicationController();
