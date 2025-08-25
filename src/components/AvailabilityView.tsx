import React, { useState } from 'react';
import { apiService, ProviderDetails, AvailabilityResult, PatientType, Location, VirtualLocation } from '../services/api';

interface AvailabilityViewProps {
  provider: ProviderDetails;
  onBack: () => void;
}

const AvailabilityView: React.FC<AvailabilityViewProps> = ({ provider, onBack }) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedVisitReason, setSelectedVisitReason] = useState<string>('');
  const [patientType, setPatientType] = useState<PatientType>('new');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get all locations (in-person and virtual)
  const allLocations = [
    ...provider.locations.map((loc: Location) => ({ ...loc, type: 'In-Person' as const })),
    ...provider.virtual_locations.map((loc: VirtualLocation) => ({ ...loc, type: 'Virtual' as const }))
  ];

  // Get available visit reasons
  const availableVisitReasons = provider.visit_reason_ids || [];

  const fetchAvailability = async () => {
    if (!selectedLocation || !selectedVisitReason) {
      setError('Please select a location and visit reason');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      console.log('Fetching availability for provider:', provider.full_name);
      console.log('Location:', selectedLocation);
      console.log('Visit Reason:', selectedVisitReason);
      console.log('Patient Type:', patientType);
      
      const availabilityResult = await apiService.getAvailability(
        [selectedLocation],
        selectedVisitReason,
        patientType,
        startDate || undefined,
        endDate || undefined
      );
      
      setAvailability(availabilityResult);
      console.log('Availability fetched successfully');
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateTimeString;
    }
  };

  const getLocationDisplayName = (locationId: string) => {
    const location = allLocations.find(loc => loc.provider_location_id === locationId);
    if (!location) return locationId;
    
    if (location.type === 'Virtual') {
      return `Virtual - ${location.state}`;
    } else {
      return `${location.address1}, ${location.city}, ${location.state}`;
    }
  };

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
          ← Back to Providers
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
          Availability for {provider.full_name}
        </h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Configuration Panel */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
            Search Settings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Location Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Location *
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              >
                <option value="">Select a location</option>
                {allLocations.map((location) => (
                  <option key={location.provider_location_id} value={location.provider_location_id}>
                    {location.type === 'Virtual' 
                      ? `Virtual - ${location.state}` 
                      : `${location.address1}, ${location.city}, ${location.state}`
                    }
                  </option>
                ))}
              </select>
            </div>

            {/* Visit Reason Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Visit Reason *
              </label>
              <select
                value={selectedVisitReason}
                onChange={(e) => setSelectedVisitReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              >
                <option value="">Select a visit reason</option>
                {availableVisitReasons.map((visitReasonId) => (
                  <option key={visitReasonId} value={visitReasonId}>
                    {visitReasonId}
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Type Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Patient Type
              </label>
              <select
                value={patientType}
                onChange={(e) => setPatientType(e.target.value as PatientType)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              >
                <option value="new">New Patient</option>
                <option value="existing">Existing Patient</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              onClick={fetchAvailability}
              disabled={isLoading || !selectedLocation || !selectedVisitReason}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: (isLoading || !selectedLocation || !selectedVisitReason) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !selectedLocation || !selectedVisitReason) ? 0.5 : 1,
                fontSize: '0.875rem',
                fontWeight: '500',
                marginTop: '0.5rem'
              }}
            >
              {isLoading ? 'Loading Availability...' : 'Search Availability'}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
            Available Appointments
          </h3>

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

          {isLoading && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                Loading availability...
              </div>
              <div>This may take a few moments.</div>
            </div>
          )}

          {!isLoading && !availability && !error && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                No availability data
              </div>
              <div>Select a location and visit reason, then click "Search Availability" to see available appointments.</div>
            </div>
          )}

          {availability && (
            <div>
              {availability.data.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#6b7280'
                }}>
                  <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                    No availability found
                  </div>
                  <div>No available appointments found for the selected criteria.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {availability.data.map((locationAvailability) => (
                    <div
                      key={locationAvailability.provider_location_id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <h4 style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#374151',
                          margin: 0
                        }}>
                          {getLocationDisplayName(locationAvailability.provider_location_id)}
                        </h4>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginTop: '0.25rem'
                        }}>
                          {locationAvailability.timeslots.length} available appointment{locationAvailability.timeslots.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {locationAvailability.timeslots.length > 0 && (
                        <div style={{
                          maxHeight: '400px',
                          overflowY: 'auto'
                        }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '0.5rem',
                            padding: '1rem'
                          }}>
                            {locationAvailability.timeslots.map((timeslot, index) => (
                              <div
                                key={index}
                                style={{
                                  padding: '0.75rem',
                                  backgroundColor: '#f0f9ff',
                                  border: '1px solid #0ea5e9',
                                  borderRadius: '0.25rem',
                                  textAlign: 'center'
                                }}
                              >
                                <div style={{
                                  fontSize: '0.875rem',
                                  fontWeight: '500',
                                  color: '#0c4a6e'
                                }}>
                                  {formatDateTime(timeslot.start_time)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityView; 