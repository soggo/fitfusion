import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import Dashboard from '../components/admin/Dashboard.jsx';
import ProductList from '../components/admin/ProductList.jsx';
import ProductForm from '../components/admin/ProductForm.jsx';
import { DataMigration } from '../components/admin/DataMigration.jsx';

const Admin = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
        <Route path="/migration" element={<DataMigration />} />
        
        {/* Placeholder routes for future features */}
        <Route path="/categories" element={<div className="p-8 text-center text-gray-500">Categories management coming soon...</div>} />
        <Route path="/orders" element={<div className="p-8 text-center text-gray-500">Orders management coming soon...</div>} />
        <Route path="/analytics" element={<div className="p-8 text-center text-gray-500">Analytics coming soon...</div>} />
        <Route path="/users" element={<div className="p-8 text-center text-gray-500">User management coming soon...</div>} />
        <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Settings coming soon...</div>} />
      </Routes>
    </AdminLayout>
  );
};

export default Admin; 