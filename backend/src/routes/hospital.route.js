const express = require("express");
const hospitalRouter = express.Router();
const { registerHospital } = require("../controllers/hospital.controller.js");
const { protect, authorize } = require("../middlewares/auth.middleware.js");

// Route: POST /api/hospitals/register (Public - No auth required)
hospitalRouter.post("/register", registerHospital);

// Protected routes below
hospitalRouter.get(
  "/:id",
  protect,
  authorize("HOSPITAL_ADMIN", "ADMIN"),
  (req, res) => {
    // Get hospital details
  }
);

module.exports = hospitalRouter;
