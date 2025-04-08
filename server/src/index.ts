import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db";

// Import routes
import userRoutes from "./routes/userRoutes";
import testRoutes from "./routes/testRoutes";
import userDataRoutes from "./routes/userDataRoutes";
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Create Express app
const app: Express = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Log requests in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/user-data", userDataRoutes);
app.use("/api/test", testRoutes);

// Basic route for testing
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Economy Tracker API is running..." });
});

// Error handling middleware
interface ErrorWithStatus extends Error {
  statusCode?: number;
  stack?: string;
}

app.use(
  (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  }
);

// Set port and start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
