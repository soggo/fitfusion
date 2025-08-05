import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, User } from 'lucide-react';
import useCartStore from '../../store/cartStore.js';
import useProductStore from '../../store/productStore.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import Button from '../ui/Button.jsx';
import CustomerLogin from '../auth/CustomerLogin.jsx';
import CustomerRegister from '../auth/CustomerRegister.jsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const { getTotalItems, openCart } = useCartStore();
  const { setSearch, categories } = useProductStore();
  const { user, profile, isAdmin } = useAuth();
  
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

  const handleAccountClick = () => {
    if (user && !isAdmin()) {
      // Authenticated customer - go to account page
      navigate(ROUTES.ACCOUNT);
    } else if (user && isAdmin()) {
      // Admin user - go to admin panel
      navigate('/admin');
    } else {
      // Not authenticated - show login modal
      setShowLoginModal(true);
    }
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
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
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {/* Account Icon */}
            <button
              onClick={handleAccountClick}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <User className="h-5 w-5" />
            </button>
            
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ShoppingBag className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
          
          {/* Mobile Right Side */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Search className="h-5 w-5" />
            </button>
            
            {/* Account */}
            <button
              onClick={handleAccountClick}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <User className="h-5 w-5" />
            </button>
            
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-400 hover:text-gray-600"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
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
      
      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="ml-4"
              >
                Search
              </Button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="ml-2 p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>
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
          </div>
        </div>
      )}

      {/* Click outside to close search */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsSearchOpen(false)}
        />
      )}

      {/* Auth Modals */}
      <CustomerLogin
        isOpen={showLoginModal}
        onClose={closeModals}
        onSwitchToRegister={switchToRegister}
      />
      <CustomerRegister
        isOpen={showRegisterModal}
        onClose={closeModals}
        onSwitchToLogin={switchToLogin}
      />
    </header>
  );
};

export default Header; 