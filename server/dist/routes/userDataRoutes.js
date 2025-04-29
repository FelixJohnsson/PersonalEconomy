"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const userDataController_1 = require("../controllers/userDataController");
const incomeController_1 = require("../controllers/incomeController");
const subscriptionController_1 = require("../controllers/subscriptionController");
const assetController_1 = require("../controllers/assetController");
const expenseController_1 = require("../controllers/expenseController");
const liabilityController_1 = require("../controllers/liabilityController");
const notesController_1 = require("../controllers/notesController");
const budgetController_1 = require("../controllers/budgetController");
const router = express_1.default.Router();
// Apply protection middleware to all routes
router.use(authMiddleware_1.protect);
// Main route to get all user data
router.route("/").get(userDataController_1.getUserData);
// Income routes
router.route("/incomes").post(incomeController_1.createIncome).get(incomeController_1.getIncomes);
router
    .route("/incomes/:id")
    .put(incomeController_1.updateIncome)
    .delete(incomeController_1.deleteIncome)
    .get(incomeController_1.getIncome);
// Expense routes
router.route("/expenses").post(expenseController_1.createExpense).get(expenseController_1.getExpenses);
router
    .route("/expenses/:id")
    .put(expenseController_1.updateExpense)
    .delete(expenseController_1.deleteExpense)
    .get(expenseController_1.getExpenseById);
router.route("/expenses/import").post(expenseController_1.importExpensesToUser);
// Asset routes
router.route("/assets").post(assetController_1.createAsset).get(assetController_1.getAssets);
router
    .route("/assets/:id")
    .put(assetController_1.updateAsset)
    .delete(assetController_1.deleteAsset)
    .get(assetController_1.getAssetById);
router.route("/assets/:id/value").put(assetController_1.updateAssetValue);
router.route("/assets/:id/deposit").post(assetController_1.addAssetDeposit);
// Liability routes
router.route("/liabilities").post(liabilityController_1.createLiability).get(liabilityController_1.getLiabilities);
router
    .route("/liabilities/:id")
    .put(liabilityController_1.updateLiability)
    .delete(liabilityController_1.deleteLiability)
    .get(liabilityController_1.getLiabilityById);
// Subscription routes
router.route("/subscriptions").post(subscriptionController_1.createSubscription).get(subscriptionController_1.getSubscriptions);
router
    .route("/subscriptions/:id")
    .get(subscriptionController_1.getSubscriptionById)
    .put(subscriptionController_1.updateSubscription)
    .delete(subscriptionController_1.deleteSubscription);
// Note routes
router.route("/notes").post(notesController_1.createNote).get(notesController_1.getNotes);
router.route("/notes/:id").get(notesController_1.getNote).put(notesController_1.updateNote).delete(notesController_1.deleteNote);
router.route("/notes/:id/pin").put(notesController_1.toggleNotePin);
// Budget routes
router.route("/budgets").post(budgetController_1.createBudget).get(budgetController_1.getBudgets);
router
    .route("/budgets/:id")
    .get(budgetController_1.getBudgetById)
    .put(budgetController_1.updateBudget)
    .delete(budgetController_1.deleteBudget);
router.route("/budgets/:id/track").post(budgetController_1.trackBudgetSpending);
exports.default = router;
