const cloudinary = require('cloudinary').v2;

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

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { folder = 'fitfusion_uploads', fileName, resourceType = 'auto' } = body;

    // Generate timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // Parameters to sign (these will be sent to Cloudinary)
    const paramsToSign = {
      folder,
      timestamp,
      resource_type: resourceType,
    };

    // Add public_id if fileName is provided
    if (fileName) {
      const publicId = fileName.split('.')[0]; // Remove file extension
      paramsToSign.public_id = publicId;
    }

    // Generate signature using API secret
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign, 
      process.env.CLOUDINARY_API_SECRET
    );

    // Return signature and upload parameters
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        folder,
        resourceType,
        publicId: paramsToSign.public_id,
      }),
    };
  } catch (error) {
    console.error('Signature generation error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
}; 