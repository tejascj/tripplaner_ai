# Triplanner_ai
•	A web application for creating and sharing trip itineraries using MERN stack (MongoDB, Express.js, React.js, Node.js)

•	AI-powered for extracting points of interest and itinerary creation based on user input

•	The AI used in this project enable users to create a trip itinerary in just 30 seconds, a significant improvement over traditional manual planning.

•	Users can create an account and login to create and share trip itineraries with other users

• Uses imgur API to upload images to the cloud and retrieve them for display

## MongoDB
Create a MongoDB database named trip_login and in that collection named users.

## Environment Variables
Replace all the environment variables in the .env file with your own values.
### •	OpenAI variables
### OPENAI_API_kEY & OPENAI_ORGANIZATION
Create an account on OpenAI (https://platform.openai.com/account/api-keys) and get your API key and organization ID.
### •	Amadeus variables
### AMADEUS_CLIENT_ID & AMADEUS_CLIENT_SECRET
Create an account on Amadeus (https://developers.amadeus.com/get-started) and get your client ID and secret.
### •	MongoDB variables
### mongodb_url
Create an account on MongoDB (https://www.mongodb.com/cloud/atlas) and get your connection string.
### •	Email variables
### tripplanner_email & tripplanner_password
Create an account on Gmail (https://mail.google.com/mail/u/0/#inbox) and get your email and password.
### •	Imgur variables
### IMGUR_CLIENT_ID
If you want to uplaod images ananymously, no need to create an account on Imgur. Otherwise,
Create an account on Imgur (https://api.imgur.com/oauth2/addclient) and get your client ID.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `node index.js`
Runs the server in the development mode.