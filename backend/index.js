const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Function to read data from Google Sheets
const readGoogleSheet = async () => {
    const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_API_KEY });
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Sheet1!A1:C', // Adjust the range according to your sheet
    });
    return response.data.values;
};

// Endpoint to send emails
app.post('/send-emails', async (req, res) => {
    const { prompt } = req.body;
    const data = await readGoogleSheet();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    data.forEach(async (row) => {
        const email = row[0]; // Assuming the first column is the email address
        const name = row[1]; // Assuming the second column is the name

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Hello ${name}`,
            text: `${prompt} ${name}`,
        };

        await transporter.sendMail(mailOptions);
    });

    res.send('Emails sent!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});