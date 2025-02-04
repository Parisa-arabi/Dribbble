
// backend/app.js  
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const buyerRoutes = require('./routes/buyerRoutes');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config(); // Load environment variables  
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// const config = require('./config/config.js');
const { connectDB } = require('./config/db');
const designerRoutes = require('./routes/designerRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authMiddleware = require('./middleware/authMiddleware');
require('./db.js');


// Debug log for environment variables
console.log('Environment variables loaded:', {
    jwtSecret: !!process.env.JWT_SECRET,
    mongoUri: !!process.env.MONGODB_URI,
    port: process.env.PORT
});


const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'frontend', 'views'));

// Middleware for parsing URL-encoded data  
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse JSON request bodies  
app.use(cookieParser(process.env.JWT_SECRET));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser()); // To parse cookies in requests
app.use(express.static(path.join(__dirname, 'front-end/public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use(session({
    secret: 'cf51c403eb360382b7afdf5e2f3ba2e8f424a2e21fccca5456e65123f591c37f',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
const cors = require('cors');

app.use(cors({
    origin: ['http://localhost:5000', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));



app.get('/', (req, res) => {
    return res.render('index', {
        title: 'Design Market',
        description: 'Welcome to our Design Marketplace'
    });
});

// Redirect to appropriate login pages based on role  

// Use buyer routes  
app.use('/buyer', buyerRoutes);
app.use('/auth', authRoutes);
app.use('/api/designers', authRoutes, designerRoutes);
app.use("/admin", adminRoutes); // Ensure this is correctly mounted
app.use(authMiddleware);
// Root route
app.get('/designer-index', (req, res) => {
    return res.render('designer-index', {
        title: 'Design Market',
        description: 'Welcome to our Design Marketplace'
    });
});

app.get('/designer/login', (req, res) => {
    return res.render('login');
});


app.get('/',(req,res)=>{
    return res.render('home')
})
// Start the server  
// app.listen(3000, () => {
//     console.log('Server is running on http://localhost:3000');
// });

// Server startup function
const startServer = async () => {
    try {
        // Connect to database first
        await connectDB();
        console.log('Database connected successfully');

        // Start the server
        const PORT = process.env.PORT || config.serverPort || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Initialize server
startServer();

module.exports = app;