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

    // Generate a unique public_id if fileName is provided
    let publicId = null;
    if (fileName) {
      publicId = fileName.split('.')[0]; // Remove file extension
    }

    // Parameters to sign (these must match exactly what will be sent to Cloudinary)
    // Note: Cloudinary requires parameters to be sorted alphabetically for signing
    // resource_type is not included in the signature for uploads
    const paramsToSign = {};
    
    if (publicId) {
      paramsToSign.public_id = publicId;
    }
    
    paramsToSign.folder = folder;
    paramsToSign.timestamp = timestamp;

    // Generate signature using API secret
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign, 
      process.env.CLOUDINARY_API_SECRET
    );

    // Debug logging
    console.log('Signature generation:', {
      paramsToSign,
      signature,
      timestamp,
      publicId,
    });

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

