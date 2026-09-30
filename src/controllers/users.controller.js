import usersService from "../services/users.service.js";
import { RESPONSE_STATUS } from "../constants/constants.js";

const success = (res, statusCode, payload) =>
    res.status(statusCode).json({ status: RESPONSE_STATUS.SUCCESS, payload });

class UsersController {
    async findAll(req, res, next) {
        try {
            const users = await usersService.findAll();
            return success(res, 200, users);
        } catch (error) {
            next(error);
        }
    }

    async findById(req, res, next) {
        try {
            const user = await usersService.findById(req.params.id);
            return success(res, 200, user);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const user = await usersService.create(req.body);
            return success(res, 201, user);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const user = await usersService.update(req.params.id, req.body);
            return success(res, 200, user);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const user = await usersService.delete(req.params.id);
            return success(res, 200, user);
        } catch (error) {
            next(error);
        }
    }
}

export default new UsersController();
