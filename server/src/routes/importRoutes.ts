import express from "express";
import { importFromLocalStorage } from "../controllers/importController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// All routes are protected
router.use(protect);

// Route for importing from localStorage
router.post("/localStorage", importFromLocalStorage);

export default router;
