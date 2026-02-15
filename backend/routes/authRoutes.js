const router = require("express").Router()
const controller = require("../controllers/authController")
const { body } = require("express-validator");
const auth = require("../middleware/authMiddleware")
const role = require("../middleware/roleMiddleware")
const rateLimit = require("express-rate-limit");







const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Try again later."
  },
});


router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  controller.register
);
router.post(
  "/login",
  loginLimiter,
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  controller.login
);


// ADMIN ONLY
router.get("/pending", auth, role("admin"), controller.getPendingUsers)
router.put("/approve/:id", auth, role("admin"), controller.approveUser)
// Get all users (Admin)
router.get("/all", auth, role("admin"), controller.getAllUsers)

// Update a user (Admin)
router.put("/update/:id", auth, role("admin"), controller.updateUser)

// Delete a user (Admin)
router.delete("/delete/:id", auth, role("admin"), controller.deleteUser)



module.exports = router
