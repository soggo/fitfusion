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

  try {
    // Test environment variables
    const envCheck = {
      cloudinary_cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      cloudinary_api_key: !!process.env.CLOUDINARY_API_KEY,
      cloudinary_api_secret: !!process.env.CLOUDINARY_API_SECRET,
      node_env: process.env.NODE_ENV,
    };

    // Test if we can require cloudinary
    let cloudinaryStatus = 'not_loaded';
    try {
      const cloudinary = require('cloudinary').v2;
      cloudinaryStatus = 'loaded_successfully';
    } catch (error) {
      cloudinaryStatus = `failed_to_load: ${error.message}`;
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Test function working',
        timestamp: new Date().toISOString(),
        environment: envCheck,
        cloudinary: cloudinaryStatus,
        event: {
          httpMethod: event.httpMethod,
          path: event.path,
          headers: Object.keys(event.headers || {}),
          bodyLength: event.body ? event.body.length : 0,
          isBase64Encoded: event.isBase64Encoded,
        }
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
    };
  }
}; 