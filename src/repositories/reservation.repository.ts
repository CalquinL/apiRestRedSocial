import Reservation, { IReservation } from "../models/reservation";

class ReservationRepository {
    async create(reservationData: Partial<IReservation>): Promise<IReservation> {
        const reservation = new Reservation(reservationData);
        return await reservation.save();
    }

    async findById(id: string): Promise<IReservation | null> {
        return await Reservation.findById(id);
    }

    async findByDonor(donorId: string, options: any): Promise<{ docs: IReservation[], totalDocs: number, totalPages: number, page: number, limit: number }> {
        return await Reservation.paginate({ donor_id: donorId }, options);
    }

    async update(id: string, updateData: Partial<IReservation>): Promise<IReservation | null> {
        return await Reservation.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id: string): Promise<IReservation | null> {
        return await Reservation.findByIdAndDelete(id);
    }
}

export default new ReservationRepository();
