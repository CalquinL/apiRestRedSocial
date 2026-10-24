import { Schema, model, Document } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { Role, ROLES } from "../types/domain";

export interface IUser extends Document {
    name: string;
    surname: string;
    nick: string;
    email: string;
    password: string;
    role: Role;
    image: string;
    address?: string;
    phone?: string;
    verified: boolean;
    created_at: Date;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    nick: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ROLES,
        required: true
    },
    image: { type: String, default: "default.png" },
    address: String,
    phone: String,
    verified: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

UserSchema.plugin(mongoosePaginate);

export default model<IUser>("User", UserSchema, "users");
