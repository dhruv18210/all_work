require('dotenv').config();
const axios = require('axios');

async function test() {
    const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID;
    const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
    const FB_GRAPH_VERSION = 'v19.0';
    // Use a standard placeholder image guaranteed to work
    const imageUrl = 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80.jpg';
    
    try {
        console.log('Creating container with Unsplash image...');
        const containerUrl = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${IG_ACCOUNT_ID}/media`;
        const containerResponse = await axios.post(containerUrl, null, {
            params: {
                image_url: imageUrl,
                caption: 'Test caption',
                access_token: ACCESS_TOKEN
            }
        });
        
        const creationId = containerResponse.data.id;
        console.log('Container ID:', creationId);
        
        console.log('Checking status...');
        const statusResponse = await axios.get(`https://graph.facebook.com/${FB_GRAPH_VERSION}/${creationId}`, {
            params: { fields: 'status_code', access_token: ACCESS_TOKEN }
        });
        
        console.log('Status:', statusResponse.data);
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
