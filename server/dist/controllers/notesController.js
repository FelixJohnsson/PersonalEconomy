"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleNotePin = exports.deleteNote = exports.updateNote = exports.createNote = exports.getNote = exports.getNotes = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const findUser_1 = require("../utils/findUser");
const userModel_1 = __importDefault(require("../models/userModel"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Get all notes for the authenticated user
 * @route   GET /api/notes
 * @access  Private
 */
const getNotes = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    res.status(200).json(user.notes || []);
});
exports.getNotes = getNotes;
/**
 * Get a specific note by ID
 * @route   GET /api/notes/:id
 * @access  Private
 */
const getNote = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await (0, findUser_1.findUser)(req);
    if (user === 400) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    if (user === 404) {
        res.status(404);
        throw new Error("User not found");
    }
    const note = user.notes.find((n) => { var _a; return ((_a = n._id) === null || _a === void 0 ? void 0 : _a.toString()) === req.params.id; });
    if (note) {
        res.status(200).json(note);
    }
    else {
        res.status(404);
        throw new Error("Note not found");
    }
});
exports.getNote = getNote;
/**
 * Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
const createNote = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    const { title, content, tags, isPinned } = req.body;
    // Check if required fields are provided
    if (!title || !content) {
        res.status(400);
        throw new Error("Please provide title and content");
    }
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    const newNote = {
        _id: new mongoose_1.default.Types.ObjectId(),
        user: req.user._id,
        title,
        content,
        tags: tags || [],
        isPinned: isPinned || false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    try {
        // Use updateOne to push the new note directly
        await userModel_1.default.updateOne({ _id: req.user._id }, { $push: { notes: newNote } });
        res.status(201).json(newNote);
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to create note",
            error: error.message,
        });
    }
});
exports.createNote = createNote;
/**
 * Update a note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
const updateNote = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    const { title, content, tags, isPinned } = req.body;
    // Build update fields
    const updateFields = {};
    const now = new Date();
    if (title)
        updateFields["notes.$.title"] = title;
    if (content)
        updateFields["notes.$.content"] = content;
    if (tags !== undefined)
        updateFields["notes.$.tags"] = tags;
    if (isPinned !== undefined)
        updateFields["notes.$.isPinned"] = isPinned;
    updateFields["notes.$.updatedAt"] = now;
    if (Object.keys(updateFields).length === 0) {
        res.status(400);
        throw new Error("No update fields provided");
    }
    try {
        // Use findOneAndUpdate to update specific note
        const result = await userModel_1.default.findOneAndUpdate({
            _id: req.user._id,
            "notes._id": req.params.id,
        }, { $set: updateFields }, { new: true });
        if (!result) {
            res.status(404);
            throw new Error("Note not found");
        }
        // Find the updated note
        const updatedNote = result.notes.find((note) => note._id.toString() === req.params.id);
        res.status(200).json(updatedNote);
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to update note",
            error: error.message,
        });
    }
});
exports.updateNote = updateNote;
/**
 * Delete a note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    try {
        // Use updateOne with $pull to remove the note
        const result = await userModel_1.default.updateOne({ _id: req.user._id }, { $pull: { notes: { _id: req.params.id } } });
        if (result.modifiedCount === 0) {
            res.status(404);
            throw new Error("Note not found or already deleted");
        }
        res.status(200).json({ message: "Note removed" });
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to delete note",
            error: error.message,
        });
    }
});
exports.deleteNote = deleteNote;
/**
 * Toggle note pin status
 * @route   PUT /api/notes/:id/pin
 * @access  Private
 */
const toggleNotePin = (0, express_async_handler_1.default)(async (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
        res.status(400);
        throw new Error("Not authorized, no user found");
    }
    try {
        // First, get the current pin status
        const user = await userModel_1.default.findOne({
            _id: req.user._id,
            "notes._id": req.params.id,
        }, { "notes.$": 1 });
        if (!user || !user.notes || user.notes.length === 0) {
            res.status(404);
            throw new Error("Note not found");
        }
        const currentPinStatus = user.notes[0].isPinned;
        // Now toggle the pin status
        const result = await userModel_1.default.findOneAndUpdate({
            _id: req.user._id,
            "notes._id": req.params.id,
        }, {
            $set: {
                "notes.$.isPinned": !currentPinStatus,
                "notes.$.updatedAt": new Date(),
            },
        }, { new: true });
        if (!result) {
            res.status(404);
            throw new Error("Failed to update note");
        }
        // Find the updated note
        const updatedNote = result.notes.find((note) => note._id.toString() === req.params.id);
        res.status(200).json(updatedNote);
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to toggle pin status",
            error: error.message,
        });
    }
});
exports.toggleNotePin = toggleNotePin;
