// src/App.js
/**
 * Main application component that handles routing and layout structure.
 * Sets up the navigation bar and main content area with routes for different pages.
 */
import React, { createContext, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentTable from './components/StudentTable';
import StudentProfile from './components/StudentProfile';
import SyncSettings from './components/SyncSettings';
import './App.css';

// Create theme context
export const ThemeContext = createContext();

function App() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark-mode');
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <Router>
                <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
                    {/* Navigation bar with logo and main navigation links */}
                    <nav className="navbar">
                        <div className="nav-brand">
                            <img src="/logo.svg" alt="TLE Eliminators Logo" className="logo" />
                            <span className="brand-text">TLE Eliminators</span>
                        </div>
                        <div className="nav-links">
                            <button 
                                className="theme-toggle" 
                                onClick={toggleTheme}
                                aria-label="Toggle dark mode"
                            >
                                <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                            </button>
                            {/* Link to student list page */}
                            <Link to="/" className="nav-link">
                                <span className="link-text">Students</span>
                                <i className="fas fa-users link-icon"></i>
                            </Link>
                            {/* Link to sync settings page */}
                            <Link to="/sync-settings" className="nav-link">
                                <span className="link-text">Sync</span>
                                <i className="fas fa-sync link-icon"></i>
                            </Link>
                        </div>
                    </nav>

                    {/* Main content area with route definitions */}
                    <main className="main-content">
                        <Routes>
                            {/* Route for student list table */}
                            <Route path="/" element={<StudentTable />} />
                            {/* Route for individual student profile */}
                            <Route path="/student/:id" element={<StudentProfile />} />
                            {/* Route for sync settings page */}
                            <Route path="/sync-settings" element={<SyncSettings />} />
                        </Routes>
                    </main>

                    <style jsx>{`
                        .app {
                            min-height: 100vh;
                            background-color: var(--bg-color);
                            color: var(--text-color);
                            transition: background-color 0.3s, color 0.3s;
                        }

                        .navbar {
                            background-color: var(--nav-bg);
                            padding: 1rem 2rem;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            color: white; /* Always white text in navbar */
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                            margin-bottom: 2rem; /* Add space between navbar and content */
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
                            color: white; /* Always white */
                        }

                        .nav-links {
                            display: flex;
                            gap: 1.5rem;
                            align-items: center;
                        }

                        .theme-toggle {
                            background: none;
                            border: none;
                            color: white; /* Always white */
                            font-size: 1.2rem;
                            cursor: pointer;
                            padding: 0.5rem;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: background-color 0.3s;
                        }

                        .theme-toggle:hover {
                            background-color: rgba(255, 255, 255, 0.2); /* White with transparency for hover */
                        }

                        .nav-link {
                            color: white; /* Always white */
                            text-decoration: none;
                            padding: 0.5rem 1rem;
                            border-radius: 4px;
                            transition: background-color 0.3s;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        }

                        .nav-link:hover {
                            background-color: rgba(255, 255, 255, 0.2); /* White with transparency for hover */
                        }

                        .link-icon {
                            display: none;
                        }

                        .main-content {
                            padding: 0;
                            width: 100%;
                            margin: 0 auto;
                            box-sizing: border-box;
                        }

                        @media (max-width: 768px) {
                            .navbar {
                                padding: 1rem;
                                margin-bottom: 1.5rem; /* Slightly less space on mobile */
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
        </ThemeContext.Provider>
    );
}

export default App;