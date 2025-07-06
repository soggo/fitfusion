import React from 'react';
import { useParams } from 'react-router-dom';
import { extractIdFromSlug } from '../utils/helpers.js';
import useProductStore from '../store/productStore.js';
import Loading from '../components/common/Loading.jsx';

const ProductDetail = () => {
  const { slug } = useParams();
  const { getProductById } = useProductStore();
  
  const productId = extractIdFromSlug(slug);
  const product = getProductById(productId);
  
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-8">Product Detail Page - Coming Soon</p>
          <div className="bg-gray-100 rounded-lg p-8">
            <Loading text="Product detail page is under construction..." />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 