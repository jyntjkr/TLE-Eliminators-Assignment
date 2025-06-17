/**
 * SyncSettings Component
 * 
 * Manages the synchronization settings for student data with Codeforces:
 * - Configures automatic sync schedule (daily/weekly/monthly)
 * - Sets sync time
 * - Enables/disables automatic sync
 * - Provides manual sync trigger
 * 
 * Features:
 * - Real-time settings updates
 * - Manual sync capability
 * - Status feedback for sync operations
 * - Responsive design
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SyncSettings = () => {
    // State management for sync settings and UI controls
    const [settings, setSettings] = useState({
        cronTime: '0 2 * * *',  // Default: 2 AM daily
        frequency: 'daily',
        isEnabled: true
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [syncing, setSyncing] = useState(false);

    // Fetch current sync settings on component mount
    useEffect(() => {
        fetchSettings();
    }, []);

    // Fetch current sync settings from the API
    const fetchSettings = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/sync/settings');
            setSettings(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching sync settings:', error);
            setMessage('Error loading settings');
            setLoading(false);
        }
    };

    // Handle settings form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put('http://localhost:5001/api/sync/settings', settings);
            setMessage('Settings updated successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating settings:', error);
            setMessage('Error updating settings');
        }
        setLoading(false);
    };

    // Trigger manual sync of all student data
    const handleManualSync = async () => {
        setSyncing(true);
        setMessage('Starting global sync...');
        try {
            const response = await axios.post('http://localhost:5001/api/sync/trigger');
            setMessage('Global sync completed successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error triggering global sync:', error);
            setMessage('Error during global sync');
        }
        setSyncing(false);
    };

    // Convert time input to cron format
    const handleTimeChange = (e) => {
        const [hours, minutes] = e.target.value.split(':');
        const cronTime = `${minutes} ${hours} * * *`;
        setSettings(prev => ({ ...prev, cronTime }));
    };

    // Update sync frequency
    const handleFrequencyChange = (e) => {
        setSettings(prev => ({ ...prev, frequency: e.target.value }));
    };

    // Toggle sync enabled/disabled
    const handleToggle = () => {
        setSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
    };

    if (loading) return <div>Loading settings...</div>;

    // Convert cron time to 24-hour format for input
    const [minutes, hours] = settings.cronTime.split(' ');
    const timeValue = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

    return (
        <div className="sync-settings">
            <div className="header-section">
                <h2>Sync Settings</h2>
                <button 
                    onClick={handleManualSync} 
                    disabled={syncing}
                    className="action-button sync-button"
                >
                    {syncing ? 'Syncing...' : 'Trigger Global Sync'}
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>
                        Sync Time:
                        <input
                            type="time"
                            value={timeValue}
                            onChange={handleTimeChange}
                            disabled={!settings.isEnabled}
                        />
                    </label>
                </div>

                <div className="form-group">
                    <label>
                        Frequency:
                        <select
                            value={settings.frequency}
                            onChange={handleFrequencyChange}
                            disabled={!settings.isEnabled}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </label>
                </div>

                <div className="form-group">
                    <label className="toggle-label">
                        Enable Sync:
                        <input
                            type="checkbox"
                            checked={settings.isEnabled}
                            onChange={handleToggle}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="button-container">
                    <button type="submit" disabled={loading} className="action-button">
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>

                {message && (
                    <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
            </form>

            <style jsx>{`
                .sync-settings {
                    max-width: 600px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                h2 {
                    margin: 0;
                    color: #333;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #555;
                }

                input[type="time"],
                select {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                }

                .toggle-label {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                }

                input[type="checkbox"] {
                    display: none;
                }

                .toggle-slider {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                    background-color: #ccc;
                    border-radius: 12px;
                    margin-left: 1rem;
                    transition: 0.4s;
                }

                .toggle-slider:before {
                    content: "";
                    position: absolute;
                    height: 16px;
                    width: 16px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    border-radius: 50%;
                    transition: 0.4s;
                }

                input[type="checkbox"]:checked + .toggle-slider {
                    background-color: var(--primary-blue);
                }

                input[type="checkbox"]:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }

                .button-container {
                    display: flex;
                    justify-content: flex-start;
                    margin-top: 1rem;
                }

                .action-button {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background-color: #4a90e2;
                    color: white;
                    min-width: 120px;
                    justify-content: center;
                }

                .action-button:hover {
                    background-color: #357abd;
                }

                .action-button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
                }

                .sync-button {
                    background-color: #4CAF50;
                }

                .sync-button:hover {
                    background-color: #45a049;
                }

                .message {
                    margin-top: 1rem;
                    padding: 0.75rem;
                    border-radius: 4px;
                    text-align: center;
                }

                .message.success {
                    background-color: #e8f5e9;
                    color: #2e7d32;
                }

                .message.error {
                    background-color: #ffebee;
                    color: #c62828;
                }

                @media (max-width: 768px) {
                    .sync-settings {
                        margin: 1rem;
                        padding: 1rem;
                    }

                    .header-section {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: stretch;
                    }

                    .action-button {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default SyncSettings;