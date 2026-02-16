const router = require("express").Router();
const attendanceController = require("../controllers/attendanceController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware"); // FIXED

// -------------------- Employee --------------------
// Check-in
router.post("/checkin", auth, attendanceController.checkIn);

// Check-out
router.post("/checkout", auth, attendanceController.checkOut);

// Get employee's attendance for today
router.get("/my", auth, attendanceController.getTodayAttendance);

// -------------------- Admin --------------------
// Get all attendance records
router.get("/all", auth, role("admin"), attendanceController.getAllAttendance);

// Get all attendance for the logged-in user
router.get("/my/all", auth, attendanceController.getMyAttendance);


module.exports = router;
