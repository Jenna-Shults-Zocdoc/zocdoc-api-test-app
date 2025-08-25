import React, { useState } from 'react';
import { apiService, ProviderDetails } from '../services/api';
import AvailabilityView from './AvailabilityView';

interface ProviderListProps {
  onBack: () => void;
}

const ProviderList: React.FC<ProviderListProps> = ({ onBack }) => {
  const [providers, setProviders] = useState<ProviderDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [selectedProvider, setSelectedProvider] = useState<ProviderDetails | null>(null);

  const fetchAllProviders = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Fetching all providers from directory...');
      const allProviders = await apiService.getAllProviders();
      setProviders(allProviders);
      console.log(`Successfully loaded ${allProviders.length} providers`);
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch providers');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProviderDetails = (providerId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const handleViewAvailability = (provider: ProviderDetails) => {
    setSelectedProvider(provider);
  };

  const handleBackFromAvailability = () => {
    setSelectedProvider(null);
  };

  const formatSpecialties = (specialties: string[]) => {
    return specialties.length > 0 ? specialties.join(', ') : 'Not specified';
  };

  const formatLanguages = (languages: string[]) => {
    return languages.length > 0 ? languages.join(', ') : 'Not specified';
  };

  const formatLocations = (locations: any[], virtualLocations: any[]) => {
    const allLocations = [
      ...locations.map(loc => ({ ...loc, type: 'In-Person' })),
      ...virtualLocations.map(loc => ({ ...loc, type: 'Virtual' }))
    ];
    
    return allLocations.map((location, index) => (
      <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '0.25rem' }}>
        <div style={{ fontWeight: '600', color: '#1e40af' }}>{location.type} Location</div>
        {location.type === 'In-Person' ? (
          <div>
            <div>{location.address1}</div>
            {location.address2 && <div>{location.address2}</div>}
            <div>{location.city}, {location.state} {location.zip_code}</div>
          </div>
        ) : (
          <div>Virtual - {location.state}</div>
        )}
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
          Practice: {location.practice?.practice_name || 'Unknown'}
        </div>
      </div>
    ));
  };

  // If a provider is selected, show the availability view
  if (selectedProvider) {
    return <AvailabilityView provider={selectedProvider} onBack={handleBackFromAvailability} />;
  }

  return (
    <div style={{
      maxWidth: '80rem',
      margin: '0 auto',
      padding: '2rem 1rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem',
        gap: '1rem'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          ← Back to Auth
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
          Provider Directory
        </h1>
      </div>

      {providers.length === 0 && !isLoading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            No Providers Loaded
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Click the button below to fetch all providers from your Zocdoc directory.
          </p>
          <button
            onClick={fetchAllProviders}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {isLoading ? 'Loading Providers...' : 'Load All Providers'}
          </button>
        </div>
      )}

      {isLoading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '1.125rem', color: '#374151', marginBottom: '1rem' }}>
            Loading providers from your directory...
          </div>
          <div style={{ color: '#6b7280' }}>
            This may take a few moments depending on the size of your directory.
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #f87171',
          color: '#b91c1c',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {providers.length > 0 && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '1.125rem', color: '#374151' }}>
              <strong>{providers.length}</strong> providers found in your directory
            </div>
            <button
              onClick={fetchAllProviders}
              disabled={isLoading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1
              }}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Providers'}
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {providers.map((provider, index) => (
              <div
                key={`${provider.npi}-${index}`}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  padding: '1.5rem',
                  borderBottom: showDetails[`${provider.npi}-${index}`] ? '1px solid #e5e7eb' : 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <h3 style={{
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: 0
                        }}>
                          {provider.full_name}
                        </h3>
                        {provider.title && (
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            backgroundColor: '#f3f4f6',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem'
                          }}>
                            {provider.title}
                          </span>
                        )}
                      </div>
                      
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        NPI: {provider.npi}
                      </div>
                      
                      <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                        <strong>Specialties:</strong> {formatSpecialties(provider.specialties)}
                      </div>
                      
                      <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                        <strong>Languages:</strong> {formatLanguages(provider.languages)}
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      alignItems: 'flex-end'
                    }}>
                      <button
                        onClick={() => toggleProviderDetails(`${provider.npi}-${index}`)}
                        style={{
                          padding: '0.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          color: '#374151'
                        }}
                      >
                        {showDetails[`${provider.npi}-${index}`] ? '−' : '+'}
                      </button>
                      
                      {(provider.locations.length > 0 || provider.virtual_locations.length > 0) && (
                        <button
                          onClick={() => handleViewAvailability(provider)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}
                        >
                          View Availability
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {showDetails[`${provider.npi}-${index}`] && (
                  <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb' }}>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      {provider.statement && (
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                            Professional Statement
                          </h4>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                            {provider.statement}
                          </p>
                        </div>
                      )}

                      {provider.credentials && (
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                            Credentials
                          </h4>
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            {provider.credentials.certifications.length > 0 && (
                              <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Certifications:</strong> {provider.credentials.certifications.join(', ')}
                              </div>
                            )}
                            {provider.credentials.education.institutions.length > 0 && (
                              <div>
                                <strong>Education:</strong> {provider.credentials.education.institutions.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(provider.locations.length > 0 || provider.virtual_locations.length > 0) && (
                        <div>
                          <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                            Locations ({provider.locations.length + provider.virtual_locations.length})
                          </h4>
                          <div>
                            {formatLocations(provider.locations, provider.virtual_locations)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderList; 