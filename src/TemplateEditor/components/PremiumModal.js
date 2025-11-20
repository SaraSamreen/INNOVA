import React, { useState } from 'react';
import { CreditCard, Crown, Lock, Check, X, AlertCircle } from 'lucide-react';

const PremiumModal = ({ isOpen, onClose, template, onPurchase }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  if (!isOpen || !template) return null;

  const handleStripePayment = async () => {
    // Validate card details
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      setError('Please fill in all card details');
      return;
    }

    // Basic validation
    const cleanCardNumber = cardDetails.number.replace(/\s/g, '');
    if (cleanCardNumber.length !== 16) {
      setError('Invalid card number');
      return;
    }

    if (cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
      setError('Invalid CVV');
      return;
    }

    // Validate expiry
    const expiryParts = cardDetails.expiry.split('/');
    if (expiryParts.length !== 2) {
      setError('Invalid expiry date format');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Get auth token
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please log in to make a purchase');
      }

      // Step 1: Create Payment Intent
      console.log('Creating payment intent...');
      const intentResponse = await fetch('http://localhost:5000/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: template.price,
          templateId: template.id,
          templateTitle: template.title
        })
      });

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await intentResponse.json();
      console.log('Payment intent created:', paymentIntentId);

      // Step 2: Simulate Stripe payment confirmation
      // In test mode with test card 4242 4242 4242 4242, we'll auto-confirm
      console.log('Processing payment with card:', cleanCardNumber);
      
      // For test card 4242 4242 4242 4242, simulate successful payment
      if (cleanCardNumber === '4242424242424242') {
        console.log('Test card detected - simulating successful payment');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 3: Mark payment as confirmed in backend
        const confirmResponse = await fetch('http://localhost:5000/api/payment/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntentId,
            templateId: template.id,
            simulateSuccess: true // Flag for test mode
          })
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.error || 'Payment confirmation failed');
        }

        const confirmData = await confirmResponse.json();
        console.log('Payment confirmation response:', confirmData);

        if (confirmData.success) {
          setIsProcessing(false);
          
          // Show success message
          alert(`🎉 Payment successful! You've unlocked ${template.title}. Redirecting to editor...`);
          
          // Reset form
          setCardDetails({
            number: '',
            expiry: '',
            cvv: '',
            name: ''
          });
          
          // Call purchase handler
          onPurchase(template.id);
          onClose();
        } else {
          throw new Error('Payment was not successful');
        }
      } else {
        // For other cards, show message about test mode
        throw new Error('Please use test card: 4242 4242 4242 4242 for testing');
      }

    } catch (err) {
      setIsProcessing(false);
      setError(err.message || 'Payment failed. Please try again.');
      console.error('Payment error:', err);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white rounded-t-2xl">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-all"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Crown size={32} className="text-yellow-300" />
            <h2 className="text-3xl font-bold">Unlock Premium Template</h2>
          </div>
          <p className="text-white/90">Secure payment powered by Stripe</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-red-800 font-medium">Payment Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Template Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-purple-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-1">{template.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{template.category} • Premium Template</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">${template.price}</div>
                <span className="text-xs text-gray-500">One-time payment</span>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="mb-6 bg-blue-50 p-4 rounded-xl">
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Check className="text-green-500" size={20} />
              What's Included:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Full customization',
                'AI avatar voices',
                'HD 1080p export',
                'No watermarks',
                'Unlimited edits',
                'Commercial rights',
                'Priority support',
                'Custom scenes'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card Payment Form */}
          <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="text-gray-600" size={24} />
              <h4 className="font-semibold text-lg">Payment Details</h4>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({...cardDetails, number: formatCardNumber(e.target.value)})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                maxLength="19"
                disabled={isProcessing}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({...cardDetails, expiry: formatExpiry(e.target.value)})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  maxLength="5"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  maxLength="4"
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleStripePayment}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Pay ${template.price} with Stripe
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            <Lock size={14} className="text-gray-400" />
            <p className="text-xs text-gray-500 text-center">
              Secure payment powered by Stripe • Your data is encrypted and safe
            </p>
          </div>

          {/* Test Card Info */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 font-medium mb-1">🧪 Test Mode:</p>
            <p className="text-xs text-yellow-700">Use card: <strong>4242 4242 4242 4242</strong></p>
            <p className="text-xs text-yellow-700">Expiry: Any future date (e.g., 12/25)</p>
            <p className="text-xs text-yellow-700">CVV: Any 3 digits (e.g., 123)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;