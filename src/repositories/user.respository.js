import User from "../model/user.model.js";

const PUBLIC_PROJECTION = "-password -__v";

class UsersRepository {
    async findAll() {
        return User.find({}, PUBLIC_PROJECTION).lean();
    }

    async findById(id) {
        return User.findById(id, PUBLIC_PROJECTION).lean();
    }

    async findByEmail(email) {
        return User.findOne({ email: String(email).trim().toLowerCase() }, PUBLIC_PROJECTION).lean();
    }

    async create(data) {
        const user = await User.create(data);
        const { password, __v, ...rest } = user.toObject();
        return rest;
    }

    async update(id, data) {
        return User.findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .select(PUBLIC_PROJECTION)
            .lean();
    }

    async delete(id) {
        return User.findByIdAndDelete(id).select(PUBLIC_PROJECTION).lean();
    }
}

export default new UsersRepository();
