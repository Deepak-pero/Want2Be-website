// // models/DreamAnalysis.js
// import mongoose from 'mongoose';

// const stepSchema = new mongoose.Schema({
//     step: Number,
//     title: String,
//     description: String,
//     actionItems: [String]
// });

// const resourcesSchema = new mongoose.Schema({
//     books: [String],
//     videos: [String],
//     habits: [String]
// });

// const dreamAnalysisSchema = new mongoose.Schema({
//     dream: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Dream',
//         required: true
//     },
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     analysis: {
//         summary: String,
//         stepByStepRoadmap: [stepSchema],
//         keyInsights: [String],
//         recommendedResources: resourcesSchema,
//         motivationalQuote: String
//     },
//     apiResponse: String, // Raw API response for debugging
//     analyzedAt: {
//         type: Date,
//         default: Date.now
//     }
// }, {
//     timestamps: true
// });

// export default mongoose.model('DreamAnalysis', dreamAnalysisSchema);



// models/DreamAnalysis.js - IMPROVED SCHEMA
import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
    challenge: String,
    solution: String
});

const stepSchema = new mongoose.Schema({
    step: Number,
    title: String,
    description: String,
    timeline: String,
    resourcesNeeded: [String],
    successIndicators: [String],
    completed: { type: Boolean, default: false },
    completedAt: Date
});

const dreamAnalysisSchema = new mongoose.Schema({
    dream: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dream',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    analysis: {
        summary: String,
        emotionalSignificance: String,
        stepByStepRoadmap: [stepSchema],
        potentialChallenges: [challengeSchema],
        skillDevelopment: [String],
        milestoneCelebrations: [String],
        motivationalQuote: String,
        immediateNextSteps: [String],
        longTermVision: String
    },
    progress: {
        completedSteps: { type: Number, default: 0 },
        totalSteps: { type: Number, default: 0 },
        completionPercentage: { type: Number, default: 0 },
        lastActive: Date
    },
    analyzedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Calculate progress before save
dreamAnalysisSchema.pre('save', function (next) {
    if (this.analysis.stepByStepRoadmap) {
        this.progress.totalSteps = this.analysis.stepByStepRoadmap.length;
        this.progress.completedSteps = this.analysis.stepByStepRoadmap.filter(step => step.completed).length;
        this.progress.completionPercentage = this.progress.totalSteps > 0
            ? Math.round((this.progress.completedSteps / this.progress.totalSteps) * 100)
            : 0;
    }
    next();
});

export default mongoose.model('DreamAnalysis', dreamAnalysisSchema);