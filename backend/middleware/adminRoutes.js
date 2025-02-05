const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authmiddleware = require('./authmiddleware2');


//router.use(authMiddleware.isAdmin);


router.get('/login', adminController.getLoginPage);
router.post('/login', adminController.postLogin);
router.get('/logout', adminController.logout);

router.get('/dashboard', authmiddleware, adminController.dashboard);
router.post('/designers', authmiddleware, adminController.createDesigner); 
router.put('/designers/:id', authmiddleware, adminController.editDesigner); 
router.delete('/designers/:id', authmiddleware, adminController.deleteDesigner); 
router.get('/designers', authmiddleware, adminController.getDesigners); 


router.post('/buyers', authmiddleware, adminController.createBuyer); 
router.put('/buyers/:id', authmiddleware, adminController.editBuyer); 
router.delete('/buyers/:id', authmiddleware, adminController.deleteBuyer); 
router.get('/buyers', authmiddleware, adminController.getBuyers); 


router.get('/designs', authmiddleware, adminController.getDesigns); 
router.put('/designs/:id', authmiddleware, adminController.editDesign); 
router.delete('/designs/:id', authmiddleware, adminController.deleteDesign); 


router.get('/purchases', authmiddleware, adminController.getPurchases);

module.exports = router;