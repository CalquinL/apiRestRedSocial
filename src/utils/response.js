const sendSuccess = (res, data, statusCode = 200, meta = null) => {
    const response = {
        status: "success",
        statusCode,
        data
    };

    if (meta) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
};

module.exports = { sendSuccess };
