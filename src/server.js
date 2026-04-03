require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const recordRoutes = require("./routes/recordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const {verifyToken, requireRole} = require("./middleware/authMiddleware");
const app = express();
const prisma = require("./prisma");
const PORT = process.env.PORT || 3000;

// middleware
app.use(helmet())
app.use(cors());
app.use(express.json());

// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use(limiter);

// secure test routes
app.get("/api/dashboard/viewer", verifyToken, (req, res) => {
  res.json({ message: "Welcome Viewer! You are authenticated.", user: req.user });
});

app.get("/api/dashboard/admin", verifyToken, requireRole(["ADMIN"]), (req, res) => {
  res.json({ message: "Welcome Admin! You have special privileges.", user: req.user });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

// homepage
app.get("/", (req, res) => {
  res.send("Welcome to the Dashboard API! Please use /api/auth to login.");
});

// heatlh
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

// dbconnect
prisma
  .$connect()
  .then(() => {
    console.log("✅ Successfully connected to the PostgreSQL database!");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1);
  });
