const Leave = require("../models/Leave");

// Employee requests leave
exports.requestLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const userId = req.user.id;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const leave = await Leave.create({ userId, startDate, endDate, reason });
    res.status(201).json({ message: "Leave request submitted", leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Employee views own leave requests
exports.getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaves = await Leave.find({ userId }).sort({ createdAt: -1 });
    res.json({ leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin views pending leave requests
exports.getPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: "pending" }).populate("userId", "name email");
    res.json({ leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin approves leave
exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = "approved";
    await leave.save();
    res.json({ message: "Leave approved", leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin rejects leave
exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = "rejected";
    await leave.save();
    res.json({ message: "Leave rejected", leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.submitLeave = async (req, res) => {
  const { startDate, endDate, reason } = req.body;
  const userId = req.user.id;

  if (!startDate || !endDate || !reason) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const leave = await Leave.create({ userId, startDate, endDate, reason });
  res.status(201).json({ message: "Leave request submitted", leave });
};




exports.getUserLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json({ leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin gets all leaves
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json({ leaves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

