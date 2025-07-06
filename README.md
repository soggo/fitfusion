# FitFusion - Premium Activewear Ecommerce

A modern, responsive ecommerce website for premium activewear inspired by Leelo Active. Built with React, Vite, and Tailwind CSS, designed for optimal performance and user experience.

## 🚀 Features

### ✅ Currently Implemented

- **Modern React Architecture**: Built with React 18+ and Vite for fast development and optimal performance
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: Zustand for cart and product management with localStorage persistence
- **Product Catalog**: Advanced filtering, sorting, and search functionality
- **Shopping Cart**: Slide-out cart drawer with item management
- **Product Cards**: Interactive cards with hover effects, color swatches, and quick actions
- **Navigation**: Sticky header with search, mobile menu, and cart integration
- **Professional Layout**: Clean design with earth tones and modern UI patterns

### 🚧 In Development

- **Product Detail Pages**: Advanced image gallery with zoom and color variants
- **Checkout Process**: Multi-step checkout with payment integration
- **User Authentication**: Firebase integration for login/signup
- **Admin Panel**: Product management and inventory tracking
- **Enhanced Features**: Wishlist, reviews, related products

## 🛠️ Tech Stack

- **Frontend**: React 18+ with Vite
- **Styling**: Tailwind CSS with custom components
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Form Handling**: React Hook Form (ready for integration)
- **Authentication**: Firebase (setup ready)

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Shared components (Header, Footer, Loading)
│   ├── product/         # Product-related components
│   ├── cart/           # Shopping cart components
│   ├── auth/           # Authentication components (planned)
│   ├── admin/          # Admin panel components (planned)
│   └── ui/             # Reusable UI components
├── pages/              # Main page components
├── store/              # Zustand state management
├── utils/              # Helper functions and constants
├── data/               # Mock data and JSON files
└── assets/             # Static assets
```

## 🎯 Product Categories

### Tops
- Moana Piece (one-shoulder tops)
- Future: T-shirts, Singlets, Jackets, Tank tops

### Bottoms
- Currently none in stock
- Future: Shorts, Leggings, Skirts

### Sets
- Claire Romper (one-piece set)
- Cecile Singlet + Short Set
- Theresa Singlet + Leggings Set
- Liza Jumpsuit/Bodysuit
- Maria Jacket + Short Set
- Monica Jacket + Leggings Set
- Rita Long-Top + Leggings Set
- Lucy Long-Top + Shorts Set

## 🎨 Design System

### Color Palette
- **Primary**: `#1F2937` (Dark Gray/Black)
- **Secondary**: `#D2B48C` (Tan/Beige)
- **Accent**: `#8B4513` (Brown)
- **Background**: `#FFFFFF` (White)
- **Success**: `#10B981` (Green)
- **Error**: `#EF4444` (Red)

### Key Features
- Earth tone color scheme
- Clean, minimalist design
- Smooth animations and transitions
- Accessible design patterns
- Mobile-first responsive layout

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern web browser

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - The app will hot-reload as you make changes

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🛍️ Usage

### Shopping Experience
1. **Browse Products**: Use the shop page with filters and search
2. **Product Details**: Click on products to view details (coming soon)
3. **Add to Cart**: Select size and color, then add to cart
4. **Cart Management**: Use the slide-out cart to manage items
5. **Checkout**: Proceed to checkout (coming soon)

### Admin Features (Planned)
- Product upload and management
- Inventory tracking
- Order management
- Analytics dashboard

## 🔧 Development

### State Management
The app uses Zustand for state management with two main stores:

- **Cart Store**: Manages shopping cart state with localStorage persistence
- **Product Store**: Handles products, filters, sorting, and search

### Key Components

#### ProductCard
- Interactive product display with hover effects
- Color swatch selection with image preview
- Size selection and stock management
- Add to cart functionality

#### Header
- Responsive navigation with mobile menu
- Search functionality
- Cart icon with item count
- User account access

#### ProductFilters
- Category, size, and color filtering
- Price range selection
- Stock availability filtering
- Quick filters for new/sale items

### Custom Hooks and Utilities
- Product filtering and sorting utilities
- Price formatting for Nigerian Naira
- Image lazy loading and optimization
- Form validation helpers

## 🎯 Performance Features

- **Lazy Loading**: Images load as needed
- **Code Splitting**: Route-based code splitting ready
- **Optimized Bundle**: Vite's optimized production builds
- **Responsive Images**: Multiple image sizes for different devices
- **Smooth Animations**: 60fps animations with CSS transitions

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Basic ecommerce functionality
- ✅ Product catalog with filtering
- ✅ Shopping cart functionality
- ✅ Responsive design

### Phase 2 (Next)
- 🚧 Complete product detail pages
- 🚧 User authentication system
- 🚧 Checkout process
- 🚧 Admin panel

### Phase 3 (Future)
- 📋 Payment integration (PayStack)
- 📋 Order management
- 📋 Email notifications
- 📋 Advanced analytics
- 📋 SEO optimization
- 📋 PWA features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code structure and naming conventions
- Use TypeScript interfaces for new components (planned migration)
- Ensure mobile responsiveness for all new features
- Add proper error handling and loading states
- Write clean, commented code

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ for the modern woman's active lifestyle.

## 📞 Support

For support, email hello@fitfusion.com or create an issue in this repository.

---

**FitFusion** - Elevate Your Active Lifestyle
