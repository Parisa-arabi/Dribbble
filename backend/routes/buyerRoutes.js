const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');
const { authenticateJWT } = require('../controllers/buyerController')

// Buyer routes  
router.get('/designs', buyerController.getDesigns);
router.post('/buy', buyerController.buyDesign);
router.get('/purchases/:id', buyerController.getPurchases);
router.put('/add-balance',authenticateJWT, buyerController.addBalance);
router.get('/login', (req, res) => {
    res.render('buyer-login');

});
router.post('/login', buyerController.loginBuyer);
router.get('/register', (req, res) => {
    res.render('/register', { message: req.flash('message') });
});
router.post('/register', buyerController.registerBuyer);
router.post('/purchase', authenticateJWT, buyerController.createPurchase);
router.get('/info', authenticateJWT, buyerController.buyerInfo)
router.get('/dashboard', (req, res) => {
    res.render('buyer-dashboard');
});
router.get('/account-balance' , authenticateJWT,buyerController.userbalance)

module.exports = router;