const publicationService = require("../services/publication.service");
const { sendSuccess } = require("../utils/response");

class PublicationController {
    async create(req, res, next) {
        try {
            const publication = await publicationService.createPublication(req.user.id, req.body);
            return sendSuccess(res, publication, 201);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const publication = await publicationService.getPublicationById(req.params.id);
            return sendSuccess(res, publication, 200);
        } catch (error) {
            next(error);
        }
    }

    async listApproved(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);

            const options = {
                page,
                limit,
                sort: { created_at: -1 }
            };

            const result = await publicationService.listApprovedPublications(options);

            return sendSuccess(res, result.docs, 200, {
                page: result.page,
                limit: result.limit,
                total: result.totalDocs,
                pages: result.totalPages
            });
        } catch (error) {
            next(error);
        }
    }

    async listByUser(req, res, next) {
        try {
            const userId = req.params.id;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);

            const options = {
                page,
                limit,
                sort: { created_at: -1 }
            };

            const result = await publicationService.listUserPublications(userId, options);

            return sendSuccess(res, result.docs, 200, {
                page: result.page,
                limit: result.limit,
                total: result.totalDocs,
                pages: result.totalPages
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updated = await publicationService.updatePublication(req.params.id, req.user.id, req.body);
            return sendSuccess(res, updated, 200);
        } catch (error) {
            next(error);
        }
    }

    async remove(req, res, next) {
        try {
            await publicationService.deletePublication(req.params.id, req.user.id);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async moderate(req, res, next) {
        try {
            const { status } = req.body;
            const moderated = await publicationService.moderatePublication(req.params.id, status);
            return sendSuccess(res, moderated, 200);
        } catch (error) {
            next(error);
        }
    }

    async uploadImage(req, res, next) {
        try {
            if (!req.file) {
                throw new AppError("BAD_REQUEST", 400, "No se ha subido ninguna imagen");
            }
            const updated = await publicationService.updatePublicationImage(req.params.id, req.user.id, req.file.filename);
            return sendSuccess(res, updated, 200);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PublicationController();
