import React, { useState } from 'react';
import { DollarSign, Package, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import GooglePayButton from './GooglePayButton';
import { paymentAPI } from '../services/api';

interface PaymentFormProps {
  onPaymentSuccess: (transaction: any) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onPaymentSuccess }) => {
  const [amount, setAmount] = useState<number>(10);
  const [description, setDescription] = useState('Premium Product Purchase');
  const [currency, setCurrency] = useState('INR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleGooglePaySuccess = async (paymentData: any) => {
    setIsProcessing(true);
    setPaymentStatus('idle');
    setErrorMessage('');

    try {
      // First, create payment intent
      const intentResponse = await paymentAPI.createPaymentIntent({
        amount,
        currency,
        description
      });

      const { transactionId } = intentResponse.data;

      // Then process the payment
      const processResponse = await paymentAPI.processPayment({
        transactionId,
        paymentData: {
          ...paymentData,
          transactionId
        }
      });

      setPaymentStatus('success');
      onPaymentSuccess(processResponse.data.transaction);
    } catch (error: any) {
      console.error('Payment processing error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGooglePayError = (error: any) => {
    console.error('Google Pay error:', error);
    setPaymentStatus('error');
    setErrorMessage('Google Pay initialization failed');
    setIsProcessing(false);
  };

  const resetForm = () => {
    setPaymentStatus('idle');
    setErrorMessage('');
    setAmount(10);
    setDescription('Premium Product Purchase');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
        <div className="text-center text-white">
          <Package className="mx-auto h-12 w-12 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Complete Your Purchase</h2>
          <p className="text-blue-100">Secure checkout with Google Pay</p>
        </div>
      </div>

      <div className="p-6">
        {paymentStatus === 'idle' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-2xl font-bold text-gray-900">{formatPrice(amount)}</span>
              </div>
              <p className="text-sm text-gray-500">{description}</p>
            </div>

            <GooglePayButton
              amount={amount}
              currency={currency}
              description={description}
              onSuccess={handleGooglePaySuccess}
              onError={handleGooglePayError}
              disabled={isProcessing || amount <= 0}
            />

            {errorMessage && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Payment Successful!</h3>
            <p className="text-gray-600">
              Your payment of {formatPrice(amount)} has been processed successfully.
            </p>
            <button
              onClick={resetForm}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Make Another Payment
            </button>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Payment Failed</h3>
            <p className="text-gray-600">
              {errorMessage || 'An error occurred while processing your payment.'}
            </p>
            <button
              onClick={resetForm}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;