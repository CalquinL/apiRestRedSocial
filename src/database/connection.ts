import mongoose from "mongoose";

const connection = async (): Promise<void> => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/robin_db";
        await mongoose.connect(MONGODB_URI);
        console.log("Conexión con base de datos exitosa");
    } catch (error) {
        console.error(error);
        throw new Error("No se ha podido conectar a la base de datos");
    }
};

export { connection };
