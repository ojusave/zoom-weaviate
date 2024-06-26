const axios = require('axios');
require('dotenv').config();

async function getAccessToken() {
    const response = await axios.post('https://zoom.us/oauth/token?grant_type=client_credentials', {}, {
        headers: {
            'Authorization': 'Basic ' + Buffer.from(process.env.ZOOM_CLIENT_ID + ':' + process.env.ZOOM_CLIENT_SECRET).toString('base64')
        }
    });

    if (response.status !== 200) {
        throw new Error(`Failed to get access token. Status: ${response.status} ${response.statusText}`);
    }

    console.log('Access Token Response:', response.data);
    return response.data.access_token;
}

module.exports = { getAccessToken };
