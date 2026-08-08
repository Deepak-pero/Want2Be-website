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
    // dream: {
    //     type: String,
    //     required: true,
    //     trim: true
    // },
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