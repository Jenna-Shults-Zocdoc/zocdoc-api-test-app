import React from 'react';

const PostmanComparison: React.FC = () => {
  return (
    <div style={{
      maxWidth: '28rem',
      margin: '2rem auto 0',
      padding: '1.5rem',
      backgroundColor: '#f0f9ff',
      border: '1px solid #0ea5e9',
      borderRadius: '0.5rem'
    }}>
      <h3 style={{
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#0c4a6e',
        marginBottom: '1rem'
      }}>
        🔍 Postman vs Browser Comparison
      </h3>
      
      <div style={{ fontSize: '0.875rem', color: '#0c4a6e' }}>
        <h4 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Key Differences:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Origin Header:</strong> Browser adds Origin header, Postman doesn't
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>CORS Policy:</strong> Browser enforces CORS, Postman bypasses it
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>User-Agent:</strong> Different user agents may affect API behavior
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Request Timing:</strong> Browser requests may be slower
          </li>
        </ul>
        
        <h4 style={{ fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Troubleshooting Steps:</h4>
        <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Check Console:</strong> Look for detailed error messages in browser console (F12)
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Compare Headers:</strong> Check if any required headers are missing
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Verify Audience:</strong> Ensure the audience value matches exactly
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Check Scopes:</strong> Verify your credentials have the right permissions
          </li>
        </ol>
        
        <h4 style={{ fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem' }}>Expected Request Format:</h4>
        <div style={{
          backgroundColor: '#f1f5f9',
          padding: '0.75rem',
          borderRadius: '0.25rem',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          overflow: 'auto'
        }}>
          <div>POST https://auth-api-developer-sandbox.zocdoc.com/oauth/token</div>
          <div>Content-Type: application/json</div>
          <br />
          <div>{'{'}</div>
          <div>  "grant_type": "client_credentials",</div>
          <div>  "client_id": "YOUR_CLIENT_ID",</div>
          <div>  "client_secret": "YOUR_CLIENT_SECRET",</div>
          <div>  "audience": "https://api-developer-sandbox.zocdoc.com/"</div>
          <div>{'}'}</div>
        </div>
      </div>
    </div>
  );
};

export default PostmanComparison; 