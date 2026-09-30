import dotenv from "dotenv";

dotenv.config();

const required = ["PORT", "MONGO_URI", "NODE_ENV"];

for (const name of required) {
    if (!process.env[name]) {
        throw new Error(`Falta la variable de entorno: ${name}`);
    }
}

export const config = {
    port: process.env.PORT,
    mongoUri: process.env.MONGO_URI,
    nodeEnv: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === "production"
};
