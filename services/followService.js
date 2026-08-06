const Follow = require("../models/follow");

// Obtener ids de usuarios seguidos y de usuarios que me siguen
const followUserIds = async (identityUserId) => {
    try {
        let following = await Follow.find({ user: identityUserId })
            .select({ followed: 1, _id: 0 })
            .exec();

        let followers = await Follow.find({ followed: identityUserId })
            .select({ user: 1, _id: 0 })
            .exec();

        // Array solo con los ids de los usuarios que sigo
        let followingClean = following.map(follow => follow.followed);

        // Array solo con los ids de los usuarios que me siguen
        let followersClean = followers.map(follow => follow.user);

        return {
            user_following: followingClean,
            user_follow_me: followersClean
        };

    } catch (error) {
        return {};
    }
}

// Comprobar seguimiento individual entre dos usuarios
const followThisUser = async (identityUserId, profileUserId) => {
    try {
        const following = await Follow.exists({
            user: identityUserId,
            followed: profileUserId
        });

        const follower = await Follow.exists({
            user: profileUserId,
            followed: identityUserId
        });

        return {
            following: !!following,
            follower: !!follower
        };

    } catch (error) {
        return {};
    }
}

module.exports = {
    followUserIds,
    followThisUser
}