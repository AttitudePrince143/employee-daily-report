require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorMiddleware");
const rateLimit = require("express-rate-limit");




const app = express();



const loginLimiter = rateLimit({
  windowMs: 0.5 * 60 * 1000, // 30 sec 
  max: 5, // max 5 requests per window per IP
  message: {
    success: false,
    message: "Too many login attempts. Try again later."
  },
});


// --- Middleware ---
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // your frontend URL
  credentials: true
}));

app.use(express.json());

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/dailyreport", require("./routes/dailyReportRoutes"));
app.use("/api/leave", require("./routes/leaveRoutes"));
app.use("/api/users", require("./routes/userRoutes"));


// --- Handle 404 ---
app.use((req, res, next) => {
  const error = new Error("Route not found");
  res.status(404);
  next(error);
});

// --- Global error handler ---
app.use(errorHandler);

app.get("/healthz", (req, res) => res.status(200).send("OK"));

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
