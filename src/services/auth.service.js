const userRepository = require("../repositories/user.repository");
const bcrypt = require("bcrypt");
const jwtService = require("./jwt");
const AppError = require("../utils/AppError");

class AuthService {
    async register(userData) {
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

    async login(email, password) {
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
                id: user._id,
                name: user.name,
                nick: user.nick,
                role: user.role
            },
            token
        };
    }
}

module.exports = new AuthService();
