import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const CheckoutCallback = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus('failed');
        setMessage('Missing payment reference.');
        return;
      }

      try {
        const res = await fetch('/.netlify/functions/paystack-verify?reference=' + encodeURIComponent(reference));
        const data = await res.json();

        if (data?.data?.status === 'success') {
          setStatus('success');
          setMessage('Payment confirmed. Thank you for your order!');
        } else {
          setStatus('failed');
          setMessage(data?.message || 'Payment verification failed.');
        }
      } catch (e) {
        setStatus('failed');
        setMessage('An error occurred while verifying your payment.');
      }
    };

    verify();
  }, [reference]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
            <p className="text-gray-600">Verifying your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
            <h2 className="text-xl font-semibold">Payment Successful</h2>
            <p className="text-gray-700">{message}</p>
            <div className="flex gap-3 mt-4">
              <Link to="/" className="px-4 py-2 bg-black text-white rounded">Continue Shopping</Link>
              <Link to="/account" className="px-4 py-2 border rounded">View Orders</Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
            <h2 className="text-xl font-semibold">Payment Not Confirmed</h2>
            <p className="text-gray-700">{message}</p>
            <div className="flex gap-3 mt-4">
              <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Go Back</button>
              <Link to="/checkout" className="px-4 py-2 bg-black text-white rounded">Retry Payment</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutCallback;


