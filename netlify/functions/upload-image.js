const cloudinary = require('cloudinary').v2;
const multiparty = require('multiparty');
const fs = require('fs');

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
    // Log environment variables for debugging (remove in production)
    console.log('Cloudinary config check:', {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
    });

    // Parse multipart form data
    const form = new multiparty.Form();
    
    // Create a mock request object that multiparty expects
    const mockReq = {
      headers: event.headers,
      body: Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'),
      method: event.httpMethod,
      url: event.path,
    };

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(mockReq, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    if (!files.file || !files.file[0]) {
      throw new Error('No file provided');
    }

    // Get product_id and image_type from form fields
    const product_id = fields.product_id && fields.product_id[0];
    const image_type = fields.image_type && fields.image_type[0];
    if (!product_id || !image_type) {
      throw new Error('Missing product_id or image_type in form fields');
    }

    const file = files.file[0];
    
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: 'fitfusion_uploads',
      resource_type: 'auto', // Automatically detect file type
    });
    
    // Clean up temp file
    try {
      fs.unlinkSync(file.path);
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError);
    }

    // Dynamically import the ESM Supabase client
    const { supabase } = await import('./utils/supabase.js');

    // Fetch current images object for the product
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('images')
      .eq('id', product_id)
      .single();
    if (fetchError) {
      throw new Error('Failed to fetch product images: ' + fetchError.message);
    }
    const currentImages = product?.images || {};

    // Update the relevant key in the images object
    currentImages[image_type] = {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    };

    // Save updated images object back to Supabase
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({ images: currentImages })
      .eq('id', product_id)
      .select();
    if (updateError) {
      throw new Error('Failed to update product images: ' + updateError.message);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        db_update: updateData
      }),
    };
  } catch (error) {
    console.error('Upload error:', error);
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