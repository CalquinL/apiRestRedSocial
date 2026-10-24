const mongoose = require("mongoose");
const User = require("./src/models/user");
const Publication = require("./src/models/publication");
const Reservation = require("./src/models/reservation");
const Notification = require("./src/models/notification");
const bcrypt = require("bcrypt");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/robin_db";

async function initDB() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Conectado a MongoDB para inicialización...");

        // Limpiar colecciones
        await User.deleteMany({});
        await Publication.deleteMany({});
        await Reservation.deleteMany({});
        await Notification.deleteMany({});
        console.log("Colecciones limpiadas.");

        // Crear Admin Inicial
        const adminPassword = await bcrypt.hash("admin123", 10);
        const admin = new User({
            name: "Administrador",
            surname: "Sistema",
            nick: "admin",
            email: "admin@robin.com",
            password: adminPassword,
            role: "admin",
            verified: true
        });
        await admin.save();
        console.log("Usuario admin creado: admin@robin.com / admin123");

        process.exit(0);
    } catch (error) {
        console.error("Error inicializando DB:", error);
        process.exit(1);
    }
}

initDB();
