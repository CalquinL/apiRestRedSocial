// Modelos
const publication = require("../models/publication");
const Publication = require("../models/publication");

// Modulos
const fs = require("fs");
const path = require("path");

// Servicios
const followService = require("../services/followService");

// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/publication.js"
    });
}

// Guardar publicacion
const save = async (req, res) => {
    try {
        // Recoger datos del body
        const params = req.body;

        // Si no llegan, dar respuesta negativa
        if (!params.text) return res.status(400).send({ status: "error", "message": "Debes enviar el texto de la publicacion" });

        // Crear y rellenar el objeto del modelo
        let newPublication = new Publication(params);
        newPublication.user = req.user.id;

        // Guardar objeto en base de datos
        const publicationStored = await newPublication.save();

        if (!publicationStored) return res.status(400).send({ status: "error", "message": "No se ha guardado la publicacion" });

        return res.status(200).send({
            status: "success",
            message: "Publicacion guardada",
            publicationStored
        });

    } catch (error) {
        return res.status(400).send({
            status: "error",
            message: "No se ha guardado la publicacion",
            error: error.message
        });
    }
}

// Sacar una publicacion
const detail = async (req, res) => {
    try {
        // Sacar id de publicacion de la URL
        const publicationId = req.params.id;

        // Find con la condicion del id
        const publicationStored = await Publication.findById(publicationId);

        if (!publicationStored) {
            return res.status(404).send({
                status: "error",
                message: "No existe la publicacion"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Mostrar publicacion",
            publication: publicationStored
        });

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "No existe la publicacion",
            error: error.message
        });
    }
}

// Eliminar publicaciones
const remove = async (req, res) => {
    try {
        // Sacar el id de la publicacion a eliminar
        const publicationId = req.params.id;

        // Find y delete
        const publicationRemoved = await Publication.findOneAndDelete({
            "user": req.user.id,
            "_id": publicationId
        });

        if (!publicationRemoved) {
            return res.status(404).send({
                status: "error",
                message: "No existe la publicacion o no tienes permiso para eliminarla"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Eliminar publicacion",
            publication: publicationRemoved
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "No se ha eliminado la publicacion",
            error: error.message
        });
    }
}

// Listar publicaciones de un usuario
const user = async (req, res) => {
    try {
        // Sacar el id de usuario
        const userId = req.params.id;

        // Controlar la pagina
        let page = req.params.page ? parseInt(req.params.page) : 1;
        const itemsPerPage = 5;

        // Opciones de paginate
        const options = {
            sort: "-created_at",
            populate: { path: "user", select: "-password -__v -role" },
            page: page,
            limit: itemsPerPage
        };

        const result = await Publication.paginate({ "user": userId }, options);

        if (!result.docs || result.docs.length <= 0) {
            return res.status(404).send({
                status: "error",
                message: "No hay publicaciones para mostrar"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Publicaciones del usuario",
            page,
            total: result.totalDocs,
            pages: result.totalPages,
            publications: result.docs
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al listar publicaciones",
            error: error.message
        });
    }
}

// Subir ficheros
const upload = async (req, res) => {
    
    // Sacar publicationId
    const publicationId = req.params.id;

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
        const publicationUpdated = await Publication.findOneAndUpdate(
            { "user": req.user.id, "_id": publicationId },
            { file: req.file.filename },
            { returnDocument: 'after' }
        );

        if (!publicationUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida"
            });
        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            publication: publicationUpdated
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: "error",
            message: "Error en la subida"
        });
    }
}

// Devolver archivos multimedia 
const media = (req, res) => {

    // Sacar el parametro de la URL
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = "./uploads/publications/" + file;

    // Comprobar que existe
    fs.stat(filePath, (error, stats) => {
        if (error || !stats) {
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            });
        }

        // Devolver un file
        return res.sendFile(path.resolve(filePath));

    });

}

// Listar todas las publicaciones (feed)
const feed = async (req, res) => {
    try {
        // Controlar la pagina
        let page = req.params.page ? parseInt(req.params.page) : 1;
        const itemsPerPage = 5;

        // Sacar un array de identificadores de usuarios que yo sigo como usuario logueado
        const myFollows = await followService.followUserIds(req.user.id);

        if (!myFollows.user_following || myFollows.user_following.length <= 0) {
            return res.status(404).send({
                status: "error",
                message: "No sigues a ningun usuario, no hay feed que mostrar"
            });
        }

        // Opciones de paginate (mismo patron que en user())
        const options = {
            sort: "-created_at",
            populate: { path: "user", select: "-password -role -__v -email" },
            page: page,
            limit: itemsPerPage
        };

        const result = await Publication.paginate({ user: { $in: myFollows.user_following } }, options);

        if (!result.docs || result.docs.length <= 0) {
            return res.status(404).send({
                status: "error",
                message: "No hay publicaciones para mostrar"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Feed de publicaciones",
            following: myFollows.user_following,
            total: result.totalDocs,
            page,
            pages: result.totalPages,
            publications: result.docs
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "No se han listado las publicaciones del feed",
            error: error.message
        });
    }
}


// Exportación 
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}