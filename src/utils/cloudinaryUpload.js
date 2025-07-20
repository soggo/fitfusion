/**
 * Upload an image file to Cloudinary using signed direct upload
 * @param {File} file - The image file to upload
 * @param {string} folder - The folder to upload to (optional)
 * @returns {Promise<string>} - The Cloudinary URL
 */
export const uploadImageToCloudinary = async (file, folder = 'fitfusion_uploads') => {
  try {
    // Step 1: Get signature from Netlify function
    const signatureResponse = await fetch('/.netlify/functions/get-cloudinary-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        folder,
        fileName: file.name,
        resourceType: 'auto',
      }),
    });

    if (!signatureResponse.ok) {
      throw new Error(`Failed to get signature: ${signatureResponse.statusText}`);
    }

    const signatureData = await signatureResponse.json();
    
    if (signatureData.error) {
      throw new Error(signatureData.error);
    }

    // Step 2: Upload directly to Cloudinary using the signature
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder);
    formData.append('resource_type', signatureData.resourceType);

    if (signatureData.publicId) {
      formData.append('public_id', signatureData.publicId);
    }

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Legacy base64 upload function (kept for backward compatibility)
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The Cloudinary URL
 */
export const uploadImageToCloudinaryBase64 = async (file) => {
  try {
    // Convert file to base64
    const fileData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await fetch('/.netlify/functions/upload-image-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileData,
        fileName: file.name,
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    return data.url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Upload multiple images and return an object with image type keys
 * @param {Object} files - Object with image type as key and File as value
 * @param {string} folder - The folder to upload to (optional)
 * @returns {Promise<Object>} - Object with image type as key and Cloudinary URL as value
 */
export const uploadMultipleImages = async (files, folder = 'fitfusion_uploads') => {
  const uploadPromises = Object.entries(files).map(async ([imageType, file]) => {
    try {
      const url = await uploadImageToCloudinary(file, folder);
      return [imageType, url];
    } catch (error) {
      console.error(`Failed to upload ${imageType} image:`, error);
      throw error;
    }
  });

  const results = await Promise.all(uploadPromises);
  return Object.fromEntries(results);
}; 