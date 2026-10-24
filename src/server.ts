import app from "./app";
import { connection } from "./database/connection";

const PORT = process.env.PORT || 3900;

// Conexión a la base de datos
connection().then(() => {
    console.log("Conectado a MongoDB con éxito");

    app.listen(PORT, () => {
        console.log(`Servidor de Robin corriendo en el puerto: ${PORT}`);
    });
}).catch((err: Error) => {
    console.error("Error conectando a la base de datos:", err);
    process.exit(1);
});
