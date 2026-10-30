import User, { IUser } from "../models/user";

class UserRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email: email.toLowerCase() });
    }

    async findByNick(nick: string): Promise<IUser | null> {
        return await User.findOne({ nick: nick.toLowerCase() });
    }

    async findByCriteria(criteria: { email: string; nick: string }): Promise<IUser[]> {
        return await User.find({
            $or: [
                { email: criteria.email.toLowerCase() },
                { nick: criteria.nick.toLowerCase() }
            ]
        });
    }

    async create(userData: Partial<IUser>): Promise<any> {
        const user = new User(userData);
        const savedUser = await user.save();

        // Convertimos a objeto plano y eliminamos el password antes de devolverlo
        const userObj = savedUser.toObject();
        delete userObj.password;

        return userObj;
    }
}

export default new UserRepository();
