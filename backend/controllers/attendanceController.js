const Attendance = require("../models/Attendance");

// ------------------- CHECK-IN -------------------
exports.checkIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Find today's attendance
    let attendance = await Attendance.findOne({
      userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (!attendance) {
      // Create attendance for today
      attendance = await Attendance.create({
        userId,
        date: today,
        loginTime: new Date(),
      });
      return res.json({ message: "Check-in successful", attendance });
    }

    if (!attendance.loginTime) {
      attendance.loginTime = new Date();
      await attendance.save();
      return res.json({ message: "Check-in successful", attendance });
    }

    // Already checked in, just return today’s attendance
    return res.json({ message: "Already checked in today", attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- CHECK-OUT -------------------
exports.checkOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (!attendance || !attendance.loginTime) {
      return res.status(400).json({ message: "You have not checked in today" });
    }

    if (!attendance.logoutTime) {
      attendance.logoutTime = new Date();
      // calculate total hours
      const diff = (attendance.logoutTime - attendance.loginTime) / (1000 * 60 * 60);
      attendance.totalHours = parseFloat(diff.toFixed(2));
      await attendance.save();
      return res.json({ message: "Check-out successful", attendance });
    }

    // Already checked out, just return today’s attendance
    return res.json({ message: "Already checked out today", attendance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- GET TODAY ATTENDANCE -------------------
exports.getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    // Always return attendance (null if not exists)
    res.json({ attendance: attendance || null });
  } catch (error) {
    console.error("Get Today Attendance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getAllAttendance = async (req, res) => {
  try {
    const allAttendance = await Attendance.find().populate("userId", "name email").sort({ date: -1 });
    res.json({ attendance: allAttendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
