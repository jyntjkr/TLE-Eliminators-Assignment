const mongoose = require('mongoose');

const codeforcesDataSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  handle: {
    type: String,
    required: true
  },
  userInfo: {
    type: Object,
    default: {}
  },
  contests: [{
    contestId: Number,
    contestName: String,
    rank: Number,
    oldRating: Number,
    newRating: Number,
    ratingUpdateTimeSeconds: Number
  }],
  submissions: [{
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
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for studentId and handle
codeforcesDataSchema.index({ studentId: 1, handle: 1 }, { unique: true });

module.exports = mongoose.model('CodeforcesData', codeforcesDataSchema); 