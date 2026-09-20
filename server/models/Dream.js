// import mongoose from 'mongoose';

// const commentSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     content: {
//         type: String,
//         required: true
//     }
// }, {
//     timestamps: true
// });

// const dreamSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     content: {
//         type: String,
//         required: true
//     },
//     dreamType: {
//         type: String,
//         enum: ['text', 'voice'],
//         default: 'text'
//     },
//     audioUrl: {
//         type: String,
//         default: null
//     },
//     likes: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     }],
//     comments: [commentSchema],
//     shares: {
//         type: Number,
//         default: 0
//     }
// }, {
//     timestamps: true
// });

// export default mongoose.model('Dream', dreamSchema);




// server/models/Dream.js
import mongoose from 'mongoose';

// ============================================
// ✅ COMMENT SCHEMA
// ============================================
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
}, {
    timestamps: true
});

// ============================================
// ✅ SHARED WITH SCHEMA
// ============================================
const sharedWithSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sharedAt: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        default: ''
    }
}, {
    _id: false
});

// ============================================
// ✅ DREAM SCHEMA
// ============================================
const dreamSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    dreamType: {
        type: String,
        enum: ['text', 'voice'],
        default: 'text'
    },
    audioUrl: {
        type: String,
        default: null
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [commentSchema],
    
    // ✅ Who the dream was shared with
    sharedWith: [sharedWithSchema],
    
    // ✅ Who shared this dream (original sharer)
    sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    // ✅ Shares count
    shares: {
        type: Number,
        default: 0
    },
    sharesCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// ============================================
// ✅ INDEXES
// ============================================
dreamSchema.index({ user: 1, createdAt: -1 });
dreamSchema.index({ 'sharedWith.user': 1 });
dreamSchema.index({ createdAt: -1 });

export default mongoose.model('Dream', dreamSchema);