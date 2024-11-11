import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
    const [prompt, setPrompt] = useState('');

    const sendEmails = async () => {
        try {
            const response = await axios.post('http://localhost:5000/send-emails', { prompt });
            alert(response.data);
        } catch (error) {
            console.error('Error sending emails:', error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Email Sender</h1>
            <textarea
                rows="4"
                cols="50"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your customizable prompt here..."
            />
            <br />
            <button onClick={sendEmails}>Send Emails</button>
        </div>
    );
};

export default App;