// Transform existing JSON data to Supabase format
export const dataTransformer = {
  // Transform categories from JSON to Supabase format
  transformCategories(categories) {
    return categories.map(category => ({
      name: category.name,
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      description: category.description || '',
      image_url: category.image_url || null,
    }));
  },

  // Transform products from JSON to Supabase format
  transformProducts(products) {
    return products.map(product => ({
      name: product.name,
      slug: product.name.toLowerCase().replace(/\s+/g, '-'),
      description: product.description,
      price: product.price, // Already in cents
      original_price: product.originalPrice,
      category_id: null, // Will be set after categories are created
      subcategory: product.subcategory,
      sizes: product.sizes,
      is_new: product.isNew,
      on_sale: product.onSale,
      featured: product.featured,
      rating: product.rating,
      review_count: product.reviewCount,
      sold_count: product.soldCount,
    }));
  },

  // Transform product colors
  transformProductColors(products) {
    const colors = [];
    
    products.forEach(product => {
      if (product.colors) {
        product.colors.forEach(color => {
          colors.push({
            product_id: product.id,
            name: color.name,
            hex_code: color.hex,
          });
        });
      }
    });
    
    return colors;
  },

  // Transform product images
  transformProductImages(products) {
    const images = [];
    
    products.forEach(product => {
      if (product.colors) {
        product.colors.forEach(color => {
          if (color.images) {
            Object.entries(color.images).forEach(([type, url]) => {
              images.push({
                product_id: product.id,
                color_id: null, // Will be set after colors are created
                cloudinary_public_id: url, // For now, using the URL as public_id
                cloudinary_url: url,
                image_type: type,
                alt_text: `${product.name} ${color.name} ${type}`,
                sort_order: type === 'front' ? 1 : type === 'back' ? 2 : 3,
              });
            });
          }
        });
      }
    });
    
    return images;
  },

  // Transform product stock
  transformProductStock(products) {
    const stock = [];
    
    products.forEach(product => {
      if (product.stock && product.colors) {
        product.colors.forEach(color => {
          Object.entries(product.stock).forEach(([size, quantity]) => {
            stock.push({
              product_id: product.id,
              color_id: null, // Will be set after colors are created
              size: size,
              quantity: quantity,
            });
          });
        });
      }
    });
    
    return stock;
  },

  // Get unique categories from products
  extractCategories(products) {
    const categories = new Set();
    products.forEach(product => {
      if (product.category) {
        categories.add(product.category);
      }
    });
    
    return Array.from(categories).map(category => ({
      name: category,
      slug: category.toLowerCase().replace(/\s+/g, '-'),
      description: `${category} collection`,
    }));
  }
}; 