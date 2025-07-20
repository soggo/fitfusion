import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { extractIdFromSlug, formatPrice, isProductInStock } from '../utils/helpers.js';
import useProductStore from '../store/productStore.js';
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
  // For now, always use template images (same as ProductCard)
  // In production, this would check if product.images exist and fallback to templates
  return templateImages;
};

const ProductDetail = () => {
  const { slug } = useParams();
  const { getProductById, initializeData, loading } = useProductStore();
  const { addItem, openCart } = useCartStore();
  const productId = extractIdFromSlug(slug);
  
  // Initialize data from database
  useEffect(() => {
    initializeData();
  }, [initializeData]);
  
  const product = getProductById(productId);

  // Default to first color and no size selected
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || null);
  const [selectedSize, setSelectedSize] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading product..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images Grid */}
        <div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {allImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={product.name + ' view'}
                className="w-full h-64 object-cover rounded-lg border border-gray-100 bg-gray-50"
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
          {product.colors.length > 1 && (
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-gray-700 mr-2">Color:</span>
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                    selectedColor?.name === color.name
                      ? 'border-gray-900 ring-2 ring-gray-200'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              <span className="text-xs text-gray-500 ml-2">{selectedColor?.name}</span>
            </div>
          )}

          {/* Size Selector */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-700">Size:</span>
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
            {selectedSize && <span className="text-xs text-gray-500">Selected: {selectedSize}</span>}
          </div>

          {/* Add to Cart Button */}
          <Button
            variant="primary"
            size="md"
            onClick={handleAddToCart}
            disabled={!selectedSize || !isProductInStock(product, selectedSize)}
            className="w-full mb-6 bg-gray-900 hover:bg-gray-800 text-white border border-gray-900"
          >
            Add to Cart
          </Button>

          {/* Rating */}
          {product.rating && (
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
          )}

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
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 