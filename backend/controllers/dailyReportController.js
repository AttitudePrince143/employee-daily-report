const DailyReport = require("../models/DailyReport");
const Attendance = require("../models/Attendance");

// Employee submits a daily report
exports.submitReport = async (req, res) => {
  try {
    const { tasks, workDetails } = req.body;
    if (!tasks || tasks.trim() === "") {
      return res.status(400).json({ message: "Tasks field is required" });
    }

    const userId = req.user.id;

    // ---- Start and end of today (local server time) ----
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // ---- Check attendance ----
    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (!attendance || !attendance.loginTime) {
      return res.status(400).json({ message: "Check-in required before submitting report" });
    }

    // ---- Prevent duplicate report ----
    const existingReport = await DailyReport.findOne({
      userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existingReport) {
      return res.status(400).json({ message: "Report already submitted for today" });
    }

    // ---- Create report ----
    const report = await DailyReport.create({
      userId,
      attendanceId: attendance._id,
      tasks,
      workDetails,
      date: startOfDay,
    });

    res.status(201).json({ message: "Daily report submitted successfully", report });
  } catch (error) {
    console.error("Submit Report Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Employee fetches own reports
exports.getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;

    let filter = { userId };

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
      filter.date = { $gte: startOfDay, $lt: endOfDay };
    }

    const reports = await DailyReport.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .select("-__v");

    res.json({ reports });
  } catch (error) {
    console.error("Get My Reports Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin fetches all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await DailyReport.find()
      .populate("userId", "name email") // Important: populate user info
      .sort({ date: -1 });

    res.json({ reports });
  } catch (err) {
    console.error("Get All Reports Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
