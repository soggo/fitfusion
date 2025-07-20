import { create } from 'zustand';
import { productService } from '../services/productService.js';
import { searchProducts, sortProducts, filterProducts } from '../utils/helpers.js';

const useProductStore = create((set, get) => ({
  // State
  products: [],
  categories: [],
  filteredProducts: [],
  loading: true,
  error: null,
  initialized: false,
  
  // Filters
  filters: {
    category: 'all',
    sizes: [],
    colors: [],
    priceRange: { min: 0, max: 50000 },
    inStockOnly: false,
    isNew: false,
    onSale: false,
    search: ''
  },
  
  // Sorting
  sortBy: 'featured',
  
  // Pagination
  currentPage: 1,
  itemsPerPage: 12,

  // Initialize data from database
  initializeData: async () => {
    const { initialized } = get();
    if (initialized) return;

    set({ loading: true, error: null });
    
    try {
      // Fetch data from database
      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts(),
        productService.getAllCategories()
      ]);

      // Transform database data to match UI expectations
      const transformedProducts = productsData.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price, // Already in cents
        originalPrice: product.original_price,
        category: product.category?.name || 'Uncategorized',
        subcategory: product.subcategory,
        sizes: product.sizes || [],
        colors: product.colors || [{ name: 'Default', hex: '#000000' }],
        images: product.images || {},
        stock: product.stock || {},
        isNew: product.is_new || false,
        onSale: product.on_sale || false,
        featured: product.featured || false,
        rating: product.rating || 0,
        reviewCount: product.review_count || 0,
        soldCount: product.sold_count || 0,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));

      const transformedCategories = categoriesData.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image_url
      }));

      // Update price range based on actual products
      const prices = transformedProducts.map(p => p.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 50000;

      set({ 
        products: transformedProducts,
        categories: transformedCategories,
        filteredProducts: transformedProducts,
        loading: false,
        initialized: true,
        filters: {
          ...get().filters,
          priceRange: { min: minPrice, max: maxPrice }
        }
      });

      // Apply any existing filters
      get().applyFiltersAndSort();
    } catch (error) {
      console.error('Failed to initialize product data:', error);
      set({ 
        error: error.message || 'Failed to load products',
        loading: false 
      });
    }
  },
  
  // Actions
  setProducts: (products) => {
    set({ products, filteredProducts: products });
  },
  
  setLoading: (loading) => {
    set({ loading });
  },
  
  setError: (error) => {
    set({ error });
  },
  
  // Filter actions
  setFilter: (filterType, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [filterType]: value
      },
      currentPage: 1 // Reset to first page when filtering
    }));
    get().applyFiltersAndSort();
  },
  
  clearFilters: () => {
    set({
      filters: {
        category: 'all',
        sizes: [],
        colors: [],
        priceRange: { min: 0, max: 50000 },
        inStockOnly: false,
        isNew: false,
        onSale: false,
        search: ''
      },
      currentPage: 1
    });
    get().applyFiltersAndSort();
  },
  
  // Sorting actions
  setSortBy: (sortBy) => {
    set({ sortBy, currentPage: 1 });
    get().applyFiltersAndSort();
  },
  
  // Search actions
  setSearch: (search) => {
    set((state) => ({
      filters: {
        ...state.filters,
        search
      },
      currentPage: 1
    }));
    get().applyFiltersAndSort();
  },
  
  // Pagination actions
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },
  
  setItemsPerPage: (itemsPerPage) => {
    set({ itemsPerPage, currentPage: 1 });
  },
  
  // Apply filters and sorting
  applyFiltersAndSort: () => {
    const { products, filters, sortBy } = get();
    
    // First apply search
    let filtered = searchProducts(products, filters.search);
    
    // Then apply other filters
    filtered = filterProducts(filtered, filters);
    
    // Finally apply sorting
    filtered = sortProducts(filtered, sortBy);
    
    set({ filteredProducts: filtered });
  },
  
  // Get product by ID
  getProductById: (id) => {
    const { products } = get();
    return products.find(product => product.id === id);
  },
  
  // Get products by category
  getProductsByCategory: (category) => {
    const { products } = get();
    if (category === 'all') return products;
    return products.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  },
  
  // Get featured products
  getFeaturedProducts: (limit = 8) => {
    const { products } = get();
    return products
      .filter(product => product.featured)
      .slice(0, limit);
  },
  
  // Get new products
  getNewProducts: (limit = 8) => {
    const { products } = get();
    return products
      .filter(product => product.isNew)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },
  
  // Get sale products
  getSaleProducts: (limit = 8) => {
    const { products } = get();
    return products
      .filter(product => product.onSale)
      .slice(0, limit);
  },
  
  // Get related products
  getRelatedProducts: (productId, limit = 4) => {
    const { products } = get();
    const currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return [];
    
    return products
      .filter(product => 
        product.id !== productId && 
        (product.category === currentProduct.category || 
         product.subcategory === currentProduct.subcategory)
      )
      .slice(0, limit);
  },
  
  // Get category info
  getCategoryById: (id) => {
    const { categories } = get();
    return categories.find(category => category.id === id);
  },
  
  // Get paginated products
  getPaginatedProducts: () => {
    const { filteredProducts, currentPage, itemsPerPage } = get();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      products: filteredProducts.slice(startIndex, endIndex),
      totalProducts: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / itemsPerPage),
      currentPage,
      hasNextPage: endIndex < filteredProducts.length,
      hasPrevPage: currentPage > 1
    };
  },
  
  // Get unique filter options
  getFilterOptions: () => {
    const { products, categories } = get();
    
    const sizes = [...new Set(products.flatMap(p => p.sizes))];
    const colors = [...new Set(products.flatMap(p => p.colors.map(c => c.name)))];
    const availableCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const priceRange = {
      min: Math.min(...products.map(p => p.price)),
      max: Math.max(...products.map(p => p.price))
    };
    
    return { sizes, colors, categories: availableCategories, priceRange };
  },
  
  // Admin actions (for product management)
  addProduct: (product) => {
    set((state) => ({
      products: [...state.products, product]
    }));
    get().applyFiltersAndSort();
  },
  
  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map(product =>
        product.id === id ? { ...product, ...updates } : product
      )
    }));
    get().applyFiltersAndSort();
  },
  
  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter(product => product.id !== id)
    }));
    get().applyFiltersAndSort();
  }
}));

export default useProductStore; 