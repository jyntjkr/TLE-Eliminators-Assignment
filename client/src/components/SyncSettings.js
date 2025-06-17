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
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../App';

const SyncSettings = () => {
    const { isDarkMode } = useContext(ThemeContext);
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

    if (loading) return <div className="loading">Loading settings...</div>;

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
                        <span className="toggle-text">Automatic Sync</span>
                        <div className="toggle-description">Enable or disable automatic synchronization of student data</div>
                        <div className="toggle-container">
                            <input
                                type="checkbox"
                                checked={settings.isEnabled}
                                onChange={handleToggle}
                                className="toggle-input"
                            />
                            <span className="toggle-slider"></span>
                        </div>
                    </label>
                </div>

                <div className="button-container">
                    <button type="submit" disabled={loading} className="action-button">
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>

            {message && <div className="message">{message}</div>}

            <style jsx>{`
                .sync-settings {
                    max-width: 600px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background: var(--card-bg);
                    border-radius: 8px;
                    box-shadow: 0 2px 4px var(--shadow-color);
                    color: var(--text-color);
                }

                .header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .header-section h2 {
                    margin: 0;
                    color: var(--text-color);
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: var(--text-color);
                }

                .form-group input[type="time"],
                .form-group select {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--input-border);
                    border-radius: 4px;
                    background-color: var(--input-bg);
                    color: var(--text-color);
                    font-size: 1rem;
                }

                .form-group input[type="time"]:disabled,
                .form-group select:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .toggle-label {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .toggle-text {
                    font-weight: 500;
                    color: var(--text-color);
                }

                .toggle-description {
                    font-size: 0.875rem;
                    color: var(--text-color);
                    opacity: 0.8;
                }

                .toggle-container {
                    position: relative;
                    display: inline-block;
                    margin-top: 0.5rem;
                }

                .toggle-input {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .toggle-slider {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                    background-color: #ccc;
                    border-radius: 12px;
                    transition: 0.3s;
                }

                .toggle-slider:before {
                    content: "";
                    position: absolute;
                    height: 20px;
                    width: 20px;
                    left: 2px;
                    bottom: 2px;
                    background-color: white;
                    border-radius: 50%;
                    transition: 0.3s;
                }

                .toggle-input:checked + .toggle-slider {
                    background-color: var(--primary-blue);
                }

                .toggle-input:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }

                .button-container {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 2rem;
                }

                .action-button {
                    background-color: var(--primary-blue);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: background-color 0.2s;
                    min-width: 120px;
                }

                .action-button:hover {
                    background-color: var(--primary-blue-hover);
                }

                .action-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .message {
                    margin-top: 1rem;
                    padding: 1rem;
                    border-radius: 4px;
                    background-color: var(--card-bg);
                    color: var(--text-color);
                    text-align: center;
                }

                .loading {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-color);
                }

                @media (max-width: 768px) {
                    .sync-settings {
                        margin: 1rem;
                        padding: 1.5rem;
                    }

                    .header-section {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: stretch;
                    }

                    .action-button {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default SyncSettings;