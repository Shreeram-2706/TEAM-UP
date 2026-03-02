const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    username: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    link: { type: String, default: "" },
    description: { type: String, required: true },
    image: { type: String },
    likes: { type: Number, default: 0 },  
    createdAt: { type: Date, default: Date.now },
    likedBy: [{ type: String, default: [] }],
    expireAt: { type: Date, default: () => new Date(Date.now() + 7*24*60*60*1000) }
}, { timestamps: true });

eventSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('event', eventSchema);
