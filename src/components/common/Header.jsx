import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, User } from 'lucide-react';
import useCartStore from '../../store/cartStore.js';
import useProductStore from '../../store/productStore.js';
import { ROUTES } from '../../utils/constants.js';
import Button from '../ui/Button.jsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const { getTotalItems, openCart } = useCartStore();
  const { setSearch, categories } = useProductStore();
  
  const totalItems = getTotalItems();
  
  const navigation = [
    { name: 'Home', href: ROUTES.HOME },
    { name: 'Shop', href: ROUTES.SHOP },
    { name: 'Tops', href: `${ROUTES.SHOP}?category=tops` },
    { name: 'Sets', href: `${ROUTES.SHOP}?category=sets` },
    { name: 'Bottoms', href: `${ROUTES.SHOP}?category=bottoms` },
  ];
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearch(searchQuery);
      navigate(ROUTES.SHOP);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };
  
  const isActive = (href) => {
    if (href === ROUTES.HOME) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={ROUTES.HOME} className="text-2xl font-bold text-gray-900">
              FitFusion
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-64 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {/* User Account */}
            <Link
              to={ROUTES.ACCOUNT}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <User className="h-5 w-5" />
            </Link>
            
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {/* Mobile Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-400 hover:text-gray-600"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4">
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              autoFocus
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="ml-2"
            >
              Search
            </Button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="ml-2 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
      
      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-2">
              <Link
                to={ROUTES.ACCOUNT}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              >
                My Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 