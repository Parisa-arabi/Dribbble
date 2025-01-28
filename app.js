const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const designerRoutes = require('./routes/designerRoutes');
const cors = require('cors');
const config = require('./config/config.js');
const path = require('path'); // Make sure this is added

const app = express();
app.use(cors());

// Make sure these lines are present and correct
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../front-end/views')); // Changed this line

// اتصال به MongoDB
mongoose.connect('mongodb://localhost:27017/designMarket');

app.use(bodyParser.json());
app.use('/api/designers', designerRoutes);

// Root route
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Design Market',
        description: 'Welcome to our Design Marketplace'
    });
});

app.listen(config.serverPort, () => {
    console.log(`Server running on port http://localhost:${config.serverPort}`);
});
console.log('Views Directory:', path.join(__dirname, 'views'));