// App-wide constants
export const COLORS = {
  primary: '#1F2937',
  secondary: '#D2B48C',
  accent: '#8B4513',
  background: '#FFFFFF',
  text: '#374151',
  success: '#10B981',
  error: '#EF4444',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
};

export const CATEGORIES = {
  TOPS: 'Tops',
  BOTTOMS: 'Bottoms',
  SETS: 'Sets'
};

export const SUBCATEGORIES = {
  // Tops subcategories
  ONE_SHOULDER: 'one-shoulder',
  T_SHIRT: 't-shirt',
  SINGLET: 'singlet',
  JACKET: 'jacket',
  TANK_TOP: 'tank-top',
  LONG_TOP: 'long-top',
  
  // Bottoms subcategories  
  SHORTS: 'shorts',
  LEGGINGS: 'leggings',
  SKIRTS: 'skirts',
  
  // Sets subcategories
  ROMPER: 'romper',
  SINGLET_SHORT_SET: 'singlet-short-set',
  SINGLET_LEGGINGS_SET: 'singlet-leggings-set',
  JUMPSUIT: 'jumpsuit',
  JACKET_SHORT_SET: 'jacket-short-set',
  JACKET_LEGGINGS_SET: 'jacket-leggings-set',
  LONG_TOP_LEGGINGS_SET: 'long-top-leggings-set',
  LONG_TOP_SHORTS_SET: 'long-top-shorts-set'
};

export const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

export const PRODUCT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Forest Green', hex: '#166534' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Tan', hex: '#D2B48C' },
  { name: 'Olive', hex: '#6B7739' },
  { name: 'Cream', hex: '#F5F5DC' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Sage', hex: '#9CAF88' }
];

export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  AUTH: '/api/auth',
  CART: '/api/cart',
  ORDERS: '/api/orders'
};

export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  PRODUCT: '/product',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ACCOUNT: '/account',
  ADMIN: '/admin',
  LOGIN: '/login',
  SIGNUP: '/signup'
};

export const LOCAL_STORAGE_KEYS = {
  CART: 'fitfusion_cart',
  USER: 'fitfusion_user',
  WISHLIST: 'fitfusion_wishlist'
};

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
}; 