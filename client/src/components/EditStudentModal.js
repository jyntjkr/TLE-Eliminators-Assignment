import React, { useState, useEffect } from 'react';

const EditStudentModal = ({ student, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        codeforcesHandle: '',
        disableEmail: false,
    });

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name,
                email: student.email,
                phone: student.phone || '',
                codeforcesHandle: student.codeforcesHandle,
                disableEmail: student.disableEmail || false,
            });
        }
    }, [student]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!student) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <button className="modal-close" onClick={onCancel}>X</button>
                <h2>Edit Student</h2>
                <form onSubmit={handleSubmit}>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
                    <input name="codeforcesHandle" value={formData.codeforcesHandle} onChange={handleChange} placeholder="Codeforces Handle" required />
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
                    <div className="form-actions">
                        <button type="submit">Update Student</button>
                        <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStudentModal;