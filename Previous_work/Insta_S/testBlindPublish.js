require('dotenv').config();
const axios = require('axios');

async function test() {
    const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID;
    const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
    const FB_GRAPH_VERSION = 'v19.0';
    // Use the exact image the user tried
    const imageUrl = 'https://res.cloudinary.com/dcduoocev/image/upload/image3_pmvvzf.jpg';
    
    try {
        console.log('Creating container with Cloudinary .jpg image...');
        const containerUrl = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${IG_ACCOUNT_ID}/media`;
        const containerResponse = await axios.post(containerUrl, null, {
            params: {
                image_url: imageUrl,
                caption: 'Test publish bypass',
                access_token: ACCESS_TOKEN
            }
        });
        
        const creationId = containerResponse.data.id;
        console.log('Container ID:', creationId);
        
        console.log('Waiting 15 seconds without polling...');
        await new Promise(r => setTimeout(r, 15000));
        
        console.log('Publishing directly...');
        const publishUrl = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${IG_ACCOUNT_ID}/media_publish`;
        const publishResponse = await axios.post(publishUrl, null, {
            params: {
                creation_id: creationId,
                access_token: ACCESS_TOKEN
            }
        });
        console.log('Publish success! Post ID:', publishResponse.data.id);
        
    } catch (err) {
        console.log('ERROR CAUGHT:');
        if (err.response) {
            console.log(JSON.stringify(err.response.data, null, 2));
        } else {
            console.log(err.message);
        }
    }
}

test();
