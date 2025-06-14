const axios = require('axios');
const Student = require('../models/Student');

const CODEFORCES_API_URL = 'https://codeforces.com/api';

const fetchCodeforcesData = async (handle) => {
    console.log('Fetching Codeforces data for handle:', handle);
    try {
        // Make all API calls in parallel
        const [userInfoResponse, ratingHistoryResponse, submissionsResponse] = await Promise.all([
            axios.get(`${CODEFORCES_API_URL}/user.info?handles=${handle}`),
            axios.get(`${CODEFORCES_API_URL}/user.rating?handle=${handle}`),
            // Limit submissions to last 100 to reduce data size
            axios.get(`${CODEFORCES_API_URL}/user.status?handle=${handle}&count=100`)
        ]);

        if (!userInfoResponse.data.result || userInfoResponse.data.result.length === 0) {
            throw new Error(`Codeforces user '${handle}' not found.`);
        }

        const user = userInfoResponse.data.result[0];
        const { rating: currentRating, maxRating } = user;

        const contestHistory = ratingHistoryResponse.data.result.map(contest => ({
            contestId: contest.contestId,
            contestName: contest.contestName,
            rank: contest.rank,
            oldRating: contest.oldRating,
            newRating: contest.newRating,
            ratingUpdateTimeSeconds: contest.ratingUpdateTimeSeconds
        }));

        const submissionHistory = submissionsResponse.data.result;

        const data = {
            currentRating,
            maxRating,
            contestHistory,
            submissionHistory,
            lastUpdated: new Date()
        };

        console.log('Successfully fetched Codeforces data:', data);
        return data;
    } catch (error) {
        console.error('Error in fetchCodeforcesData:', error);
        throw error;
    }
};

// Add a function to check if data needs updating
const shouldUpdateData = (lastUpdated) => {
    if (!lastUpdated) return true;
    const now = new Date();
    const hoursSinceLastUpdate = (now - new Date(lastUpdated)) / (1000 * 60 * 60);
    // Update if data is older than 1 hour
    return hoursSinceLastUpdate > 1;
};

// Add a function to get cached data if available
const getCodeforcesData = async (handle) => {
    try {
        const student = await Student.findOne({ codeforcesHandle: handle });
        
        if (student && !shouldUpdateData(student.lastUpdated)) {
            return {
                currentRating: student.currentRating,
                maxRating: student.maxRating,
                contestHistory: student.contestHistory,
                submissionHistory: student.submissionHistory,
                lastUpdated: student.lastUpdated
            };
        }

        return await fetchCodeforcesData(handle);
    } catch (error) {
        console.error('Error in getCodeforcesData:', error);
        throw error;
    }
};

module.exports = { fetchCodeforcesData, getCodeforcesData };