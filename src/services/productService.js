import { supabase } from '../lib/supabase.js';

export const productService = {
  // Get all products with related data
  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        colors:product_colors(*),
        images:product_images(*),
        stock:product_stock(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    return data || [];
  },

  // Get a single product by ID
  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        colors:product_colors(*),
        images:product_images(*),
        stock:product_stock(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
    return data;
  },

  // Get featured products
  async getFeaturedProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        colors:product_colors(*),
        images:product_images(*)
      `)
      .eq('featured', true)
      .limit(8)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
    return data || [];
  },

  // Get products by category
  async getProductsByCategory(categorySlug) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        colors:product_colors(*),
        images:product_images(*),
        stock:product_stock(*)
      `)
      .eq('category.slug', categorySlug)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
    return data || [];
  },

  // Get all categories
  async getAllCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
    return data || [];
  },

  // Search products
  async searchProducts(query) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        colors:product_colors(*),
        images:product_images(*)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }
    return data || [];
  },

  // Get product stock for a specific product, color, and size
  async getProductStock(productId, colorId, size) {
    const { data, error } = await supabase
      .from('product_stock')
      .select('quantity')
      .eq('product_id', productId)
      .eq('color_id', colorId)
      .eq('size', size)
      .single();
    
    if (error) {
      console.error('Error fetching product stock:', error);
      return { quantity: 0 };
    }
    return data || { quantity: 0 };
  }
}; 