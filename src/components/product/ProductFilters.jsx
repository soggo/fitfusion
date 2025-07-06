import React from 'react';
import { X } from 'lucide-react';
import useProductStore from '../../store/productStore.js';
import { CATEGORIES, SIZES, PRODUCT_COLORS } from '../../utils/constants.js';
import { formatPrice } from '../../utils/helpers.js';
import Button from '../ui/Button.jsx';

const ProductFilters = () => {
  const {
    filters,
    setFilter,
    clearFilters,
    getFilterOptions,
  } = useProductStore();
  
  const filterOptions = getFilterOptions();
  
  const handleCategoryChange = (category) => {
    setFilter('category', category);
  };
  
  const handleSizeToggle = (size) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size];
    setFilter('sizes', newSizes);
  };
  
  const handleColorToggle = (color) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    setFilter('colors', newColors);
  };
  
  const handlePriceRangeChange = (type, value) => {
    setFilter('priceRange', {
      ...filters.priceRange,
      [type]: Number(value) || 0
    });
  };
  
  const handleInStockToggle = () => {
    setFilter('inStockOnly', !filters.inStockOnly);
  };
  
  const getColorHex = (colorName) => {
    const color = PRODUCT_COLORS.find(c => c.name === colorName);
    return color ? color.hex : '#000000';
  };
  
  const hasActiveFilters = 
    filters.category !== 'all' ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.priceRange.min > filterOptions.priceRange.min ||
    filters.priceRange.max < filterOptions.priceRange.max ||
    filters.inStockOnly;
  
  return (
    <div className="bg-white">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-900"
          >
            Clear All
          </Button>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                value="all"
                checked={filters.category === 'all'}
                onChange={() => handleCategoryChange('all')}
                className="h-4 w-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              />
              <span className="ml-2 text-sm text-gray-700">All Products</span>
            </label>
            {Object.values(CATEGORIES).map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category.toLowerCase()}
                  checked={filters.category === category.toLowerCase()}
                  onChange={() => handleCategoryChange(category.toLowerCase())}
                  className="h-4 w-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                />
                <span className="ml-2 text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Size Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Size</h4>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`px-3 py-2 text-sm border rounded-md transition-colors duration-200 ${
                  filters.sizes.includes(size)
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {filters.sizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filters.sizes.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                >
                  {size}
                  <button
                    onClick={() => handleSizeToggle(size)}
                    className="ml-1 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Color Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Color</h4>
          <div className="grid grid-cols-4 gap-2">
            {filterOptions.colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorToggle(color)}
                className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  filters.colors.includes(color)
                    ? 'border-gray-900 ring-2 ring-gray-200'
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: getColorHex(color) }}
                title={color}
              >
                {filters.colors.includes(color) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
          {filters.colors.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {filters.colors.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                >
                  {color}
                  <button
                    onClick={() => handleColorToggle(color)}
                    className="ml-1 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Price Range Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min || ''}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max || ''}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="text-xs text-gray-500">
              Range: {formatPrice(filterOptions.priceRange.min)} - {formatPrice(filterOptions.priceRange.max)}
            </div>
          </div>
        </div>
        
        {/* In Stock Filter */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={handleInStockToggle}
              className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
            />
            <span className="ml-2 text-sm text-gray-700">In stock only</span>
          </label>
        </div>
        
        {/* Quick Filters */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Filters</h4>
          <div className="space-y-2">
            <button
              onClick={() => setFilter('isNew', !filters.isNew)}
              className={`w-full text-left px-3 py-2 text-sm border rounded-md transition-colors duration-200 ${
                filters.isNew
                  ? 'border-purple-300 bg-purple-50 text-purple-700'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => setFilter('onSale', !filters.onSale)}
              className={`w-full text-left px-3 py-2 text-sm border rounded-md transition-colors duration-200 ${
                filters.onSale
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:border-gray-500'
              }`}
            >
              On Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters; 