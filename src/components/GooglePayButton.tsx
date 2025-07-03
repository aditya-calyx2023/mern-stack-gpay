import React, { useEffect, useState } from 'react';
import { Smartphone, Shield, CreditCard, AlertCircle } from 'lucide-react';

interface GooglePayButtonProps {
  amount: number;
  currency?: string;
  description: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

const GooglePayButton: React.FC<GooglePayButtonProps> = ({
  amount,
  currency = 'USD',
  description,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [isGooglePayReady, setIsGooglePayReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentsClient, setPaymentsClient] = useState<any>(null);

  useEffect(() => {
    const initializeGooglePay = async () => {
      try {
        // Load Google Pay API
        const script = document.createElement('script');
        script.src = 'https://pay.google.com/gp/p/js/pay.js';
        script.onload = () => {
          const google = (window as any).google;
          if (google?.payments?.api?.PaymentsClient) {
            const client = new google.payments.api.PaymentsClient({
              environment: 'TEST' // Use 'PRODUCTION' for production
            });
            setPaymentsClient(client);
            checkGooglePayAvailability(client);
          }
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to initialize Google Pay:', error);
        onError(error);
      }
    };

    const checkGooglePayAvailability = async (client: any) => {
      try {
        const isReadyToPayRequest = {
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [
            {
              type: 'CARD',
              parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
              }
            }
          ]
        };

        const response = await client.isReadyToPay(isReadyToPayRequest);
        setIsGooglePayReady(response.result);
      } catch (error) {
        console.error('Error checking Google Pay availability:', error);
        setIsGooglePayReady(false);
      }
    };

    initializeGooglePay();
  }, [onError]);

  const handleGooglePay = async () => {
    if (!paymentsClient || !isGooglePayReady || disabled) return;

    setIsLoading(true);

    try {
      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'example',
                gatewayMerchantId: 'exampleGatewayMerchantId'
              }
            }
          }
        ],
        merchantInfo: {
          merchantId: 'BCR2DN4T26HZJJRR',
          merchantName: 'MERN Google Pay Store'
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: amount.toFixed(2),
          currencyCode: 'INR',
          countryCode: 'IN'
        },
        shippingAddressRequired: false,
        emailRequired: true
      };

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      
      // Simulate opening Google Pay app (in a real app, this would be handled by the Google Pay SDK)
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        // On mobile, this would open the Google Pay app
        window.location.href = `googlepay://pay?amount=${amount}&currency=${currency}&description=${encodeURIComponent(description)}`;
      }
      
      onSuccess(paymentData);
    } catch (error) {
      console.error('Google Pay error:', error);
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openGooglePayApp = () => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try to open Google Pay app directly
      const googlePayUrl = `googlepay://pay?amount=${amount}&currency=${currency}&description=${encodeURIComponent(description)}`;
      window.location.href = googlePayUrl;
      
      // Fallback to Google Pay web if app is not available
      setTimeout(() => {
        window.open('https://pay.google.com/', '_blank');
      }, 2000);
    } else {
      // On desktop, open Google Pay web
      window.open('https://pay.google.com/', '_blank');
    }
  };

  if (!isGooglePayReady) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-gray-400" />
        <p className="text-gray-600 mb-4">Google Pay is not available on this device</p>
        <button
          onClick={openGooglePayApp}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Smartphone className="mr-2 h-4 w-4" />
          Open Google Pay App
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleGooglePay}
        disabled={disabled || isLoading}
        className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-medium transition-all transform hover:scale-105 ${
          disabled || isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-black text-white hover:bg-gray-800 shadow-lg'
        }`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Processing...
          </>
        ) : (
          <>
            <div className="flex items-center mr-3">
              <span className="text-blue-500 font-bold">G</span>
              <span className="text-red-500 font-bold">o</span>
              <span className="text-yellow-500 font-bold">o</span>
              <span className="text-blue-500 font-bold">g</span>
              <span className="text-green-500 font-bold">l</span>
              <span className="text-red-500 font-bold">e</span>
              <span className="ml-2 text-white">Pay</span>
            </div>
            <CreditCard className="h-5 w-5" />
          </>
        )}
      </button>

      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-1" />
          <span>Secure</span>
        </div>
        <div className="flex items-center">
          <Smartphone className="h-4 w-4 mr-1" />
          <span>Fast</span>
        </div>
      </div>

      <button
        onClick={openGooglePayApp}
        className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
      >
        <Smartphone className="mr-2 h-4 w-4" />
        Open Google Pay App Directly
      </button>
    </div>
  );
};

export default GooglePayButton;