/**
 * Upload an image file to Cloudinary via Netlify function
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The Cloudinary URL
 */
export const uploadImageToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/.netlify/functions/upload-image', {
      method: 'POST',
      body: formData,
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
 * Alternative upload function using base64 encoding
 * Use this if the FormData approach fails
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
 * @returns {Promise<Object>} - Object with image type as key and Cloudinary URL as value
 */
export const uploadMultipleImages = async (files) => {
  const uploadPromises = Object.entries(files).map(async ([imageType, file]) => {
    try {
      const url = await uploadImageToCloudinary(file);
      return [imageType, url];
    } catch (error) {
      console.error(`Failed to upload ${imageType} image:`, error);
      throw error;
    }
  });

  const results = await Promise.all(uploadPromises);
  return Object.fromEntries(results);
}; 