import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { ROUTES } from '../../utils/constants.js';

const Footer = () => {
  const navigation = {
    shop: [
      { name: 'All Products', href: ROUTES.SHOP },
      { name: 'Tops', href: `${ROUTES.SHOP}?category=tops` },
      { name: 'Sets', href: `${ROUTES.SHOP}?category=sets` },
      { name: 'Bottoms', href: `${ROUTES.SHOP}?category=bottoms` },
      { name: 'New Arrivals', href: `${ROUTES.SHOP}?filter=new` },
      { name: 'Sale', href: `${ROUTES.SHOP}?filter=sale` },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      // { name: 'Size Guide', href: '/size-guide' },
      // { name: 'Care Instructions', href: '/care' },
      // { name: 'Sustainability', href: '/sustainability' },
      // { name: 'Careers', href: '/careers' },
      // { name: 'Press', href: '/press' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Shipping Info', href: '/shipping' },
      // { name: 'Returns & Exchanges', href: '/returns' },
      // { name: 'Track Your Order', href: '/track' },
      { name: 'Customer Service', href: '/support' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      // { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Refund Policy', href: '/refund' },
    ],
  };
  
  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/fitfusion',
      icon: Instagram,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/fitfusion',
      icon: Twitter,
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/fitfusion',
      icon: Facebook,
    },
  ];
  
  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 lg:py-16">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            {/* Company Info */}
            <div className="space-y-8 xl:col-span-1">
              <Link to={ROUTES.HOME} className="text-2xl font-bold text-white">
                FitFusion
              </Link>
              <p className="text-gray-300 text-base">
                Premium activewear designed for the modern woman. Comfort, style, and performance in every piece.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Mail className="h-5 w-5 mr-3" />
                  <span>hello@fitfusion.com</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone className="h-5 w-5 mr-3" />
                  <span>+234 123 456 7890</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>Worldwide</span>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-6">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                    Shop
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {navigation.shop.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                    Company
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {navigation.company.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                    Support
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {navigation.support.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                    Legal
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {navigation.legal.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-base text-gray-300 hover:text-white transition-colors duration-200"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Newsletter Signup */}
          <div className="mt-12 border-t border-gray-700 pt-8">
            <div className="xl:grid xl:grid-cols-3 xl:gap-8">
              <div className="xl:col-span-1">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
                  Subscribe to our newsletter
                </h3>
                <p className="mt-4 text-base text-gray-300">
                  Get the latest updates on new products and exclusive offers.
                </p>
              </div>
              <div className="mt-4 xl:mt-0 xl:col-span-2">
                <form className="sm:flex sm:max-w-md lg:max-w-lg">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email-address"
                    id="email-address"
                    autoComplete="email"
                    required
                    className="appearance-none min-w-0 w-full bg-white border border-transparent rounded-md py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white focus:border-white focus:placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                  <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <button
                      type="submit"
                      className="w-full bg-white border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-colors duration-200"
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} FitFusion. All rights reserved.
            </p>
            <div className="mt-4 lg:mt-0">
              <p className="text-sm text-gray-400">
                Made with ❤️ in Nigeria
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 