import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag } from 'lucide-react';
import useCartStore from '../../store/cartStore.js';
import { formatPrice } from '../../utils/helpers.js';
import { ROUTES } from '../../utils/constants.js';
import Button from '../ui/Button.jsx';
import CartItem from './CartItem.jsx';

const CartDrawer = () => {
  const { 
    items, 
    isOpen, 
    closeCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCartStore();
  
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  
  return (
    <>
      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({totalItems})
            </h2>
            <button
              onClick={closeCart}
              className="p-2 -m-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-6">
                  Add some items to get started
                </p>
                <Button
                  onClick={closeCart}
                  variant="primary"
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Shipping Notice */}
              <div className="text-sm text-gray-600 text-center">
                Free shipping on orders over ₦50,000
              </div>
              
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              
              {/* Actions */}
              <div className="space-y-2">
                <Link to={ROUTES.CHECKOUT} onClick={closeCart}>
                  <Button variant="primary" fullWidth size="lg">
                    Checkout
                  </Button>
                </Link>
              </div>
              
              {/* Continue Shopping */}
              <button
                onClick={closeCart}
                className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer; 