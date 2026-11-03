import { Schema, model, Document } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { PublicationStatus, NeedStatus, PUBLICATION_STATUS, NEED_STATUS } from "../types/domain";

export interface INeed {
    _id?: any;
    name: string;
    status: NeedStatus;
}

export interface IPublication extends Document {
    user_id: Schema.Types.ObjectId;
    text: string;
    file?: string;
    status: PublicationStatus;
    created_at: Date;
    necesidades: INeed[];
}

const PublicationSchema = new Schema<IPublication>({
    user_id: {
        type: Schema.Types.ObjectId,
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
        enum: PUBLICATION_STATUS,
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
                enum: NEED_STATUS,
                default: "disponible",
                required: true
            }
        }
    ]
});

PublicationSchema.plugin(mongoosePaginate);

export default model<IPublication>("Publication", PublicationSchema, "publications");
