import React, { useState, useEffect } from 'react';
import { Environment, setEnvironment, getCurrentEnvironment, ENVIRONMENT_CONFIGS } from '../services/api';

interface EnvironmentToggleProps {
  onEnvironmentChange?: (environment: Environment) => void;
}

const EnvironmentToggle: React.FC<EnvironmentToggleProps> = ({ onEnvironmentChange }) => {
  const [currentEnvironment, setCurrentEnvironmentState] = useState<Environment>(getCurrentEnvironment());

  // Update local state when environment changes externally
  useEffect(() => {
    const checkEnvironment = () => {
      const env = getCurrentEnvironment();
      if (env !== currentEnvironment) {
        setCurrentEnvironmentState(env);
      }
    };

    // Check periodically for environment changes
    const interval = setInterval(checkEnvironment, 100);
    return () => clearInterval(interval);
  }, [currentEnvironment]);

  const handleEnvironmentChange = (environment: Environment) => {
    console.log('Environment toggle clicked:', environment);
    console.log('Previous environment:', currentEnvironment);
    console.log('New environment:', environment);
    
    setEnvironment(environment);
    setCurrentEnvironmentState(environment);
    
    console.log('Environment after set:', getCurrentEnvironment());
    
    if (onEnvironmentChange) {
      onEnvironmentChange(environment);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.75rem',
      border: '1px solid #e2e8f0',
      marginBottom: '1rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ fontWeight: '600', color: '#374151' }}>
        🌍 Environment:
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {(['sandbox', 'production'] as Environment[]).map((env) => (
          <button
            key={env}
            onClick={() => handleEnvironmentChange(env)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              backgroundColor: currentEnvironment === env 
                ? (env === 'sandbox' ? '#fef3c7' : '#fecaca')
                : '#ffffff',
              color: currentEnvironment === env 
                ? (env === 'sandbox' ? '#92400e' : '#991b1b')
                : '#6b7280',
              border: currentEnvironment === env 
                ? (env === 'sandbox' ? '2px solid #f59e0b' : '2px solid #ef4444')
                : '2px solid #d1d5db',
              boxShadow: currentEnvironment === env 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              position: 'relative',
              zIndex: 10,
              pointerEvents: 'auto',
              minWidth: '120px',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              if (currentEnvironment !== env) {
                e.currentTarget.style.backgroundColor = env === 'sandbox' ? '#fef3c7' : '#fecaca';
                e.currentTarget.style.color = env === 'sandbox' ? '#92400e' : '#991b1b';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentEnvironment !== env) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            {ENVIRONMENT_CONFIGS[env].name}
            {currentEnvironment === env && ' ✓'}
          </button>
        ))}
      </div>
      <div style={{ 
        fontSize: '0.75rem', 
        color: '#6b7280',
        marginLeft: 'auto',
        fontWeight: '500'
      }}>
        {currentEnvironment === 'sandbox' ? '🧪 Test Environment' : '🚀 Production Environment'}
      </div>
    </div>
  );
};

export default EnvironmentToggle; 