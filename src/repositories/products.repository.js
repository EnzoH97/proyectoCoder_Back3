import Product from "../model/product.model.js";
import { PRODUCT_STATUS } from "../constants/constants.js";

const DEFAULT_PROJECTION = "-__v";

const AVAILABLE_FILTER = Object.freeze({
    status: PRODUCT_STATUS.AVAILABLE,
    stock: { $gt: 0 }
});

class ProductsRepository {
    async findAll() {
        return Product.find({}, DEFAULT_PROJECTION).lean();
    }

    async findAvailable() {
        return Product.find(AVAILABLE_FILTER, DEFAULT_PROJECTION).lean();
    }

    async findById(id) {
        return Product.findById(id, DEFAULT_PROJECTION).lean();
    }

    async findByCode(code) {
        return Product.findOne({ code }, DEFAULT_PROJECTION).lean();
    }

    async create(data) {
        const product = await Product.create(data);
        const { __v, ...rest } = product.toObject();
        return rest;
    }

    async update(id, data) {
        return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .select(DEFAULT_PROJECTION)
            .lean();
    }

    async delete(id) {
        return Product.findByIdAndDelete(id).select(DEFAULT_PROJECTION).lean();
    }
}

export default new ProductsRepository();
