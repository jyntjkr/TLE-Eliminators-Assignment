const Student = require('../models/Student');
const CodeforcesData = require('../models/CodeforcesData');
const SyncSettings = require('../models/SyncSettings');
const codeforcesService = require('./codeforcesService');
const inactivityService = require('./inactivityService');

class SyncService {
  async syncStudentData(studentId, forceSync = false) {
    try {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      // Check if already syncing
      if (student.isDataSyncing && !forceSync) {
        console.log(`Student ${student.name} is already syncing`);
        return;
      }

      // Mark as syncing
      await Student.findByIdAndUpdate(studentId, { isDataSyncing: true });

      console.log(`Starting sync for student: ${student.name} (${student.codeforcesHandle})`);

      // Fetch data from Codeforces
      const cfData = await codeforcesService.fetchAllUserData(student.codeforcesHandle);

      // Calculate current and max rating
      let currentRating = 0;
      let maxRating = 0;

      if (cfData.contests && cfData.contests.length > 0) {
        // Sort contests by time
        const sortedContests = cfData.contests.sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds);
        currentRating = sortedContests[sortedContests.length - 1].newRating;
        maxRating = Math.max(...sortedContests.map(contest => contest.newRating));
      }

      // Update or create Codeforces data
      await CodeforcesData.findOneAndUpdate(
        { studentId, handle: student.codeforcesHandle },
        {
          studentId,
          handle: student.codeforcesHandle,
          userInfo: cfData.userInfo,
          contests: cfData.contests,
          submissions: cfData.submissions,
          lastUpdated: new Date()
        },
        { upsert: true }
      );

      // Update student with new ratings and sync status
      await Student.findByIdAndUpdate(studentId, {
        currentRating,
        maxRating,
        lastDataSync: new Date(),
        isDataSyncing: false
      });

      // Check for inactivity
      await inactivityService.checkInactivityForStudent(studentId, cfData.submissions);

      console.log(`Sync completed for student: ${student.name}`);
      return { success: true, message: 'Data synced successfully' };

    } catch (error) {
      // Reset syncing status on error
      await Student.findByIdAndUpdate(studentId, { isDataSyncing: false });
      console.error(`Sync failed for student ID ${studentId}:`, error.message);
      throw error;
    }
  }

  async syncAllStudents() {
    try {
      console.log('Starting global sync for all students');
      
      const students = await Student.find({});
      const syncPromises = students.map(student => 
        this.syncStudentData(student._id).catch(error => {
          console.error(`Failed to sync student ${student.name}:`, error.message);
          return { studentId: student._id, error: error.message };
        })
      );

      const results = await Promise.all(syncPromises);
      
      // Update global sync timestamp
      await SyncSettings.findOneAndUpdate(
        {},
        { lastGlobalSync: new Date() },
        { upsert: true }
      );

      // Collect submissions data for inactivity processing
      const studentsData = [];
      for (const result of results) {
        if (!result.error) {
          const data = await this.getStudentCodeforcesData(result.studentId || result._id);
          if (data) {
            studentsData.push({
              studentId: data.studentId,
              submissions: data.submissions
            });
          }
        }
      }
      
      // Process inactivity for all students
      await inactivityService.processInactivityForAllStudents(studentsData);

      console.log('Global sync completed');
      return results;
    } catch (error) {
      console.error('Global sync failed:', error.message);
      throw error;
    }
  }

  async getStudentCodeforcesData(studentId) {
    try {
      const data = await CodeforcesData.findOne({ studentId }).populate('studentId');
      return data;
    } catch (error) {
      console.error(`Error fetching Codeforces data for student ${studentId}:`, error.message);
      throw error;
    }
  }
}

module.exports = new SyncService();