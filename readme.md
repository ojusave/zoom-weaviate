# Zoom Teams Chat app

This is a Node.js application that integrates with the Zoom Workplace to fetch email and calendar data, and provides a chatbot interface for querying and updating the data. The application uses the Zoom OAuth2 authentication flow to obtain access tokens and interacts with the Zoom APIs for emails, calendars, and chat messaging.

## Prerequisites

Before running the application, make sure you have the following:

- Node.js installed on your machine
- Zoom One Pro or Standard Pro, Zoom One Business or Zoom One Enterprise account
- Zoom Mail and Calendar Clients enabled with customized domains, Zoom Team Chat enabled
- End-to-end encryption disabled on Zoom Mail
- Configure the Zoom App and Chatbot
- Select the required scopes in your Zoom App

## Setup

1. Clone the repository or download the source code.
2. Navigate to the project directory.
3. In the `sample.env` file in the root directory add the values for the  environment variables. The values can be found in the Zoom Developer Portal and Weaviate Developer Portal.

4. Install the required dependencies by running `npm install`.

## Running the Application

To start the application, run the following command:

node server.js

This will start the server and listen for incoming requests on `http://localhost:4000`.

## Usage

The application provides the following functionality:

**Fetching Email and Calendar Data**

To fetch and update the email and calendar data, first create and install the application from the Zoom Marketplace.

Then send the message 'update' to your bot in your Zoom Teams Chat App

This will trigger the following actions:

- Fetch email messages and calendar events from the Zoom API
- Send the email and calendar data to the /input endpoint
- Send a notification message to the specified Zoom Team Chat

**Querying Data**

To query the data, send the message to your bot in your Zoom Teams Chat App, for example, 'where is the offsite' ?

# Code Structure
The application consists of the following files:

**auth.js** : Contains the logic for obtaining an access token from the Zoom API
**emailAPI.js** : Handles the fetching of email and calendar data, sending data to the /input endpoint, sending queries to the /query endpoint, and interacting with the Zoom Chat API.
**server.js** : Sets up the Express server and handles incoming requests.

# Dependencies
The application uses the following dependencies:

**axios**: For making HTTP requests
**dotenv**: For loading environment variables from a .env file
**express**: For setting up the server
**body-parser**: For parsing request bodies

# Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

# License
This project is licensed under the MIT License.