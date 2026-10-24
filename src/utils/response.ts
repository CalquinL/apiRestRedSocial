import { Response } from "express";

export interface Meta {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

interface SuccessResponse<T> {
    status: "success";
    statusCode: number;
    data: T;
    meta?: Meta;
}

export const sendSuccess = <T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    meta: Meta | null = null
): Response => {
    const response: SuccessResponse<T> = {
        status: "success",
        statusCode,
        data
    };

    if (meta) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
};
