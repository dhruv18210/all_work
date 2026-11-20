const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(__dirname, '..', 'google-token.json');

const getOAuth2Client = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000'
    );
};

const getAuth = async () => {
    const oAuth2Client = getOAuth2Client();
    
    if (fs.existsSync(TOKEN_PATH)) {
        const token = fs.readFileSync(TOKEN_PATH);
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
    } else {
        console.error('\n❌ Google OAuth tokens not found!');
        console.error('Please run "node src/authGoogle.js" first to authenticate your Google Account.\n');
        process.exit(1);
    }
};

const getSheetsAPI = async () => {
    const auth = await getAuth();
    return google.sheets({ version: 'v4', auth });
};

/**
 * Fetch all rows from the specified range
 * @param {string} range e.g., 'Sheet1!A2:D'
 */
const getScheduledPosts = async (range = 'Sheet1!A2:D') => {
    try {
        const sheets = await getSheetsAPI();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: range,
        });
        
        return response.data.values || [];
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error.message);
        return [];
    }
};

/**
 * Update the status of a specific row
 * @param {string} cellRange e.g., 'Sheet1!D2'
 * @param {string} status 'POSTED' or 'FAILED'
 */
const updatePostStatus = async (cellRange, status) => {
    try {
        const sheets = await getSheetsAPI();
        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: cellRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[status]]
            }
        });
        console.log(`Updated status for range ${cellRange} to ${status}`);
    } catch (error) {
        console.error(`Error updating status for range ${cellRange}:`, error.message);
    }
};

module.exports = {
    getScheduledPosts,
    updatePostStatus
};
