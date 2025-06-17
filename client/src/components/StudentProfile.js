// src/components/StudentProfile.js
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import { format, differenceInDays } from 'date-fns';
import RatingGraph from './RatingGraph';
import SubmissionsHeatmap from './SubmissionsHeatmap';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import studentService from '../services/studentService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const PRIMARY_BLUE = 'rgb(35, 106, 242)';
const PRIMARY_BLUE_TRANSPARENT = 'rgba(35, 106, 242, 0.1)';

const StudentProfile = () => {
    const [student, setStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [contestFilter, setContestFilter] = useState(365);
    const [problemFilter, setProblemFilter] = useState(30);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchStudentData = async () => {
            setIsLoading(true);
            try {
                const response = await studentService.getStudent(id);
                setStudent(response.data.data);
            } catch (error) {
                console.error("Failed to fetch student data:", error);
            }
            setIsLoading(false);
        };
        fetchStudentData();
    }, [id]);

    const filteredContests = useMemo(() => {
        if (!student?.codeforcesData?.contests) return [];
        const now = new Date();
        return student.codeforcesData.contests
            .filter(c => differenceInDays(now, new Date(c.ratingUpdateTimeSeconds * 1000)) <= contestFilter)
            .sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds);
    }, [student, contestFilter]);

    const contestStats = useMemo(() => {
        if (!student?.codeforcesData?.submissions || !filteredContests.length) return null;

        return filteredContests.map(contest => {
            // Get all submissions for this contest
            const contestSubmissions = student.codeforcesData.submissions.filter(
                sub => sub.problem.contestId === contest.contestId
            );

            // Get unique problems attempted
            const attemptedProblems = new Set(
                contestSubmissions.map(sub => sub.problem.index)
            );

            // Get solved problems
            const solvedProblems = new Set(
                contestSubmissions
                    .filter(sub => sub.verdict === 'OK')
                    .map(sub => sub.problem.index)
            );

            // Calculate unsolved problems
            const unsolvedProblems = Array.from(attemptedProblems)
                .filter(problem => !solvedProblems.has(problem));

            return {
                ...contest,
                date: format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM d, yyyy'),
                ratingChange: contest.newRating - contest.oldRating,
                unsolvedProblems,
                totalAttempted: attemptedProblems.size,
                totalSolved: solvedProblems.size
            };
        });
    }, [student, filteredContests]);

    const problemSolvingStats = useMemo(() => {
        if (!student?.codeforcesData?.submissions) return null;
        const now = new Date();

        const solvedSubmissions = student.codeforcesData.submissions
            .filter(sub => sub.verdict === 'OK')
            .filter(sub => differenceInDays(now, new Date(sub.creationTimeSeconds * 1000)) <= problemFilter);

        if (solvedSubmissions.length === 0) {
            return {
                mostDifficult: 'N/A',
                totalSolved: 0,
                avgRating: 'N/A',
                avgPerDay: 0,
                ratingBuckets: { labels: [], datasets: [] }
            };
        }

        const uniqueProblems = Array.from(new Map(solvedSubmissions.map(sub => [sub.problem.name, sub])).values());

        const mostDifficult = uniqueProblems.reduce((max, p) => (p.problem.rating > (max.problem.rating || 0) ? p : max), { problem: { rating: 0 } });
        const totalSolved = uniqueProblems.length;
        const avgRating = Math.round(uniqueProblems.reduce((sum, p) => sum + (p.problem.rating || 0), 0) / totalSolved);
        const avgPerDay = (totalSolved / problemFilter).toFixed(2);
        
        const buckets = {};
        uniqueProblems.forEach(p => {
            if (p.problem.rating) {
                const bucket = Math.floor(p.problem.rating / 200) * 200;
                buckets[bucket] = (buckets[bucket] || 0) + 1;
            }
        });

        const sortedBucketKeys = Object.keys(buckets).sort((a,b) => a - b);
        const ratingBucketsData = {
            labels: sortedBucketKeys.map(b => `${b}-${parseInt(b, 10) + 199}`),
            datasets: [{
                label: 'Solved Problems by Rating',
                data: sortedBucketKeys.map(key => buckets[key]),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
            }]
        };

        return {
            mostDifficult: `${mostDifficult.problem.name} (${mostDifficult.problem.rating || 'Unrated'})`,
            totalSolved,
            avgRating,
            avgPerDay,
            ratingBuckets: ratingBucketsData
        };

    }, [student, problemFilter]);

    if (isLoading) return <p>Loading profile...</p>;
    if (!student) return <p>Could not load student profile.</p>;

    return (
        <div className="profile-container">
            <button className="back-button" onClick={() => navigate('/')}>&larr; Back to List</button>
            <h2>{student.name}'s Profile ({student.codeforcesHandle})</h2>
            <p>Reminder Emails Sent: {student.reminderSentCount}</p>
            
            <section className="profile-section">
                <div className="section-header">
                    <h3>Contest History</h3>
                    {isMobile ? (
                        <select 
                            value={contestFilter} 
                            onChange={(e) => setContestFilter(Number(e.target.value))}
                            className="filter-select"
                        >
                            <option value={30}>Last 30 Days</option>
                            <option value={90}>Last 90 Days</option>
                            <option value={365}>Last 365 Days</option>
                        </select>
                    ) : (
                        <div className="filter-buttons">
                            <button 
                                onClick={() => setContestFilter(30)} 
                                className={contestFilter === 30 ? 'active' : ''}
                            >
                                Last 30 Days
                            </button>
                            <button 
                                onClick={() => setContestFilter(90)} 
                                className={contestFilter === 90 ? 'active' : ''}
                            >
                                Last 90 Days
                            </button>
                            <button 
                                onClick={() => setContestFilter(365)} 
                                className={contestFilter === 365 ? 'active' : ''}
                            >
                                Last 365 Days
                            </button>
                        </div>
                    )}
                </div>
                <div className="chart-container" style={{
                    height: '400px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '1rem'
                }}>
                    {filteredContests.length > 0 ? (
                        <Line 
                            data={{
                                labels: filteredContests.map(c => 
                                    format(new Date(c.ratingUpdateTimeSeconds * 1000), 'MMM d, yyyy')
                                ),
                                datasets: [
                                    {
                                        label: 'Rating',
                                        data: filteredContests.map(c => c.newRating),
                                        borderColor: 'rgb(75, 192, 192)',
                                        tension: 0.1
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    title: {
                                        display: true,
                                        text: 'Rating Progression'
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: false,
                                        title: {
                                            display: true,
                                            text: 'Rating'
                                        }
                                    }
                                }
                            }}
                        />
                    ) : (
                        <p>No contest data for this period.</p>
                    )}
                </div>
                {contestStats && contestStats.length > 0 && (
                    <div className="contests-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Contest</th>
                                    <th>Rank</th>
                                    <th>Rating Change</th>
                                    <th>Solved/Attempted</th>
                                    <th>Unsolved Problems</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contestStats.map(contest => (
                                    <tr key={contest.contestId}>
                                        <td>{contest.date}</td>
                                        <td>
                                            <a 
                                                href={`https://codeforces.com/contest/${contest.contestId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {contest.contestName}
                                            </a>
                                        </td>
                                        <td>{contest.rank}</td>
                                        <td className={contest.ratingChange >= 0 ? 'positive' : 'negative'}>
                                            {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                                        </td>
                                        <td>{contest.totalSolved}/{contest.totalAttempted}</td>
                                        <td>
                                            {contest.unsolvedProblems.length > 0 ? (
                                                <div className="unsolved-problems">
                                                    {contest.unsolvedProblems.map(problem => (
                                                        <a
                                                            key={problem}
                                                            href={`https://codeforces.com/contest/${contest.contestId}/problem/${problem}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="problem-link"
                                                        >
                                                            {problem}
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                'All solved'
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
            
            <section className="profile-section">
                <div className="section-header">
                    <h3>Problem Solving Data</h3>
                    {isMobile ? (
                        <select 
                            value={problemFilter} 
                            onChange={(e) => setProblemFilter(Number(e.target.value))}
                            className="filter-select"
                        >
                            <option value={7}>Last 7 Days</option>
                            <option value={30}>Last 30 Days</option>
                            <option value={90}>Last 90 Days</option>
                        </select>
                    ) : (
                        <div className="filter-buttons">
                            <button 
                                onClick={() => setProblemFilter(7)} 
                                className={problemFilter === 7 ? 'active' : ''}
                            >
                                Last 7 Days
                            </button>
                            <button 
                                onClick={() => setProblemFilter(30)} 
                                className={problemFilter === 30 ? 'active' : ''}
                            >
                                Last 30 Days
                            </button>
                            <button 
                                onClick={() => setProblemFilter(90)} 
                                className={problemFilter === 90 ? 'active' : ''}
                            >
                                Last 90 Days
                            </button>
                        </div>
                    )}
                </div>
                <div className="chart-container">
                    {problemSolvingStats?.totalSolved > 0 ? (
                        <Bar 
                            data={problemSolvingStats.ratingBuckets} 
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            precision: 0
                                        }
                                    }
                                }
                            }}
                        />
                    ) : (
                        <p>No problems solved in this period.</p>
                    )}
                </div>
                {problemSolvingStats && (
                    <div className="stats-grid">
                        <div className="stat-card"><h4>Most Difficult Problem</h4><p>{problemSolvingStats.mostDifficult}</p></div>
                        <div className="stat-card"><h4>Total Solved</h4><p>{problemSolvingStats.totalSolved}</p></div>
                        <div className="stat-card"><h4>Average Rating</h4><p>{problemSolvingStats.avgRating}</p></div>
                        <div className="stat-card"><h4>Avg Problems/Day</h4><p>{problemSolvingStats.avgPerDay}</p></div>
                    </div>
                )}
            </section>

            <section className="profile-section">
                <h3>Submission Heatmap (Last Year)</h3>
                <SubmissionsHeatmap submissions={student.codeforcesData?.submissions || []} />
            </section>

            <style jsx>{`
                .profile-container {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .back-button {
                    background: ${PRIMARY_BLUE};
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-bottom: 1rem;
                    font-size: 1rem;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .filter-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .filter-buttons button {
                    background: white;
                    color: ${PRIMARY_BLUE};
                    border: 2px solid ${PRIMARY_BLUE};
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s ease;
                }

                .filter-buttons button:hover {
                    background: ${PRIMARY_BLUE_TRANSPARENT};
                }

                .filter-buttons button.active {
                    background: ${PRIMARY_BLUE};
                    color: white;
                }

                .filter-select {
                    padding: 0.5rem;
                    border: 2px solid ${PRIMARY_BLUE};
                    border-radius: 8px;
                    color: ${PRIMARY_BLUE};
                    background: white;
                    font-size: 0.9rem;
                    cursor: pointer;
                }

                .chart-container {
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    margin: 1rem auto;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .stat-card h4 {
                    color: ${PRIMARY_BLUE};
                    margin: 0 0 0.5rem 0;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-card p {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 600;
                }

                .contests-table {
                    margin-top: 2rem;
                    overflow-x: auto;
                }

                .contests-table table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 1rem;
                }

                .contests-table th,
                .contests-table td {
                    padding: 0.75rem;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                }

                .contests-table th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                }

                .contests-table tr:hover {
                    background-color: #f8f9fa;
                }

                .positive {
                    color: #28a745;
                }

                .negative {
                    color: #dc3545;
                }

                .unsolved-problems {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .problem-link {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                    color: #495057;
                    text-decoration: none;
                    font-size: 0.875rem;
                }

                .problem-link:hover {
                    background-color: #e9ecef;
                }

                @media (max-width: 768px) {
                    .profile-container {
                        padding: 1rem;
                    }

                    .section-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }

                    .filter-buttons {
                        width: 100%;
                    }

                    .filter-select {
                        width: 100%;
                    }

                    .stat-card {
                        padding: 1rem;
                    }

                    .stat-card p {
                        font-size: 1.2rem;
                    }

                    .contests-table {
                        font-size: 0.875rem;
                    }

                    .contests-table th,
                    .contests-table td {
                        padding: 0.5rem;
                    }

                    .unsolved-problems {
                        gap: 0.25rem;
                    }

                    .problem-link {
                        padding: 0.125rem 0.25rem;
                        font-size: 0.75rem;
                    }

                    .chart-container {
                        height: 300px;
                        padding: 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default StudentProfile;