const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    children: {
        type: [mongoose.Schema.Types.ObjectId], // IDs of child lines
        index: true,
    },
    isFirstLine: {
        type: Boolean,
        default: false,
        index: true,
    },
    isLastLine: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: true, // adds updatedAt and createdAt fields
});

schema.index({
    createdAt: 1
});

module.exports = mongoose.model('Line', schema);