import UsersRepository from "../repositories/user.respository.js";
import { USER_ROLES } from "../constants/constants.js";
import AppError from "../utils/errors.js";
import { pick } from "../utils/pick.js";

const WRITABLE_FIELDS = ["firstName", "lastName", "email", "password", "role", "documents"];

class UsersService {
    async findAll() {
        return UsersRepository.findAll();
    }

    async findById(id) {
        const user = await UsersRepository.findById(id);
        if (!user) {
            throw new AppError("Usuario no encontrado", 404);
        }
        return user;
    }

    async create(data) {
        const { firstName, lastName, email, password } = data;
        if (!firstName || !lastName || !email || !password) {
            throw new AppError("Faltan campos obligatorios (firstName, lastName, email, password)", 400);
        }

        if (data.role === USER_ROLES.ADMIN) {
            throw new AppError("No es posible crear admins desde este endpoint", 400);
        }

        const existingUser = await UsersRepository.findByEmail(email);
        if (existingUser) {
            throw new AppError("Este email ya se encuentra registrado", 409);
        }

        return UsersRepository.create(pick(data, WRITABLE_FIELDS));
    }

    async update(id, data) {
        const changes = pick(data, WRITABLE_FIELDS);

        if (Object.keys(changes).length === 0) {
            throw new AppError("No hay campos válidos para actualizar", 400);
        }

        if (changes.role === USER_ROLES.ADMIN) {
            throw new AppError("No es posible asignar el rol admin desde este endpoint", 403);
        }

        const updatedUser = await UsersRepository.update(id, changes);
        if (!updatedUser) {
            throw new AppError("Usuario no encontrado", 404);
        }
        return updatedUser;
    }

    async delete(id) {
        const deletedUser = await UsersRepository.delete(id);
        if (!deletedUser) {
            throw new AppError("Usuario no encontrado", 404);
        }
        return deletedUser;
    }
}

export default new UsersService();