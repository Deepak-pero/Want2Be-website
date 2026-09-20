import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        sparse: true
    },
    phone: {
        type: String,
        trim: true,
        sparse: true
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },
    sharedWith: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        sharedAt: {
            type: Date,
            default: Date.now
        },
        message: {
            type: String,
            default: ''
        }
    }],
    // ✅ Track shares count
    sharesCount: {
        type: Number,
        default: 0
    },
    profilePicture: {
        type: String,
        default: ''
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: String,
        expiresAt: Date
    }
}, {
    timestamps: true
});

// Ensure either email or phone is provided
userSchema.pre('save', function (next) {
    if (!this.email && !this.phone) {
        return next(new Error('Either email or phone must be provided'));
    }
    next();
});

export default mongoose.model('User', userSchema);  