import { Request, Response, NextFunction } from "express";
import publicationService from "../services/publication.service";
import { sendSuccess } from "../utils/response";
import AppError from "../utils/AppError";

class PublicationController {
    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Usuario no autenticado");

            const { text, necesidades } = req.body;
            if (!text || !necesidades || !Array.isArray(necesidades) || necesidades.length === 0) {
                throw new AppError("VALIDATION_ERROR", 400, "El texto y al menos una necesidad son obligatorios");
            }

            const publication = await publicationService.createPublication(userId, req.body);

            const filteredPublication = {
                _id: publication._id,
                user_id: publication.user_id,
                text: publication.text,
                file: publication.file,
                status: publication.status,
                created_at: publication.created_at,
                necesidades: publication.necesidades.map((n: any) => ({
                    _id: n._id,
                    name: n.name,
                    status: n.status
                }))
            };

            sendSuccess(res, filteredPublication, 201);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = String(req.params.id);
            const publication = await publicationService.getPublicationById(id);

            const filteredPublication = {
                _id: publication._id,
                user_id: publication.user_id,
                text: publication.text,
                file: publication.file,
                status: publication.status,
                created_at: publication.created_at,
                necesidades: publication.necesidades.map((n: any) => ({
                    _id: n._id,
                    name: n.name,
                    status: n.status
                }))
            };

            sendSuccess(res, filteredPublication, 200);
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

            if (!updated) {
                throw new AppError("NOT_FOUND", 404, "La publicación no existe o no tienes permiso para editarla");
            }

            const filteredPublication = {
                _id: updated._id,
                user_id: updated.user_id,
                text: updated.text,
                file: updated.file,
                status: updated.status,
                created_at: updated.created_at,
                necesidades: updated.necesidades.map((n: any) => ({
                    _id: n._id,
                    name: n.name,
                    status: n.status
                }))
            };

            sendSuccess(res, filteredPublication, 200);
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
            if (!status) throw new AppError("VALIDATION_ERROR", 400, "El estado es obligatorio para moderar");

            const id = String(req.params.id);
            const moderated = await publicationService.moderatePublication(id, status);

            if (!moderated) {
                throw new AppError("NOT_FOUND", 404, "La publicación no existe o ya ha sido moderada");
            }

            const filteredPublication = {
                _id: moderated._id,
                user_id: moderated.user_id,
                text: moderated.text,
                file: moderated.file,
                status: moderated.status,
                created_at: moderated.created_at,
                necesidades: moderated.necesidades.map((n: any) => ({
                    _id: n._id,
                    name: n.name,
                    status: n.status
                }))
            };

            sendSuccess(res, filteredPublication, 200);
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

            if (!updated) {
                throw new AppError("NOT_FOUND", 404, "La publicación no existe o no tienes permiso para subir una imagen");
            }

            const filteredPublication = {
                _id: updated._id,
                user_id: updated.user_id,
                text: updated.text,
                file: updated.file,
                status: updated.status,
                created_at: updated.created_at,
                necesidades: updated.necesidades.map((n: any) => ({
                    _id: n._id,
                    name: n.name,
                    status: n.status
                }))
            };

            sendSuccess(res, filteredPublication, 200);
        } catch (error) {
            next(error);
        }
    }
}

export default new PublicationController();
