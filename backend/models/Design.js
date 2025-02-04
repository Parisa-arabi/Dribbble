const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    designer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Designer',
        required: true
    },
    designerEmail: {
        type: String,
        required: true
    },
    description: String,
    // Add the images field
    images: [{
        type: String,  // This will store the image paths
        required: false
    }],
    purchase: {
        type: Boolean,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Design', designSchema);
