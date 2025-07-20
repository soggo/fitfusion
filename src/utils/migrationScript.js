import { dataTransformer } from './dataTransformer.js';
import productsData from '../data/products.json' assert { type: 'json' };
import categoriesData from '../data/categories.json' assert { type: 'json' };

export const migrationScript = {
  // Prepare all data for migration
  prepareMigrationData() {
    const categories = dataTransformer.extractCategories(productsData);
    const products = dataTransformer.transformProducts(productsData);
    const colors = dataTransformer.transformProductColors(productsData);
    const images = dataTransformer.transformProductImages(productsData);
    const stock = dataTransformer.transformProductStock(productsData);

    return {
      categories,
      products,
      colors,
      images,
      stock
    };
  },

  // Execute migration via Netlify function
  async executeMigration() {
    const data = this.prepareMigrationData();
    
    try {
      // Migrate categories first
      const categoriesResponse = await fetch('/.netlify/functions/migrate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'migrate-categories',
          data: data.categories
        })
      });

      if (!categoriesResponse.ok) {
        throw new Error('Failed to migrate categories');
      }

      // Migrate products
      const productsResponse = await fetch('/.netlify/functions/migrate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'migrate-products',
          data: data.products
        })
      });

      if (!productsResponse.ok) {
        throw new Error('Failed to migrate products');
      }

      // Migrate stock
      const stockResponse = await fetch('/.netlify/functions/migrate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'migrate-stock',
          data: data.stock
        })
      });

      if (!stockResponse.ok) {
        throw new Error('Failed to migrate stock');
      }

      return {
        success: true,
        message: 'Migration completed successfully'
      };

    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Log migration data for debugging
  logMigrationData() {
    const data = this.prepareMigrationData();
    console.log('Migration Data:', data);
    return data;
  }
}; 