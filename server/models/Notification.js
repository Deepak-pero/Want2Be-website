// import mongoose from 'mongoose';

// const notificationSchema = new mongoose.Schema({
//     recipient: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     sender: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     type: {
//         type: String,
//         enum: ['like', 'comment', 'share', 'follow'],
//         required: true
//     },
//     dream: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Dream'
//     },
//     commentText: {
//         type: String
//     },
//     isRead: {
//         type: Boolean,
//         default: false
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// export default mongoose.model('Notification', notificationSchema);




// server/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'share', 'follow', 'dream_share'],
        required: true
    },
    // ✅ For like, comment, share
    dream: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dream',
        default: null
    },
    // ✅ For comments
    commentText: {
        type: String,
        default: null
    },
    // ✅ For dream shares - store message and dream content
    shareMessage: {
        type: String,
        default: null
    },
    dreamContent: {
        type: String,
        default: null
    },
    // ✅ For direct navigation
    redirectUrl: {
        type: String,
        default: null
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// ✅ Compound index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);