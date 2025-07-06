import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, ChevronDown } from 'lucide-react';
import useProductStore from '../store/productStore.js';
import ProductCard from '../components/product/ProductCard.jsx';
import ProductFilters from '../components/product/ProductFilters.jsx';
import Button from '../components/ui/Button.jsx';
import Loading from '../components/common/Loading.jsx';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('grid');
  
  const {
    filteredProducts,
    loading,
    filters,
    sortBy,
    setSortBy,
    setFilter,
    getPaginatedProducts,
    setCurrentPage,
    currentPage,
  } = useProductStore();
  
  const paginatedData = getPaginatedProducts();
  
  // Handle URL parameters
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const filter = searchParams.get('filter');
    
    if (category) {
      setFilter('category', category);
    }
    if (search) {
      setFilter('search', search);
    }
    if (filter === 'new') {
      setFilter('isNew', true);
    }
    if (filter === 'sale') {
      setFilter('onSale', true);
    }
  }, [searchParams, setFilter]);
  
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'best-selling', label: 'Best Selling' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading products..." />
      </div>
    );
  }
  
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Shop Activewear
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-600">
            Discover our complete collection of premium activewear designed for the modern woman.
          </p>
        </div>
        
        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          {/* Left Side - Filter Toggle and Results Count */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <p className="text-sm text-gray-600">
              {paginatedData.totalProducts} products
            </p>
          </div>
          
          {/* Right Side - View Mode and Sort */}
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex border border-gray-300 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${
                  viewMode === 'grid'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${
                  viewMode === 'list'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <ProductFilters />
          </div>
          
          {/* Products Grid */}
          <div className="lg:col-span-4">
            {paginatedData.products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Products Grid/List */}
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'
                      : 'space-y-8'
                  }
                >
                  {paginatedData.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {paginatedData.totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center">
                    <nav className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!paginatedData.hasPrevPage}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: paginatedData.totalPages }, (_, i) => {
                        const page = i + 1;
                        const isCurrentPage = page === currentPage;
                        const isNearCurrentPage = Math.abs(page - currentPage) <= 2;
                        const isFirstOrLastPage = page === 1 || page === paginatedData.totalPages;
                        
                        if (isNearCurrentPage || isFirstOrLastPage) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                isCurrentPage
                                  ? 'bg-gray-900 text-white'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                        
                        if (page === currentPage - 3 || page === currentPage + 3) {
                          return (
                            <span key={page} className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        
                        return null;
                      })}
                      
                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!paginatedData.hasNextPage}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop; 