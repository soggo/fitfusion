// Creates an order in Supabase and initializes a Paystack transaction
// POST /.netlify/functions/paystack-init
// Body: { email, phone, shipping_address, items, totals: { subtotal, shipping, tax, total } }

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Allow': 'POST' },
      body: 'Method Not Allowed',
    };
  }

  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return { statusCode: 500, body: 'Server misconfiguration: PAYSTACK_SECRET_KEY missing' };
    }

    const { supabase } = await import('./utils/supabase.js');

    const input = JSON.parse(event.body || '{}');
    const { email, phone, shipping_address, items, totals, user_id, currency } = input;

    if (!email || !totals || !items || !Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields: email, items, totals' }),
      };
    }

    const currencyCode = (currency || 'NGN').toUpperCase();
    const subtotal = Number(totals.subtotal || 0);
    const shippingCost = Number(totals.shipping || 0);
    const taxAmount = Number(totals.tax || 0);
    const discountAmount = Number(totals.discount || 0);
    const totalAmount = Number(totals.total || subtotal + shippingCost + taxAmount - discountAmount);

    // 1) Create order
    const orderInsert = {
      user_id: user_id || null,
      guest_email: user_id ? null : email,
      guest_phone: user_id ? null : phone,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'paystack',
      subtotal: Math.round(subtotal),
      shipping_cost: Math.round(shippingCost),
      tax_amount: Math.round(taxAmount),
      discount_amount: Math.round(discountAmount),
      total_amount: Math.round(totalAmount),
      shipping_address: shipping_address || {},
    };

    const { data: orderRows, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert)
      .select();

    if (orderError || !orderRows || orderRows.length === 0) {
      console.error('Order insert error:', orderError);
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Failed to create order' }),
      };
    }

    const order = orderRows[0];

    // 2) Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product?.id || null,
      product_name: item.product?.name || 'Product',
      product_slug: item.product?.slug || null,
      product_image_url: (item.selectedColor?.images && item.selectedColor.images.front) || null,
      color_name: item.selectedColor?.name || null,
      color_hex: item.selectedColor?.hex || null,
      size: item.selectedSize || null,
      unit_price: Math.round(item.product?.price || 0),
      quantity: Math.round(item.quantity || 1),
      total_price: Math.round((item.product?.price || 0) * (item.quantity || 1)),
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items insert error:', itemsError);
      // Don't fail the entire flow; but you may want to handle compensation
    }

    // 3) Initialize Paystack transaction
    const protocol = event.headers['x-forwarded-proto'] || (process.env.CONTEXT ? 'https' : 'http');
    const host = event.headers.host;
    const baseUrlOverride = process.env.PAYSTACK_CALLBACK_URL_BASE; // e.g., https://buyfitfusion.netlify.app
    const baseUrl = baseUrlOverride || `${protocol}://${host}`;
    const callbackUrl = `${baseUrl}/checkout/callback`;

    const initBody = {
      email,
      amount: Math.round(totalAmount * 100), // to kobo
      currency: currencyCode,
      callback_url: callbackUrl,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        customer_email: email,
      },
    };

    const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(initBody),
    });

    const initJson = await initRes.json();
    if (!initRes.ok || !initJson?.status) {
      console.error('Paystack init failed:', initJson);
      return {
        statusCode: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Failed to initialize Paystack', details: initJson }),
      };
    }

    const authorizationUrl = initJson?.data?.authorization_url;
    const reference = initJson?.data?.reference;

    // Save reference on order for correlation
    if (reference) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_intent_id: reference })
        .eq('id', order.id);
      if (updateError) {
        console.error('Failed to store reference on order:', updateError);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        authorization_url: authorizationUrl,
        reference,
        order_id: order.id,
        order_number: order.order_number,
      }),
    };
  } catch (error) {
    console.error('paystack-init error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};


