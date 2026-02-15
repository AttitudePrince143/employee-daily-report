const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const { validationResult } = require("express-validator");

// ------------------- REGISTER -------------------
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array()[0].msg);
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Registered successfully. Waiting for admin approval.",
    });

  } catch (error) {
    next(error);
  }
};



// ------------------- LOGIN -------------------
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(errors.array()[0].msg);
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400);
      throw new Error("User not found");
    }

    // Check if user is approved
    if (user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your account is not approved yet. Wait for admin approval."
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400);
      throw new Error("Invalid credentials");
    }

    // Generate JWT including role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
    });

  } catch (error) {
    next(error);
  }
};



// ------------------- GET PENDING USERS (ADMIN ONLY) -------------------
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "pending" }).select("-password")
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// ------------------- APPROVE USER (ADMIN ONLY) -------------------
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    user.status = "approved"
    await user.save()

    res.json({ message: "User approved successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}


// Get all users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update user (Admin)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    const { name, email, password, role, status } = req.body
    if (name) user.name = name
    if (email) user.email = email
    if (password) user.password = await bcrypt.hash(password, 10)
    if (role) user.role = role
    if (status) user.status = status

    await user.save()
    res.json({ message: "User updated successfully", user })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete user (Admin)
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
