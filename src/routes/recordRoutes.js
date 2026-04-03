const express = require("express");
const router = express.Router();
const {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} = require("../controllers/recordController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// all routes require authentication
router.use(verifyToken);

// both admin and analyst can view records
router.get("/", requireRole(["ADMIN", "ANALYST"]), getRecords);

// only admin can create and delete records
router.post('/', requireRole(["ADMIN"]), createRecord);
router.put("/:id", requireRole(["ADMIN"]), updateRecord);
router.delete('/:id', requireRole(["ADMIN"]), deleteRecord);

module.exports = router;
