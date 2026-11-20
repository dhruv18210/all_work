require('dotenv').config();
const axios = require('axios');

async function test() {
    const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID;
    const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
    const FB_GRAPH_VERSION = 'v19.0';
    // Use a widely known public image
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png';
    
    try {
        console.log('Creating container with Wikimedia image...');
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
        for(let i=0; i<3; i++) {
            await new Promise(r => setTimeout(r, 2000));
            try {
                const statusResponse = await axios.get(`https://graph.facebook.com/${FB_GRAPH_VERSION}/${creationId}`, {
                    params: { fields: 'status_code', access_token: ACCESS_TOKEN }
                });
                console.log('Status:', statusResponse.data);
            } catch(e) {
                console.log('Status check failed:', e.response ? e.response.data.error.message : e.message);
            }
        }
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
