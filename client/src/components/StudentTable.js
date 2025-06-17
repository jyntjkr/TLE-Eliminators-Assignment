// src/components/StudentTable.js
/**
 * StudentTable Component
 * 
 * Displays a list of all students with their basic information and provides functionality for:
 * - Adding new students
 * - Viewing detailed student profiles
 * - Downloading student data as CSV
 * - Responsive design with mobile view support
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';
import Papa from 'papaparse';
import { format } from 'date-fns';

/**
 * Modal Component
 * A reusable modal dialog for displaying forms and messages
 */
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
        disableEmail: student ? student.disableEmail || false : false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
            
            {student && (
                <div className="checkbox-container">
                    <input 
                        type="checkbox" 
                        id="disableEmail" 
                        name="disableEmail" 
                        checked={formData.disableEmail} 
                        onChange={handleChange} 
                    />
                    <label htmlFor="disableEmail">Disable Inactivity Reminder Emails</label>
                </div>
            )}
            
            <div className="form-actions">
                <button type="submit">{student ? 'Update Student' : 'Save Student'}</button>
                <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};

const StudentTable = () => {
    // State management for students list and UI controls
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [newStudent, setNewStudent] = useState({ name: '', codeforcesHandle: '' });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();

    // Handle window resize for responsive design
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch students data on component mount
    useEffect(() => {
        fetchStudents();
    }, []);

    // Fetch all students from the API
    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await studentService.getAllStudents();
            setStudents(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setStudents([]);
        }
        setIsLoading(false);
    };

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
            LastUpdated: format(new Date(s.lastDataSync), 'yyyy-MM-dd HH:mm'),
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

    const toggleRowExpansion = (id) => {
        setExpandedRows(new Set([id === Array.from(expandedRows)[0] ? null : id]));
    };

    if (isLoading) return <p>Loading students...</p>;

    return (
        <div className="student-table-container">
            <div className="table-header">
                <h2>Student Data</h2>
                <div className="header-actions">
                    <button className="add-btn" onClick={() => setIsModalOpen(true)}>
                        <i className="fas fa-plus"></i>
                        <span className="button-text">Add Student</span>
                    </button>
                    <button className="download-btn" onClick={downloadCSV}>
                        <i className="fas fa-download"></i>
                        <span className="button-text">Download</span>
                    </button>
                </div>
            </div>
            
            {/* Desktop View */}
            <div className="desktop-view">
                <table className="student-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Codeforces Handle</th>
                            <th>Current Rating</th>
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
                                <td>{format(new Date(student.lastDataSync), 'PPpp')}</td>
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
            </div>
            
            {/* Mobile View */}
            <div className="mobile-view">
                {students.map(student => (
                    <div 
                        key={student._id}
                        className={`student-card ${expandedRows.has(student._id) ? 'expanded' : ''}`}
                        onClick={() => toggleRowExpansion(student._id)}
                    >
                        <div className="card-main-content">
                            <div className="student-info">
                                <div className="student-name">{student.name}</div>
                                <div className="student-rating">Rating: {student.currentRating || 'N/A'}</div>
                            </div>
                            <div className="actions-cell" onClick={e => e.stopPropagation()}>
                                <button onClick={() => navigate(`/student/${student._id}`)}>
                                    <i className="fas fa-eye"></i>
                                </button>
                                <button onClick={() => { setEditingStudent(student); setIsModalOpen(true); }}>
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button onClick={() => handleDelete(student._id)} className="delete-btn">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        
                        {expandedRows.has(student._id) && (
                            <div className="card-expanded-content">
                                <p><strong>Email:</strong> {student.email}</p>
                                <p><strong>Handle:</strong> {student.codeforcesHandle}</p>
                                <p><strong>Phone:</strong> {student.phone}</p>
                                <p><strong>Max Rating:</strong> {student.maxRating}</p>
                                <p><strong>Last Updated:</strong> {format(new Date(student.lastDataSync), 'PPpp')}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {isModalOpen && (
                <Modal onClose={() => { setIsModalOpen(false); setEditingStudent(null); }}>
                    <h2>{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
                    <StudentForm student={editingStudent} onSave={handleSaveStudent} onCancel={() => { setIsModalOpen(false); setEditingStudent(null); }}/>
                </Modal>
            )}
            <style jsx>{`
                .student-table-container {
                    padding: 2rem;
                    max-width: 100%;
                    box-sizing: border-box;
                }

                .table-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .header-actions {
                    display: flex;
                    gap: 1rem;
                }

                .add-btn, .download-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .button-text {
                    display: inline;
                }

                @media (max-width: 768px) {
                    .student-table-container {
                        padding: 0 1rem;
                    }

                    .button-text {
                        display: none;
                    }

                    .add-btn, .download-btn {
                        padding: 0.5rem;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .student-table thead {
                        display: none;
                    }

                    .student-table tbody tr {
                        display: block;
                        margin-bottom: 1rem;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .student-table tbody tr.expanded .mobile-expanded-content {
                        display: block;
                    }

                    .student-table tbody td {
                        display: block;
                        padding: 0.5rem;
                        text-align: right;
                        position: relative;
                    }

                    .student-table tbody td::before {
                        content: attr(data-label);
                        position: absolute;
                        left: 0;
                        width: 50%;
                        padding-left: 0.5rem;
                        font-weight: bold;
                        text-align: left;
                    }

                    .student-table tbody .actions-cell {
                        text-align: center;
                    }

                    .student-table tbody .mobile-details {
                        display: none;
                    }

                    .student-table tbody tr.expanded .mobile-details {
                        display: block;
                    }

                    .mobile-expanded-content {
                        display: none;
                        padding: 0.5rem;
                        background-color: #f9f9f9;
                    }
                }

                /* Modal Styles */
                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    padding: 1rem;
                    box-sizing: border-box;
                }

                .modal-content {
                    background: var(--modal-bg);
                    padding: 2rem;
                    border-radius: 8px;
                    width: 100%;
                    max-width: 400px;
                    position: relative;
                    box-shadow: 0 4px 12px rgba(35, 106, 242, 0.15);
                    margin: auto;
                    transform: translateY(0);
                    color: var(--text-color);
                }

                .modal-close {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-color);
                    padding: 0.5rem;
                    line-height: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    transition: background-color 0.2s;
                }

                .modal-close:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                }

                .modal-content h2 {
                    margin-top: 0;
                    margin-bottom: 1.5rem;
                    color: var(--text-color);
                    font-size: 1.5rem;
                }

                .modal-content form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .checkbox-container {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .checkbox-container input[type="checkbox"] {
                    width: auto;
                    margin-right: 0.5rem;
                }

                .checkbox-container label {
                    color: var(--text-color);
                    font-size: 0.9rem;
                }

                .modal-content label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-color);
                    font-weight: 500;
                }

                .modal-content input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--input-border);
                    border-radius: 4px;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                    background-color: var(--input-bg);
                    color: var(--text-color);
                }

                .modal-content input:focus {
                    outline: none;
                    border-color: var(--primary-blue);
                }

                .modal-content .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }

                .modal-content button[type="submit"] {
                    background-color: var(--primary-blue);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background-color 0.2s;
                }

                .modal-content button[type="submit"]:hover {
                    background-color: var(--primary-blue-hover);
                }

                .modal-content button.cancel-btn {
                    background-color: transparent;
                    color: var(--text-color);
                    border: 1px solid var(--input-border);
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background-color 0.2s;
                }

                .modal-content button.cancel-btn:hover {
                    background-color: rgba(0, 0, 0, 0.05);
                }

                @media (max-width: 768px) {
                    .modal-content {
                        padding: 1.5rem;
                        margin: 1rem;
                    }

                    .modal-content h2 {
                        font-size: 1.25rem;
                        margin-bottom: 1rem;
                    }

                    .modal-content input {
                        padding: 0.625rem;
                        font-size: 0.9375rem;
                    }

                    .modal-content .form-actions {
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .modal-content button {
                        width: 100%;
                        padding: 0.625rem;
                    }

                    .modal-close {
                        top: 8px;
                        right: 8px;
                        font-size: 1.25rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default StudentTable;