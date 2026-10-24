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
}

module.exports = new PublicationRepository();
