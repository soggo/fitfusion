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
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [images, setImages] = useState([]);

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
    // Mock categories - replace with API call
    setCategories([
      { value: 'Tops', label: 'Tops' },
      { value: 'Bottoms', label: 'Bottoms' },
      { value: 'Sets', label: 'Sets' }
    ]);
  };

  const loadProduct = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock product data - replace with API call
    const mockProduct = {
      name: 'Moana One-Shoulder Top',
      description: 'A sleek and stylish one-shoulder activewear top perfect for yoga, pilates, or casual wear.',
      price: 12500,
      originalPrice: null,
      category: 'Tops',
      subcategory: 'one-shoulder',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      isNew: true,
      onSale: false,
      featured: true,
      colors: [
        {
          name: 'Black',
          hex: '#000000',
          images: {
            front: '/images/moana-top-black-front.jpg',
            back: '/images/moana-top-black-back.jpg',
            detail: '/images/moana-top-black-detail.jpg'
          }
        }
      ]
    };
    
    // Set form values
    Object.keys(mockProduct).forEach(key => {
      if (key !== 'colors') {
        setValue(key, mockProduct[key]);
      }
    });
    
    setColors(mockProduct.colors || []);
    setLoading(false);
  };

  const handleImageUpload = (event, colorIndex, imageType) => {
    const file = event.target.files[0];
    if (file) {
      // Simulate image upload - replace with actual upload logic
      const reader = new FileReader();
      reader.onload = (e) => {
        const newColors = [...colors];
        if (!newColors[colorIndex]) {
          newColors[colorIndex] = { name: '', hex: '#000000', images: {} };
        }
        newColors[colorIndex].images[imageType] = e.target.result;
        setColors(newColors);
      };
      reader.readAsDataURL(file);
    }
  };

  const addColor = () => {
    setColors([...colors, { name: '', hex: '#000000', images: {} }]);
  };

  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const updateColor = (index, field, value) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setColors(newColors);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      // Validate colors
      if (colors.length === 0) {
        toast.error('Please add at least one color');
        return;
      }
      
      const productData = {
        ...data,
        colors,
        price: parseInt(data.price) * 100, // Convert to cents
        originalPrice: data.originalPrice ? parseInt(data.originalPrice) * 100 : null
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
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
                Available Sizes
              </label>
              <div className="space-y-2">
                {sizeOptions.map((size) => (
                  <label key={size.value} className="flex items-center">
                    <input
                      type="checkbox"
                      value={size.value}
                      {...register('sizes')}
                      className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{size.label}</span>
                  </label>
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Colors & Images</h2>
            <Button type="button" onClick={addColor} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Color
            </Button>
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
                </div>
                
                {/* Image Upload */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['front', 'back', 'detail'].map((imageType) => (
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
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400">
                              <Upload className="h-6 w-6 text-gray-400" />
                              <span className="text-xs text-gray-500 mt-1">Upload {imageType}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, index, imageType)}
                                className="hidden"
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