const express = require('express');
const router = express.Router();
const designerController = require('../controllers/designerController');

router.post('/add-design', designerController.addDesign);
router.get('/designs/:id', designerController.viewDesigns);
router.get('/income/:id', designerController.viewIncome);

module.exports = router;