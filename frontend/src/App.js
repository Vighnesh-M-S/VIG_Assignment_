// src/App.js
import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [file, setFile] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [refreshToken, setRefreshToken] = useState(''); // Store refresh token here

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handlePromptChange = (event) => {
        setPrompt(event.target.value);
    };

    const handleRefreshTokenChange = (event) => {
        setRefreshToken(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Upload CSV file
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Send the CSV file to the backend
            const response = await axios.post('http://localhost:5000/upload-csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const emailData = response.data;

            // Send emails
            await axios.post('http://localhost:5000/send-emails', {
                prompt,
                data: emailData,
                refreshToken,
            });

            alert('Emails sent successfully!');
        } catch (error) {
            console.error('Error sending emails:', error);
            alert('Error sending emails. Please try again.');
        }
    };

    return (
        <div>
            <h1>Email Sender</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Upload CSV:
                        <input type="file" onChange={handleFileChange} accept=".csv" required />
                    </label>
                </div>
                <div>
                    <label>
                        Email Prompt:
                        <textarea value={prompt} onChange={handlePromptChange} required />
                    </label>
                </div>
                <div>
                    <label>
                        Refresh Token:
                        <input type="text" value={refreshToken} onChange={handleRefreshTokenChange} required />
                    </label>
                </div>
                <button type="submit">Send Emails</button>
            </form>
        </div>
    );
}

export default App;