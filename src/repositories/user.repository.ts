import User, { IUser } from "../models/user";

class UserRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email: email.toLowerCase() });
    }

    async findByNick(nick: string): Promise<IUser | null> {
        return await User.findOne({ nick: nick.toLowerCase() });
    }

    async findById(id: string): Promise<IUser | null> {
        return await User.findById(id).select("-password");
    }

    async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    }

    async findAll(page: number, limit: number): Promise<{ users: IUser[], total: number }> {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find()
                .select("_id name surname nick image role")
                .skip(skip)
                .limit(limit),
            User.countDocuments()
        ]);
        return { users, total };
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
