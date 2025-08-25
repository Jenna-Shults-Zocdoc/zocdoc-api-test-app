import React, { useState } from 'react';
import { apiService, AuthResponse } from '../services/api';

interface AuthFormProps {
  onAuthSuccess: (response: AuthResponse) => void;
  storedCredentials?: {
    clientId: string;
    clientSecret: string;
    useBackendProxy: boolean;
  } | null;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess, storedCredentials }) => {
  const [clientId, setClientId] = useState(storedCredentials?.clientId || '');
  const [clientSecret, setClientSecret] = useState(storedCredentials?.clientSecret || '');
  const [useBackendProxy, setUseBackendProxy] = useState(storedCredentials?.useBackendProxy ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId || !clientSecret) {
      setError('Please enter both Client ID and Client Secret');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.authenticate(clientId, clientSecret);
      
      // Store credentials for quick re-authentication
      if (useBackendProxy) {
        localStorage.setItem('zocdoc_credentials', JSON.stringify({
          clientId,
          clientSecret,
          useBackendProxy
        }));
      }
      
      onAuthSuccess(response);
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockAuth = () => {
    const mockResponse: AuthResponse = {
      access_token: 'mock_token_12345',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'external.appointment.read'
    };
    onAuthSuccess(mockResponse);
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '2rem',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '1rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e2e8f0'
    }}>
      <h2 style={{ 
        fontSize: '1.875rem', 
        fontWeight: '700', 
        color: '#1f2937', 
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        🔐 Zocdoc API Authentication
      </h2>

      {error && (
        <div style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          border: '1px solid #f87171',
          color: '#b91c1c',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            🆔 Client ID *
          </label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Enter your Client ID"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e2e8f0',
              borderRadius: '0.75rem',
              outline: 'none',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              backgroundColor: '#ffffff'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>
            🔑 Client Secret *
          </label>
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Enter your Client Secret"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #e2e8f0',
              borderRadius: '0.75rem',
              outline: 'none',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              backgroundColor: '#ffffff'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '0.5rem',
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '0.75rem',
          border: '1px solid #0ea5e9'
        }}>
          <input
            type="checkbox"
            id="useBackendProxy"
            checked={useBackendProxy}
            onChange={(e) => setUseBackendProxy(e.target.checked)}
            style={{ width: '1.25rem', height: '1.25rem', accentColor: '#0ea5e9' }}
          />
          <label htmlFor="useBackendProxy" style={{
            fontSize: '0.875rem',
            color: '#0c4a6e',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            🌐 Use Backend Proxy (Recommended for real credentials)
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1rem',
            background: isLoading ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            fontSize: '1rem',
            fontWeight: '600',
            marginTop: '1rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          {isLoading ? '🔄 Authenticating...' : '🚀 Authenticate'}
        </button>
      </form>

      <div style={{
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '2px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          🧪 For testing purposes only:
        </p>
        <button
          onClick={handleMockAuth}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          🎭 Use Mock Authentication
        </button>
      </div>
    </div>
  );
};

export default AuthForm; 