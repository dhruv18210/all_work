const axios = require('axios');

async function checkImg() {
    try {
        const res = await axios.head('https://res.cloudinary.com/dcduoocev/image/upload/image3_pmvvzf.jpg');
        console.log('Status:', res.status);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Content-Length:', res.headers['content-length']);
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.log('Headers:', err.response.headers);
        }
    }
}

checkImg();
