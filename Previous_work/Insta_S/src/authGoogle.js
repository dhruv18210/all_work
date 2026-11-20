const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
require('dotenv').config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(__dirname, '..', 'google-token.json');
const REDIRECT_URI = 'http://localhost:3000';

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
);

const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
});

console.log('====================================================');
console.log('🔗 GOOGLE ACCOUNT AUTHENTICATION REQUIRED');
console.log('====================================================\n');
console.log('Please authorize this app by visiting this URL in your browser:\n');
console.log(authUrl);
console.log('\nWaiting for you to log in...');

const server = http.createServer(async (req, res) => {
    const parsedUrl = new url.URL(req.url, 'http://localhost:3000');
    const code = parsedUrl.searchParams.get('code');
    
    if (code) {
        try {
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
            
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>Authentication successful!</h1><p>You can close this tab and return to your terminal.</p>');
            
            console.log('\n✅ Token stored successfully to google-token.json');
            console.log('✅ You can now start the scheduler by running: npm start\n');
            server.close();
            process.exit(0);
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<h1>Error retrieving access token</h1><p>' + error.message + '</p>');
            console.error('\n❌ Error retrieving access token', error);
            server.close();
            process.exit(1);
        }
    } else {
        res.writeHead(404);
        res.end('Invalid request. No code found in URL.');
    }
});

server.listen(3000, () => {
    // Server is listening
});
