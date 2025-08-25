import React, { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import AuthSuccess from './components/AuthSuccess';
import ProviderList from './components/ProviderList';
import ProviderSearch from './components/ProviderSearch';
import TokenExpirationModal from './components/TokenExpirationModal';
import DebugInfo from './components/DebugInfo';
import PostmanComparison from './components/PostmanComparison';
import { AuthResponse, apiService, setTokenExpiredCallback } from './services/api';

type AppView = 'auth' | 'success' | 'providers' | 'search';

function App() {
  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('auth');
  const [showDebug, setShowDebug] = useState(false);
  const [showPostmanComparison, setShowPostmanComparison] = useState(false);
  const [showTokenExpirationModal, setShowTokenExpirationModal] = useState(false);
  const [storedCredentials, setStoredCredentials] = useState<{
    clientId: string;
    clientSecret: string;
    useBackendProxy: boolean;
  } | null>(null);

  // Load stored credentials on app start
  useEffect(() => {
    const savedCredentials = localStorage.getItem('zocdoc_credentials');
    if (savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials);
        setStoredCredentials(credentials);
      } catch (error) {
        console.error('Error parsing stored credentials:', error);
        localStorage.removeItem('zocdoc_credentials');
      }
    }
  }, []);

  // Set up token expiration callback
  useEffect(() => {
    setTokenExpiredCallback(() => {
      console.log('Token expired callback triggered');
      setShowTokenExpirationModal(true);
    });
  }, []);

  const handleAuthSuccess = (response: AuthResponse) => {
    setAuthResponse(response);
    setIsAuthenticated(true);
    setCurrentView('success');
    setShowTokenExpirationModal(false);
  };

  const handleLogout = () => {
    apiService.logout();
    setAuthResponse(null);
    setIsAuthenticated(false);
    setCurrentView('auth');
    // Clear stored credentials on logout
    localStorage.removeItem('zocdoc_credentials');
    setStoredCredentials(null);
  };

  const handleViewProviders = () => {
    setCurrentView('providers');
  };

  const handleViewSearch = () => {
    setCurrentView('search');
  };

  const handleBackToAuth = () => {
    setCurrentView('success');
  };

  const handleQuickReauthenticate = async () => {
    if (!storedCredentials) {
      setShowTokenExpirationModal(false);
      setCurrentView('auth');
      return;
    }

    try {
      const response = await apiService.authenticate(
        storedCredentials.clientId, 
        storedCredentials.clientSecret
      );
      handleAuthSuccess(response);
    } catch (error) {
      console.error('Quick re-authentication failed:', error);
      // If quick re-auth fails, clear stored credentials and go to auth form
      localStorage.removeItem('zocdoc_credentials');
      setStoredCredentials(null);
      setShowTokenExpirationModal(false);
      setCurrentView('auth');
    }
  };

  const handleCloseTokenExpirationModal = () => {
    setShowTokenExpirationModal(false);
    setCurrentView('auth');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'auth':
        return <AuthForm onAuthSuccess={handleAuthSuccess} storedCredentials={storedCredentials} />;
      case 'success':
        return authResponse && (
          <AuthSuccess
            authResponse={authResponse}
            onLogout={handleLogout}
            onViewProviders={handleViewProviders}
            onViewSearch={handleViewSearch}
          />
        );
      case 'providers':
        return <ProviderList onBack={handleBackToAuth} />;
      case 'search':
        return <ProviderSearch onBack={handleBackToAuth} />;
      default:
        return <AuthForm onAuthSuccess={handleAuthSuccess} storedCredentials={storedCredentials} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'white',
                  margin: 0
                }}>
                  🏥 Zocdoc API Test App
                </h1>
                {currentView === 'providers' && (
                  <span style={{
                    marginLeft: '1rem',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    backdropFilter: 'blur(10px)'
                  }}>
                    📋 Provider Directory
                  </span>
                )}
                {currentView === 'search' && (
                  <span style={{
                    marginLeft: '1rem',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    backdropFilter: 'blur(10px)'
                  }}>
                    🔍 Provider Search
                  </span>
                )}
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button
                onClick={() => setShowDebug(!showDebug)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: showDebug ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease'
                }}
              >
                🐛 Debug
              </button>
              <button
                onClick={() => setShowPostmanComparison(!showPostmanComparison)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: showPostmanComparison ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.2s ease'
                }}
              >
                📊 Postman
              </button>
            </div>
          </div>
        </div>
      </header>
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {showDebug && <DebugInfo />}
        {showPostmanComparison && <PostmanComparison />}
        {renderCurrentView()}
      </main>

      {/* Token Expiration Modal */}
      <TokenExpirationModal
        isOpen={showTokenExpirationModal}
        onReauthenticate={handleQuickReauthenticate}
        onClose={handleCloseTokenExpirationModal}
      />
    </div>
  );
}

export default App;
