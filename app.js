// backend/app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const designerRoutes = require('./routes/designerRoutes');
const cors = require('cors');
const config = require('./config/config.js');  // وارد کردن

const app = express();
app.use(cors());

// اتصال به MongoDB
mongoose.connect('mongodb://localhost:27017/designMarket');

app.use(bodyParser.json());
app.use('/api/designers', designerRoutes);

app.listen(config.serverPort, () => {
    console.log(`Server running on port http://localhost:${config.serverPort}`);
});
