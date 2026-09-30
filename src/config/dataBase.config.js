import mongoose from "mongoose";
import { config } from "./env.config.js";

export const connectDB = async () => {
    await mongoose.connect(config.mongoUri);
    console.log("Conectado con MongoDB");
};