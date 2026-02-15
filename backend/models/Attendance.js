const mongoose = require("mongoose")

const attendanceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  loginTime: { 
    type: Date, 
    default: null 
  },
  logoutTime: { 
    type: Date, 
    default: null 
  },
  totalHours: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true })

// 🔥 VERY IMPORTANT — Prevent duplicate attendance per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model("Attendance", attendanceSchema)
