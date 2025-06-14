const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    id: Number,
    contestId: Number,
    problem: {
        contestId: Number,
        index: String,
        name: String,
        rating: Number,
        tags: [String]
    },
    verdict: String,
    creationTimeSeconds: Number
});

const contestSchema = new mongoose.Schema({
    contestId: Number,
    contestName: String,
    rank: Number,
    oldRating: Number,
    newRating: Number,
    ratingUpdateTimeSeconds: Number,
    unsolvedProblems: { type: Number, default: 0 }
});


const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        unique: true, 
        sparse: true,
        default: null
    },
    phone: String,
    codeforcesHandle: { type: String, required: true, unique: true },
    currentRating: { type: Number, default: 0 },
    maxRating: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    contestHistory: [contestSchema],
    submissionHistory: [submissionSchema],
    reminderSentCount: { type: Number, default: 0 },
    disableEmail: { type: Boolean, default: false }
});

// Drop existing indexes to avoid conflicts
studentSchema.index({ email: 1 }, { unique: true, sparse: true });
studentSchema.index({ codeforcesHandle: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);