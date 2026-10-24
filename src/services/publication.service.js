const publicationRepository = require("../repositories/publication.repository");
const AppError = require("../utils/AppError");

class PublicationService {
    async createPublication(userId, data) {
        // Regla: solo el beneficiario puede crear
        // (La validación de rol se hace en la ruta con el middleware, pero el service la refuerza)

        const publicationData = {
            ...data,
            user_id: userId,
            status: "pendiente" // Nace pendiente
        };

        return await publicationRepository.create(publicationData);
    }

    async getPublicationById(id) {
        const publication = await publicationRepository.findById(id);
        if (!publication) {
            throw new AppError("NOT_FOUND", 404, "La publicación no existe");
        }
        return publication;
    }

    async listApprovedPublications(options) {
        return await publicationRepository.findApproved(options);
    }

    async listUserPublications(userId, options) {
        return await publicationRepository.findByUserId(userId, options);
    }

    async updatePublication(id, userId, data) {
        const publication = await this.getPublicationById(id);

        // Regla: solo el dueño puede editar
        if (publication.user_id.toString() !== userId.toString()) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para editar esta publicación");
        }

        return await publicationRepository.update(id, data);
    }

    async deletePublication(id, userId) {
        const publication = await this.getPublicationById(id);

        if (publication.user_id.toString() !== userId.toString()) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para eliminar esta publicación");
        }

        // Regla: eliminar con reservas activas -> 409
        // (Este chequeo se implementará plenamente en Fase 4, por ahora lanzamos el esqueleto)

        const deleted = await publicationRepository.delete(id, userId);
        if (!deleted) {
            throw new AppError("NOT_FOUND", 404, "No se pudo encontrar la publicación para eliminar");
        }
        return deleted;
    }

    async moderatePublication(id, status) {
        const publication = await this.getPublicationById(id);

        // Regla: si ya fue moderada (no es pendiente) -> 409
        if (publication.status !== "pendiente") {
            throw new AppError("INVALID_STATE_TRANSITION", 409, "La publicación ya ha sido moderada");
        }

        return await publicationRepository.updateStatus(id, status);
    }

    async updatePublicationImage(id, userId, filename) {
        const publication = await this.getPublicationById(id);

        if (publication.user_id.toString() !== userId.toString()) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para cambiar la imagen");
        }

        return await publicationRepository.updateImage(id, userId, filename);
    }
}

module.exports = new PublicationService();
