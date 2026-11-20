const { google } = require('googleapis');
const fs = require('fs');
const xlsx = require('xlsx');
require('dotenv').config();

const exportData = async () => {
    try {
        const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            'http://localhost:3000'
        );
        
        const token = fs.readFileSync('google-token.json');
        oAuth2Client.setCredentials(JSON.parse(token));
        
        const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
        
        console.log('Fetching data from Google Sheets...');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Content!A1:Q', // Fetch everything up to column Q
        });
        
        const data = response.data.values;
        if (!data || data.length === 0) {
            console.log('No data found.');
            return;
        }

        console.log(`Fetched ${data.length} rows. Writing to Excel...`);
        
        // Convert array of arrays to a worksheet
        const ws = xlsx.utils.aoa_to_sheet(data);
        
        // Create a new workbook and append the worksheet
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Content");
        
        const fileName = 'GoogleSheet_Export.xlsx';
        xlsx.writeFile(wb, fileName);
        
        console.log(`✅ Successfully exported data to ${fileName}!`);
    } catch (error) {
        console.error('❌ Error exporting data:', error.message);
    }
};

exportData();
