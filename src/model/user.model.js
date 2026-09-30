import mongoose from "mongoose";
import { USER_ROLES } from "../constants/constants.js";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "El nombre es obligatorio"],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, "El apellido es obligatorio"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "El email es obligatorio"],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"]
    },
    role: {
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.USER
    },
    documents: {
        type: [
            {
                name: { type: String },
                reference: { type: String }
            }
        ],
        default: []
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;
