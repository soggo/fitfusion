// Checkout form formatting and validation helpers

// Format card number with spaces
export const formatCardNumber = (value) => {
  if (!value) return value;
  
  // Remove all non-digits
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  // Add spaces every 4 digits
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  
  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
};

// Format expiry date
export const formatExpiryDate = (value) => {
  if (!value) return value;
  
  // Remove all non-digits
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  if (v.length >= 2) {
    return v.substring(0, 2) + '/' + v.substring(2, 4);
  }
  
  return v;
};

// Validate card number (Luhn algorithm)
export const validateCardNumber = (cardNumber) => {
  if (!cardNumber) return false;
  
  // Remove spaces and non-digits
  const cleanNumber = cardNumber.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Validate expiry date
export const validateExpiryDate = (expiryDate) => {
  if (!expiryDate) return false;
  
  const [month, year] = expiryDate.split('/');
  if (!month || !year) return false;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  if (expMonth < 1 || expMonth > 12) return false;
  
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
};

// Validate CVV
export const validateCVV = (cvv) => {
  if (!cvv) return false;
  
  const cleanCVV = cvv.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  return cleanCVV.length >= 3 && cleanCVV.length <= 4;
};

// Calculate shipping cost based on location
export const calculateShipping = (state) => {
  const shippingRates = {
    'Lagos': 1000,
    'Abuja': 1200,
    'Kano': 1500,
    'Rivers': 1300,
    'Kaduna': 1400,
    'Oyo': 1100,
    'Imo': 1400,
    'Borno': 1800,
    'Anambra': 1300,
    'Sokoto': 1700
  };
  
  return shippingRates[state] || 1500; // Default shipping cost
};

// Calculate tax based on state
export const calculateTax = (subtotal, state) => {
  const taxRates = {
    'Lagos': 0.075, // 7.5%
    'Abuja': 0.06,  // 6%
    'Kano': 0.08,   // 8%
    'Rivers': 0.07, // 7%
    'Kaduna': 0.075, // 7.5%
    'Oyo': 0.065,   // 6.5%
    'Imo': 0.07,    // 7%
    'Borno': 0.08,  // 8%
    'Anambra': 0.07, // 7%
    'Sokoto': 0.075  // 7.5%
  };
  
  const rate = taxRates[state] || 0.075; // Default 7.5%
  return Math.round(subtotal * rate);
};

// Generate order number
export const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `FF-${timestamp}-${random}`;
};

// Validate Nigerian phone number
export const validateNigerianPhone = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digits
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  // Nigerian phone number patterns
  const patterns = [
    /^(\+234|234)?[789][01]\d{8}$/, // +234 or 234 prefix
    /^0[789][01]\d{8}$/, // 0 prefix
    /^[789][01]\d{8}$/ // No prefix
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  if (!phone) return phone;
  
  // Remove all non-digits
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  
  // If it starts with 234, remove it
  let formatted = cleanPhone;
  if (cleanPhone.startsWith('234')) {
    formatted = cleanPhone.substring(3);
  }
  
  // If it starts with 0, remove it
  if (formatted.startsWith('0')) {
    formatted = formatted.substring(1);
  }
  
  // Format as +234 XXX XXX XXXX
  if (formatted.length === 10) {
    return `+234 ${formatted.substring(0, 3)} ${formatted.substring(3, 6)} ${formatted.substring(6)}`;
  }
  
  return phone;
}; 