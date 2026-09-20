// server/models/Reel.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

const reelSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // ✅ Media
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    // ✅ Caption
    caption: {
        type: String,
        default: '',
        maxLength: 500
    },
    // ✅ Hashtags
    hashtags: [{
        type: String
    }],
    // ✅ Engagement
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema],
    shares: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    // ✅ Track unique viewers
    viewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // ✅ Privacy
    isPublic: {
        type: Boolean,
        default: true
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// ✅ Indexes for fast queries
reelSchema.index({ createdAt: -1 });
reelSchema.index({ user: 1, createdAt: -1 });
reelSchema.index({ hashtags: 1 });
reelSchema.index({ likes: 1 });

export default mongoose.model('Reel', reelSchema);