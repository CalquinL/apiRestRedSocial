const mongoose = require("mongoose");

const connection = async() => {

    try{
        // Nombre de base de datos: red_social
        await mongoose.connect("mongodb://localhost:27017/red_social"); 

        console.log("Conexión con base de datos exitosa");

    } catch(error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos");
    }
}

// Exportación
module.exports = {
    connection
}
