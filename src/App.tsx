import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthForm from './components/AuthForm';
import PaymentForm from './components/PaymentForm';
import TransactionHistory from './components/TransactionHistory';
import { LogOut, CreditCard, History, User, Smartphone } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading, login, register, logout } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'payment' | 'history'>('payment');
  const [latestTransaction, setLatestTransaction] = useState<any>(null);

  const handlePaymentSuccess = (transaction: any) => {
    setLatestTransaction(transaction);
    setActiveTab('history');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm
        mode={authMode}
        onSubmit={async (email, password, name) => {
          if (authMode === 'login') {
            await login(email, password);
          } else {
            await register(email, password, name!);
          }
        }}
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">MERN Pay</span>
              </div>
            </div>
            
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('payment')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'payment'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Payment
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <History className="h-4 w-4 mr-2" />
                History
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            {activeTab === 'payment' 
              ? 'Make secure payments with Google Pay integration'
              : 'View your transaction history and payment details'
            }
          </p>
        </div>

        {/* Success Message */}
        {latestTransaction && activeTab === 'payment' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Payment successful! Transaction ID: {latestTransaction.id}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'payment' ? (
            <PaymentForm onPaymentSuccess={handlePaymentSuccess} />
          ) : (
            <TransactionHistory />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 MERN Pay. Secure payments powered by Google Pay.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;