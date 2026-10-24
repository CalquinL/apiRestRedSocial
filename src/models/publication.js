const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const PublicationSchema = Schema({
    user_id: {
        type: Schema.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    file: String,
    status: {
        type: String,
        enum: ["pendiente", "aprobada", "rechazada"],
        default: "pendiente",
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    necesidades: [
        {
            name: {
                type: String,
                required: true
            },
            status: {
                type: String,
                enum: ["disponible", "reservado", "entregado"],
                default: "disponible",
                required: true
            }
        }
    ]
});

PublicationSchema.plugin(mongoosePaginate);

module.exports = model("Publication", PublicationSchema, "publications");
