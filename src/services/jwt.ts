import dotenv from "dotenv";
dotenv.config();
import jwt from "jwt-simple";
import moment from "moment";

const secret: string = process.env.JWT_SECRET || "default_secret";
const expires_in: string = process.env.JWT_EXPIRES_IN || "24h";

interface JwtPayload {
    id: string;
    role: string;
    iat: number;
    exp: number;
}

export const createToken = (user: { _id: string; role: string }): string => {
    const payload: JwtPayload = {
        id: user._id,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(expires_in, "seconds").unix()
    };

    return jwt.encode(payload, secret);
}

export { secret };
