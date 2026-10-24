import Publication, { IPublication } from "../models/publication";
import { Meta } from "../utils/response";

class PublicationRepository {
    async create(publicationData: Partial<IPublication>): Promise<IPublication> {
        const publication = new Publication(publicationData);
        return await publication.save();
    }

    async findById(id: string): Promise<IPublication | null> {
        return await Publication.findById(id);
    }

    async findByUserId(userId: string, options: any): Promise<{ docs: IPublication[], totalDocs: number, totalPages: number, page: number, limit: number }> {
        return await Publication.paginate({ user_id: userId }, options);
    }

    async findApproved(options: any): Promise<{ docs: IPublication[], totalDocs: number, totalPages: number, page: number, limit: number }> {
        return await Publication.paginate({ status: "aprobada" }, options);
    }

    async update(id: string, updateData: Partial<IPublication>): Promise<IPublication | null> {
        return await Publication.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id: string, userId: string): Promise<IPublication | null> {
        return await Publication.findOneAndDelete({ _id: id, user_id: userId });
    }

    async updateStatus(id: string, status: string): Promise<IPublication | null> {
        return await Publication.findByIdAndUpdate(id, { status }, { new: true });
    }

    async updateImage(id: string, userId: string, filename: string): Promise<IPublication | null> {
        return await Publication.findOneAndUpdate(
            { _id: id, user_id: userId },
            { file: filename },
            { new: true }
        );
    }

    async atomicReserveItem(publicationId: string, itemId: string): Promise<IPublication | null> {
        return await Publication.findOneAndUpdate(
            {
                _id: publicationId,
                status: "aprobada",
                necesidades: { $elemMatch: { _id: itemId, status: "disponible" } }
            },
            {
                $set: { "necesidades.$.status": "reservado" }
            },
            { new: true }
        );
    }

    async updateItemStatus(publicationId: string, itemId: string, status: string): Promise<IPublication | null> {
        return await Publication.findOneAndUpdate(
            { _id: publicationId, "necesidades._id": itemId },
            { $set: { "necesidades.$.status": status } },
            { new: true }
        );
    }
}

export default new PublicationRepository();
