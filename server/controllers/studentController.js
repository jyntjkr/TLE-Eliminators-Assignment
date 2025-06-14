// controllers/studentController.js
const Student = require('../models/Student');
const { getCodeforcesData } = require('./codeforcesController');

// Create a new student and fetch initial data
exports.createStudent = async (req, res) => {
    console.log('Creating student with data:', req.body);
    try {
        const existingStudent = await Student.findOne({ $or: [{ email: req.body.email }, { codeforcesHandle: req.body.codeforcesHandle }] });
        if (existingStudent) {
            console.log('Student already exists:', existingStudent);
            return res.status(409).send({ message: 'A student with this email or Codeforces handle already exists.' });
        }
        
        const student = new Student(req.body);
        console.log('Attempting to fetch Codeforces data for handle:', student.codeforcesHandle);
        try {
            // Fetch data immediately
            const initialData = await getCodeforcesData(student.codeforcesHandle);
            console.log('Successfully fetched Codeforces data:', initialData);
            Object.assign(student, initialData);
            await student.save();
            console.log('Student saved successfully:', student);
            res.status(201).send(student);
        } catch (error) {
            console.error('Error fetching Codeforces data:', error);
            return res.status(404).send({ message: error.message });
        }
    } catch (error) {
        console.error('Error in createStudent:', error);
        res.status(500).send({ message: 'Error creating student.', error: error.message });
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