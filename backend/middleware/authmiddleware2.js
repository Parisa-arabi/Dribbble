const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.session.token; 

    if (!token) {
        return res.redirect('/admin/login'); 
    }

    try {
        const decoded = jwt.verify(token, 'secret_key'); 
        req.admin = decoded; 
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        req.session.destroy(); 
        res.redirect('/admin/login'); 
    }
};