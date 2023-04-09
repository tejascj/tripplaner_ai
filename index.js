const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3001;
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();


const pdf = require('pdf-creator-node');

const nodemailer = require('nodemailer');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');


app.use(bodyParser.json());
app.use(cors());
const MongoClient = require('mongodb').MongoClient;
const url = process.env.mongodb_url;
const options = { useNewUrlParser: true, useUnifiedTopology: true };
const mongoose = require('mongoose');
const dbName = 'trip_login';

// pdf creator
app.post('/pdfbooking', async (req, res) => {
  console.log("Generating PDF...")
  // Get data from request body
  const { usermail, airline, flightNumber, departureDate, arrivalDate, arrivalairport, departureairport, flightcode, people, contact, email, baseprice, tax, totalprice, confirmationId, ticketPNR, cardname, cardnumber, passengers, bookingDate } = req.body;

  // Read HTML template
  const template = fs.readFileSync('./PDF/prac.html', 'utf8')

  // Define options for PDF generation
  const options = {
    format: "A3",
    orientation: "portrait",
    border: "10mm",
    header: {
      height: "20mm"
    },
    footer: {
      height: "10mm",
      contents: {
        first: '1',
        2: '2', // Any page number is working. 1-based index
        default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
        last: 'Last Page'
      }
    }
  };

  // Define data for PDF generation
  const passengersWithIndex = passengers.map((passenger, index) => ({ ...passenger, index: index + 1 }));
  const data = {
    usermail,
    airline,
    flightNumber,
    departureDate,
    arrivalDate,
    arrivalairport,
    departureairport,
    flightcode,
    people,
    passengersWithIndex,
    contact,
    email,
    baseprice,
    tax,
    totalprice,
    confirmationId,
    ticketPNR,
    cardname,
    cardnumber,
    bookingDate,
  };

  const document = {
    html: template,
    data,
    path: `./pdf/${confirmationId}-booking-confirmation.pdf`,
    type: "",
  };

  // Generate PDF using pdf-creator-node
  pdf.create(document, options)
    .then(pdfBuffer => {
      // Send PDF as attachment in response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${email}-booking-confirmation.pdf"`);
      console.log("PDF generated.")
      res.send(pdfBuffer);

      // Send email with PDF attachment
      sendMail(document.path, email);
      // Update user bookings
      updateBooking(usermail, document.path, confirmationId, bookingDate, departureairport, arrivalairport);
      console.log({ usermail, confirmationId, bookingDate, departureairport, arrivalairport })
    })
    .catch(error => {
      // Send error response to client
      console.log(error);
      res.status(500).send('Error generating PDF');
    });
});

const sendMail = async (filePath, email) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.tripplanner_email,
      pass: process.env.tripplanner_password,
    },
  });

  const mailOptions = {
    from: process.env.tripplanner_email,
    to: email,
    subject: 'Booking Confirmation',
    text: 'Please find the booking confirmation attached.',
    attachments: [{ filename: 'booking-confirmation.pdf', path: filePath }],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent.');
  } catch (error) {
    console.log('Error sending booking confirmation email:', error.message);
  }
};

const updateBooking = async (usermail, filePath, confirmationId, bookingDate, departureairport, arrivalairport) => {
  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(url, options);
    const db = client.db('trip_login');
    const collection = db.collection('users');
    // console.log(usermail)
    const user = await collection.findOneAndUpdate(
      { email: usermail },
      {
        $push: {
          bookings: {
            filePath: filePath, confirmationId: confirmationId, bookingDate: bookingDate, departureairport: departureairport, arrivalairport: arrivalairport
          }
        }
      },
      { returnOriginal: false }
    );
    // console.log('User bookings updated:', user);
    client.close();
  } catch (error) {
    console.log('Error updating user bookings:', error.message);
  }
};

const PDF_DIR = path.join(__dirname, '.', 'PDF');

app.get('/pdf/:confirmationId', (req, res) => {
  const confirmationId = req.params.confirmationId;
  const pdfPath = path.join(PDF_DIR, `${confirmationId}-booking-confirmation.pdf`);

  fs.readFile(pdfPath, (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.sendStatus(404);
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${confirmationId}-booking-confirmation.pdf"`);
    res.send(data);
  });
});


