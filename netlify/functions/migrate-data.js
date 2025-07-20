import { supabase } from './utils/supabase.js';
import { headers, handleCors } from './utils/cors.js';

export const handler = async (event) => {
  const corsResponse = handleCors(event);
  if (corsResponse) return corsResponse;

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { action, data } = JSON.parse(event.body);

    switch (action) {
      case 'migrate-categories':
        return await migrateCategories(data);
      case 'migrate-products':
        return await migrateProducts(data);
      case 'migrate-stock':
        return await migrateStock(data);
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('Migration error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

async function migrateCategories(categories) {
  const { data, error } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' });

  if (error) throw error;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      success: true, 
      message: `Migrated ${data?.length || 0} categories`,
      data 
    }),
  };
}

async function migrateProducts(products) {
  const { data, error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'slug' });

  if (error) throw error;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      success: true, 
      message: `Migrated ${data?.length || 0} products`,
      data 
    }),
  };
}

async function migrateStock(stockData) {
  const { data, error } = await supabase
    .from('product_stock')
    .upsert(stockData, { onConflict: 'product_id,color_id,size' });

  if (error) throw error;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      success: true, 
      message: `Migrated ${data?.length || 0} stock records`,
      data 
    }),
  };
} 