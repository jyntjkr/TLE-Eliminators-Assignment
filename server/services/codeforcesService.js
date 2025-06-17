const axios = require('axios');

class CodeforcesService {
  constructor() {
    this.baseURL = 'https://codeforces.com/api';
    this.rateLimitDelay = 1000; // 1 second between requests
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchUserInfo(handle) {
    try {
      await this.delay(this.rateLimitDelay);
      const response = await axios.get(`${this.baseURL}/user.info?handles=${handle}`);
      
      if (response.data.status !== 'OK') {
        throw new Error(`Codeforces API Error: ${response.data.comment}`);
      }
      
      return response.data.result[0];
    } catch (error) {
      console.error(`Error fetching user info for ${handle}:`, error.message);
      throw error;
    }
  }

  async fetchUserRating(handle) {
    try {
      await this.delay(this.rateLimitDelay);
      const response = await axios.get(`${this.baseURL}/user.rating?handle=${handle}`);
      
      if (response.data.status !== 'OK') {
        throw new Error(`Codeforces API Error: ${response.data.comment}`);
      }
      
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching rating for ${handle}:`, error.message);
      throw error;
    }
  }

  async fetchUserSubmissions(handle, from = 1, count = 10000) {
    try {
      await this.delay(this.rateLimitDelay);
      const response = await axios.get(`${this.baseURL}/user.status?handle=${handle}&from=${from}&count=${count}`);
      
      if (response.data.status !== 'OK') {
        throw new Error(`Codeforces API Error: ${response.data.comment}`);
      }
      
      return response.data.result;
    } catch (error) {
      console.error(`Error fetching submissions for ${handle}:`, error.message);
      throw error;
    }
  }

  async fetchAllUserData(handle) {
    try {
      console.log(`Fetching data for handle: ${handle}`);
      
      const [userInfo, contests, submissions] = await Promise.all([
        this.fetchUserInfo(handle),
        this.fetchUserRating(handle),
        this.fetchUserSubmissions(handle)
      ]);

      return {
        userInfo,
        contests,
        submissions
      };
    } catch (error) {
      console.error(`Error fetching all data for ${handle}:`, error.message);
      throw error;
    }
  }
}

module.exports = new CodeforcesService();