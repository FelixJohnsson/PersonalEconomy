"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesUserExist = exports.findUserByEmail = exports.findUserById = exports.findUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const findUser = async (req) => {
    if (!req.user) {
        return 400;
    }
    const user = await userModel_1.default.findById(req.user._id);
    if (!user) {
        return 404;
    }
    return user;
};
exports.findUser = findUser;
const findUserById = async (id) => {
    if (!id) {
        return 400;
    }
    const user = await userModel_1.default.findById(id);
    if (!user) {
        return 404;
    }
    return user;
};
exports.findUserById = findUserById;
const findUserByEmail = async (email) => {
    if (!email) {
        return 400;
    }
    const user = await userModel_1.default.findOne({ email });
    if (!user) {
        return 404;
    }
    return user;
};
exports.findUserByEmail = findUserByEmail;
const doesUserExist = async (id) => {
    const user = await userModel_1.default.findById(id);
    return user ? true : false;
};
exports.doesUserExist = doesUserExist;
