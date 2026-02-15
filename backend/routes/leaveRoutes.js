const router = require("express").Router();
const leaveController = require("../controllers/leaveController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");


// Employee submits a leave
router.post("/submit", auth, leaveController.requestLeave);


// Employee routes
router.post("/request", auth, leaveController.requestLeave);
router.get("/my", auth, leaveController.getMyLeaves);

// Admin routes
router.get("/pending", auth, role("admin"), leaveController.getPendingLeaves);
router.put("/approve/:id", auth, role("admin"), leaveController.approveLeave);
router.put("/reject/:id", auth, role("admin"), leaveController.rejectLeave);
router.get("/user/:id", auth, role("admin"), leaveController.getUserLeaves);


// Admin: get all leaves (leave history)
router.get("/", auth, role("admin"), leaveController.getAllLeaves);
// Admin fetch all leaves
router.get("/all", auth, role("admin"), leaveController.getAllLeaves);

module.exports = router;
