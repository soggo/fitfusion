import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Account from './pages/Account.jsx';
import Admin from './pages/Admin.jsx';

// Utils
import { ROUTES } from './utils/constants.js';

function App() {
  return (
    <Router>
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
            <Route path={ROUTES.ACCOUNT} element={<Account />} />
            <Route path={`${ROUTES.ADMIN}/*`} element={<Admin />} />
            
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
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