app.post('/update-user-itinerary', async (req, res) => {
  const { destination, days, email, openAiResponse, pointOfInterestLinks } = req.body;
  console.log("Updating user itinerary...")
  try {
    const client = await MongoClient.connect(url, options);
    const db = client.db('trip_login');
    const collection = db.collection('users');

    const result = await collection.findOneAndUpdate(
      { email: email },
      {
        $push: {
          queries: {
            destination: destination,
            days: days,
            openAiResponse: openAiResponse,
            pointsOfInterestLinks: pointOfInterestLinks,
            timestamp: new Date()
          }
        }
      },
      { returnOriginal: false }
    );

    res.send({ message: 'User document updated.' });
    console.log("User document updated.")
    client.close();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error updating user document.' });
  }
});
app.get('/get-user-itineraries', async (req, res) => {
  const { email } = req.query;
  console.log("Getting user itineraries...");
  try {
    const client = await MongoClient.connect(url, options);
    const db = client.db('trip_login');
    const collection = db.collection('users');
    const itineraries = await collection.find({ email: email }).toArray();
    console.log("User itineraries retrieved.");
    res.send(itineraries);
    client.close();
  }
  catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error getting user document.' });
  }
});

// Get user bookings
app.get('/get-user-bookings', async (req, res) => {
  const { email } = req.query;
  console.log("Getting user bookings...");
  try {
    const client = await MongoClient.connect(url, options);
    const db = client.db('trip_login');
    const collection = db.collection('users');
    const bookings = await collection.find({ email: email }).toArray();
    console.log("User bookings retrieved.");
    res.send(bookings);
    client.close();
  }
  catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error getting user document.' });
  }
});

// Login function
async function login(email, password) {
  const client = await MongoClient.connect(url, options);
  const db = client.db('trip_login');
  const collection = db.collection('users');
  const user = await collection.findOne({ email, password });
  client.close();
  return user;
}
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const validate = await login(email, password);
  if (validate) {
    res.json({
      status: 'success',
      userID: validate.userID,
      name: validate.name,
      email: validate.email,
      password: validate.password,
    });
  } else {
    res.json({ status: 'Invalid Us' });
  }
});

// Register function
async function register(name, email, password) {
  const client = await MongoClient.connect(url, options);
  const db = client.db('trip_login');
  const collection = db.collection('users');
  const reg = await collection.insertOne({ name, email, password });
  client.close();
  return reg;
}
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const validate = await register(name, email, password);
  if (validate) {
    res.json({
      status: 'success',
      name: validate.name,
      email: validate.email,
      password: validate.password,
    });
  } else {
    res.json({ status: 'error' });
  }
});


var Amadeus = require('amadeus');
var amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

const OpenAI = require('openai');
const { Configuration, OpenAIApi } = OpenAI

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);



app.post('/openai', async (req, res) => {
  const { destination, days } = req.body;

  // Generate response from OpenAI
  const openAiResponse = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `You are a travel guide that knows everything about ${destination}. I am a tourist who has never visited ${destination}. What is an ideal itinerary for ${days} days in ${destination} that includes all the city's main attractions, some historic and some adventerous? Break out your receommendation for each day into morning, afternoon and evening activities. Always keep itineraries to under 500 words.`,
    max_tokens: 1000,
    temperature: 0
  });
  const itinerary = openAiResponse.data.choices[0];
  const pointsOfInterestPrompt = 'Extract the points of interest out of this text, with no additional words, separated by commas: ' + itinerary.text;
  // Log OpenAI response
  // console.log(openAiResponse.data);
  // console.log(itinerary.text);
  // Send OpenAI response to the frontend
  res.json({ openAiResponse: openAiResponse.data, pointsOfInterestPrompt });
});

app.post('/flight', async (req, res) => {
  const { flight1, flight2, date, people } = req.body;

  // Get response from Amadeus API
  const amadeusResponse = await amadeus.shopping.flightOffersSearch.get({
    originLocationCode: flight1,
    destinationLocationCode: flight2,
    departureDate: date,
    adults: people,
    max: '3',
    currencyCode: "INR"
  });

  // Log Amadeus response
  // console.log(amadeusResponse.data);

  // Send Amadeus response to the frontend
  res.json(amadeusResponse.data);
});

