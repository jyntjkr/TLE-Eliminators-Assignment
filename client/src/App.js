// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentTable from './components/StudentTable';
import StudentProfile from './components/StudentProfile';
import SyncSettings from './components/SyncSettings';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app">
                <nav className="navbar">
                    <div className="nav-brand">
                        <img src="/logo.svg" alt="TLE Eliminators Logo" className="logo" />
                        <span className="brand-text">TLE Eliminators</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/" className="nav-link">
                            <span className="link-text">Students</span>
                            <i className="fas fa-users link-icon"></i>
                        </Link>
                        <Link to="/sync-settings" className="nav-link">
                            <span className="link-text">Sync</span>
                            <i className="fas fa-sync link-icon"></i>
                        </Link>
                    </div>
                </nav>

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<StudentTable />} />
                        <Route path="/student/:id" element={<StudentProfile />} />
                        <Route path="/sync-settings" element={<SyncSettings />} />
                    </Routes>
                </main>

                <style jsx>{`
                    .app {
                        min-height: 100vh;
                        background-color: #f5f5f5;
                    }

                    .navbar {
                        background-color: #2196F3;
                        padding: 1rem 2rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        color: white;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }

                    .nav-brand {
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }

                    .logo {
                        height: 40px;
                        width: auto;
                    }

                    .brand-text {
                        font-family: 'Outfit', sans-serif;
                        font-size: 1.5rem;
                        font-weight: 500;
                    }

                    .nav-links {
                        display: flex;
                        gap: 1.5rem;
                    }

                    .nav-link {
                        color: white;
                        text-decoration: none;
                        padding: 0.5rem 1rem;
                        border-radius: 4px;
                        transition: background-color 0.3s;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }

                    .nav-link:hover {
                        background-color: rgba(255, 255, 255, 0.1);
                    }

                    .link-icon {
                        display: none;
                    }

                    .main-content {
                        padding: 2rem;
                        max-width: 1200px;
                        margin: 0 auto;
                    }

                    @media (max-width: 768px) {
                        .navbar {
                            padding: 1rem;
                        }

                        .brand-text {
                            font-size: 1.2rem;
                        }

                        .link-text {
                            display: none;
                        }

                        .link-icon {
                            display: inline-block;
                            font-size: 1.2rem;
                        }

                        .nav-link {
                            padding: 0.5rem;
                        }
                    }
                `}</style>
            </div>
        </Router>
    );
}

export default App;