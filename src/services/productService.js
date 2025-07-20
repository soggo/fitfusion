import { supabase } from '../lib/supabase.js';

export const productService = {
  // Get all products with related data
  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
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
        category:categories(*)
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
        category:categories(*)
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
        category:categories(*)
      `)
      .eq('categories.slug', categorySlug)
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
        category:categories(*)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error searching products:', error);
      throw error;
    }
    return data || [];
  },

  // Create a new product
  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }
    return data;
  },

  // Update an existing product
  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    return data;
  },

  // Update product images
  async updateProductImages(productId, images) {
    const { data, error } = await supabase
      .from('products')
      .update({ images })
      .eq('id', productId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product images:', error);
      throw error;
    }
    return data;
  },

  // Delete a product
  async deleteProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
    return data;
  },

  // Get category by slug
  async getCategoryBySlug(slug) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
    return data;
  },

  // Create a new category
  async createCategory(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    return data;
  },

  // Update a category
  async updateCategory(id, categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
    return data;
  }
}; 