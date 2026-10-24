import validator from "validator";

interface ValidationParams {
    name?: string;
    surname?: string;
    nick?: string;
    email?: string;
    password?: string;
    bio?: string;
}

const validate = (params: ValidationParams): void => {
    // Validaciones individuales
    const isNameValid = params.name && !validator.isEmpty(params.name) &&
        validator.isLength(params.name, { min: 3 }) &&
        validator.isAlpha(params.name, "es-ES");

    const isSurnameValid = params.surname && !validator.isEmpty(params.surname) &&
        validator.isLength(params.surname, { min: 3 }) &&
        validator.isAlpha(params.surname, "es-ES");

    const isNickValid = params.nick && !validator.isEmpty(params.nick) &&
        validator.isLength(params.nick, { min: 3 });

    const isEmailValid = params.email && !validator.isEmpty(params.email) &&
        validator.isEmail(params.email);

    const isPasswordValid = params.password && !validator.isEmpty(params.password);

    // Validación de bio si existe
    if (params.bio) {
        const isBioValid = validator.isLength(params.bio, { max: 255 });
        if (!isBioValid) {
            throw new Error("No se ha superado la validación de la bio");
        }
    }

    // Validación final de campos obligatorios
    if (!isNameValid || !isSurnameValid || !isNickValid || !isEmailValid || !isPasswordValid) {
        throw new Error("No se ha superado la validación de datos");
    }
};

export default validate;
