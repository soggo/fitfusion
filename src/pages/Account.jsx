import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { User, Package, MapPin, Settings, LogOut, Edit2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Loading from '../components/common/Loading.jsx';
import { formatPrice } from '../utils/helpers.js';

const Account = () => {
  const { user, profile, loading, isAdmin, updateProfile, getUserAddresses, addAddress, updateAddress, deleteAddress, getUserOrders, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [addressData, setAddressData] = useState({
    type: 'shipping',
    first_name: '',
    last_name: '',
    company: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Nigeria',
    phone: '',
    is_default: false
  });

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/" replace />;
  }

  // Redirect admin users to admin panel
  if (!loading && user && isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      loadAddresses();
      loadOrders();
    }
  }, [user]);

  const loadAddresses = async () => {
    const { data, error } = await getUserAddresses();
    if (error) {
      console.error('Error loading addresses:', error);
    } else {
      setAddresses(data);
    }
  };

  const loadOrders = async () => {
    const { data, error } = await getUserOrders();
    if (error) {
      console.error('Error loading orders:', error);
    } else {
      setOrders(data);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const { error } = await updateProfile(profileData);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { error } = await addAddress(addressData);
    if (error) {
      toast.error('Failed to add address');
    } else {
      toast.success('Address added successfully');
      setShowAddAddress(false);
      setAddressData({
        type: 'shipping',
        first_name: '',
        last_name: '',
        company: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Nigeria',
        phone: '',
        is_default: false
      });
      loadAddresses();
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const { error } = await deleteAddress(addressId);
      if (error) {
        toast.error('Failed to delete address');
      } else {
        toast.success('Address deleted successfully');
        loadAddresses();
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loading text="Loading account..." />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'orders', name: 'Orders', icon: Package },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600">
                Welcome back, {profile?.first_name || user?.email}!
              </p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut size={20} />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Edit2 size={16} />
                        Edit
                      </Button>
                    )}
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <Input
                          type="text"
                          value={profileData.first_name}
                          onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                          disabled={!isEditing}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <Input
                          type="text"
                          value={profileData.last_name}
                          onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                          disabled={!isEditing}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-4">
                        <Button type="submit">Save Changes</Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setProfileData({
                              first_name: profile?.first_name || '',
                              last_name: profile?.last_name || '',
                              phone: profile?.phone || ''
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                      <Button onClick={() => window.location.href = '/shop'}>
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Order #{order.order_number}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="font-medium">{formatPrice(order.total_amount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                    <Button
                      onClick={() => setShowAddAddress(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Address
                    </Button>
                  </div>

                  {showAddAddress && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-medium mb-4">Add New Address</h3>
                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder="First Name"
                            value={addressData.first_name}
                            onChange={(e) => setAddressData({...addressData, first_name: e.target.value})}
                            required
                          />
                          <Input
                            placeholder="Last Name"
                            value={addressData.last_name}
                            onChange={(e) => setAddressData({...addressData, last_name: e.target.value})}
                            required
                          />
                        </div>
                        <Input
                          placeholder="Company (Optional)"
                          value={addressData.company}
                          onChange={(e) => setAddressData({...addressData, company: e.target.value})}
                        />
                        <Input
                          placeholder="Address Line 1"
                          value={addressData.address_line_1}
                          onChange={(e) => setAddressData({...addressData, address_line_1: e.target.value})}
                          required
                        />
                        <Input
                          placeholder="Address Line 2 (Optional)"
                          value={addressData.address_line_2}
                          onChange={(e) => setAddressData({...addressData, address_line_2: e.target.value})}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            placeholder="City"
                            value={addressData.city}
                            onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                            required
                          />
                          <Input
                            placeholder="State"
                            value={addressData.state}
                            onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                            required
                          />
                          <Input
                            placeholder="Postal Code"
                            value={addressData.postal_code}
                            onChange={(e) => setAddressData({...addressData, postal_code: e.target.value})}
                            required
                          />
                        </div>
                        <Input
                          placeholder="Phone Number"
                          value={addressData.phone}
                          onChange={(e) => setAddressData({...addressData, phone: e.target.value})}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="is_default"
                            checked={addressData.is_default}
                            onChange={(e) => setAddressData({...addressData, is_default: e.target.checked})}
                          />
                          <label htmlFor="is_default" className="text-sm text-gray-700">
                            Set as default address
                          </label>
                        </div>
                        <div className="flex gap-4">
                          <Button type="submit">Save Address</Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddAddress(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">
                                {address.first_name} {address.last_name}
                              </h4>
                              {address.is_default && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.address_line_1}
                              {address.address_line_2 && `, ${address.address_line_2}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.postal_code}
                            </p>
                            {address.phone && (
                              <p className="text-sm text-gray-600">{address.phone}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {addresses.length === 0 && !showAddAddress && (
                    <div className="text-center py-12">
                      <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                      <p className="text-gray-600 mb-4">Add an address to make checkout faster</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Password</h3>
                      <p className="text-sm text-gray-600 mb-4">Change your account password</p>
                      <Button variant="outline" onClick={() => toast.info('Password change coming soon!')}>
                        Change Password
                      </Button>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Notifications</h3>
                      <p className="text-sm text-gray-600 mb-4">Manage your email preferences</p>
                      <Button variant="outline" onClick={() => toast.info('Notification settings coming soon!')}>
                        Manage Notifications
                      </Button>
                    </div>

                    <div className="border border-red-200 rounded-lg p-4">
                      <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
                      <p className="text-sm text-red-600 mb-4">Permanently delete your account and all data</p>
                      <Button 
                        variant="outline" 
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => toast.info('Account deletion coming soon!')}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account; 