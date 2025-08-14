import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';

// Pages
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import CheckoutCallback from './pages/CheckoutCallback.jsx';
import Account from './pages/Account.jsx';
import Admin from './pages/Admin.jsx';
import AdminLogin from './pages/AdminLogin.jsx';

// Auth Components
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import CustomerProtectedRoute from './components/auth/CustomerProtectedRoute.jsx';

// Utils
import { ROUTES } from './utils/constants.js';

function AppContent() {
  const location = useLocation();

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    // Admin routes get their own layout without main site header/footer
    return (
      <div className="min-h-screen">
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path={`${ROUTES.ADMIN}/*`} 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
        </Routes>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </div>
    );
  }

  // Regular routes get the main site layout with header and footer
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.SHOP} element={<Shop />} />
          <Route path={`${ROUTES.PRODUCT}/:slug`} element={<ProductDetail />} />
          <Route path={ROUTES.CART} element={<Cart />} />
          <Route path={ROUTES.CHECKOUT} element={<Checkout />} />
          <Route path="/checkout/callback" element={<CheckoutCallback />} />
          <Route 
            path={ROUTES.ACCOUNT} 
            element={
              <CustomerProtectedRoute>
                <Account />
              </CustomerProtectedRoute>
            } 
          />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      
      {/* Global Footer */}
      <Footer />
      
      {/* Global Cart Drawer */}
      <CartDrawer />
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App; 