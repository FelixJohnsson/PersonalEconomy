"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const testController_1 = require("../controllers/testController");
const router = express_1.default.Router();
// Public route for testing database connection
router.get("/db", testController_1.testDbConnection);
exports.default = router;
