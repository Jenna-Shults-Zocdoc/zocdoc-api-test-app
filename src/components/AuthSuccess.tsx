import React from 'react';
import { AuthResponse } from '../services/api';

interface AuthSuccessProps {
  authResponse: AuthResponse;
  onLogout: () => void;
  onViewProviders: () => void;
  onViewSearch: () => void;
  onViewAppointments: () => void;
}

const AuthSuccess: React.FC<AuthSuccessProps> = ({ authResponse, onLogout, onViewProviders, onViewSearch, onViewAppointments }) => {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '2rem',
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
      borderRadius: '1rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e2e8f0',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
        fontSize: '2.5rem',
        color: 'white',
        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
      }}>
        ✅
      </div>

      <h2 style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1rem'
      }}>
        🎉 Authentication Successful!
      </h2>

      <p style={{
        fontSize: '1.125rem',
        color: '#6b7280',
        marginBottom: '2rem',
        lineHeight: '1.6'
      }}>
        You're now connected to the Zocdoc API. You can explore providers and search for available appointments.
      </p>

      <div style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        border: '1px solid #0ea5e9',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem',
        textAlign: 'left'
      }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#0c4a6e',
          marginBottom: '1rem'
        }}>
          🔑 Token Details
        </h3>
        <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
          <div><strong>Token Type:</strong> {authResponse.token_type}</div>
          <div><strong>Expires In:</strong> {authResponse.expires_in} seconds</div>
          <div><strong>Scope:</strong> {authResponse.scope}</div>
          <div style={{
            wordBreak: 'break-all',
            backgroundColor: '#ffffff',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: '#374151'
          }}>
            <strong>Access Token:</strong> {authResponse.access_token.substring(0, 50)}...
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={onViewSearch}
          style={{
            padding: '0.875rem 1.5rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          🔍 Search Providers with Availability
        </button>
        <button
          onClick={onViewProviders}
          style={{
            padding: '0.875rem 1.5rem',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          📋 View Provider Directory
        </button>
        <button
          onClick={onViewAppointments}
          style={{
            padding: '0.875rem 1.5rem',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          📅 View Appointments
        </button>
        <button
          onClick={onLogout}
          style={{
            padding: '0.875rem 1.5rem',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default AuthSuccess; 