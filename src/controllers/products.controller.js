import productsService from "../services/products.service.js";
import { RESPONSE_STATUS } from "../constants/constants.js";

const success = (res, statusCode, payload) =>
    res.status(statusCode).json({ status: RESPONSE_STATUS.SUCCESS, payload });

class ProductsController {
    async findAll(req, res, next) {
        try {
            const products = await productsService.findAll({ all: req.query.all === "true" });
            return success(res, 200, products);
        } catch (error) {
            next(error);
        }
    }

    async findById(req, res, next) {
        try {
            const product = await productsService.findById(req.params.id);
            return success(res, 200, product);
        } catch (error) {
            next(error);
        }
    }

    async getShippingCost(req, res, next) {
        try {
            const shipping = await productsService.getShippingCost(req.params.id);
            return success(res, 200, shipping);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const product = await productsService.create(req.body);
            return success(res, 201, product);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const product = await productsService.update(req.params.id, req.body);
            return success(res, 200, product);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const product = await productsService.delete(req.params.id);
            return success(res, 200, product);
        } catch (error) {
            next(error);
        }
    }
}

export default new ProductsController();
