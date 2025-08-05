import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { extractIdFromSlug, formatPrice, isProductInStock } from '../utils/helpers.js';
import { productService } from '../services/productService.js';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Loading from '../components/common/Loading.jsx';
import useCartStore from '../store/cartStore.js';

const templateImages = [
  '/frontv.jpg',    // Index 0: Default front view
  '/backv.jpg',     // Index 1: Back view
  '/caro1.jpg',     // Index 2: Additional view 1
  '/caro2.jpg'      // Index 3: Additional view 2
];

const getProductImages = (product) => {
  if (product.images && typeof product.images === 'object') {
    // Convert database images object to array
    const imageUrls = [];
    
    // Add images in preferred order
    if (product.images.front) imageUrls.push(product.images.front);
    if (product.images.back) imageUrls.push(product.images.back);
    if (product.images.detail) imageUrls.push(product.images.detail);
    
    // Add any other images that might exist
    Object.entries(product.images).forEach(([key, url]) => {
      if (!['front', 'back', 'detail'].includes(key) && url) {
        imageUrls.push(url);
      }
    });
    
    // Return database images if any exist, otherwise fall back to templates
    return imageUrls.length > 0 ? imageUrls : templateImages;
  }
  
  // Fallback to template images
  return templateImages;
};

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, openCart } = useCartStore();
  const rawProductId = extractIdFromSlug(slug);
  
  // Convert to number if it's a numeric string, otherwise keep as string
  const productId = /^\d+$/.test(rawProductId) ? parseInt(rawProductId, 10) : rawProductId;
  
  // Local state for product data
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');

  // Load product data from database
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Loading product with ID:', productId, 'from slug:', slug);
        
        // Fetch product directly from database
        const productData = await productService.getProductById(productId);
        
        console.log('📦 Product data received:', productData);
        
        if (!productData) {
          console.warn('⚠️ No product data returned for ID:', productId);
          setError('Product not found');
          setLoading(false);
          return;
        }
        
        // Transform database data to match UI expectations
        const transformedProduct = {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          price: productData.price, // Already in cents from database
          originalPrice: productData.original_price,
          category: productData.category?.name || 'Uncategorized',
          subcategory: productData.subcategory,
          sizes: productData.sizes || [],
          colors: productData.colors || [{ name: 'Default', hex: '#000000', images: {} }],
          images: productData.images || {},
          stock: productData.stock || {},
          colorstock: productData.colorstock || {},
          isNew: productData.is_new || false,
          onSale: productData.on_sale || false,
          featured: productData.featured || false,
          rating: productData.rating || 0,
          reviewCount: productData.review_count || 0,
          soldCount: productData.sold_count || 0,
          createdAt: productData.created_at,
          updatedAt: productData.updated_at
        };
        
        console.log('✅ Product transformed successfully:', transformedProduct.name);
        setProduct(transformedProduct);
        
        // Set initial color selection
        if (transformedProduct.colors && transformedProduct.colors.length > 0) {
          setSelectedColor(transformedProduct.colors[0]);
        }
        
      } catch (err) {
        console.error('❌ Error loading product:', err);
        
        // Provide more specific error messages
        if (err.message.includes('Missing Supabase environment variables')) {
          setError('Database configuration error. Please check environment variables.');
        } else if (err.message.includes('Invalid API key')) {
          setError('Database authentication error. Please check your API key.');
        } else if (err.code === 'PGRST116') {
          setError('Product not found in database.');
        } else {
          setError(`Failed to load product: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading product..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Product Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Button onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // Use the same images as ProductCard for consistency
  const allImages = getProductImages(product);

  // Features (mocked for now)
  const features = [
    'Nylon Spandex Blend',
    'Flattering & shaping square neck',
    'Designed to contour',
    'Shelf Bra with high quality removable padding',
    'Buttery soft fabric',
    'Fast drying',
    'Perfect length',
  ];

  // Add to Cart handler (real implementation)
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!selectedSize || !isProductInStock(product, selectedSize)) return;
    addItem(product, selectedSize, selectedColor, 1);
    openCart();
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <button onClick={() => navigate('/')} className="hover:text-gray-700">
                Home
              </button>
            </li>
            <li>/</li>
            <li>
              <button onClick={() => navigate('/shop')} className="hover:text-gray-700">
                Shop
              </button>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Images Grid */}
          <div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {allImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} view ${idx + 1}`}
                  className="w-full h-64 object-cover rounded-lg border border-gray-100 bg-gray-50"
                  loading="lazy"
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-start">
            {/* Badges */}
            <div className="flex space-x-2 mb-2">
              {product.isNew && <Badge variant="new" size="xs">New</Badge>}
              {product.onSale && <Badge variant="sale" size="xs">Sale</Badge>}
              {!isProductInStock(product) && <Badge variant="danger" size="xs">Out of Stock</Badge>}
            </div>

            {/* Name & Price */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-xl font-semibold text-gray-900">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 1 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-700">Color:</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {selectedColor?.name || 'Select a color'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={`${color.name}-${index}`}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        selectedColor?.name === color.name 
                          ? 'border-gray-900 ring-2 ring-gray-200' 
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color.hex || '#000000' }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-700">Size:</span>
                  {selectedSize && <span className="text-sm text-gray-900 font-medium">{selectedSize}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const inStock = isProductInStock(product, size);
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                        disabled={!inStock}
                        className={`px-3 py-1 text-xs rounded border transition-all duration-200 ${
                          selectedSize === size
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : inStock
                            ? 'border-gray-300 hover:border-gray-500'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              variant="primary"
              size="md"
              onClick={handleAddToCart}
              disabled={!selectedSize || !isProductInStock(product, selectedSize)}
              className="w-full mb-6 bg-gray-900 hover:bg-gray-800 text-white border border-gray-900"
            >
              {!selectedSize ? 'Select Size' : 'Add to Cart'}
            </Button>

            {/* Rating */}
            {/* {product.rating && product.reviewCount > 0 && (
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className={`h-4 w-4 ${
                        index < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-2">({product.reviewCount} reviews)</span>
              </div>
            )} */}

            {/* Description */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Description</h2>
              <p className="text-gray-700 text-sm mb-2">{product.description}</p>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                {features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Stock Information */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Availability</h3>
              <div className="text-sm text-gray-600">
                {isProductInStock(product) ? (
                  <span className="text-green-600">✓ In Stock</span>
                ) : (
                  <span className="text-red-600">✗ Out of Stock</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 