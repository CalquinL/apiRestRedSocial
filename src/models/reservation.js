const { Schema, model } = require("mongoose");

const ReservationSchema = Schema({
    publication_id: {
        type: Schema.ObjectId,
        ref: "Publication",
        required: true
    },
    item_id: {
        type: Schema.ObjectId,
        required: true
    },
    donor_id: {
        type: Schema.ObjectId,
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

module.exports = model("Reservation", ReservationSchema, "reservations");
