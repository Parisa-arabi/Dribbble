const express = require('express');
const router = express.Router();
const designerController = require('../controllers/designerController');

// Define the add-design route
router.get('/designs/:designId', designerController.getDesign);  // Add this line
router.post('/add-design', designerController.addDesign);
router.get('/designs/', designerController.viewDesigns);
router.get('/income/:id', designerController.viewIncome);
router.get('/income', designerController.getDesignerIncome);
router.put('/edit-design/:designId', designerController.editDesign);
router.delete('/delete-design/:designId', designerController.deleteDesign);


module.exports = router