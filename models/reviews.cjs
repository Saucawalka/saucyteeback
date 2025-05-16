const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: Number,
        comment: String,
        createdAt: Date
      
      
})
module.exports = mongoose.model('Review', reviewSchema);
module.exports = reviewSchema;