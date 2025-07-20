import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import { uploadImageWithDatabase } from '../../utils/cloudinaryUpload.js';

const ImageUploadTest = () => {
  const [productId, setProductId] = useState('');
  const [imageType, setImageType] = useState('front');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const imageTypeOptions = [
    { value: 'front', label: 'Front View' },
    { value: 'back', label: 'Back View' },
    { value: 'detail', label: 'Detail View' }
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!productId.trim()) {
      toast.error('Please enter a product ID');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const result = await uploadImageWithDatabase(file, productId.trim(), imageType);
      setUploadResult(result);
      toast.success(`${imageType} image uploaded and saved to database successfully!`);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const resetTest = () => {
    setUploadResult(null);
    setError(null);
    setProductId('');
    setImageType('front');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Database-Aware Image Upload Test
      </h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product ID
          </label>
          <Input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter product UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            This should be a valid UUID from your products table
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image Type
          </label>
          <Select
            value={imageType}
            onChange={(e) => setImageType(e.target.value)}
            options={imageTypeOptions}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              {uploading ? (
                <Loader2 className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
              ) : (
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${
                  uploading ? 'pointer-events-none opacity-50' : ''
                }`}>
                  <span>Upload a file</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                    disabled={uploading}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
              {uploading && (
                <p className="text-sm text-blue-600 font-medium">
                  Uploading and saving to database...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {uploadResult && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800">Upload Successful!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p><strong>Cloudinary URL:</strong> <a href={uploadResult.url} target="_blank" rel="noopener noreferrer" className="underline">{uploadResult.url}</a></p>
                <p><strong>Public ID:</strong> {uploadResult.public_id}</p>
                <p><strong>Database Update:</strong> {uploadResult.db_update ? 'Success' : 'Failed'}</p>
              </div>
              {uploadResult.db_update && (
                <div className="mt-2 text-xs text-green-600 bg-green-100 p-2 rounded">
                  <pre>{JSON.stringify(uploadResult.db_update, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <XCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Upload Failed</h3>
              <div className="mt-1 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-4">
        <Button
          type="button"
          onClick={resetTest}
          variant="outline"
          className="flex-1"
        >
          Reset Test
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">How to Test:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>First, create a product in your database or use an existing product UUID</li>
          <li>Enter the product UUID in the Product ID field</li>
          <li>Select the image type (front, back, or detail)</li>
          <li>Upload an image file</li>
          <li>The image will be uploaded to Cloudinary and the URL will be saved to the product's images field in your database</li>
        </ol>
      </div>
    </div>
  );
};

export default ImageUploadTest; 