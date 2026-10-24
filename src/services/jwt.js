require("dotenv").config();
const jwt = require("jwt-simple");
const moment = require("moment");

const secret = process.env.JWT_SECRET;
const expires_in = process.env.JWT_EXPIRES_IN || "24h";

const createToken = (user) => {
    const payload = {
        id: user._id,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(expires_in).unix()
    };

    return jwt.encode(payload, secret);
}

module.exports = {
    secret,
    createToken
}
