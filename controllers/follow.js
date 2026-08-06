// Modelos
const Follow = require("../models/follow");
const User = require("../models/user");

// Servicios
const followService = require("../services/followService");

// Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/follow.js"
    });
}

// Accion de guardar follow (seguir)
const save = async (req, res) => {
    try {
        const params = req.body;
        const identity = req.user;

        let userToFollow = new Follow({
            user: identity.id,
            followed: params.followed
        });

        const followStored = await userToFollow.save();

        if (!followStored) {
            return res.status(500).send({
                status: "error",
                message: "No se ha podido seguir al usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            identity: req.user,
            follow: followStored
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "No se ha podido seguir al usuario"
        });
    }
}

// Accion de borrar follow (dejar de seguir)
const unfollow = async (req, res) => {
    try {
        const userId = req.user.id;
        const followedId = req.params.id;

        const followDeleted = await Follow.deleteOne({
            user: userId,
            followed: followedId
        });

        if (!followDeleted || followDeleted.deletedCount === 0) {
            return res.status(500).send({
                status: "error",
                message: "No has dejado de seguir a nadie"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Follow eliminado correctamente"
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al intentar dejar de seguir al usuario"
        });
    }
}

// Listado de usuarios seguidos
const following = async (req, res) => {
    try {
        let userId = req.user.id;
        if (req.params.id) userId = req.params.id;

        let page = req.params.page ? parseInt(req.params.page) : 1;
        const itemsPerPage = 5;

        const options = {
            page,
            limit: itemsPerPage,
            populate: {
                path: "user followed",
                select: "-password -role -__v"
            }
        };

        const result = await Follow.paginate({ user: userId }, options);

        const followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que estoy siguiendo",
            follows: result.docs,
            total: result.totalDocs,
            pages: result.totalPages,
            user_following: followUserIds.user_following,
            user_follow_me: followUserIds.user_follow_me
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al obtener el listado de usuarios seguidos"
        });
    }
}

// Listado de seguidores
const followers = async (req, res) => {
    try {
        let userId = req.user.id;
        if (req.params.id) userId = req.params.id;

        let page = req.params.page ? parseInt(req.params.page) : 1;
        const itemsPerPage = 5;

        const options = {
            page,
            limit: itemsPerPage,
            populate: {
                path: "user followed",
                select: "-password -role -__v"
            }
        };

        const result = await Follow.paginate({ followed: userId }, options);

        const followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que me siguen",
            follows: result.docs,
            total: result.totalDocs,
            pages: result.totalPages,
            user_following: followUserIds.user_following,
            user_follow_me: followUserIds.user_follow_me
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al obtener el listado de seguidores"
        });
    }
}

// Exportación
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}