// Verifies a Paystack transaction by reference and (optionally) updates the order
// GET /.netlify/functions/paystack-verify?reference=xxxx
const crypto = require('crypto');

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Allow': 'GET' },
      body: 'Method Not Allowed',
    };
  }

  const reference = event.queryStringParameters?.reference;
  if (!reference) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing reference' }),
    };
  }

  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Server misconfiguration' }),
      };
    }

    // Verify with Paystack
    const url = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await res.json();

    // If success, ensure order is marked paid (webhook should handle this, but this is a safety net)
    if (result?.data?.status === 'success') {
      try {
        const { supabase } = await import('./utils/supabase.js');
        const data = result.data;
        const channel = data.channel || 'card';
        const metadata = data.metadata || {};
        const updateFields = {
          payment_status: 'paid',
          status: 'confirmed',
          payment_method: channel,
          payment_intent_id: reference,
        };

        let updateResult;
        if (metadata.order_id) {
          updateResult = await supabase
            .from('orders')
            .update(updateFields)
            .eq('id', metadata.order_id)
            .select();
        } else if (metadata.order_number) {
          updateResult = await supabase
            .from('orders')
            .update(updateFields)
            .eq('order_number', metadata.order_number)
            .select();
        } else {
          updateResult = await supabase
            .from('orders')
            .update(updateFields)
            .eq('payment_intent_id', reference)
            .select();
        }

        if (updateResult?.error) {
          console.error('Order update error on verify:', updateResult.error);
        }
      } catch (e) {
        console.error('Supabase update on verify failed:', e);
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Verify error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};


