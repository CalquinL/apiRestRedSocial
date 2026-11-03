import { Schema, model, Document } from "mongoose";
import { ReservationStatus, RESERVATION_STATUS } from "../types/domain";
import mongoosePaginate from "mongoose-paginate-v2";

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
        enum: RESERVATION_STATUS,
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

ReservationSchema.plugin(mongoosePaginate);

export default model<IReservation>("Reservation", ReservationSchema, "reservations");
