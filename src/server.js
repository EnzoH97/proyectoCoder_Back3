import { config } from "./config/index.js"
import app from "../app.js";
import { connectDB } from "./config/dataBase.config.js"

try {
    await connectDB();

    app.listen(config.port, () => {
        console.log(`Servidor iniciado en el puerto ${config.port} (${config.nodeEnv})`);
    });
} catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    process.exit(1);
}
