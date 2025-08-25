import React, { useState } from 'react';

interface TokenExpirationModalProps {
  isOpen: boolean;
  onReauthenticate: () => void;
  onClose: () => void;
}

const TokenExpirationModal: React.FC<TokenExpirationModalProps> = ({ 
  isOpen, 
  onReauthenticate, 
  onClose 
}) => {
  const [isReauthenticating, setIsReauthenticating] = useState(false);

  if (!isOpen) return null;

  const handleReauthenticate = async () => {
    setIsReauthenticating(true);
    try {
      await onReauthenticate();
    } finally {
      setIsReauthenticating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#f59e0b',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            color: 'white'
          }}>
            ⚠️
          </div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1f2937', 
            margin: 0 
          }}>
            Session Expired
          </h2>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            fontSize: '1rem',
            color: '#374151',
            lineHeight: '1.6',
            marginBottom: '1.5rem'
          }}>
            <p style={{ marginBottom: '1rem' }}>
              Your authentication session has expired. To continue using the application, you need to re-authenticate.
            </p>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb'
            }}>
              <strong>Note:</strong> You can quickly re-authenticate using your previous credentials without re-entering them.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleReauthenticate}
              disabled={isReauthenticating}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: isReauthenticating ? 'not-allowed' : 'pointer',
                opacity: isReauthenticating ? 0.5 : 1,
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              {isReauthenticating ? 'Re-authenticating...' : 'Re-authenticate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenExpirationModal; 