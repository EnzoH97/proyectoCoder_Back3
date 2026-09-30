import { config } from "../config/index.js";
import { RESPONSE_STATUS } from "../constants/constants.js";

export const notFoundHandler = (req, res) => {
    res.status(404).json({ status: RESPONSE_STATUS.ERROR, message: "Ruta no encontrada" });
};


export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message;

    if (err.name === "CastError") {
        statusCode = 400;
        message = "ID inválido";
    } else if (err.name === "ValidationError" && err.errors) {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(", ");
    } else if (err.code === 11000) {
        statusCode = 409;
        message = `Ya existe un registro con ese valor único (${Object.keys(err.keyValue || {}).join(", ")})`;
    } else if (err.type === "entity.parse.failed") {
        statusCode = 400;
        message = "JSON inválido en el body";
    }

    if (statusCode >= 500) {
        console.error(err);
        if (config.isProduction) message = "Error interno del servidor";
    }

    res.status(statusCode).json({ status: RESPONSE_STATUS.ERROR, message });
};
