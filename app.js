const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const multer = require('multer');

const app = express();

// OAuth2 credentials
const CLIENT_ID = '893688586645-j4l6orfehb0fn5fltneq1e3djcti894a.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URL = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//040qbxBqSIRZZCgYIARAAGAQSNwF-L9IrhWNwd90mCAED0Axa0zTWr72szExatEOD6tW39n6-FVG2OdB3ZM-Ot6bDOMQCRIcXFEE';

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Initialize Google Drive API
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Set up multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Route for uploading files
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const fileMetadata = {
    'name': file.originalname
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path)
  };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });
    fs.unlinkSync(file.path); // Delete the temporary file
    res.json({ webViewLink: response.data.webViewLink });
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).json({ error: 'An error occurred while uploading the file.' });
  }
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
