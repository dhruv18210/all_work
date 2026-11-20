require('dotenv').config();
const axios = require('axios');

async function debugToken() {
    const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
    try {
        console.log('Debugging token...');
        const res = await axios.get(`https://graph.facebook.com/debug_token`, {
            params: {
                input_token: ACCESS_TOKEN,
                access_token: ACCESS_TOKEN // Using the same token to call debug_token might work if it's an app/page token
            }
        });
        console.log(JSON.stringify(res.data.data, null, 2));
    } catch (err) {
        console.log('Error debugging token:');
        if (err.response) {
            console.log(JSON.stringify(err.response.data, null, 2));
        } else {
            console.log(err.message);
        }
    }
}

debugToken();
