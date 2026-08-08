import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['image'],
    default: 'image'
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      maxLength: 200
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: '24h' } // Auto-delete after 24 hours
  }
});

// Add index for faster queries
storySchema.index({ createdAt: -1 });
storySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Story', storySchema);