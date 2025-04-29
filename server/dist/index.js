"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("./config/db"));
// Import routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const userDataRoutes_1 = __importDefault(require("./routes/userDataRoutes"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
// Create Express app
const app = (0, express_1.default)();
// Connect to MongoDB
(0, db_1.default)();
// Middleware
app.use(express_1.default.json()); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
// Log requests in development
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
// API Routes
app.use("/api/users", userRoutes_1.default);
app.use("/api/user-data", userDataRoutes_1.default);
app.use("/api/test", testRoutes_1.default);
// Basic route for testing
app.get("/", (req, res) => {
    res.json({ message: "Economy Tracker API is running..." });
});
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
});
// Set port and start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
