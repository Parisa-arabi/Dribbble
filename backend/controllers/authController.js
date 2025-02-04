const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db'); // Import getDB instead of client

// Remove the getDatabase function since we'll use getDB directly
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt with:', { email, password });

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            return res.status(500).json({ 
                success: false, 
                message: 'خطای پیکربندی سرور' 
            });
        }

        // Get database instance and designers collection
        const db = getDB();
        const collection = db.collection('designers');
        
        // Find designer and log the result
        const designer = await collection.findOne({ email });
        console.log('Designer found:', {
            id: designer?._id,
            email: designer?.email
        });
        
        // Rest of your login logic remains the same
        if (!designer) {
            console.log('No designer found with email:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'ایمیل یا رمز عبور اشتباه است',
                error: 'INVALID_CREDENTIALS'
            });
        }
        // Log password comparison
        console.log('Password comparison:', {
            provided: password,
            stored: designer.password,
            matches: designer.password === password
        });

        if (designer.password !== password) {
            console.log('Password mismatch for email:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'ایمیل یا رمز عبور اشتباه است',
                error: 'INVALID_CREDENTIALS'
            });
        }

        const token = jwt.sign(
            { id: designer._id, email: designer.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: false,
            path : "/",
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 20000 // 24 hours
        });

        return res.status(200).json({
            success: true,
            token,
            designer: {
                id: designer._id,
                name: designer.name,
                email: designer.email
            }
        });

    } catch (error) {
        console.error('Login error details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'خطا در ورود به سیستم',
            error: error.message 
        });
    }
};