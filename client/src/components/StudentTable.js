// src/components/StudentTable.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';
import Papa from 'papaparse';
import { format } from 'date-fns';

// Simplified Modal for brevity
const Modal = ({ children, onClose }) => (
    <div className="modal-backdrop">
        <div className="modal-content">
            <button className="modal-close" onClick={onClose}>X</button>
            {children}
        </div>
    </div>
);

// Form for Add/Edit
const StudentForm = ({ student, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: student ? student.name : '',
        email: student ? student.email : '',
        phone: student ? student.phone : '',
        codeforcesHandle: student ? student.codeforcesHandle : '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
            <input name="codeforcesHandle" value={formData.codeforcesHandle} onChange={handleChange} placeholder="Codeforces Handle" required />
            <div className="form-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};

const StudentTable = () => {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const navigate = useNavigate();

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await studentService.getAllStudents();
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleSaveStudent = async (studentData) => {
        try {
            if (editingStudent) {
                await studentService.updateStudent(editingStudent._id, studentData);
            } else {
                await studentService.createStudent(studentData);
            }
            fetchStudents(); // Refresh table
        } catch (error) {
            alert(`Error saving student: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsModalOpen(false);
            setEditingStudent(null);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await studentService.deleteStudent(id);
                fetchStudents(); // Refresh table
            } catch (error) {
                console.error('Failed to delete student:', error);
            }
        }
    };
    
    const downloadCSV = () => {
        const data = students.map(s => ({
            Name: s.name,
            Email: s.email,
            Phone: s.phone,
            CodeforcesHandle: s.codeforcesHandle,
            CurrentRating: s.currentRating,
            MaxRating: s.maxRating,
            LastUpdated: format(new Date(s.lastUpdated), 'yyyy-MM-dd HH:mm'),
        }));
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'students.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) return <p>Loading students...</p>;

    return (
        <div className="table-container">
            <div className="table-actions">
                <button onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}>
                    <i className="fas fa-plus"></i> Add Student
                </button>
                <button onClick={downloadCSV}>
                    <i className="fas fa-download"></i> Download as CSV
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>CF Handle</th>
                        <th>Rating</th>
                        <th>Max Rating</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => (
                        <tr key={student._id}>
                            <td>{student.name}</td>
                            <td>{student.email}</td>
                            <td>{student.phone}</td>
                            <td>{student.codeforcesHandle}</td>
                            <td>{student.currentRating}</td>
                            <td>{student.maxRating}</td>
                            <td>{format(new Date(student.lastUpdated), 'PPpp')}</td>
                            <td className="actions-cell">
                                <button onClick={() => navigate(`/student/${student._id}`)}>
                                    <i className="fas fa-eye"></i>
                                </button>
                                <button onClick={() => { setEditingStudent(student); setIsModalOpen(true); }}>
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button onClick={() => handleDelete(student._id)} className="delete-btn">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isModalOpen && (
                <Modal onClose={() => { setIsModalOpen(false); setEditingStudent(null); }}>
                    <h2>{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
                    <StudentForm student={editingStudent} onSave={handleSaveStudent} onCancel={() => { setIsModalOpen(false); setEditingStudent(null); }}/>
                </Modal>
            )}
        </div>
    );
};

export default StudentTable;