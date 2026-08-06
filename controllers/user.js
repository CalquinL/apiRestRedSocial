// Dependencias, servicios y modulos
const bcrypt = require("bcrypt")
const User = require("../models/user");
const jwt = require("../services/jwt");
const mongoosePagination = require("mongoose-paginate-v2");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService");
const validate = require("../helpers/validate");

// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.js",
        usuario: req.user
    });
}

// Registro de usuarios
const register = async (req, res) => {
    try {
        // Recoger datos de la peticion
        let params = req.body;

        // Comprobar que llegan bien + validacion
        if (!params.name || !params.email || !params.password || !params.nick) {
            return res.status(400).json({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        // Validacion de datos
        try{
            validate(params);
        } catch(error){
            return res.status(400).json({
                status: "error",
                message: "validacion no superada"
            });
        }

        // Control de usuarios duplicados
        const users = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        });

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }

        // Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        // Crear objeto de usuario
        let user_to_save = new User(params);

        // Guardar usuario en la base de datos
        const userStored = await user_to_save.save();

        if (!userStored) {
            return res.status(500).send({
                status: "error",
                message: "Error al guardar el usuario"
            });
        }

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Usuario registrado correctamente",
            user: userStored
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en el registro de usuario",
            error: error.message
        });
    }
}

const login = async (req, res) => {
    try {
        // Recoger parametros body
        let params = req.body;
        if (!params.email || !params.password) {
            return res.status(400).send({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        // Buscar en la base de datos si existe
        const user = await User.findOne({ email: params.email });

        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "No existe el usuario"
            });
        }

        // Comprobar su contraseña
        const pwd = bcrypt.compareSync(params.password, user.password);
        if (!pwd) {
            return res.status(400).send({
                status: "error",
                message: "No te has identificado correctamente"
            });
        }

        // Conseguir Token
        const token = jwt.createToken(user);

        // Devolver datos de usuario
        return res.status(200).send({
            status: "success",
            message: "identificación exitosa",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick
            },
            token
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en la identificación del usuario",
            error: error.message
        });
    }
}

const profile = async (req, res) => {
    try {
        // Recibir el parametro del id de usuario por la url
        const id = req.params.id;

        // debugg
        console.log("identityUserId (req.user.id):", req.user.id);
        console.log("profileUserId (params.id):", id);

        // Consulta para sacar los datos de usuario
        const userProfile = await User.findById(id).select('-password -role');

        if (!userProfile) {
            return res.status(404).send({
                status: "error",
                message: "El usuario no existe"
            });
        }

        // Informacion de seguimiento
        const followInfo = await followService.followThisUser(req.user.id, id);

        // Devolver el usuario
        return res.status(200).send({
            status: "success",
            user: userProfile,
            followInfo
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al recuperar el usuario",
            error: error.message
        });
    }

}

const list = async (req, res) => {
    try {
        let page = 1;
        if (req.params.page) {
            page = parseInt(req.params.page);
        }
 
        const itemsPerPage = 4;
 
        const options = {
            page,
            limit: itemsPerPage,
            sort: '_id',
            select: '-password -role'
        };
 
        const result = await User.paginate({}, options);
 
        if (!result.docs || result.docs.length === 0) {
            return res.status(404).send({
                status: "error",
                message: "No hay usuarios disponibles"
            });
        }
 
        // Obtener info de seguimiento del usuario autenticado
        let followInfo = await followService.followUserIds(req.user.id);
 
        return res.status(200).send({
            status: "success",
            users: result.docs,
            page: result.page,
            itemsPerPage,
            total: result.totalDocs,
            pages: result.totalPages,
            user_following: followInfo.user_following,
            user_follow_me: followInfo.user_follow_me
        });
 
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al listar los usuarios",
            error: error.message
        });
    }
}

const update = async (req, res) => {
    try {
        // Recoger info del usuario a actualizar
        let userIdentity = req.user;
        let userToUpdate = req.body;

        // Eliminar campos sobrantes
        delete userToUpdate.iat;
        delete userToUpdate.exp;
        delete userToUpdate.role;
        delete userToUpdate.image;

        // Validar campos obligatorios
        if (!userToUpdate.email || !userToUpdate.nick) {
            return res.status(400).send({
                status: "error",
                message: "Faltan datos obligatorios (email o nick)"
            });
        }

        // Comprobar si el usuario ya existe
        const users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        });

        let userIsset = false;
        users.forEach(user => {
            if (user && user._id.toString() !== userIdentity.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }

        // Cifrar la contraseña
        if (userToUpdate.password) {
            userToUpdate.password = await bcrypt.hash(userToUpdate.password, 10);
        
        } else{ 
            delete userToUpdate.password;
        }

        // Buscar y actualizar
        const userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true });

        if (!userUpdated) {
            return res.status(500).json({ status: "error", message: "Error al actualizar" });
        }

        return res.status(200).send({
            status: "success",
            message: "Metodo de actualizar usuario",
            user: userUpdated
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al actualizar el usuario",
            error: error.message
        });
    }
}

const upload = async (req, res) => {

    // Recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Peticion no incluye la imagen"
        });
    }

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extension del archivo (usando el último punto)
    const imageSplit = image.split(".");
    const extension = imageSplit[imageSplit.length - 1].toLowerCase();

    // Comprobar extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        // Borrar archivo
        const filePath = req.file.path;
        fs.unlinkSync(filePath);

        return res.status(400).send({
            status: "error",
            message: "Extension del archivo invalida"
        });
    }

    try {
        // Si es correcta, guardar imagen en la base de datos
        const userUpdated = await User.findOneAndUpdate(
            { _id: req.user.id },
            { image: req.file.filename },
            { returnDocument: 'after' }
        );

        if (!userUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida del avatar"
            });
        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            user: userUpdated,
            file: req.file
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: "error",
            message: "Error en la subida del avatar"
        });
    }
}

const avatar = (req, res) => {

    // Sacar ell parametro de la URL
    const file = req.params.file;


    // Montar el path real de la imagen
    const filePath = "./uploads/avatars/" + file;

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {
        if (!exists){
            return res.status(404).send({ 
                status: "error", 
                message: "No existe la imagen" 
            });
        }    

        // Devolver un file
        return res.sendFile(path.resolve(filePath));

    });

}


// Exportación 
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}