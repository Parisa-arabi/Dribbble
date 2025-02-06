const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authmiddleware = require("./authmiddleware2");


// Admin authentication routes
router.get("/login", adminController.getLoginPage);
router.post("/login", adminController.postLogin);
router.get("/logout", adminController.logout);

router.get("/dashboard", authmiddleware, adminController.dashboard);
// designer Management
router.post("/designers", authmiddleware, adminController.createDesigner); // Create user
router.put("/designers/:id", authmiddleware, adminController.editDesigner); // Edit user
router.delete("/designers/:id", authmiddleware, adminController.deleteDesigner); // Delete user
router.get("/designers", authmiddleware, adminController.getDesigners); // Create user

// buyer Management
router.post("/buyers", authmiddleware, adminController.createBuyer); // Create user
router.put("/buyers/:id", authmiddleware, adminController.editBuyer); // Edit user
router.delete("/buyers/:id", authmiddleware, adminController.deleteBuyer); // Delete user
router.get("/buyers", authmiddleware, adminController.getBuyers); // Create user

// Designs Management

router.get("/designs", authmiddleware, adminController.getDesigns); // Get all designs
router.put("/designs/:id", authmiddleware, adminController.editDesign); // Edit design
router.delete("/designs/:id", authmiddleware, adminController.deleteDesign); // Delete design

// Buying Management

router.get("/purchases", authmiddleware, adminController.getPurchases); // Get all purchases

module.exports = router;
