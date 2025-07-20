const cloudinary = require('cloudinary').v2;
const multiparty = require('multiparty');
const fs = require('fs');
const util = require('util');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Allow': 'POST' },
      body: 'Method Not Allowed',
    };
  }

  // Parse multipart form data
  const form = new multiparty.Form();
  const parseForm = util.promisify(form.parse);

  try {
    const [fields, files] = await parseForm({ headers: event.headers, ...event });
    const file = files.file[0];
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: 'fitfusion_uploads',
    });
    // Clean up temp file
    fs.unlinkSync(file.path);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: uploadResult.secure_url }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
}; 