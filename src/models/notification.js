const { Schema, model } = require("mongoose");

const NotificationSchema = Schema({
    user_id: {
        type: Schema.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["confirmación", "alerta pendiente", "conflicto"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = model("Notification", NotificationSchema, "notifications");
