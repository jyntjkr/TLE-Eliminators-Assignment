import axios from 'axios';

const API_URL = 'http://localhost:5001/api/students'; // Explicitly define the full URL

// Add axios interceptor for debugging
axios.interceptors.request.use(request => {
    console.log('Starting Request:', request);
    return request;
});

axios.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.error('Response Error:', error.response || error);
        return Promise.reject(error);
    }
);

const getAllStudents = () => {
    return axios.get(API_URL);
};

const getStudent = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

const createStudent = async (studentData) => {
    try {
        console.log('Creating student with data:', studentData);
        const response = await axios.post(API_URL, studentData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Create student response:', response);
        return response;
    } catch (error) {
        console.error('Error creating student:', error.response || error);
        throw error;
    }
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