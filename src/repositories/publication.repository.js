const Publication = require("../models/publication");

class PublicationRepository {
    async create(publicationData) {
        const publication = new Publication(publicationData);
        return await publication.save();
    }

    async findById(id) {
        return await Publication.findById(id);
    }

    async findByUserId(userId, options) {
        return await Publication.paginate({ user_id: userId }, options);
    }

    async findApproved(options) {
        return await Publication.paginate({ status: "aprobada" }, options);
    }

    async update(id, updateData) {
        return await Publication.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id, userId) {
        return await Publication.findOneAndDelete({ _id: id, user_id: userId });
    }

    async updateStatus(id, status) {
        return await Publication.findByIdAndUpdate(id, { status }, { new: true });
    }

    async updateImage(id, userId, filename) {
        return await Publication.findOneAndUpdate(
            { _id: id, user_id: userId },
            { file: filename },
            { new: true }
        );
    }

    /**
     * Reserva atómica de una necesidad
     * Marca la necesidad como 'reservado' solo si la publicación está 'aprobada'
     * y la necesidad específica está 'disponible'.
     */
    async atomicReserveItem(publicationId, itemId) {
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

    /**
     * Actualiza el estado de una necesidad (para cancelaciones o entregas)
     */
    async updateItemStatus(publicationId, itemId, status) {
        return await Publication.findOneAndUpdate(
            { _id: publicationId, "necesidades._id": itemId },
            { $set: { "necesidades.$.status": status } },
            { new: true }
        );
    }
}

module.exports = new PublicationRepository();