// Get points of interest from OpenAI
app.post('/get-points-of-interest', async (req, res) => {
  const { pointsOfInterestPrompt } = req.body;

  // Call OpenAI API to extract points of interest
  const openAiResponse = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: pointsOfInterestPrompt,
    max_tokens: 300,
    temperature: 0
  });
  // console.log(openAiResponse.data);
  let pointsOfInterest = openAiResponse.data.choices[0].text.split('\n');
  pointsOfInterest = pointsOfInterest[pointsOfInterest.length - 1];
  pointsOfInterest = pointsOfInterest.split(',');
  const pointsOfInterestArray = pointsOfInterest.map(i => i.trim());
  // console.log("POI:", pointsOfInterestArray);
  res.status(200).json({
    pointsOfInterest: JSON.stringify(pointsOfInterestArray)
  });
});

// generate itinerary as image and upload it to imgur and return the link by using canvas for image generation and imgur api for uploading the image
app.post('/create-image', async (req, res) => {
  const { destination, openairesponse } = req.body;
  console.log(openairesponse);


  const formattedText = openairesponse
    .split('Day ')
    .filter(day => day.trim() !== '')
    .map(day => {
      const dayParts = day.split('\n');
      const dayTitle = `Day ${dayParts[0].trim()}`;
      const activities = dayParts.slice(1)
        .filter(activity => activity.trim() !== '')
        .map(activity => activity.trim());
      return {
        day: dayTitle,
        activities
      };
    });



  console.log(formattedText);

  try {
    // Load background image
    const backgroundImage = await loadImage('./image/background.png');

    // Create canvas
    const canvas = createCanvas(backgroundImage.width, backgroundImage.height);
    const context = canvas.getContext('2d');

    // Draw background image
    context.drawImage(backgroundImage, 0, 0);

    // Set font properties
    context.textAlign = 'center';
    // Set canvas border properties

    // Set title text
    context.font = '100px Sans  bold';
    const title = `Trip to ${destination}`;
    const titleWidth = context.measureText(title).width;
    context.fillStyle = '#FFFFFF';
    context.fillText(title, canvas.width / 2, 100);

    // Set content text and set the content width as the max width of the canvas
    const content = formattedText;
    context.fillStyle = '#FFFFFF';

    let y = 200;
    let dayFontSize = 50;
    let activityFontSize = 40;
    const contentWidth = canvas.width - 100;
    if (content.length > 4) {
      dayFontSize = 40;
      activityFontSize = 30;
    }

    for (let i = 0; i < content.length; i++) {
      context.font = `bold ${dayFontSize}px Sans `;
      context.fillText(content[i].day, canvas.width / 2, y);

      y += dayFontSize;
      context.font = `normal ${activityFontSize}px Sans `;
      for (let j = 0; j < content[i].activities.length; j++) {
        const activity = content[i].activities[j];
        const words = activity.split(' ');

        const lines = [];
        let currentLine = words[0];

        for (let k = 1; k < words.length; k++) {
          const word = words[k];
          const testLine = currentLine + ' ' + word;
          const testLineWidth = context.measureText(testLine).width;
          if (testLineWidth > contentWidth) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        const lineHeight = activityFontSize;
        for (let k = 0; k < lines.length; k++) {
          context.fillText(lines[k], canvas.width / 2, y);
          y += lineHeight;
        }
      }

      y += dayFontSize;
    }


    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/jpeg');
    console.log('image saved')
    fs.writeFileSync('image.png', buffer);
    var request = require('request');
    var options = {
      'method': 'POST',
      'url': 'https://api.imgur.com/3/image',
      'headers': {
        'Authorization': 'Client-ID ee5e8f6eea109f4'
      },
      formData: {
        'image': {
          value: buffer,
          options: {
            filename: 'image.png',
            contentType: 'image/png'
          }
        }
      }
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body.link);
      res.status(200).json({
        image: JSON.parse(response.body).data.link
      });
    });
    fs.unlinkSync('image.png');
  } catch (error) {
    console.log(error);
  }
});

// say hello to the user
app.get('/hello', (req, res) => {
  res.send('Hello World!')
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
}); 