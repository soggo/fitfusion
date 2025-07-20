import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import useCartStore from '../../store/cartStore.js';
import { formatPrice, createProductSlug, isProductInStock, getProductPrimaryImage } from '../../utils/helpers.js';
import { ROUTES } from '../../utils/constants.js';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();
  
  const productSlug = createProductSlug(item.product.name, item.product.id);
  const productUrl = `${ROUTES.PRODUCT}/${productSlug}`;
  const isInStock = isProductInStock(item.product, item.selectedSize);
  const maxQuantity = item.product.stock[item.selectedSize] || 0;
  
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      removeItem(item.id);
    } else if (newQuantity <= maxQuantity) {
      updateQuantity(item.id, newQuantity);
    }
  };
  
  const handleRemove = () => {
    removeItem(item.id);
  };
  
  return (
    <div className="flex items-start space-x-4 py-4 border-b border-gray-100 last:border-b-0">
      {/* Product Image */}
      <Link to={productUrl} className="flex-shrink-0">
        <img
          src={item.selectedColor.images?.front || getProductPrimaryImage(item.product)}
          alt={item.product.name}
          className="w-16 h-20 object-cover rounded-md"
        />
      </Link>
      
      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link to={productUrl}>
          <h3 className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors duration-200">
            {item.product.name}
          </h3>
        </Link>
        
        <div className="mt-1 space-y-1">
          <p className="text-xs text-gray-500">
            {item.product.category}
          </p>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <span>Color:</span>
              <div 
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: item.selectedColor.hex }}
              />
              <span>{item.selectedColor.name}</span>
            </div>
            
            <div>
              Size: {item.selectedSize}
            </div>
          </div>
          
          {!isInStock && (
            <p className="text-xs text-red-600">Out of stock</p>
          )}
        </div>
        
        {/* Price and Quantity Controls */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Quantity Controls */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                className="p-1 hover:bg-gray-50 transition-colors duration-200"
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </button>
              
              <span className="px-2 py-1 text-sm min-w-[2rem] text-center">
                {item.quantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                className="p-1 hover:bg-gray-50 transition-colors duration-200"
                disabled={item.quantity >= maxQuantity}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            
            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
              title="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          
          {/* Price */}
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {formatPrice(item.product.price * item.quantity)}
            </div>
            {item.quantity > 1 && (
              <div className="text-xs text-gray-500">
                {formatPrice(item.product.price)} each
              </div>
            )}
          </div>
        </div>
        
        {/* Stock Warning */}
        {isInStock && item.quantity >= maxQuantity && (
          <p className="text-xs text-amber-600 mt-1">
            Maximum quantity available: {maxQuantity}
          </p>
        )}
      </div>
    </div>
  );
};

export default CartItem; 