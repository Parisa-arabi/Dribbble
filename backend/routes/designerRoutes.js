const express = require('express');
const router = express.Router();
const designerController = require('../controllers/designerController');
const auth = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware');
// Define the add-design route
router.get('/designs/:designId',auth, designerController.getDesign);  // Add this line
router.post('/add-design', auth, upload.array('images', 5), designerController.addDesign);
router.get('/designs',auth, designerController.viewDesigns);
router.get('/income', auth, designerController.getDesignerIncome);
router.put('/edit-design/:designId',auth, designerController.editDesign);
router.delete('/delete-design/:designId',auth, designerController.deleteDesign);
module.exports = router