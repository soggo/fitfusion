import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import useCartStore from '../store/cartStore.js';
import { formatPrice, validateEmail, validatePhone, validateRequired, getProductPrimaryImage } from '../utils/helpers.js';
import { 
  validateCardNumber, 
  validateExpiryDate, 
  validateCVV,
  calculateShipping,
  calculateTax,
  generateOrderNumber,
  validateNigerianPhone,
  formatCardNumber,
  formatExpiryDate,
  createWhatsAppMessage,
  openWhatsApp
} from '../utils/checkoutHelpers.js';
import { ROUTES, WHATSAPP_CONFIG } from '../utils/constants.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import OrderConfirmation from '../components/checkout/OrderConfirmation.jsx';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDetails, setOrderDetails] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    setValue
  } = useForm({
    mode: 'onChange'
  });

  const watchedValues = watch();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate(ROUTES.CART);
    }
  }, [items, navigate]);

  // Calculate totals with dynamic shipping and tax
  const subtotal = getTotalPrice();
  const shipping = calculateShipping(watchedValues.state);
  const tax = calculateTax(subtotal, watchedValues.state);
  const total = subtotal + shipping + tax;

  // Form validation
  const validateForm = () => {
    if (currentStep === 1) {
      return watchedValues.firstName && watchedValues.lastName && 
             watchedValues.email && validateEmail(watchedValues.email) && 
             watchedValues.phone && validateNigerianPhone(watchedValues.phone) && 
             watchedValues.address && watchedValues.city && 
             watchedValues.state && watchedValues.postalCode;
    }
    if (currentStep === 2) {
      return watchedValues.cardNumber && validateCardNumber(watchedValues.cardNumber) && 
             watchedValues.cardName && validateRequired(watchedValues.cardName) && 
             watchedValues.expiryDate && validateExpiryDate(watchedValues.expiryDate) && 
             watchedValues.cvv && validateCVV(watchedValues.cvv);
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async (data) => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate order number
      const newOrderNumber = generateOrderNumber();
      setOrderNumber(newOrderNumber);
      
      // Save order details
      const orderData = {
        orderNumber: newOrderNumber,
        items: items,
        shipping: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode
        },
        payment: {
          cardName: data.cardName,
          cardNumber: data.cardNumber,
          expiryDate: data.expiryDate
        },
        totals: {
          subtotal,
          shipping,
          tax,
          total
        },
        orderDate: new Date().toISOString()
      };
      
      setOrderDetails(orderData);
      
      // Clear cart
      clearCart();
      
      // Show success
      setOrderComplete(true);
      toast.success('Order placed successfully!');
      
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueShopping = () => {
    navigate(ROUTES.SHOP);
  };

  const handleContinueWithWhatsApp = () => {
    const formData = watchedValues;
    
    // Validate required shipping fields
    if (!validateForm()) {
      toast.error('Please fill in all required shipping information first.');
      return;
    }

    // Create order totals
    const orderTotals = {
      subtotal,
      shipping,
      tax,
      total
    };

    // Generate WhatsApp message
    const message = createWhatsAppMessage(formData, items, orderTotals);
    
    // Open WhatsApp
    openWhatsApp(message, WHATSAPP_CONFIG.PHONE_NUMBER);
    
    // Show success message
    toast.success('Redirecting to WhatsApp...');
  };

  if (orderComplete) {
    return (
      <OrderConfirmation 
        orderNumber={orderNumber} 
        orderDetails={orderDetails}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(ROUTES.CART)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {[
                  { step: 1, title: 'Shipping', icon: Truck },
                  { step: 2, title: 'Payment', icon: CreditCard },
                  { step: 3, title: 'Review', icon: CheckCircle }
                ].map(({ step, title, icon: Icon }) => (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      currentStep >= step 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {currentStep > step ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      currentStep >= step ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <form onSubmit={handleSubmit(handleNextStep)}>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Shipping Information
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <Input
                            {...register('firstName', { 
                              required: 'First name is required',
                              validate: validateRequired 
                            })}
                            placeholder="Enter first name"
                            error={errors.firstName?.message}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <Input
                            {...register('lastName', { 
                              required: 'Last name is required',
                              validate: validateRequired 
                            })}
                            placeholder="Enter last name"
                            error={errors.lastName?.message}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <Input
                          {...register('email', { 
                            required: 'Email is required',
                            validate: validateEmail 
                          })}
                          type="email"
                          placeholder="Enter email address"
                          error={errors.email?.message}
                        />
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <Input
                          {...register('phone', { 
                            required: 'Phone number is required',
                            validate: (value) => validateNigerianPhone(value) || 'Please enter a valid Nigerian phone number'
                          })}
                          placeholder="Enter phone number (e.g., 08012345678)"
                          error={errors.phone?.message}
                        />
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address *
                        </label>
                        <Input
                          {...register('address', { 
                            required: 'Address is required',
                            validate: validateRequired 
                          })}
                          placeholder="Enter street address"
                          error={errors.address?.message}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <Input
                            {...register('city', { 
                              required: 'City is required',
                              validate: validateRequired 
                            })}
                            placeholder="Enter city"
                            error={errors.city?.message}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State *
                          </label>
                          <Select
                            {...register('state', { 
                              required: 'State is required' 
                            })}
                            error={errors.state?.message}
                            placeholder="Select State"
                            options={[
                              { value: 'Lagos', label: 'Lagos' },
                              { value: 'Kano', label: 'Kano' },
                              { value: 'Abuja', label: 'Abuja' },
                              { value: 'Rivers', label: 'Rivers' },
                              { value: 'Kaduna', label: 'Kaduna' },
                              { value: 'Oyo', label: 'Oyo' },
                              { value: 'Imo', label: 'Imo' },
                              { value: 'Borno', label: 'Borno' },
                              { value: 'Anambra', label: 'Anambra' },
                              { value: 'Sokoto', label: 'Sokoto' }
                            ]}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code *
                          </label>
                          <Input
                            {...register('postalCode', { 
                              required: 'Postal code is required',
                              validate: validateRequired 
                            })}
                            placeholder="Enter postal code"
                            error={errors.postalCode?.message}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleContinueWithWhatsApp}
                      disabled={!validateForm()}
                      className="flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Continue with WhatsApp
                    </Button>
                    <Button type="submit" disabled={!validateForm()}>
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 2: Payment Information */}
              {currentStep === 2 && (
                <form onSubmit={handleSubmit(handleNextStep)}>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Payment Information
                      </h2>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number *
                          </label>
                          <Input
                            {...register('cardNumber', { 
                              required: 'Card number is required',
                              validate: (value) => validateCardNumber(value) || 'Please enter a valid card number'
                            })}
                            placeholder="1234 5678 9012 3456"
                            error={errors.cardNumber?.message}
                            onChange={(e) => {
                              const formatted = formatCardNumber(e.target.value);
                              e.target.value = formatted;
                              setValue('cardNumber', formatted);
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name on Card *
                          </label>
                          <Input
                            {...register('cardName', { 
                              required: 'Name on card is required',
                              validate: validateRequired 
                            })}
                            placeholder="Enter name as it appears on card"
                            error={errors.cardName?.message}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date *
                            </label>
                            <Input
                              {...register('expiryDate', { 
                                required: 'Expiry date is required',
                                validate: (value) => validateExpiryDate(value) || 'Please enter a valid expiry date'
                              })}
                              placeholder="MM/YY"
                              error={errors.expiryDate?.message}
                              onChange={(e) => {
                                const formatted = formatExpiryDate(e.target.value);
                                e.target.value = formatted;
                                setValue('expiryDate', formatted);
                              }}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV *
                            </label>
                            <Input
                              {...register('cvv', { 
                                required: 'CVV is required',
                                validate: (value) => validateCVV(value) || 'Please enter a valid CVV'
                              })}
                              placeholder="123"
                              error={errors.cvv?.message}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button type="button" variant="outline" onClick={handlePrevStep}>
                      Back to Shipping
                    </Button>
                    <Button type="submit" disabled={!validateForm()}>
                      Review Order
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 3: Order Review */}
              {currentStep === 3 && (
                <div>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Review Your Order
                      </h2>
                      
                      {/* Shipping Information Review */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">Shipping Information</h3>
                        <div className="text-sm text-gray-600">
                          <p>{watchedValues.firstName} {watchedValues.lastName}</p>
                          <p>{watchedValues.address}</p>
                          <p>{watchedValues.city}, {watchedValues.state} {watchedValues.postalCode}</p>
                          <p>{watchedValues.email}</p>
                          <p>{watchedValues.phone}</p>
                        </div>
                      </div>

                      {/* Payment Information Review */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">Payment Information</h3>
                        <div className="text-sm text-gray-600">
                          <p>{watchedValues.cardName}</p>
                          <p>•••• •••• •••• {watchedValues.cardNumber?.slice(-4)}</p>
                          <p>Expires: {watchedValues.expiryDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button type="button" variant="outline" onClick={handlePrevStep}>
                      Back to Payment
                    </Button>
                    <Button 
                      onClick={handleSubmit(handlePlaceOrder)}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? 'Processing...' : 'Place Order'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.selectedColor.images?.front || getProductPrimaryImage(item.product)}
                      alt={item.product.name}
                      className="w-12 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.selectedColor.name} • {item.selectedSize} • Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Shipping
                    {watchedValues.state && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({watchedValues.state})
                      </span>
                    )}
                  </span>
                  <span className="text-gray-900">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Tax
                    {watchedValues.state && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({watchedValues.state})
                      </span>
                    )}
                  </span>
                  <span className="text-gray-900">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium">Secure Checkout</p>
                    <p>Your payment information is encrypted and secure.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 