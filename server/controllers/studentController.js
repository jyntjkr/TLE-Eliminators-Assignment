// controllers/studentController.js
const Student = require('../models/Student');
const { getCodeforcesData } = require('./codeforcesController');

// Create a new student and fetch initial data
exports.createStudent = async (req, res) => {
    console.log('Creating student with data:', req.body);
    const session = await Student.startSession();
    session.startTransaction();
    
    try {
        // First check if student exists
        const existingStudent = await Student.findOne({ 
            $or: [
                { email: req.body.email }, 
                { codeforcesHandle: req.body.codeforcesHandle }
            ] 
        }).session(session);
        
        if (existingStudent) {
            console.log('Student already exists:', existingStudent);
            await session.abortTransaction();
            session.endSession();
            return res.status(409).send({ 
                message: 'A student with this email or Codeforces handle already exists.' 
            });
        }

        // Create new student with basic info
        const student = new Student({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            codeforcesHandle: req.body.codeforcesHandle
        });

        try {
            // Fetch Codeforces data
            console.log('Fetching Codeforces data for:', student.codeforcesHandle);
            const initialData = await getCodeforcesData(student.codeforcesHandle);
            console.log('Received Codeforces data:', initialData);
            
            // Update student with Codeforces data
            Object.assign(student, initialData);
            
            // Save the complete student record
            await student.save({ session });
            await session.commitTransaction();
            session.endSession();
            
            console.log('Student saved successfully:', student);
            res.status(201).send(student);
        } catch (error) {
            console.error('Error fetching Codeforces data:', error);
            // If Codeforces data fetch fails, still save the basic student info
            await student.save({ session });
            await session.commitTransaction();
            session.endSession();
            
            res.status(201).send({
                ...student.toObject(),
                message: 'Student created but Codeforces data could not be fetched. Will be updated on next sync.'
            });
        }
    } catch (error) {
        console.error('Error in createStudent:', error);
        await session.abortTransaction();
        session.endSession();
        res.status(500).send({ 
            message: 'Error creating student.', 
            error: error.message 
        });
    }
};

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find({}).sort({ name: 1 });
        res.send(students);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).send();
        }
        res.send(student);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Update a student
exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).send();
        }

        const oldHandle = student.codeforcesHandle;
        
        // Update fields
        Object.assign(student, req.body);
        await student.save();

        // If CF handle changed, fetch new data in real-time
        if (req.body.codeforcesHandle && req.body.codeforcesHandle !== oldHandle) {
            const newData = await getCodeforcesData(student.codeforcesHandle);
            Object.assign(student, newData);
            await student.save();
        }

        res.send(student);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).send();
        }
        res.send({ message: 'Student deleted successfully.' });
    } catch (error) {
        res.status(500).send(error);
    }
};