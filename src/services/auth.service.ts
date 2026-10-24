import userRepository from "../repositories/user.repository";
import bcrypt from "bcrypt";
import * as jwtService from "../services/jwt";
import AppError from "../utils/AppError";
import { Role } from "../types/domain";

interface AuthLoginResponse {
    user: {
        id: string;
        name: string;
        nick: string;
        role: Role;
    };
    token: string;
}

class AuthService {
    async register(userData: any): Promise<any> {
        // Control de duplicados
        const existingUser = await userRepository.findByCriteria({
            email: userData.email,
            nick: userData.nick
        });

        if (existingUser && existingUser.length > 0) {
            throw new AppError("EMAIL_ALREADY_EXISTS", 409, "El correo o el nick ya están registrados");
        }

        // Hash de contraseña
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const userToSave = {
            ...userData,
            password: hashedPassword
        };

        return await userRepository.create(userToSave);
    }

    async login(email: string, password: string): Promise<AuthLoginResponse> {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new AppError("INVALID_CREDENTIALS", 401, "Credenciales incorrectas");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new AppError("INVALID_CREDENTIALS", 401, "Credenciales incorrectas");
        }

        const token = jwtService.createToken(user);

        return {
            user: {
                id: user._id.toString(),
                name: user.name,
                nick: user.nick,
                role: user.role
            },
            token
        };
    }
}

export default new AuthService();
