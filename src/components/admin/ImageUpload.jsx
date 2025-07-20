import React, { useState } from 'react';
import { Upload, X, Eye, Loader2 } from 'lucide-react';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload.js';

const ImageUpload = ({ 
  onImageUpload, 
  onImageRemove, 
  images = {}, 
  colorName = '',
  className = '',
  imageType = '' // Add imageType prop for better error handling
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
      const cloudinaryUrl = await uploadImageToCloudinary(file);
      onImageUpload(cloudinaryUrl);
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

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['front', 'back', 'detail'].map((imageType) => (
          <div key={imageType} className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 uppercase">
              {imageType} View
            </label>
            
            {images[imageType] ? (
              <div className="relative group">
                <img
                  src={images[imageType]}
                  alt={`${colorName} ${imageType}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => window.open(images[imageType], '_blank')}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="View full size"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onImageRemove(imageType)}
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
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
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
        ))}
      </div>
    </div>
  );
};

export default ImageUpload; 