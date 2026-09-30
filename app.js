import express from "express";
import cors from "cors";

import usersRouter from "./src/routes/users.router.js";
import productsRouter from "./src/routes/products.router.js";

import { notFoundHandler, errorHandler } from "./src/middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "Servidor activo"
    });
});

app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;