const Reservation = require("../models/reservation");

class ReservationRepository {
    async create(reservationData) {
        const reservation = new Reservation(reservationData);
        return await reservation.save();
    }

    async findById(id) {
        return await Reservation.findById(id);
    }

    async findByDonor(donorId, options) {
        return await Reservation.paginate({ donor_id: donorId }, options);
    }

    async update(id, updateData) {
        return await Reservation.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await Reservation.findByIdAndDelete(id);
    }
}

module.exports = new ReservationRepository();
