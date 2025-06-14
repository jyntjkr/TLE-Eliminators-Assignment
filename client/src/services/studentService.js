import axios from 'axios';

const API_URL = 'http://localhost:5001/api/students'; // Explicitly define the full URL

const getAllStudents = () => {
    return axios.get(API_URL);
};

const getStudent = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

const createStudent = (studentData) => {
    return axios.post(API_URL, studentData);
};

const updateStudent = (id, studentData) => {
    return axios.put(`${API_URL}/${id}`, studentData);
};

const deleteStudent = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};


export default {
    getAllStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
};