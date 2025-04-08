import express from "express";
import {
  getLiabilities,
  getLiabilityById,
  createLiability,
  updateLiability,
  deleteLiability,
} from "../controllers/liabilityController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// All routes are protected
router.use(protect);

// GET all liabilities and POST new liability
router.route("/").get(getLiabilities).post(createLiability);

// GET, PUT, DELETE specific liability
router
  .route("/:id")
  .get(getLiabilityById)
  .put(updateLiability)
  .delete(deleteLiability);

export default router;
