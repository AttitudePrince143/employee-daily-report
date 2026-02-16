const router = require("express").Router();
const leaveController = require("../controllers/leaveController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// --- Employee routes ---
router.post("/request", auth, leaveController.requestLeave);
router.get("/my", auth, leaveController.getMyLeaves);

// --- Admin routes ---
router.get("/pending", auth, role("admin"), leaveController.getPendingLeaves);
router.put("/approve/:id", auth, role("admin"), leaveController.approveLeave);
router.put("/reject/:id", auth, role("admin"), leaveController.rejectLeave);
router.get("/user/:id", auth, role("admin"), leaveController.getUserLeaves);
router.get("/all", auth, role("admin"), leaveController.getAllLeaves);

module.exports = router;
