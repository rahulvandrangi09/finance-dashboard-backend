const express = require("express");
const { getDashboardSummary } = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// as per the requirement, anyone who is logged in can access 
router.get("/summary", verifyToken, getDashboardSummary);

module.exports = router;