import mongoose from "mongoose";

const connection = async (): Promise<void> => {
    try {
        // Extraemos la URI estrictamente del entorno según Sección 9 de CLAUDE.md
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error("La variable de entorno MONGODB_URI no está definida");
        }

        await mongoose.connect(MONGODB_URI);
        console.log(`Conexión exitosa a MongoDB en: ${MONGODB_URI}`);
    } catch (error) {
        console.error("Error crítico de conexión:", error);
        throw new Error("No se ha podido conectar a la base de datos");
    }
};

export { connection };
