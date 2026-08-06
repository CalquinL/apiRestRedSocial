const validator = require("validator");

const validate = (params) => {
    let name = !validator.isEmpty(params.name) &&
        validator.isLength(params.name, { min: 3, max: undefined }) &&
        validator.isAlpha(params.name, "es-ES");

    let surname = !validator.isEmpty(params.surname) &&
        validator.isLength(params.surname, { min: 3, max: undefined }) &&
        validator.isAlpha(params.surname, "es-ES");

    let nick = !validator.isEmpty(params.nick) &&
        validator.isLength(params.nick, { min: 3, max: undefined });

    let email = !validator.isEmpty(params.email) &&
        validator.isEmail(params.email, { min: 3, max: undefined });

    let password = !validator.isEmpty(params.password);

    if (params.bio) {
        let bio = validator.isLength(params.bio, { min: undefined, max: 255 });

        if (!bio) {
            throw new Error("No se ha superado la validacion");
        } else {
            console.log("validacion superada");
        }

    }


    if (!name || !surname || !nick || !email || !password) {
        throw new Error("No se ha superado la validacion");
    } else {
        console.log("validacion superada");
    }
}

module.exports = validate
