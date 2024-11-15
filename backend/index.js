const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
require('dotenv').config();
const { OAuth2 } = require('google-auth-library');

const app = express();
const port = 5001;

app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });

// Function to read data from Google Sheets
const readGoogleSheet = async (sheetId) => {
    const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_API_KEY });
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Sheet1!A:D', // Adjust the range according to your sheet
    });
    return response.data.values;
};

// Function to read data from CSV
const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                fs.unlinkSync(filePath); // Delete the file after reading
                resolve(results);
            })
            .on('error', (error) => reject(error));
    });
};

// Endpoint to upload CSV
app.post('/upload-csv', upload.single('file'), async (req, res) => {
    try {
        const data = await readCSV(req.file.path);
        res.json(data);
    } catch (error) {
        res.status(500).send('Error reading CSV file: ' + error.message);
    }
});

// Endpoint to send emails
app.post('/send-emails', async (req, res) => {
    const { prompt, data, refreshToken  } = req.body;

    const transporter = await createTransporter(refreshToken);

    data.forEach(async (row) => {
        const email = row.Email; // Assuming the column name is 'Email'
        const companyName = row['Company Name']; // Adjust according to your CSV/Sheet structure
        const location = row.Location; // Adjust according to your CSV/Sheet structure

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Hello ${companyName}`,
            text: prompt.replace(/{Company Name}/g, companyName).replace(/{Location}/g, location),
        };

        await transporter.sendMail(mailOptions);
    });

    res.send('Emails sent!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});