const crypto = require('crypto');

// Paystack sends POST requests with an HMAC SHA512 signature in x-paystack-signature
// We must validate the signature using PAYSTACK_SECRET_KEY against the RAW request body
exports.handler = async (event) => {
  // Only accept POST (Paystack uses POST). Allow OPTIONS for sanity.
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Allow': 'POST' },
      body: 'Method Not Allowed'
    };
  }

  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('Missing PAYSTACK_SECRET_KEY env var');
      return { statusCode: 500, body: 'Server misconfiguration' };
    }

    const signatureHeader = event.headers['x-paystack-signature'] || event.headers['X-Paystack-Signature'];
    if (!signatureHeader) {
      return { statusCode: 400, body: 'Missing signature' };
    }

    // Get the raw body exactly as Paystack sent it (JSON string)
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : (event.body || '');

    // Compute HMAC SHA512 signature
    const computed = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    // Constant-time compare to avoid timing attacks
    const providedBuf = Buffer.from(signatureHeader, 'hex');
    const computedBuf = Buffer.from(computed, 'hex');
    const valid = providedBuf.length === computedBuf.length && crypto.timingSafeEqual(providedBuf, computedBuf);
    if (!valid) {
      return { statusCode: 401, body: 'Invalid signature' };
    }

    // Signature is valid; process event
    const payload = JSON.parse(rawBody);
    const eventType = payload?.event;

    if (eventType === 'charge.success') {
      const data = payload.data || {};
      const reference = data.reference;
      const channel = data.channel || 'card';
      const metadata = data.metadata || {};
      const orderId = metadata.order_id || metadata.orderId || null;
      const orderNumber = metadata.order_number || metadata.orderNumber || null;

      try {
        // Use Supabase service role on server to bypass RLS and update order
        const { supabase } = await import('./utils/supabase.js');

        const updateFields = {
          payment_status: 'paid',
          status: 'confirmed',
          payment_method: channel,
          payment_intent_id: reference
        };

        let updateResult;
        if (orderId) {
          updateResult = await supabase
            .from('orders')
            .update(updateFields)
            .eq('id', orderId)
            .select();
        } else if (orderNumber) {
          updateResult = await supabase
            .from('orders')
            .update(updateFields)
            .eq('order_number', orderNumber)
            .select();
        } else if (reference) {
          // Fallback: match by stored reference (payment_intent_id)
          updateResult = await supabase
            .from('orders')
            .update(updateFields)
            .eq('payment_intent_id', reference)
            .select();
        } else {
          console.warn('Webhook charge.success without order identifier');
          return { statusCode: 200, body: JSON.stringify({ received: true }) };
        }

        if (updateResult.error) {
          console.error('Order update error:', updateResult.error);
          // Still return 200 so Paystack does not retry indefinitely; log for investigation
          return { statusCode: 200, body: JSON.stringify({ received: true, updated: false }) };
        }

        return { statusCode: 200, body: JSON.stringify({ received: true, updated: true }) };
      } catch (dbError) {
        console.error('Supabase update exception:', dbError);
        return { statusCode: 200, body: JSON.stringify({ received: true, updated: false }) };
      }
    }

    // For other events, acknowledge to stop retries
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Webhook handler error:', err);
    // Do not expose internals; still 200 to prevent repeated retries if we parsed but failed after
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  }
};


