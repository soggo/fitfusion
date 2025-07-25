import React from 'react';
import Loading from '../components/common/Loading.jsx';

const Account = () => {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Account</h1>
          <p className="text-gray-600 mb-8">Account Page - Coming Soon</p>
          <div className="bg-gray-100 rounded-lg p-8">
            <Loading text="Account page is under construction..." />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account; 