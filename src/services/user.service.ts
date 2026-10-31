import userRepository from "../repositories/user.repository";
import AppError from "../utils/AppError";
import { IUser } from "../models/user";

class UserService {
    async getUserById(id: string): Promise<IUser | null> {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new AppError("NOT_FOUND", 404, "El usuario no existe");
        }
        return user;
    }

    async updateProfile(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        // Aquí se podrían añadir reglas de negocio, como validar que el nick no esté repetido
        const updatedUser = await userRepository.update(id, updateData);
        if (!updatedUser) {
            throw new AppError("NOT_FOUND", 404, "El usuario no existe");
        }
        return updatedUser;
    }

    async getAllUsers(page: number, limit: number): Promise<{ users: IUser[], total: number }> {
        return await userRepository.findAll(page, limit);
    }
}

export default new UserService();
