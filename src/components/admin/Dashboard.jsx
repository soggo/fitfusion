import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users,
  DollarSign,
  Eye,
  Plus,
  AlertTriangle,
  Database,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import { supabase } from '../../lib/supabase.js';
import { productService } from '../../services/productService.js';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    featuredProducts: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionTest, setConnectionTest] = useState({
    status: 'idle', // 'idle', 'testing', 'success', 'error'
    message: '',
    details: null
  });

  useEffect(() => {
    // Load actual dashboard data
    const loadDashboardData = async () => {
      setLoading(true);
      
      try {
        // Fetch actual product data from database
        const products = await productService.getAllProducts();
        
        // Calculate statistics from real data
        const totalProducts = products.length;
        
        // Calculate featured products
        const featuredProducts = products.filter(product => product.featured).length;
        
        // Calculate low stock products (stock <= 5 for any size)
        const lowStockProducts = products.filter(product => {
          if (!product.stock || typeof product.stock !== 'object') return false;
          
          // Check if any size has stock <= 5
          return Object.values(product.stock).some(qty => {
            const stockQty = parseInt(qty) || 0;
            return stockQty > 0 && stockQty <= 5;
          });
        }).length;

        setStats({
          totalProducts,
          totalOrders: 0, // TODO: Implement when orders system is ready
          totalRevenue: 0, // TODO: Implement when orders system is ready
          totalCustomers: 0, // TODO: Implement when user system is ready
          lowStockProducts,
          featuredProducts
        });

        // Clear recent orders - no mock data
        setRecentOrders([]);

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Fallback to zero values on error
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          lowStockProducts: 0,
          featuredProducts: 0
        });
        setRecentOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatPrice = (priceInCents) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(priceInCents / 100);
  };

  const testSupabaseConnection = async () => {
    setConnectionTest({
      status: 'testing',
      message: 'Testing connection...',
      details: null
    });

    try {
      // Test 1: Categories table
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .limit(1);

      if (categoriesError) {
        throw new Error(`Categories table error: ${categoriesError.message}`);
      }

      // Test 2: Products table
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (productsError) {
        throw new Error(`Products table error: ${productsError.message}`);
      }

      // Test 3: RLS policies
      const { data: publicData, error: publicError } = await supabase
        .from('products')
        .select('id, name, price')
        .limit(5);

      if (publicError) {
        throw new Error(`RLS policy error: ${publicError.message}`);
      }

      setConnectionTest({
        status: 'success',
        message: '✅ Supabase connection successful!',
        details: {
          categories: categories.length,
          products: products.length,
          publicData: publicData.length
        }
      });

    } catch (error) {
      setConnectionTest({
        status: 'error',
        message: `❌ Connection failed: ${error.message}`,
        details: null
      });
    }
  };

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case 'pending': return 'bg-yellow-100 text-yellow-800';
  //     case 'shipped': return 'bg-blue-100 text-blue-800';
  //     case 'delivered': return 'bg-green-100 text-green-800';
  //     default: return 'bg-gray-100 text-gray-800';
  //   }
  // };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      href: '/admin/products'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      href: '/admin/orders'
    },
    // {
    //   title: 'Total Revenue',
    //   value: formatPrice(stats.totalRevenue),
    //   icon: DollarSign,
    //   color: 'bg-purple-500',
    //   href: '/admin/analytics'
    // },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-orange-500',
      href: '/admin/users'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your FitFusion admin panel</p>
        </div>
        <Link to="/admin/products/new">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} to={card.href}>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
            {stats.lowStockProducts > 0 ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : (
              <Package className="h-5 w-5 text-green-500" />
            )}
          </div>
          <p className="text-gray-600 mb-4">
            {stats.lowStockProducts > 0 
              ? `${stats.lowStockProducts} products are running low on stock (≤5 items)`
              : 'All products have adequate stock levels'
            }
          </p>
          <Link to="/admin/products">
            <Button 
              variant={stats.lowStockProducts > 0 ? "default" : "outline"} 
              size="sm"
              className={stats.lowStockProducts > 0 ? "bg-yellow-500 hover:bg-yellow-600" : ""}
            >
              {stats.lowStockProducts > 0 ? 'Check Stock' : 'View Products'}
            </Button>
          </Link>
        </div>

        {/* Featured Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Featured Products</h3>
            <Eye className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-gray-600 mb-4">
            {stats.featuredProducts} products are currently featured
          </p>
          <Link to="/admin/products?filter=featured">
            <Button variant="outline" size="sm">
              Manage Featured
            </Button>
          </Link>
        </div>

        {/* Supabase Connection Test */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Database Connection</h3>
            {connectionTest.status === 'idle' && <Database className="h-5 w-5 text-gray-500" />}
            {connectionTest.status === 'testing' && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>}
            {connectionTest.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {connectionTest.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
          </div>
          
          <div className="space-y-3">
            {connectionTest.status === 'idle' && (
              <p className="text-gray-600">
                Test your Supabase database connection
              </p>
            )}
            
            {connectionTest.status === 'testing' && (
              <p className="text-blue-600 font-medium">
                {connectionTest.message}
              </p>
            )}
            
            {connectionTest.status === 'success' && (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">
                  {connectionTest.message}
                </p>
                {connectionTest.details && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• Categories: {connectionTest.details.categories} record(s)</p>
                    <p>• Products: {connectionTest.details.products} record(s)</p>
                    <p>• Public data: {connectionTest.details.publicData} record(s)</p>
                  </div>
                )}
              </div>
            )}
            
            {connectionTest.status === 'error' && (
              <p className="text-red-600 font-medium">
                {connectionTest.message}
              </p>
            )}
            
            <Button 
              onClick={testSupabaseConnection}
              disabled={connectionTest.status === 'testing'}
              variant={connectionTest.status === 'success' ? 'outline' : 'default'}
              size="sm"
              className="w-full"
            >
              {connectionTest.status === 'testing' ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link to="/admin/orders">
              <Button variant="outline" size="sm">
                View All Orders
              </Button>
            </Link>
          </div>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600">
              Orders will appear here once customers start placing them.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(order.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 