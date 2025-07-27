import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, createProductSlug, isProductInStock } from '../../utils/helpers.js';
import { ROUTES } from '../../utils/constants.js';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import useCartStore from '../../store/cartStore.js';

const ProductCard = ({ product }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const imageRef = useRef(null);
  const { addItem, openCart } = useCartStore();
  
  const productSlug = createProductSlug(product.name, product.id);
  const productUrl = `${ROUTES.PRODUCT}/${productSlug}`;

  // Template images array - fallback for products without images
  const templateImages = [
    '/frontv.jpg',    // Index 0: Default front view
    '/backv.jpg',     // Index 1: Back view
    '/caro1.jpg',     // Index 2: Additional view 1
    '/caro2.jpg'      // Index 3: Additional view 2
  ];

  // Function to get product images with fallback to template images
  const getProductImages = () => {
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
  
  const productImages = getProductImages();
  
  const handleColorHover = (color) => {
    setSelectedColor(color);
  };

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't add to cart if no size is selected
    if (!selectedSize) {
      return;
    }
    
    if (!isProductInStock(product, selectedSize)) {
      return;
    }
    
    addItem(product, selectedSize, selectedColor, 1);
  };
  
  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };
  
  // Use product images with fallback to template images
  const currentImage = isHovering ? productImages[currentImageIndex] : productImages[0];
  
  return (
    <div className="group relative bg-white rounded-none overflow-hidden shadow-none hover:shadow-sm transition-shadow duration-300 p-0 m-0">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1">
        {product.isNew && (
          <Badge variant="new" size="xs">New</Badge>
        )}
        {product.onSale && (
          <Badge variant="sale" size="xs">Sale</Badge>
        )}
        {!isProductInStock(product) && (
          <Badge variant="danger" size="xs">Out of Stock</Badge>
        )}
      </div>
      
      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        <Heart 
          className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
        />
      </button>
      
      {/* Product Image with Overlay Navigation */}
      <Link to={productUrl} className="relative block">
        <div 
          className="relative aspect-[1/1.3] bg-gray-100 overflow-hidden p-0 m-0"
          onMouseEnter={() => {
            setIsHovering(true);
            setCurrentImageIndex(1); // Show back view on hover
          }}
          onMouseLeave={() => {
            setIsHovering(false);
            setCurrentImageIndex(0); // Reset to front view
          }}
        >
          <img
            ref={imageRef}
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-opacity duration-300 p-0 m-0"
            loading="lazy"
          />
          
          {/* Navigation Overlay (visible on hover) */}
          {isHovering && (
            <>
              {/* Left/Right Navigation Buttons */}
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4 text-gray-800" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4 text-gray-800" />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => handleDotClick(e, index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      currentImageIndex === index
                        ? 'bg-white'
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Add to Cart Button Overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
            <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                disabled={!selectedSize || !isProductInStock(product, selectedSize)}
                className="bg-gray-900 hover:bg-gray-800 text-white border border-gray-900"
              >
                <ShoppingBag className="h-4 w-4 mr-1" />
                {!selectedSize ? 'Select Size' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-2 pt-1 pb-1">
        {/* Color Swatches */}
        {product.colors.length > 1 && (
          <div className="flex space-x-1 mb-3">
            {product.colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color)}
                onMouseEnter={() => handleColorHover(color)}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                  selectedColor.name === color.name 
                    ? 'border-gray-900 ring-2 ring-gray-200' 
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        )}
        
        {/* Product Name */}
        <Link to={productUrl}>
          <h3 className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Category */}
        <p className="text-xs text-gray-500 mt-1">{product.category}</p>
        
        {/* Price */}
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        
        {/* Size Selection */}
        <div className="mt-3">
          <div className="flex flex-wrap gap-1">
            {product.sizes.map((size) => {
              const inStock = isProductInStock(product, size);
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                  disabled={!inStock}
                  className={`px-2 py-1 text-xs border rounded transition-all duration-200 ${
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
        
        {/* Rating - only show if there are reviews */}
        {product.rating && product.reviewCount > 0 && (
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className={`h-3 w-3 ${
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
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviewCount})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard; 