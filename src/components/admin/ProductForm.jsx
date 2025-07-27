import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Save, 
  X, 
  Upload, 
  Plus, 
  Trash2,
  Eye,
  Star,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import { uploadImageToCloudinary, uploadImageWithDatabase } from '../../utils/cloudinaryUpload.js';
import { productService } from '../../services/productService.js';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [images, setImages] = useState([]);
  const [customImageTypes, setCustomImageTypes] = useState({}); // Track custom image types per color
  const [stock, setStock] = useState({
    XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0
  });
  const [colorStock, setColorStock] = useState({});
  const [uploadingImages, setUploadingImages] = useState({});
  const [currentProductId, setCurrentProductId] = useState(null); // Track current product ID
  const [dragStates, setDragStates] = useState({}); // Track drag states for each upload area

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      subcategory: '',
      sizes: [],
      isNew: false,
      onSale: false,
      featured: false
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadProduct();
    }
  }, [isEditing, id]);

  const loadCategories = async () => {
    try {
      const categoriesData = await productService.getAllCategories();
      const categoryOptions = categoriesData.map(cat => ({
        value: cat.id,
        label: cat.name
      }));
      setCategories(categoryOptions);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Fallback to mock categories
      setCategories([
        { value: 'tops', label: 'Tops' },
        { value: 'bottoms', label: 'Bottoms' },
        { value: 'sets', label: 'Sets' }
      ]);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const product = await productService.getProductById(id);
      
      // Set the current product ID for image uploads
      setCurrentProductId(id);
      
      // Transform product data for form (snake_case -> camelCase)
      const formData = {
        name: product.name,
        description: product.description || '',
        price: (product.price / 100).toString(), // Convert from cents
        originalPrice: product.original_price ? (product.original_price / 100).toString() : '',
        category: product.category_id,
        subcategory: product.subcategory || '',
        sizes: product.sizes || [],
        isNew: product.is_new || false,
        onSale: product.on_sale || false,
        featured: product.featured || false
      };
      
      reset(formData);
      setColors(product.colors || []);
      setStock(product.stock || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
      setColorStock(product.colorstock || {}); // all lowercase from database
      
      // Extract custom image types from existing product
      const customTypes = {};
      if (product.colors) {
        product.colors.forEach((color, colorIndex) => {
          if (color.images) {
            const customImageTypes = Object.keys(color.images).filter(
              type => !['front', 'back', 'detail'].includes(type)
            );
            if (customImageTypes.length > 0) {
              customTypes[colorIndex] = customImageTypes;
            }
          }
        });
      }
      setCustomImageTypes(customTypes);
      
    } catch (error) {
      console.error('Failed to load product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event, colorIndex, imageType) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const uploadKey = `${colorIndex}-${imageType}`;
    setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));

    try {
      let cloudinaryUrl;
      
      // Use database-aware upload if we have a product ID (for existing products)
      if (currentProductId) {
        const result = await uploadImageWithDatabase(file, currentProductId, imageType);
        cloudinaryUrl = result.url;
        toast.success(`${imageType} image uploaded and saved to database!`);
      } else {
        // For new products, use simple upload (will be saved to DB when product is created)
        cloudinaryUrl = await uploadImageToCloudinary(file);
        toast.success(`${imageType} image uploaded successfully!`);
      }
      
      const newColors = [...colors];
      if (!newColors[colorIndex]) {
        newColors[colorIndex] = { name: '', hex: '#000000', images: {} };
      }
      newColors[colorIndex].images[imageType] = cloudinaryUrl;
      setColors(newColors);
      
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(`Failed to upload ${imageType} image. Please try again.`);
    } finally {
      setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e, colorIndex, imageType) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 Drag enter:', colorIndex, imageType);
    const dragKey = `${colorIndex}-${imageType}`;
    setDragStates(prev => ({ ...prev, [dragKey]: true }));
  };

  const handleDragOver = (e, colorIndex, imageType) => {
    e.preventDefault();
    e.stopPropagation();
    // Keep the drag state active
  };

  const handleDragLeave = (e, colorIndex, imageType) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🚪 Drag leave:', colorIndex, imageType);
    const dragKey = `${colorIndex}-${imageType}`;
    setDragStates(prev => ({ ...prev, [dragKey]: false }));
  };

  const handleDrop = (e, colorIndex, imageType) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('📦 Drop:', colorIndex, imageType, e.dataTransfer.files.length);
    const dragKey = `${colorIndex}-${imageType}`;
    setDragStates(prev => ({ ...prev, [dragKey]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Create a synthetic event to mimic file input change
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files
        }
      };
      handleImageUpload(syntheticEvent, colorIndex, imageType);
    }
  };

  const addColor = () => {
    setColors([...colors, { name: '', hex: '#000000', images: {} }]);
  };

  const addCustomImageType = (colorIndex) => {
    const existingTypes = customImageTypes[colorIndex] || [];
    const nextNumber = existingTypes.length + 1;
    const newType = `additional_${nextNumber}`;
    
    setCustomImageTypes(prev => ({
      ...prev,
      [colorIndex]: [...(prev[colorIndex] || []), newType]
    }));
  };

  const removeCustomImageType = (colorIndex, imageType) => {
    setCustomImageTypes(prev => ({
      ...prev,
      [colorIndex]: (prev[colorIndex] || []).filter(type => type !== imageType)
    }));
    
    // Also remove the image if it exists
    const newColors = [...colors];
    if (newColors[colorIndex]?.images[imageType]) {
      delete newColors[colorIndex].images[imageType];
      setColors(newColors);
    }
  };

  const removeColor = (index) => {
    const colorToRemove = colors[index];
    if (colorToRemove && colorToRemove.name) {
      const newColorStock = { ...colorStock };
      delete newColorStock[colorToRemove.name];
      setColorStock(newColorStock);
    }
    setColors(colors.filter((_, i) => i !== index));
  };

  const updateColor = (index, field, value) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setColors(newColors);
  };

  const handleSizeChange = (sizeValue, isChecked) => {
    const currentSizes = watch('sizes') || [];
    let newSizes;
    
    if (isChecked) {
      // Add size if not already present
      newSizes = currentSizes.includes(sizeValue) ? currentSizes : [...currentSizes, sizeValue];
    } else {
      // Remove size and set quantity to 0
      newSizes = currentSizes.filter(size => size !== sizeValue);
      setStock({
        ...stock,
        [sizeValue]: 0
      });
    }
    
    setValue('sizes', newSizes);
  };

  const handleColorStockChange = (colorName, quantity) => {
    setColorStock({
      ...colorStock,
      [colorName]: parseInt(quantity) || 0
    });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Validate colors
      if (colors.length === 0) {
        toast.error('Please add at least one color');
        return;
      }
      
      // Prepare images object for the first color (as per your database schema)
      const firstColorImages = colors[0]?.images || {};
      
      // Map form data to database column names (camelCase -> snake_case)
      const productData = {
        name: data.name,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: data.description,
        price: parseInt(data.price) * 100, // Convert to cents
        original_price: data.originalPrice ? parseInt(data.originalPrice) * 100 : null,
        category_id: data.category, // Form sends category, DB expects category_id
        subcategory: data.subcategory,
        sizes: Array.isArray(data.sizes) ? data.sizes : [],
        colors,
        stock,
        colorstock: colorStock, // all lowercase for database
        images: firstColorImages, // Store first color images in products.images field
        is_new: data.isNew || false,
        on_sale: data.onSale || false,
        featured: data.featured || false
      };
      
      if (isEditing) {
        // Update existing product
        await productService.updateProduct(currentProductId, productData);
        toast.success('Product updated successfully!');
      } else {
        // Create new product
        const newProduct = await productService.createProduct(productData);
        toast.success('Product created successfully!');
      }
      
      navigate('/admin/products');
      
    } catch (error) {
      toast.error('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sizeOptions = [
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' }
  ];

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update product information' : 'Create a new product for your store'}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/products')}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <Input
                {...register('name', { required: 'Product name is required' })}
                placeholder="Enter product name"
                error={errors.name?.message}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <Select
                {...register('category', { required: 'Category is required' })}
                error={errors.category?.message}
                options={categories}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₦) *
              </label>
              <Input
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                type="number"
                placeholder="0"
                error={errors.price?.message}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (₦)
              </label>
              <Input
                {...register('originalPrice')}
                type="number"
                placeholder="0"
                error={errors.originalPrice?.message}
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter product description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Product Options */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Sizes & Stock
              </label>
              <div className="space-y-3">
                {sizeOptions.map((size) => (
                  <div key={size.value} className="flex items-center space-x-3">
                    <label className="flex items-center min-w-[60px]">
                      <input
                        type="checkbox"
                        value={size.value}
                        checked={(watch('sizes') || []).includes(size.value)}
                        onChange={(e) => handleSizeChange(size.value, e.target.checked)}
                        className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">{size.label}</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Qty:</span>
                      <input
                        type="number"
                        min="0"
                        value={stock[size.value] || 0}
                        onChange={(e) => setStock({
                          ...stock,
                          [size.value]: parseInt(e.target.value) || 0
                        })}
                        disabled={!(watch('sizes') || []).includes(size.value)}
                        className="w-16 h-8 px-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Status
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isNew')}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mark as New</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('onSale')}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">On Sale</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('featured')}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Colors and Images */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Colors & Images</h2>
          </div>
          
          <div className="space-y-6">
            {colors.map((color, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900">Color {index + 1}</h3>
                  <Button
                    type="button"
                    onClick={() => removeColor(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color Name
                    </label>
                    <Input
                      value={color.name}
                      onChange={(e) => updateColor(index, 'name', e.target.value)}
                      placeholder="e.g., Black, Navy"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color Hex
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateColor(index, 'hex', e.target.value)}
                        className="h-10 w-16 border border-gray-300 rounded"
                      />
                      <Input
                        value={color.hex}
                        onChange={(e) => updateColor(index, 'hex', e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Quantity
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={colorStock[color.name] || 0}
                      onChange={(e) => handleColorStockChange(color.name, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {/* Image Upload */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Images
                      {index > 0 && (
                        <span className="text-xs text-gray-500 ml-2">(Detail view only for additional colors)</span>
                      )}
                    </label>
                    {index === 0 && (
                      <Button
                        type="button"
                        onClick={() => addCustomImageType(index)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Image Slot
                      </Button>
                    )}
                  </div>
                  
                  {/* Default Images Grid */}
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                    {(() => {
                      // Get default image types for this color
                      const defaultTypes = index === 0 ? ['front', 'back', 'detail'] : ['detail'];
                      
                      return defaultTypes.map((imageType) => (
                        <div key={imageType} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                              {imageType} View
                            </label>
                          </div>
                          <div className="relative group">
                            {color.images[imageType] ? (
                              <div className="relative">
                                <img
                                  src={color.images[imageType]}
                                  alt={`${color.name} ${imageType}`}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                />
                                
                                {/* Delete button - always visible on hover */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newColors = [...colors];
                                    delete newColors[index].images[imageType];
                                    setColors(newColors);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                
                                {/* Replace input overlay */}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, index, imageType)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  disabled={uploadingImages[`${index}-${imageType}`]}
                                  onDragEnter={(e) => handleDragEnter(e, index, imageType)}
                                  onDragLeave={(e) => handleDragLeave(e, index, imageType)}
                                  onDragOver={(e) => handleDragOver(e, index, imageType)}
                                  onDrop={(e) => handleDrop(e, index, imageType)}
                                />
                                
                                {/* Drag feedback */}
                                {dragStates[`${index}-${imageType}`] && (
                                  <div className="absolute inset-0 bg-blue-500 bg-opacity-30 rounded-lg flex items-center justify-center">
                                    <div className="text-white text-center">
                                      <Upload className="h-8 w-8 mx-auto mb-2" />
                                      <div className="text-sm font-medium">Drop to replace</div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Hover hint */}
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to replace
                                </div>
                              </div>
                            ) : (
                              <label 
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                                  uploadingImages[`${index}-${imageType}`] ? 'pointer-events-none opacity-50' : ''
                                } ${
                                  dragStates[`${index}-${imageType}`] 
                                    ? 'border-blue-400 bg-blue-50' 
                                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                                onDragEnter={(e) => handleDragEnter(e, index, imageType)}
                                onDragLeave={(e) => handleDragLeave(e, index, imageType)}
                                onDragOver={(e) => handleDragOver(e, index, imageType)}
                                onDrop={(e) => handleDrop(e, index, imageType)}
                              >
                                {uploadingImages[`${index}-${imageType}`] ? (
                                  <div className="flex flex-col items-center">
                                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                                    <span className="text-xs text-blue-600 mt-1 font-medium">Uploading...</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <Upload className={`h-6 w-6 ${
                                      dragStates[`${index}-${imageType}`] ? 'text-blue-500' : 'text-gray-400'
                                    }`} />
                                    <span className={`text-xs mt-1 font-medium ${
                                      dragStates[`${index}-${imageType}`] ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                      {dragStates[`${index}-${imageType}`] 
                                        ? 'Drop image here' 
                                        : `Upload ${imageType}`
                                      }
                                    </span>
                                    <span className={`text-xs mt-0.5 ${
                                      dragStates[`${index}-${imageType}`] ? 'text-blue-500' : 'text-gray-400'
                                    }`}>
                                      {dragStates[`${index}-${imageType}`] 
                                        ? 'Release to upload' 
                                        : 'Click or drag PNG, JPG up to 10MB'
                                      }
                                    </span>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, index, imageType)}
                                  className="hidden"
                                  disabled={uploadingImages[`${index}-${imageType}`]}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Additional Images - seamlessly integrated */}
                  {index === 0 && customImageTypes[index] && customImageTypes[index].length > 0 && (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {customImageTypes[index].map((imageType) => (
                        <div key={imageType} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">
                              {imageType.replace(/_/g, ' ')} View
                            </label>
                            <button
                              type="button"
                              onClick={() => removeCustomImageType(index, imageType)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Remove image slot"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="relative group">
                            {color.images[imageType] ? (
                              <div className="relative">
                                <img
                                  src={color.images[imageType]}
                                  alt={`${color.name} ${imageType}`}
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                />
                                
                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newColors = [...colors];
                                    delete newColors[index].images[imageType];
                                    setColors(newColors);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                
                                {/* Replace input overlay */}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, index, imageType)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  disabled={uploadingImages[`${index}-${imageType}`]}
                                  onDragEnter={(e) => handleDragEnter(e, index, imageType)}
                                  onDragLeave={(e) => handleDragLeave(e, index, imageType)}
                                  onDragOver={(e) => handleDragOver(e, index, imageType)}
                                  onDrop={(e) => handleDrop(e, index, imageType)}
                                />
                                
                                {/* Drag feedback */}
                                {dragStates[`${index}-${imageType}`] && (
                                  <div className="absolute inset-0 bg-blue-500 bg-opacity-30 rounded-lg flex items-center justify-center">
                                    <div className="text-white text-center">
                                      <Upload className="h-8 w-8 mx-auto mb-2" />
                                      <div className="text-sm font-medium">Drop to replace</div>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Hover hint */}
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to replace
                                </div>
                              </div>
                            ) : (
                              <label 
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                                  uploadingImages[`${index}-${imageType}`] ? 'pointer-events-none opacity-50' : ''
                                } ${
                                  dragStates[`${index}-${imageType}`] 
                                    ? 'border-blue-400 bg-blue-50' 
                                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                                onDragEnter={(e) => handleDragEnter(e, index, imageType)}
                                onDragLeave={(e) => handleDragLeave(e, index, imageType)}
                                onDragOver={(e) => handleDragOver(e, index, imageType)}
                                onDrop={(e) => handleDrop(e, index, imageType)}
                              >
                                {uploadingImages[`${index}-${imageType}`] ? (
                                  <div className="flex flex-col items-center">
                                    <Loader2 className="h-6 w-6 text-gray-500 animate-spin" />
                                    <span className="text-xs text-gray-600 mt-1 font-medium">Uploading...</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <Upload className={`h-6 w-6 ${
                                      dragStates[`${index}-${imageType}`] ? 'text-blue-500' : 'text-gray-400'
                                    }`} />
                                    <span className={`text-xs mt-1 font-medium ${
                                      dragStates[`${index}-${imageType}`] ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                      {dragStates[`${index}-${imageType}`] 
                                        ? 'Drop image here' 
                                        : `Upload ${imageType.replace(/_/g, ' ')}`
                                      }
                                    </span>
                                    <span className={`text-xs mt-0.5 ${
                                      dragStates[`${index}-${imageType}`] ? 'text-blue-500' : 'text-gray-400'
                                    }`}>
                                      {dragStates[`${index}-${imageType}`] 
                                        ? 'Release to upload' 
                                        : 'Click or drag PNG, JPG up to 10MB'
                                      }
                                    </span>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, index, imageType)}
                                  className="hidden"
                                  disabled={uploadingImages[`${index}-${imageType}`]}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Color Button at Bottom */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button type="button" onClick={addColor} variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Color
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 