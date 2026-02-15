const mongoose = require("mongoose")

const dailyReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  attendanceId: { type: mongoose.Schema.Types.ObjectId, ref: "Attendance", required: true },
  tasks: { type: String, required: true },
  workDetails: { type: String },
  date: { type: Date, required: true },
}, { timestamps: true })

module.exports = mongoose.model("DailyReport", dailyReportSchema)
