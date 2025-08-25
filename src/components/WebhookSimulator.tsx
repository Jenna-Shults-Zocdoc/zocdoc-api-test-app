import React, { useState } from 'react';
import { apiService, WebhookMockRequest, WebhookMockResponse } from '../services/api';

interface WebhookSimulatorProps {
  onBack: () => void;
}

const WebhookSimulator: React.FC<WebhookSimulatorProps> = ({ onBack }) => {
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/your-unique-url');
  const [webhookKey, setWebhookKey] = useState('g9Y9hjTUk9KKH7ffBRbtRmJYo2OISsdMK4flbfDa3zR=');
  const [updateType, setUpdateType] = useState<'updated' | 'cancelled' | 'created' | 'arrived' | 'no_show'>('updated');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WebhookMockResponse | null>(null);
  const [error, setError] = useState('');

  const handleSimulateWebhook = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Starting webhook simulation...');
      console.log('Webhook URL:', webhookUrl);
      console.log('Webhook Key:', webhookKey);
      console.log('Update Type:', updateType);
      
      const webhookRequest: WebhookMockRequest = {
        webhook_url: webhookUrl,
        webhook_key: webhookKey,
        appointment_update_type: updateType
      };

      console.log('Webhook request payload:', webhookRequest);
      
      const response = await apiService.simulateWebhook(webhookRequest);
      console.log('Webhook simulation response:', response);
      setResult(response);
    } catch (err) {
      console.error('Webhook simulation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to simulate webhook';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '1rem', 
        padding: '2rem', 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            🔗 Webhook Simulator
          </h2>
          <button
            onClick={onBack}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            ← Back
          </button>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ color: '#6b7280', fontSize: '1.125rem', lineHeight: '1.75' }}>
            Simulate webhook events to test your webhook integration. This will send a mock webhook request to the specified URL.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Webhook URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://webhook.site/your-unique-url"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease'
              }}
            />
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Use <a href="https://webhook.site" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>webhook.site</a> to get a test URL
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Webhook Key (Base64)
            </label>
            <input
              type="text"
              value={webhookKey}
              onChange={(e) => setWebhookKey(e.target.value)}
              placeholder="g9Y9hjTUk9KKH7ffBRbtRmJYo2OISsdMK4flbfDa3zR="
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease'
              }}
            />
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Any valid base64 string for sandbox testing
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Update Type
            </label>
            <select
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value as any)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            >
              <option value="updated">Updated</option>
              <option value="cancelled">Cancelled</option>
              <option value="created">Created</option>
              <option value="arrived">Arrived</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSimulateWebhook}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1rem 2rem',
            background: isLoading 
              ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.75rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '1.125rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? '🔄 Simulating...' : '🚀 Simulate Webhook'}
        </button>

        {error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            color: '#dc2626'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0.75rem'
          }}>
            <h3 style={{ color: '#059669', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
              ✅ Webhook Simulation Successful!
            </h3>
            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div><strong>Event Type:</strong> {result.event_type}</div>
              <div><strong>Timestamp:</strong> {formatTimestamp(result.webhook_timestamp)}</div>
              <div><strong>Data Type:</strong> {result.data.data_type}</div>
              <div><strong>Appointment ID:</strong> {result.data.appointment_data.appointment_id}</div>
              <div><strong>Update Type:</strong> {result.data.appointment_data.appointment_update_type}</div>
              <div><strong>Updated At:</strong> {formatTimestamp(result.data.appointment_data.appointment_updated_timestamp)}</div>
              {result.data.appointment_data.changed_attributes && result.data.appointment_data.changed_attributes.length > 0 && (
                <div>
                  <strong>Changed Attributes:</strong>
                  <ul style={{ marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                    {result.data.appointment_data.changed_attributes.map((attr, index) => (
                      <li key={index}>
                        {attr.attribute_path}
                        {attr.attachment_type && ` (${attr.attachment_type})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              <strong>Full Response:</strong>
              <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebhookSimulator; 