import publicationRepository from "../repositories/publication.repository";
import AppError from "../utils/AppError";
import { IPublication, INeed } from "../models/publication";
import { PublicationStatus } from "../types/domain";

class PublicationService {
    async createPublication(userId: string, data: any): Promise<IPublication> {
        const publicationData = {
            ...data,
            user_id: userId,
            status: "pendiente" as PublicationStatus
        };

        return await publicationRepository.create(publicationData);
    }

    async getPublicationById(id: string): Promise<IPublication> {
        const publication = await publicationRepository.findById(id);
        if (!publication) {
            throw new AppError("NOT_FOUND", 404, "La publicación no existe");
        }
        return publication;
    }

    async listApprovedPublications(options: any): Promise<{ docs: IPublication[], totalDocs: number, totalPages: number, page: number, limit: number }> {
        return await publicationRepository.findApproved(options);
    }

    async listUserPublications(userId: string, options: any): Promise<{ docs: IPublication[], totalDocs: number, totalPages: number, page: number, limit: number }> {
        return await publicationRepository.findByUserId(userId, options);
    }

    async updatePublication(id: string, userId: string, data: any): Promise<IPublication | null> {
        const publication = await this.getPublicationById(id);

        if (publication.user_id.toString() !== userId) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para editar esta publicación");
        }

        return await publicationRepository.update(id, data);
    }

    async deletePublication(id: string, userId: string): Promise<IPublication | null> {
        const publication = await this.getPublicationById(id);

        if (publication.user_id.toString() !== userId) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para eliminar esta publicación");
        }

        const deleted = await publicationRepository.delete(id, userId);
        if (!deleted) {
            throw new AppError("NOT_FOUND", 404, "No se pudo encontrar la publicación para eliminar");
        }
        return deleted;
    }

    async moderatePublication(id: string, status: PublicationStatus): Promise<IPublication | null> {
        const publication = await this.getPublicationById(id);

        if (publication.status !== "pendiente") {
            throw new AppError("INVALID_STATE_TRANSITION", 409, "La publicación ya ha sido moderada");
        }

        return await publicationRepository.updateStatus(id, status);
    }

    async updatePublicationImage(id: string, userId: string, filename: string): Promise<IPublication | null> {
        const publication = await this.getPublicationById(id);

        if (publication.user_id.toString() !== userId) {
            throw new AppError("FORBIDDEN", 403, "No tienes permiso para cambiar la imagen");
        }

        return await publicationRepository.updateImage(id, userId, filename);
    }
}

export default new PublicationService();
