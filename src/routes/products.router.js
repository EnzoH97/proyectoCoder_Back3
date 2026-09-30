import { Router } from "express";
import ProductsController from "../controllers/products.controller.js";

const router = Router();

router.get("/", ProductsController.findAll);
router.get("/:id", ProductsController.findById);
router.get("/:id/shipping-cost", ProductsController.getShippingCost);
router.post("/", ProductsController.create);
router.put("/:id", ProductsController.update);
router.delete("/:id", ProductsController.delete);

export default router;
