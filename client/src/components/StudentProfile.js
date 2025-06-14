// src/components/StudentProfile.js
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import studentService from '../services/studentService';
import { Line, Bar } from 'react-chartjs-2';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const PRIMARY_BLUE = 'rgb(35, 106, 242)';
const PRIMARY_BLUE_TRANSPARENT = 'rgba(35, 106, 242, 0.1)';

const StudentProfile = () => {
    const [student, setStudent] = useState(null);
    const [contestFilter, setContestFilter] = useState(365); // Default to 1 year
    const [problemFilter, setProblemFilter] = useState(30); // Default to 30 days
    const { id } = useParams();

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await studentService.getStudent(id);
                setStudent(response.data);
            } catch (error) {
                console.error("Failed to fetch student data:", error);
            }
        };
        fetchStudentData();
    }, [id]);

    const filteredContestData = useMemo(() => {
        if (!student) return { labels: [], datasets: [] };
        const now = new Date();
        const filterDate = new Date(now.setDate(now.getDate() - contestFilter));
        
        const filtered = student.contestHistory
            .filter(c => new Date(c.ratingUpdateTimeSeconds * 1000) >= filterDate)
            .sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds);

        return {
            labels: filtered.map(c => new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString()),
            datasets: [{
                label: 'Rating',
                data: filtered.map(c => c.newRating),
                borderColor: PRIMARY_BLUE,
                backgroundColor: PRIMARY_BLUE_TRANSPARENT,
                tension: 0.1,
                fill: true
            }],
        };
    }, [student, contestFilter]);
    
    // ... Additional logic for problem solving data would go here
    
    if (!student) return <p>Loading profile...</p>;

    return (
        <div className="profile-container">
            <h2>{student.name}'s Profile ({student.codeforcesHandle})</h2>
            
            <section className="profile-section">
                <h3>Contest History</h3>
                <div>
                    <button onClick={() => setContestFilter(30)}>Last 30 Days</button>
                    <button onClick={() => setContestFilter(90)}>Last 90 Days</button>
                    <button onClick={() => setContestFilter(365)}>Last 365 Days</button>
                </div>
                <div className="chart-container">
                    <Line 
                        data={filteredContestData}
                        options={{
                            plugins: {
                                legend: {
                                    labels: {
                                        color: PRIMARY_BLUE
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    grid: {
                                        color: PRIMARY_BLUE_TRANSPARENT
                                    },
                                    ticks: {
                                        color: PRIMARY_BLUE
                                    }
                                },
                                x: {
                                    grid: {
                                        color: PRIMARY_BLUE_TRANSPARENT
                                    },
                                    ticks: {
                                        color: PRIMARY_BLUE
                                    }
                                }
                            }
                        }}
                    />
                </div>
                {/* Contest list table would go here */}
            </section>
            
            <section className="profile-section">
                <h3>Problem Solving Data</h3>
                 {/* Problem filter buttons and calculated stats would go here */}
            </section>

             <section className="profile-section">
                <h3>Submission Heatmap</h3>
                 {/* Submission Heatmap Component would be rendered here */}
             </section>
        </div>
    );
};

export default StudentProfile;