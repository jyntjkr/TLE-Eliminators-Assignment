// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentTable from './components/StudentTable';
import StudentProfile from './components/StudentProfile';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <h1>Student Progress Management System</h1>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<StudentTable />} />
                        <Route path="/student/:id" element={<StudentProfile />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;