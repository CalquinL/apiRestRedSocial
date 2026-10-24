import { Schema, model, Document } from "mongoose";
import { ReservationStatus } from "../types/domain";

export interface IReservation extends Document {
    publication_id: Schema.Types.ObjectId;
    item_id: Schema.Types.ObjectId;
    donor_id: Schema.Types.ObjectId;
    status: ReservationStatus;
    reserved_at: Date;
    delivered_at?: Date;
}

const ReservationSchema = new Schema<IReservation>({
    publication_id: {
        type: Schema.Types.ObjectId,
        ref: "Publication",
        required: true
    },
    item_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    donor_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["reservado", "entregado", "cancelada"],
        default: "reservado",
        required: true
    },
    reserved_at: {
        type: Date,
        default: Date.now
    },
    delivered_at: {
        type: Date
    }
});

export default model<IReservation>("Reservation", ReservationSchema, "reservations");
