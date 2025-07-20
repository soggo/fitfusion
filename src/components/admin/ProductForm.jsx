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
  const [stock, setStock] = useState({
    XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0
  });
  const [colorStock, setColorStock] = useState({});
  const [uploadingImages, setUploadingImages] = useState({});
  const [currentProductId, setCurrentProductId] = useState(null); // Track current product ID

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
      setColorStock(product.colorStock || {});
      
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

  const addColor = () => {
    setColors([...colors, { name: '', hex: '#000000', images: {} }]);
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
    if (!isChecked) {
      // If size is unchecked, set quantity to 0
      setStock({
        ...stock,
        [sizeValue]: 0
      });
    }
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
        colorStock,
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
        setCurrentProductId(newProduct.id);
        
        toast.success('Product created successfully! You can now upload images that will be saved to the database.');
        
        // Don't navigate away immediately for new products so user can upload images
        // navigate('/admin/products');
        return;
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
                        {...register('sizes')}
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
                        className="w-16 h-8 px-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                    {index > 0 && (
                      <span className="text-xs text-gray-500 ml-2">(Detail view only for additional colors)</span>
                    )}
                  </label>
                  <div className={`grid gap-4 ${index === 0 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
                    {(index === 0 ? ['front', 'back', 'detail'] : ['detail']).map((imageType) => (
                      <div key={imageType} className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700 uppercase">
                          {imageType} View
                        </label>
                        <div className="relative">
                          {color.images[imageType] ? (
                            <div className="relative">
                              <img
                                src={color.images[imageType]}
                                alt={`${color.name} ${imageType}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newColors = [...colors];
                                  delete newColors[index].images[imageType];
                                  setColors(newColors);
                                }}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 ${
                              uploadingImages[`${index}-${imageType}`] ? 'pointer-events-none opacity-50' : ''
                            }`}>
                              {uploadingImages[`${index}-${imageType}`] ? (
                                <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                              ) : (
                                <Upload className="h-6 w-6 text-gray-400" />
                              )}
                              <span className="text-xs text-gray-500 mt-1">
                                {uploadingImages[`${index}-${imageType}`] ? 'Uploading...' : `Upload ${imageType}`}
                              </span>
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
