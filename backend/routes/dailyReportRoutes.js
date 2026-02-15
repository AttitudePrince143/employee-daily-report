const router = require("express").Router();
const dailyReportController = require("../controllers/dailyReportController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Employee submits report
router.post("/submit", auth, dailyReportController.submitReport);

// Employee: get own reports
router.get("/myreports", auth, dailyReportController.getMyReports);

// Admin: get all reports
router.get("/all", auth, role("admin"), dailyReportController.getAllReports);

module.exports = router;
