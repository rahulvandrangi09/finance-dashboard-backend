const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
router.post("/register", authController.register);
router.post("/login", authController.login);

// manage the user status
router.put("/users/:id", authMiddleware.verifyToken, authMiddleware.requireRole(['ADMIN']), authController.updateUserStatus);

module.exports = router;
