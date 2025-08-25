import React from 'react';

const DebugInfo: React.FC = () => {
  return (
    <div style={{
      maxWidth: '28rem',
      margin: '2rem auto 0',
      padding: '1.5rem',
      backgroundColor: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '0.5rem'
    }}>
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#92400e',
        marginBottom: '1rem'
      }}>
        🔍 Authentication Debugging Guide
      </h3>
      
      <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
        <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Common Issues:</h4>
        <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Invalid Credentials:</strong> Make sure you have valid Zocdoc sandbox credentials
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>CORS Issues:</strong> Open browser console (F12) and look for CORS errors
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Network Issues:</strong> Check your internet connection
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Wrong Environment:</strong> Ensure you're using sandbox credentials, not production
          </li>
        </ol>
        
        <h4 style={{ fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>To Debug:</h4>
        <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            Press <strong>F12</strong> to open browser developer tools
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Go to the <strong>Console</strong> tab
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Try to authenticate and look for error messages
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            Check the <strong>Network</strong> tab for failed requests
          </li>
        </ol>
        
        <h4 style={{ fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Test Credentials:</h4>
        <p style={{ margin: 0 }}>
          If you don't have real credentials, you can test with dummy values to see the error handling:
        </p>
        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
          <li>Client ID: <code>test_client_id</code></li>
          <li>Client Secret: <code>test_client_secret</code></li>
        </ul>
      </div>
    </div>
  );
};

export default DebugInfo; 