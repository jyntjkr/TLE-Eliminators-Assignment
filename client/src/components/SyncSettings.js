import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SyncSettings = () => {
    const [settings, setSettings] = useState({
        cronTime: '0 2 * * *',
        frequency: 'daily',
        isEnabled: true
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

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

    const handleTimeChange = (e) => {
        const [hours, minutes] = e.target.value.split(':');
        const cronTime = `${minutes} ${hours} * * *`;
        setSettings(prev => ({ ...prev, cronTime }));
    };

    const handleFrequencyChange = (e) => {
        setSettings(prev => ({ ...prev, frequency: e.target.value }));
    };

    const handleToggle = () => {
        setSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
    };

    if (loading) return <div>Loading settings...</div>;

    // Convert cron time to 24-hour format for input
    const [minutes, hours] = settings.cronTime.split(' ');
    const timeValue = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;

    return (
        <div className="sync-settings">
            <h2>Sync Settings</h2>
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

                <button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Settings'}
                </button>

                {message && (
                    <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                        {message}
                    </div>
                )}
            </form>

            <style jsx>{`
                .sync-settings {
                    max-width: 500px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                h2 {
                    margin-bottom: 1.5rem;
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
                    background-color: var(--primary-blue); /* Match the button color */
                }

                input[type="checkbox"]:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }

                button {
                    width: 100%;
                    padding: 0.75rem;
                    background-color: var(--primary-blue); /* Match the download button color */
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }

                button:hover {
                    background-color: var(--primary-blue-hover); /* Hover state */
                }

                button:disabled {
                    background-color: #ccc;
                    cursor: not-allowed;
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
                }
            `}</style>
        </div>
    );
};

export default SyncSettings;