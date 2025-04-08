import express from "express";
import { testDbConnection } from "../controllers/testController";

const router = express.Router();

// Public route for testing database connection
router.get("/db", testDbConnection);

export default router;
