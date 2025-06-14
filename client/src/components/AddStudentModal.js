import React, { useState } from 'react';

const AddStudentModal = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        codeforcesHandle: '',
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
        <div className="modal-backdrop">
            <div className="modal-content">
                <button className="modal-close" onClick={onCancel}>X</button>
                <h2>Add New Student</h2>
                <form onSubmit={handleSubmit}>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
                    <input name="codeforcesHandle" value={formData.codeforcesHandle} onChange={handleChange} placeholder="Codeforces Handle" required />
                    <div className="form-actions">
                        <button type="submit">Save Student</button>
                        <button type="button" onClick={onCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudentModal;