class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly details: any[];
    public readonly isOperational: boolean;

    constructor(code: string, statusCode: number, message: string, details: any[] = []) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
