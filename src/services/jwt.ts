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
    const iat = moment().unix();
    let exp = iat;

    if (expires_in.endsWith("h")) {
        const hours = parseInt(expires_in.replace("h", ""), 10);
        exp = moment().add(hours, "hours").unix();
    } else if (expires_in.endsWith("d")) {
        const days = parseInt(expires_in.replace("d", ""), 10);
        exp = moment().add(days, "days").unix();
    } else {
        const seconds = parseInt(expires_in, 10);
        exp = moment().add(seconds || 86400, "seconds").unix();
    }

    const payload: JwtPayload = {
        id: user._id,
        role: user.role,
        iat: iat,
        exp: exp
    };

    console.log(`Token created for user ${user._id} - iat: ${payload.iat}, exp: ${payload.exp}, now: ${moment().unix()}`);

    return jwt.encode(payload, secret);
}

export { secret };
