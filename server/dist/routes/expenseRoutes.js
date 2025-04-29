"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expenseController_1 = require("../controllers/expenseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const importExpenses_1 = require("../utils/importExpenses");
const router = express_1.default.Router();
// Route to import expenses from a file
router.post("/import", authMiddleware_1.protect, async (req, res) => {
    var _a;
    try {
        const { filePath, email } = req.body;
        if (!filePath) {
            return res.status(400).json({
                success: false,
                message: "Please provide a filePath",
            });
        }
        // Use the email from request body or from authenticated user
        const userEmail = email || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.email);
        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: "No user email provided",
            });
        }
        const importCount = await (0, importExpenses_1.importExpensesToUser)(filePath, userEmail);
        return res.status(200).json({
            success: true,
            count: importCount,
            message: `Successfully imported ${importCount} expenses for user ${userEmail}`,
        });
    }
    catch (error) {
        console.error("Import error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({
            success: false,
            message: "Failed to import expenses",
            error: errorMessage,
        });
    }
});
// Protect all routes
router.use(authMiddleware_1.protect);
router.route("/").get(expenseController_1.getExpenses).post(expenseController_1.createExpense);
router
    .route("/:id")
    .get(expenseController_1.getExpenseById)
    .put(expenseController_1.updateExpense)
    .delete(expenseController_1.deleteExpense);
exports.default = router;
