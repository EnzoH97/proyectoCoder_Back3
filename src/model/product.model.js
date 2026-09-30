import mongoose from "mongoose";
import { PRODUCT_STATUS } from "../constants/constants.js"



const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "El título es obligatorio"],
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    code: {
        type: String,
        required: [true, "El código es obligatorio"],
        unique: true,
        trim: true
    },
    price: {
        type: Number,
        required: [true, "El precio es obligatorio"],
        min: [0, "El precio no puede ser negativo"]
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, "El stock no puede ser negativo"]
    },
    category: {
        type: String,
        default: "general",
        trim: true
    },
    status: {
        type: String,
        enum: Object.values(PRODUCT_STATUS),
        default: PRODUCT_STATUS.AVAILABLE
    }
}, {
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);

export default Product;