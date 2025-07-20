import React, { useState } from 'react';
import { Upload, X, Eye, Loader2 } from 'lucide-react';
import { uploadImageToCloudinary, uploadImageWithDatabase } from '../../utils/cloudinaryUpload.js';

const ImageUpload = ({ 
  onImageUpload, 
  onImageRemove, 
  images = {}, 
  colorName = '',
  className = '',
  imageType = '', // Add imageType prop for better error handling
  productId = null // Add productId prop for database-aware uploads
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      console.error('File is not an image');
      return;
    }

    setUploading(true);
    try {
      let result;
      
      // Use database-aware upload if productId is provided
      if (productId) {
        // For each image type, upload and save to database
        const uploadPromises = ['front', 'back', 'detail'].map(async (imgType) => {
          if (images[imgType]) return null; // Skip if image already exists
          
          try {
            const uploadResult = await uploadImageWithDatabase(file, productId, imgType);
            return { imageType: imgType, result: uploadResult };
          } catch (error) {
            console.error(`Failed to upload ${imgType} image:`, error);
            return null;
          }
        });

        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter(r => r !== null);
        
        // Call onImageUpload for each successful upload
        successfulUploads.forEach(({ imageType, result }) => {
          onImageUpload(result.url, imageType);
        });
        
        if (successfulUploads.length === 0) {
          throw new Error('All uploads failed');
        }
      } else {
        // Fallback to simple upload for backward compatibility
        const cloudinaryUrl = await uploadImageToCloudinary(file);
        onImageUpload(cloudinaryUrl);
      }
    } catch (error) {
      console.error(`Failed to upload ${imageType} image:`, error);
      // You might want to show a toast notification here
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  // Updated component for individual image type uploads
  const renderImageUpload = (imgType) => (
    <div key={imgType} className="space-y-2">
      <label className="block text-xs font-medium text-gray-700 uppercase">
        {imgType} View
      </label>
      
      {images[imgType] ? (
        <div className="relative group">
          <img
            src={images[imgType]}
            alt={`${colorName} ${imgType}`}
            className="w-full h-32 object-cover rounded-lg border border-gray-200"
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
              <button
                type="button"
                onClick={() => window.open(images[imgType], '_blank')}
                className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                title="View full size"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => onImageRemove(imgType)}
                className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-gray-400 bg-gray-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => {
            handleDrop(e);
            // For individual image uploads, we need to know which type
            if (e.dataTransfer.files && e.dataTransfer.files[0] && productId) {
              handleSingleImageUpload(e.dataTransfer.files[0], imgType);
            }
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files[0] && productId) {
                handleSingleImageUpload(e.target.files[0], imgType);
              } else {
                handleFileInput(e);
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <div className="space-y-2">
            {uploading ? (
              <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin" />
            ) : (
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
            )}
            <div className="text-sm text-gray-600">
              {uploading ? (
                <span className="font-medium">Uploading...</span>
              ) : (
                <>
                  <span className="font-medium">Click to upload</span> or drag and drop
                </>
              )}
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Handle single image upload for specific type
  const handleSingleImageUpload = async (file, imgType) => {
    if (!file.type.startsWith('image/')) {
      console.error('File is not an image');
      return;
    }

    setUploading(true);
    try {
      if (productId) {
        const result = await uploadImageWithDatabase(file, productId, imgType);
        onImageUpload(result.url, imgType);
      } else {
        const cloudinaryUrl = await uploadImageToCloudinary(file);
        onImageUpload(cloudinaryUrl, imgType);
      }
    } catch (error) {
      console.error(`Failed to upload ${imgType} image:`, error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['front', 'back', 'detail'].map(renderImageUpload)}
      </div>
    </div>
  );
};

export default ImageUpload; 