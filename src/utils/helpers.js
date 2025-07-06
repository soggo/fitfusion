import { LOCAL_STORAGE_KEYS } from './constants.js';

// Price formatting utilities
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const calculateDiscount = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// LocalStorage utilities
export const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error);
    return null;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item to localStorage: ${key}`, error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item from localStorage: ${key}`, error);
    return false;
  }
};

// Cart utilities
export const getCartFromStorage = () => {
  return getFromStorage(LOCAL_STORAGE_KEYS.CART) || [];
};

export const saveCartToStorage = (cart) => {
  return setToStorage(LOCAL_STORAGE_KEYS.CART, cart);
};

// Product utilities
export const generateProductId = () => {
  return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const isProductInStock = (product, selectedSize = null) => {
  if (!product || !product.stock) return false;
  
  if (selectedSize) {
    return product.stock[selectedSize] > 0;
  }
  
  return Object.values(product.stock).some(quantity => quantity > 0);
};

export const getAvailableSizes = (product) => {
  if (!product || !product.stock) return [];
  
  return Object.entries(product.stock)
    .filter(([_, quantity]) => quantity > 0)
    .map(([size, _]) => size);
};

export const getTotalStock = (product) => {
  if (!product || !product.stock) return 0;
  
  return Object.values(product.stock).reduce((total, quantity) => total + quantity, 0);
};

// URL utilities
export const createProductSlug = (name, id) => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
  
  return `${slug}-${id}`;
};

export const extractIdFromSlug = (slug) => {
  const parts = slug.split('-');
  return parts[parts.length - 1];
};

// Form validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
  return phoneRegex.test(phone);
};

// Array utilities
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const groupBy = (array, key) => {
  return array.reduce((grouped, item) => {
    const group = item[key];
    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(item);
    return grouped;
  }, {});
};

// Image utilities
export const getImageUrl = (imagePath, fallback = '/placeholder-image.jpg') => {
  if (!imagePath) return fallback;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a relative path, prepend with base URL
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Search utilities
export const searchProducts = (products, query) => {
  if (!query || query.trim() === '') return products;
  
  const searchTerm = query.toLowerCase().trim();
  
  return products.filter(product => {
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.subcategory.toLowerCase().includes(searchTerm) ||
      product.colors.some(color => color.name.toLowerCase().includes(searchTerm))
    );
  });
};

// Sorting utilities
export const sortProducts = (products, sortBy) => {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'price-low-high':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high-low':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'best-selling':
      return sorted.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    case 'featured':
    default:
      return sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }
};

// Filter utilities
export const filterProducts = (products, filters) => {
  return products.filter(product => {
    // Category filter
    if (filters.category && filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }
    
    // Size filter
    if (filters.sizes && filters.sizes.length > 0) {
      const hasSize = filters.sizes.some(size => 
        product.sizes.includes(size) && isProductInStock(product, size)
      );
      if (!hasSize) return false;
    }
    
    // Color filter
    if (filters.colors && filters.colors.length > 0) {
      const hasColor = filters.colors.some(color => 
        product.colors.some(productColor => productColor.name === color)
      );
      if (!hasColor) return false;
    }
    
    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (min !== undefined && product.price < min) return false;
      if (max !== undefined && product.price > max) return false;
    }
    
    // In stock filter
    if (filters.inStockOnly && !isProductInStock(product)) {
      return false;
    }
    
    return true;
  });
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Deep clone utility
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}; 