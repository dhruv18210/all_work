const axios = require('axios');
require('dotenv').config();

const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID;
const ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const FB_GRAPH_VERSION = 'v19.0';

/**
 * Post an image to Instagram using the Graph API
 * @param {string} imageUrl URL of the image to post (must be public)
 * @param {string} caption Caption for the post
 * @returns {string|null} The Media ID if successful, null if failed
 */
const postToInstagram = async (imageUrl, caption) => {
    try {
        // Step 1: Create a media container
        const containerUrl = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${IG_ACCOUNT_ID}/media`;
        const containerResponse = await axios.post(containerUrl, null, {
            params: {
                image_url: imageUrl,
                caption: caption,
                access_token: ACCESS_TOKEN
            }
        });

        const creationId = containerResponse.data.id;
        if (!creationId) {
            throw new Error('Failed to create media container');
        }
        
        console.log(`Created media container with ID: ${creationId}. Waiting 15 seconds for Meta to process it...`);

        // Workaround for Graph API "Authorization Error" (code 100 subcode 33) bug:
        // We bypass querying the status_code and instead wait 15 seconds before publishing.
        await new Promise(resolve => setTimeout(resolve, 15000));

        console.log(`Container ${creationId} processing time finished. Publishing now...`);

        // Step 2: Publish the media container
        const publishUrl = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${IG_ACCOUNT_ID}/media_publish`;
        const publishResponse = await axios.post(publishUrl, null, {
            params: {
                creation_id: creationId,
                access_token: ACCESS_TOKEN
            }
        });

        const postId = publishResponse.data.id;
        console.log(`Successfully published Instagram post with ID: ${postId}`);
        return postId;

    } catch (error) {
        console.error('Error posting to Instagram:', error.response?.data?.error || error.message);
        return null;
    }
};

/**
 * Schedule an image post to Instagram via Meta Content Planner
 * Meta requires the scheduled time to be 10 minutes – 75 days in the future.
 * @param {string} imageUrl  Publicly accessible image URL
 * @param {string} caption   Post caption
 * @param {number} unixTime  Unix timestamp (seconds) for when to publish
 * @returns {string|null}    Creation ID if successfully scheduled, null on failure
 */
const scheduleToInstagram = async (imageUrl, caption, unixTime) => {
    try {
        // Step 1: Create a scheduled media container (published=false)
        const containerUrl = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${IG_ACCOUNT_ID}/media`;
        const containerResponse = await axios.post(containerUrl, null, {
            params: {
                image_url: imageUrl,
                caption: caption,
                published: false,
                scheduled_publish_time: unixTime,
                access_token: ACCESS_TOKEN
            }
        });

        const creationId = containerResponse.data.id;
        if (!creationId) {
            throw new Error('Failed to create scheduled media container');
        }

        console.log(`Created scheduled media container with ID: ${creationId}. Waiting 15 seconds for Meta to process it...`);

        // Workaround for Graph API "Authorization Error" (code 100 subcode 33) bug:
        // We bypass querying the status_code and instead wait 15 seconds before submitting to Content Planner.
        await new Promise(resolve => setTimeout(resolve, 15000));

        console.log(`Container ${creationId} processing time finished. Submitting to Meta Content Planner...`);

        // Step 2: Submit to Meta Content Planner (triggers scheduled publish)
        const publishUrl = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${IG_ACCOUNT_ID}/media_publish`;
        const publishResponse = await axios.post(publishUrl, null, {
            params: {
                creation_id: creationId,
                access_token: ACCESS_TOKEN
            }
        });

        const scheduledId = publishResponse.data.id;
        console.log(`✅ Successfully scheduled in Meta Content Planner! ID: ${scheduledId}`);
        return scheduledId;

    } catch (error) {
        console.error('Error scheduling to Instagram:', error.response?.data?.error || error.message);
        return null;
    }
};

module.exports = {
    postToInstagram,
    scheduleToInstagram
};
