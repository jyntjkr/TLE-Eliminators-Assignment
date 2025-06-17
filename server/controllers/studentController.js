// controllers/studentController.js
const Student = require('../models/Student');
const CodeforcesData = require('../models/CodeforcesData');
const syncService = require('../services/syncService');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find({}).sort({ name: 1 });
        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get Codeforces data
        const codeforcesData = await CodeforcesData.findOne({ studentId: student._id });
        
        res.json({
            success: true,
            data: {
                ...student.toObject(),
                codeforcesData
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching student',
            error: error.message
        });
    }
};

// Create a new student
exports.createStudent = async (req, res) => {
    try {
        const { name, email, phone, codeforcesHandle } = req.body;

        // Check if student exists
        const existingStudent = await Student.findOne({
            $or: [
                { email },
                { codeforcesHandle }
            ]
        });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: 'A student with this email or Codeforces handle already exists'
            });
        }

        // Create new student
        const student = new Student({
            name,
            email,
            phone,
            codeforcesHandle
        });

        await student.save();

        // Trigger initial data sync
        syncService.syncStudentData(student._id).catch(error => {
            console.error(`Initial sync failed for new student ${student.name}:`, error.message);
        });

        res.status(201).json({
            success: true,
            data: student,
            message: 'Student created successfully. Data sync initiated.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating student',
            error: error.message
        });
    }
};

// Update a student
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, codeforcesHandle } = req.body;

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const oldHandle = student.codeforcesHandle;
        
        // Update student
        student.name = name || student.name;
        student.email = email || student.email;
        student.phone = phone || student.phone;
        student.codeforcesHandle = codeforcesHandle || student.codeforcesHandle;

        await student.save();

        // If handle changed, trigger immediate sync
        if (codeforcesHandle && codeforcesHandle !== oldHandle) {
            console.log(`Codeforces handle changed for ${student.name}. Triggering immediate sync.`);
            syncService.syncStudentData(id, true).catch(error => {
                console.error(`Handle change sync failed for ${student.name}:`, error.message);
            });
        }

        res.json({
            success: true,
            data: student,
            message: codeforcesHandle !== oldHandle ? 
                'Student updated successfully. Data sync initiated due to handle change.' : 
                'Student updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating student',
            error: error.message
        });
    }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Delete associated Codeforces data
        await CodeforcesData.deleteMany({ studentId: id });
        
        // Delete student
        await Student.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message
        });
    }
};