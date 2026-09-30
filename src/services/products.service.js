import ProductsRepository from "../repositories/products.repository.js";
import EmailService from "./email.service.js";
import { config } from "../config/index.js";
import { PRODUCT_STATUS, SHIPPING } from "../constants/constants.js";
import AppError from "../utils/errors.js";
import { pick } from "../utils/pick.js";

const WRITABLE_FIELDS = ["title", "description", "code", "price", "stock", "category", "status"];

const statusFromStock = (stock) => (stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK);

const parseNonNegativeNumber = (value, errorMessage) => {
    const number = Number(value);
    if (Number.isNaN(number) || number < 0) {
        throw new AppError(errorMessage, 400);
    }
    return number;
};

class ProductsService {
    async findAll({ all = false } = {}) {
        return all ? ProductsRepository.findAll() : ProductsRepository.findAvailable();
    }

    async findById(id) {
        const product = await ProductsRepository.findById(id);
        if (!product) {
            throw new AppError("Producto no encontrado", 404);
        }
        return product;
    }

    async getShippingCost(id) {
        const product = await this.findById(id);

        const shippingCost = config.isProduction
            ? SHIPPING.PROD_BASE_COST + product.price * SHIPPING.PROD_VALUE_RATE
            : SHIPPING.DEV_FLAT_COST;

        return {
            product: product._id,
            declaredValue: product.price,
            shippingCost: Math.round(shippingCost * 100) / 100
        };
    }

    async create(data) {
        const { title, code, price } = data;
        if (!title || !code || price === undefined) {
            throw new AppError("Faltan campos obligatorios (title, code, price)", 400);
        }

        const parsedPrice = parseNonNegativeNumber(price, "Precio inválido");
        const stock = parseNonNegativeNumber(data.stock ?? 0, "Stock inválido");

        const existing = await ProductsRepository.findByCode(code);
        if (existing) {
            throw new AppError("Ya existe un producto con ese código", 409);
        }

        const newProduct = await ProductsRepository.create({
            ...pick(data, WRITABLE_FIELDS),
            price: parsedPrice,
            stock,
            status: statusFromStock(stock)
        });

        try {
            await EmailService.send(`Producto creado: ${newProduct.title}`);
        } catch (error) {
            console.error("No se pudo enviar el email de notificación:", error.message);
        }

        return newProduct;
    }

    async update(id, data) {
        const changes = pick(data, WRITABLE_FIELDS);

        if (Object.keys(changes).length === 0) {
            throw new AppError("No hay campos válidos para actualizar", 400);
        }

        if (changes.price !== undefined) {
            changes.price = parseNonNegativeNumber(changes.price, "Precio inválido");
        }

        if (changes.status !== undefined) {
            changes.status = String(changes.status).toLowerCase();
            if (!Object.values(PRODUCT_STATUS).includes(changes.status)) {
                throw new AppError(
                    `Estado inválido. Valores permitidos: ${Object.values(PRODUCT_STATUS).join(", ")}`,
                    400
                );
            }
        }

        if (changes.stock !== undefined) {
            changes.stock = parseNonNegativeNumber(changes.stock, "Stock inválido");
            changes.status = statusFromStock(changes.stock);
        }

        const product = await ProductsRepository.update(id, changes);
        if (!product) {
            throw new AppError("Producto no encontrado", 404);
        }
        return product;
    }

    async delete(id) {
        const product = await ProductsRepository.delete(id);
        if (!product) {
            throw new AppError("Producto no encontrado", 404);
        }
        return product;
    }
}

export default new ProductsService();
