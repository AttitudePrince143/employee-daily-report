const router = require("express").Router();
const User = require("../models/User"); // Mongoose User model
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const Report = require("../models/DailyReport");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");

// --- Get current logged-in user ---
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Get all users (admin only) ---
router.get("/", auth, role("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Get pending users (admin only) ---
router.get("/pending", auth, role("admin"), async (req, res) => {
  try {
    const pending = await User.find({ status: "pending" }).select("-password");
    res.json({ pending });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// --- Reject user (admin only) ---
router.put("/reject/:id", auth, role("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.status = "rejected";
    await user.save();
    res.json({ message: "User rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Update/Edit user (admin only) ---
router.put("/update/:id", auth, role("admin"), async (req, res) => {
  try {
    const { name, password, role: newRole, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (password) user.password = password; // Make sure you hash it in your model pre-save
    if (newRole) user.role = newRole;
    if (status) user.status = status;

    await user.save();
    res.json({ message: "User updated", user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// --- Delete user + all related data (admin only) ---
router.delete("/delete/:id", auth, role("admin"), async (req, res) => {
  try {
    const userId = req.params.id;

    // Delete user
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete all related data
    await Promise.all([
      Report.deleteMany({ userId }),
      Attendance.deleteMany({ userId }),
      Leave.deleteMany({ userId }),
    ]);

    res.json({ message: "User and all related data deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// --- Block user (admin only) ---
router.put("/block/:id", auth, role("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.status = "blocked";
    await user.save();
    res.json({ message: "User blocked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// --- Approve user (admin only) ---
router.put("/approve/:id", auth, role("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "approved";  // ✅ must match enum
    await user.save();
    res.json({ message: "User approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Unblock user (admin only) ---
router.put("/unblock/:id", auth, role("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "approved";  // ✅ must match enum
    await user.save();
    res.json({ message: "User unblocked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
