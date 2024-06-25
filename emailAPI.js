const axios = require('axios');
const { getAccessToken } = require('./auth');  // Assuming auth.js has a function to get the access token
require('dotenv').config();

async function handleEmailRequests() {
    const accessToken = await getAccessToken();  // Fetch the access token using the provided logic
    console.log('Fetching email messages with access token:', accessToken);

    const messagesUrl = `https://api.zoom.us/v2/emails/mailboxes/${process.env.MAILBOX_EMAIL}/messages`;

    console.log(`Requesting email messages from URL: ${messagesUrl}`);
    const messagesResponse = await axios.get(messagesUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('Received email messages response:', messagesResponse.data);

    let emailDataList = [];
    for (const msg of messagesResponse.data.messages) {
        console.log(`Fetching email detail for message ID: ${msg.id}`);
        const emailDetail = await axios.get(`${messagesUrl}/${msg.id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        }).then(res => res.data);

        const emailData = {
            date: emailDetail.internalDate,
            subject: emailDetail.payload.headers.find(header => header.name === 'Subject').value,
            content: emailDetail.snippet,
        };

        emailDataList.push(emailData);
        console.log('Fetched email detail:', emailData);
    }

    console.log('Fetched all email data:', emailDataList);
    return emailDataList;
}

async function handleCalendarRequests() {
    const accessToken = await getAccessToken();  // Fetch the access token using the provided logic
    console.log('Fetching calendar events with access token:', accessToken);

    const calendarId = process.env.MAILBOX_EMAIL;
    const eventsUrl = `https://api.zoom.us/v2/calendars/${calendarId}/events`;

    console.log(`Requesting calendar events from URL: ${eventsUrl}`);
    const eventsResponse = await axios.get(eventsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('Received calendar events response:', eventsResponse.data);

    let calendarDataList = [];
    for (const event of eventsResponse.data.items) {
        console.log(`Fetching calendar event detail for event ID: ${event.id}`);
        const eventDetail = await axios.get(`${eventsUrl}/${event.id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        }).then(res => res.data);

        const calendarData = {
            date: eventDetail.start.dateTime || eventDetail.start.date,
            eventId: eventDetail.id,
            description: eventDetail.description,
            summary: eventDetail.summary,
        };

        calendarDataList.push(calendarData);
        console.log('Fetched calendar event detail:', calendarData);
    }

    console.log('Fetched all calendar data:', calendarDataList);
    return calendarDataList;
}

async function sendEmailDataToEndpoint(emailData) {
    const url = 'https://zoomcollab.ajchan.io/input';
    const auth = {
        username: process.env.ENDPOINT_USERNAME,
        password: process.env.ENDPOINT_PASSWORD,
    };

    const dataToSend = {
        date: emailData.date,
        subject: emailData.subject,
        content: emailData.content,
        query: 'email'  // Indicating the data is from the email API
    };

    console.log('Sending email data to endpoint:', dataToSend);

    try {
        const response = await axios.post(url, dataToSend, {
            auth: auth,
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('Request to /input endpoint:', {
            url: url,
            method: 'POST',
            headers: response.config.headers,
            data: response.config.data,
        });

        if (response.status !== 200) {
            throw new Error(`Failed to send email data to /input endpoint. Status: ${response.status} ${response.statusText}`);
        }

        console.log('Response from /input endpoint:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending email data to /input endpoint:', error);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
        }
        throw error;
    }
}

async function sendCalendarDataToEndpoint(calendarData) {
    const url = 'https://zoomcollab.ajchan.io/input';
    const auth = {
        username: process.env.ENDPOINT_USERNAME,
        password: process.env.ENDPOINT_PASSWORD,
    };

    const dataToSend = {
        query: 'calendar',
        date: calendarData.date,
        eventId: calendarData.eventId,
        description: calendarData.description,
        summary: calendarData.summary,
    };

    console.log('Sending calendar data to endpoint:', dataToSend);

    try {
        const response = await axios.post(url, dataToSend, {
            auth: auth,
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('Request to /input endpoint:', {
            url: url,
            method: 'POST',
            headers: response.config.headers,
            data: response.config.data,
        });

        if (response.status !== 200) {
            throw new Error(`Failed to send calendar data to /input endpoint. Status: ${response.status} ${response.statusText}`);
        }

        console.log('Response from /input endpoint:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending calendar data to /input endpoint:', error);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
        }
        throw error;
    }
}

async function sendQueryToEndpoint(slashCommand) {
    const url = 'https://zoomcollab.ajchan.io/query';
    const auth = {
        username: process.env.ENDPOINT_USERNAME,
        password: process.env.ENDPOINT_PASSWORD,
    };

    const dataToSend = {
        message: slashCommand
    };

    console.log(`Sending query to /query endpoint with command: ${slashCommand}`);

    try {
        const response = await axios.post(url, dataToSend, {
            auth: auth,
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('Request to /query endpoint:', {
            url: url,
            method: 'POST',
            headers: response.config.headers,
            data: response.config.data,
        });

        if (response.status !== 200) {
            throw new Error(`Failed to send query data to /query endpoint. Status: ${response.status} ${response.statusText}`);
        }

        console.log('Response from /query endpoint:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query data to /query endpoint:', error);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
        }
        throw error;
    }
}

async function getChatbotToken() {
    try {
        console.log('Requesting chatbot token from Zoom');
        const response = await axios.post('https://zoom.us/oauth/token?grant_type=client_credentials', {}, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(process.env.ZOOM_CLIENT_ID + ':' + process.env.ZOOM_CLIENT_SECRET).toString('base64')
            }
        });

        if (response.status !== 200) {
            throw new Error(`Failed to get chatbot token. Status: ${response.status} ${response.statusText}`);
        }

        console.log('Chatbot token response:', response.data);
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting chatbot token:', error);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
        }
        throw error;
    }
}

async function sendChatMessage(chatbotToken, message, toJid) {
    console.log('Sending chat message to Zoom with message:', message);

    try {
        const response = await axios.post('https://api.zoom.us/v2/im/chat/messages', {
            robot_jid: process.env.ZOOM_BOT_JID,
            to_jid: toJid,
            user_jid: toJid,
            content: {
                head: {
                    text: 'Zoom Bot Response'
                },
                body: [{
                    type: 'message',
                    text: message
                }]
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + chatbotToken
            }
        });

        console.log('Request to Zoom Chat API:', {
            url: 'https://api.zoom.us/v2/im/chat/messages',
            method: 'POST',
            headers: response.config.headers,
            data: response.config.data,
        });

        if (response.status !== 200 && response.status !== 201) {
            throw new Error(`Failed to send chat message to Zoom Chat API. Status: ${response.status} ${response.statusText}`);
        }

        console.log('Response from Zoom Chat API:', response.data);
    } catch (error) {
        console.error('Error sending chat message to Zoom Chat API:', error);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response data:', error.response.data);
        }
        throw error;
    }
}


async function handleBotEvent(req, res) {
    try {
        console.log('Received bot event:', req.body);
        const event = req.body;

        if (!event) {
            throw new Error('Event data is missing.');
        }

        console.log(`Received bot event data: ${JSON.stringify(event)}`);

        if (event.event === 'bot_notification') {
            const slashCommand = event.payload.cmd;
            const toJid = event.payload.toJid;

            if (slashCommand === 'update') {
                // Step 1: Authenticate and fetch emails and calendar events concurrently
                console.log('Step 1: Authenticate and fetch emails and calendar events concurrently');
                const [emailDataList, calendarDataList] = await Promise.all([
                    handleEmailRequests(),
                    handleCalendarRequests()
                ]);

                // Step 2: Send email and calendar data to the input endpoint (continue even if this fails)
                console.log('Step 2: Send email and calendar data to the input endpoint');
                for (const emailData of emailDataList) {
                    try {
                        await sendEmailDataToEndpoint(emailData);
                    } catch (error) {
                        console.error('Continuing despite error in sending email data to /input endpoint');
                    }
                }
                for (const calendarData of calendarDataList) {
                    try {
                        await sendCalendarDataToEndpoint(calendarData);
                    } catch (error) {
                        console.error('Continuing despite error in sending calendar data to /input endpoint');
                    }
                }

                // Step 3: Get chatbot token
                console.log('Step 3: Get chatbot token');
                const chatbotToken = await getChatbotToken();

                // Step 4: Send the update message to Zoom Team Chat
                console.log('Step 4: Send the update message to Zoom Team Chat');
                const updateMessage = 'Emails and Calendar Data Updated in the backend';
                await sendChatMessage(chatbotToken, updateMessage, toJid);

                res.status(200).json({ message: 'Data updated and notification sent to Zoom Team Chat.' });
            } else {
                // For other commands, continue the original logic
                console.log('Handling other slash commands');

                // Step 3: Send the slash command query to the query endpoint
                console.log('Step 3: Send the slash command query to the query endpoint');
                const queryResponse = await sendQueryToEndpoint(slashCommand);

                // Step 4: Get chatbot token
                console.log('Step 4: Get chatbot token');
                const chatbotToken = await getChatbotToken();

                // Step 5: Send the query response to Zoom Team Chat
                console.log('Step 5: Send the query response to Zoom Team Chat');
                await sendChatMessage(chatbotToken, queryResponse.response, toJid);

                res.status(200).json({ message: 'Query processed successfully and sent to Zoom Team Chat.', response: queryResponse });
            }
        } else {
            res.status(200).send('Event received');
        }
    } catch (error) {
        console.error('Error handling bot event:', error.message);
        res.status(500).send('Error handling bot event.');
    }
}


module.exports = { handleBotEvent };
