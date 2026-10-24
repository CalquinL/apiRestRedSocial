const User = require("../models/user");

class UserRepository {
    async findByEmail(email) {
        return await User.findOne({ email: email.toLowerCase() });
    }

    async findByNick(nick) {
        return await User.findOne({ nick: nick.toLowerCase() });
    }

    async findByCriteria(criteria) {
        return await User.find({
            $or: [
                { email: criteria.email.toLowerCase() },
                { nick: criteria.nick.toLowerCase() }
            ]
        });
    }

    async create(userData) {
        const user = new User(userData);
        return await user.save();
    }
}

module.exports = new UserRepository();
