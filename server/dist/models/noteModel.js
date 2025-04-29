"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.noteSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    title: {
        type: String,
        required: [true, "Please add a title"],
    },
    content: {
        type: String,
        required: [true, "Please add content"],
    },
    tags: {
        type: [String],
        default: [],
    },
    isPinned: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const Note = mongoose_1.default.model("Note", exports.noteSchema);
exports.default = Note;
