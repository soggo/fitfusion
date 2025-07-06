import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import useProductStore from '../store/productStore.js';
import { ROUTES } from '../utils/constants.js';
import Button from '../components/ui/Button.jsx';
import ProductCard from '../components/product/ProductCard.jsx';

const Home = () => {
  const { getFeaturedProducts, getNewProducts } = useProductStore();
  
  const featuredProducts = getFeaturedProducts(8);
  const newProducts = getNewProducts(4);
  
  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free shipping on orders over ₦50,000'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: 'Your payment information is safe with us'
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '30-day return policy on all items'
    }
  ];
  
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      rating: 5,
      text: 'Absolutely love my new activewear set! The quality is amazing and the fit is perfect.',
      image: '/images/testimonial-1.jpg'
    },
    {
      id: 2,
      name: 'Amanda Chen',
      rating: 5,
      text: 'The fabric is so comfortable and breathable. Perfect for my yoga sessions.',
      image: '/images/testimonial-2.jpg'
    },
    {
      id: 3,
      name: 'Lisa Williams',
      rating: 5,
      text: 'Great quality and fast shipping. Will definitely be ordering again!',
      image: '/images/testimonial-3.jpg'
    }
  ];
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gray-50 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-gray-50 transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>
            
            <div className="relative pt-6 px-4 sm:px-6 lg:px-8"></div>
            
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Elevate Your</span>{' '}
                  <span className="block text-gray-600 xl:inline">Active Lifestyle</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover premium activewear designed for the modern woman. From yoga sessions to street style, 
                  our collections blend comfort, performance, and elegance in every piece.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link to={ROUTES.SHOP}>
                      <Button variant="primary" size="lg" className="w-full flex items-center justify-center px-8 py-3 hover:bg-white hover:text-black">
                        Shop Now
                      
                      </Button>
                    </Link>
                  </div>
                  {/* <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link to={`${ROUTES.SHOP}?category=sets`}>
                      <Button variant="outline" size="lg" className="w-full flex items-center justify-center px-8 py-3">
                        View Sets
                      </Button>
                    </Link>
                  </div> */}
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="/hero-full.webp"
            alt="FitFusion Activewear"
          />
        </div>
      </section>
      
      {/* Features Section */}
      {/* <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center">
                  <feature.icon className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}
      
      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Featured Collection
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Discover our most popular pieces, loved by women everywhere
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-y-8 gap-x-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 xl:gap-x-4 max-w-full">
            {featuredProducts.map((product) => (
              <div className="min-w-[320px] flex-1">
                <ProductCard key={product.id} product={product} />
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to={ROUTES.SHOP}>
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                New Arrivals
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
                Fresh styles just added to our collection
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-1 gap-y-8 gap-x-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 xl:gap-x-4 max-w-full">
              {newProducts.map((product) => (
                <div className="min-w-[320px] flex-1">
                  <ProductCard key={product.id} product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Real reviews from real customers
            </p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Stay in the Loop
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300">
              Be the first to know about new arrivals, exclusive offers, and styling tips
            </p>
            
            <form className="mt-8 max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-md border-0 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                  required
                />
                <Button variant="secondary" type="submit" className="px-6 py-3">
                  Subscribe
                </Button>
              </div>
              <p className="mt-3 text-sm text-gray-400">
                No spam, unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 