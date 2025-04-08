import express from "express";
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../controllers/assetController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// All routes are protected
router.use(protect);

// GET all assets and POST new asset
router.route("/").get(getAssets).post(createAsset);

// GET, PUT, DELETE specific asset
router.route("/:id").get(getAssetById).put(updateAsset).delete(deleteAsset);

export default router;
