import React, { useState, useEffect } from 'react';
import { apiService, AvailabilityAwareProvider, InsurancePlan, PatientType, Timeslot } from '../services/api';

interface ProviderSearchProps {
  onBack: () => void;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: AvailabilityAwareProvider;
  selectedSlot: Timeslot;
  onBookingSuccess: (bookedSlot: Timeslot) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, provider, selectedSlot, onBookingSuccess }) => {
  const [bookingStep, setBookingStep] = useState<'details' | 'confirmation'>('details');
  const [patientInfo, setPatientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    insurancePlanId: '',
    insuranceMemberId: '',
    insuranceGroupNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  if (!isOpen) return null;

  const handleBookingSubmit = async () => {
    setIsSubmitting(true);
    setBookingError('');

    try {
      // Create the booking request
      const bookingRequest = {
        appointment_type: 'providers' as const,
        data: {
          start_time: selectedSlot.start_time,
          visit_reason_id: selectedSlot.visit_reason_id || 'pc_FRO-18leckytNKtruw5dLR', // Default consultation
          provider_location_id: provider.providerLocation.provider_location_id,
          patient: {
            first_name: patientInfo.firstName,
            last_name: patientInfo.lastName,
            date_of_birth: patientInfo.dateOfBirth,
            sex_at_birth: 'female' as const, // You might want to make this configurable
            phone_number: patientInfo.phone.replace(/\D/g, ''), // Remove non-digits
            email_address: patientInfo.email,
            patient_address: {
              address1: '123 Main St', // You might want to make this configurable
              city: 'New York',
              state: 'NY',
              zip_code: '10001'
            },
            insurance: patientInfo.insurancePlanId ? {
              insurance_plan_id: patientInfo.insurancePlanId,
              insurance_member_id: patientInfo.insuranceMemberId || undefined,
              insurance_group_number: patientInfo.insuranceGroupNumber || undefined
            } : undefined
          },
          patient_type: 'new' as const
        }
      };

      console.log('Submitting booking request:', bookingRequest);

      // Make the actual booking API call
      const bookingResponse = await apiService.bookAppointment(bookingRequest);
      
      console.log('Booking successful:', bookingResponse);
      
      // Call the success callback to remove the slot from availability
      onBookingSuccess(selectedSlot);
      
      setBookingStep('confirmation');
    } catch (error) {
      console.error('Booking failed:', error);
      setBookingError(error instanceof Error ? error.message : 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateTimeString;
    }
  };

  const getLocationDisplayName = (providerLocation: AvailabilityAwareProvider['providerLocation']) => {
    if (providerLocation.location) {
      return `${providerLocation.location.address1}, ${providerLocation.location.city}, ${providerLocation.location.state}`;
    } else if (providerLocation.virtual_location) {
      return `Virtual - ${providerLocation.virtual_location.state}`;
    }
    return 'Unknown location';
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
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
            {bookingStep === 'details' ? 'Book Appointment' : 'Booking Confirmation'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {bookingError && (
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
              border: '1px solid #f87171',
              color: '#b91c1c',
              borderRadius: '0.75rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              ⚠️ {bookingError}
            </div>
          )}
          {bookingStep === 'details' ? (
            <div>
              {/* Appointment Summary */}
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem' }}>
                  Appointment Details
                </h3>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div><strong>Provider:</strong> {provider.providerLocation.provider.full_name}</div>
                  <div><strong>Date & Time:</strong> {formatDateTime(selectedSlot.start_time)}</div>
                  <div><strong>Location:</strong> {getLocationDisplayName(provider.providerLocation)}</div>
                  <div><strong>Practice:</strong> {provider.providerLocation.practice.practice_name}</div>
                </div>
              </div>

              {/* Patient Information Form */}
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                Patient Information
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={patientInfo.firstName}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, firstName: e.target.value }))}
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
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={patientInfo.lastName}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={patientInfo.email}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, email: e.target.value }))}
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
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={patientInfo.phone}
                      onChange={(e) => setPatientInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={patientInfo.dateOfBirth}
                    onChange={(e) => setPatientInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                    Insurance Information (Optional)
                  </h4>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                        Insurance Member ID
                      </label>
                      <input
                        type="text"
                        value={patientInfo.insuranceMemberId}
                        onChange={(e) => setPatientInfo(prev => ({ ...prev, insuranceMemberId: e.target.value }))}
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
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                        Insurance Group Number
                      </label>
                      <input
                        type="text"
                        value={patientInfo.insuranceGroupNumber}
                        onChange={(e) => setPatientInfo(prev => ({ ...prev, insuranceGroupNumber: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.375rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                marginTop: '2rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
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
                  onClick={handleBookingSubmit}
                  disabled={isSubmitting || !patientInfo.firstName || !patientInfo.lastName || !patientInfo.email || !patientInfo.phone || !patientInfo.dateOfBirth}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: (isSubmitting || !patientInfo.firstName || !patientInfo.lastName || !patientInfo.email || !patientInfo.phone || !patientInfo.dateOfBirth) ? 'not-allowed' : 'pointer',
                    opacity: (isSubmitting || !patientInfo.firstName || !patientInfo.lastName || !patientInfo.email || !patientInfo.phone || !patientInfo.dateOfBirth) ? 0.5 : 1,
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  {isSubmitting ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </div>
          ) : (
            /* Confirmation Step */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
                color: 'white'
              }}>
                ✓
              </div>
              
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                Appointment Booked Successfully!
              </h3>
              
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                  Appointment Details
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div><strong>Patient:</strong> {patientInfo.firstName} {patientInfo.lastName}</div>
                  <div><strong>Provider:</strong> {provider.providerLocation.provider.full_name}</div>
                  <div><strong>Date & Time:</strong> {formatDateTime(selectedSlot.start_time)}</div>
                  <div><strong>Location:</strong> {getLocationDisplayName(provider.providerLocation)}</div>
                  <div><strong>Practice:</strong> {provider.providerLocation.practice.practice_name}</div>
                </div>
              </div>
              
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '2rem' }}>
                <p>You will receive a confirmation email shortly with additional details about your appointment.</p>
                <p>Please arrive 10 minutes before your scheduled time.</p>
              </div>
              
              <button
                onClick={onClose}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProviderSearch: React.FC<ProviderSearchProps> = ({ onBack }) => {
  const [zipCode, setZipCode] = useState<string>('');
  const [visitReasonId, setVisitReasonId] = useState<string>('');
  const [insurancePlanId, setInsurancePlanId] = useState<string>('');
  const [patientType, setPatientType] = useState<PatientType>('new');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [visitType, setVisitType] = useState<string>('all');
  
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [searchResults, setSearchResults] = useState<AvailabilityAwareProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  
  // Booking modal state
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    provider: AvailabilityAwareProvider | null;
    selectedSlot: Timeslot | null;
  }>({
    isOpen: false,
    provider: null,
    selectedSlot: null
  });

  // Sample visit reason IDs for testing
  const sampleVisitReasons = [
    { id: 'pc_FRO-18leckytNKtruw5dLR', name: 'Consultation' },
    { id: 'pc_TlZW-r06U0W3pCsIGtSI5B', name: 'Follow-up' },
    { id: 'pc_zZWhkaURvEGlZpSimNILaB', name: 'Annual Checkup' },
    { id: 'pc_p1KdCTTzuU6A04ZjEt837x', name: 'Sick Visit' },
    { id: 'pc_T1T3MOA0kUuE201i1ZfIWR', name: 'Physical Exam' }
  ];

  // Load insurance plans on component mount
  useEffect(() => {
    loadInsurancePlans();
  }, []);

  const loadInsurancePlans = async () => {
    try {
      const result = await apiService.getInsurancePlans();
      setInsurancePlans(result.data);
    } catch (err) {
      console.error('Error loading insurance plans:', err);
      // Don't show error to user as this is not critical
    }
  };

  const handleSearch = async () => {
    if (!zipCode || !visitReasonId) {
      setError('Please enter a zip code and visit reason');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      console.log('Searching for providers with availability...');
      
      const results = await apiService.searchProviderLocations(
        zipCode,
        visitReasonId,
        insurancePlanId || undefined,
        patientType,
        startDate || undefined,
        endDate || undefined,
        maxDistance,
        visitType === 'all' ? undefined : visitType
      );
      
      setSearchResults(results);
      console.log(`Search completed: ${results.length} providers with availability found`);
    } catch (err) {
      console.error('Error searching providers:', err);
      setError(err instanceof Error ? err.message : 'Failed to search providers');
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

  const handleSlotClick = (provider: AvailabilityAwareProvider, slot: Timeslot) => {
    setBookingModal({
      isOpen: true,
      provider,
      selectedSlot: slot
    });
  };

  const closeBookingModal = () => {
    setBookingModal({
      isOpen: false,
      provider: null,
      selectedSlot: null
    });
  };

  const handleBookingSuccess = (bookedSlot: Timeslot) => {
    setSearchResults(prev => prev.map(result => {
      if (result.providerLocation.provider_location_id === bookingModal.provider?.providerLocation.provider_location_id) {
        if (result.availability) {
          return {
            ...result,
            availability: {
              ...result.availability,
              timeslots: result.availability.timeslots.filter(slot => slot.start_time !== bookedSlot.start_time)
            }
          };
        }
      }
      return result;
    }));
    closeBookingModal();
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

  const getLocationDisplayName = (providerLocation: AvailabilityAwareProvider['providerLocation']) => {
    if (providerLocation.location) {
      return `${providerLocation.location.address1}, ${providerLocation.location.city}, ${providerLocation.location.state}`;
    } else if (providerLocation.virtual_location) {
      return `Virtual - ${providerLocation.virtual_location.state}`;
    }
    return 'Unknown location';
  };

  const formatSpecialties = (specialties: string[]) => {
    return specialties.length > 0 ? specialties.join(', ') : 'Not specified';
  };

  const formatLanguages = (languages: string[]) => {
    return languages.length > 0 ? languages.join(', ') : 'Not specified';
  };

  const getActualFirstAvailableDate = (availability: any): string => {
    if (!availability || !availability.timeslots || availability.timeslots.length === 0) {
      return 'No availability';
    }

    // Find the earliest timeslot
    const earliestSlot = availability.timeslots.reduce((earliest: any, current: any) => {
      const earliestDate = new Date(earliest.start_time);
      const currentDate = new Date(current.start_time);
      return currentDate < earliestDate ? current : earliest;
    });

    // Format the date as YYYY-MM-DD
    const date = new Date(earliestSlot.start_time);
    return date.toISOString().split('T')[0];
  };

  const getFirstAvailableDateDisplay = (providerLocation: any, availability: any): string => {
    const actualDate = getActualFirstAvailableDate(availability);
    const reportedDate = providerLocation.first_availability_date_in_provider_local_time;
    
    if (actualDate === 'No availability') {
      return 'No availability';
    }
    
    if (reportedDate && reportedDate !== actualDate) {
      return `${actualDate} (reported: ${reportedDate})`;
    }
    
    return actualDate;
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
          ← Back to Auth
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
          Search Providers with Availability
        </h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Search Configuration Panel */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
            Search Criteria
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Zip Code */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Zip Code *
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g., 10012"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Visit Reason */}
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
                value={visitReasonId}
                onChange={(e) => setVisitReasonId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              >
                <option value="">Select a visit reason</option>
                {sampleVisitReasons.map((reason) => (
                  <option key={reason.id} value={reason.id}>
                    {reason.name} ({reason.id})
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Select from sample visit reasons or enter a custom ID
              </div>
            </div>

            {/* Insurance Plan */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Insurance Plan (Optional)
              </label>
              <select
                value={insurancePlanId}
                onChange={(e) => setInsurancePlanId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              >
                <option value="">No insurance filter</option>
                {insurancePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.carrier.name} - {plan.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Type */}
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

            {/* Visit Type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Visit Type
              </label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              >
                <option value="all">All visit types</option>
                <option value="in_person">In-person only</option>
                <option value="video_visit">Video visits only</option>
              </select>
            </div>

            {/* Max Distance */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.25rem'
              }}>
                Max Distance (miles)
              </label>
              <input
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                min="1"
                max="50"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              />
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
              onClick={handleSearch}
              disabled={isLoading || !zipCode || !visitReasonId}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: (isLoading || !zipCode || !visitReasonId) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !zipCode || !visitReasonId) ? 0.5 : 1,
                fontSize: '0.875rem',
                fontWeight: '500',
                marginTop: '0.5rem'
              }}
            >
              {isLoading ? 'Searching...' : 'Search Providers with Availability'}
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
            Available Providers
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
                Searching for providers with availability...
              </div>
              <div>This may take a few moments.</div>
            </div>
          )}

          {!isLoading && searchResults.length === 0 && !error && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                No providers found
              </div>
              <div>Enter search criteria and click "Search Providers with Availability" to find providers with available appointments.</div>
            </div>
          )}

          {searchResults.length > 0 && (
            <div>
              <div style={{
                fontSize: '1rem',
                color: '#374151',
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '0.375rem'
              }}>
                <strong>{searchResults.length}</strong> provider{searchResults.length !== 1 ? 's' : ''} found with available appointments
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.providerLocation.provider_location_id}-${index}`}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      padding: '1.5rem',
                      borderBottom: showDetails[`${result.providerLocation.provider_location_id}-${index}`] ? '1px solid #e5e7eb' : 'none'
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
                            gap: '1rem',
                            marginBottom: '0.5rem'
                          }}>
                            {/* Provider Photo */}
                            {result.providerLocation.provider.provider_photo_url && (
                              <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                flexShrink: 0,
                                border: '2px solid #e5e7eb'
                              }}>
                                <img
                                  src={result.providerLocation.provider.provider_photo_url}
                                  alt={`${result.providerLocation.provider.full_name}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    // Fallback to a placeholder if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.style.backgroundColor = '#f3f4f6';
                                    target.parentElement!.innerHTML = `
                                      <div style="
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        width: 100%;
                                        height: 100%;
                                        color: #9ca3af;
                                        font-size: 12px;
                                        font-weight: 500;
                                      ">
                                        ${result.providerLocation.provider.first_name?.charAt(0) || 'D'}
                                        ${result.providerLocation.provider.last_name?.charAt(0) || 'R'}
                                      </div>
                                    `;
                                  }}
                                />
                              </div>
                            )}
                            
                            <div style={{ flex: 1 }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.25rem'
                              }}>
                                <h4 style={{
                                  fontSize: '1.125rem',
                                  fontWeight: '600',
                                  color: '#1f2937',
                                  margin: 0
                                }}>
                                  {result.providerLocation.provider.full_name}
                                </h4>
                                {result.providerLocation.provider.title && (
                                  <span style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    backgroundColor: '#f3f4f6',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem'
                                  }}>
                                    {result.providerLocation.provider.title}
                                  </span>
                                )}
                              </div>
                              
                              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                {getLocationDisplayName(result.providerLocation)}
                              </div>
                              
                              <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                                <strong>Available appointments:</strong> {result.availability?.timeslots.length || 0}
                              </div>
                              
                              <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                                <strong>Specialties:</strong> {formatSpecialties(result.providerLocation.provider.specialties)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => toggleProviderDetails(`${result.providerLocation.provider_location_id}-${index}`)}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            color: '#374151'
                          }}
                        >
                          {showDetails[`${result.providerLocation.provider_location_id}-${index}`] ? '−' : '+'}
                        </button>
                      </div>
                    </div>

                    {showDetails[`${result.providerLocation.provider_location_id}-${index}`] && (
                      <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb' }}>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                          {/* Provider Details */}
                          <div>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                              Provider Details
                            </h5>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'flex-start', 
                              gap: '1rem',
                              fontSize: '0.875rem', 
                              color: '#6b7280' 
                            }}>
                              {/* Provider Photo in Details */}
                              {result.providerLocation.provider.provider_photo_url && (
                                <div style={{
                                  width: '80px',
                                  height: '80px',
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  border: '2px solid #e5e7eb'
                                }}>
                                  <img
                                    src={result.providerLocation.provider.provider_photo_url}
                                    alt={`${result.providerLocation.provider.full_name}`}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                      // Fallback to a placeholder if image fails to load
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.parentElement!.style.backgroundColor = '#f3f4f6';
                                      target.parentElement!.innerHTML = `
                                        <div style="
                                          display: flex;
                                          align-items: center;
                                          justify-content: center;
                                          width: 100%;
                                          height: 100%;
                                          color: #9ca3af;
                                          font-size: 14px;
                                          font-weight: 500;
                                        ">
                                          ${result.providerLocation.provider.first_name?.charAt(0) || 'D'}
                                          ${result.providerLocation.provider.last_name?.charAt(0) || 'R'}
                                        </div>
                                      `;
                                    }}
                                  />
                                </div>
                              )}
                              
                              <div style={{ flex: 1 }}>
                                <div><strong>NPI:</strong> {result.providerLocation.provider.npi}</div>
                                <div><strong>Languages:</strong> {formatLanguages(result.providerLocation.provider.languages)}</div>
                                {result.providerLocation.provider.statement && (
                                  <div style={{ marginTop: '0.5rem' }}>
                                    <strong>Statement:</strong> {result.providerLocation.provider.statement}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Available Appointments */}
                          <div>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                              Available Appointments ({result.availability?.timeslots.length || 0})
                              {result.availability?.timeslots.length === 0 && (
                                <span style={{ 
                                  fontSize: '0.875rem', 
                                  fontWeight: '400', 
                                  color: '#6b7280',
                                  marginLeft: '0.5rem'
                                }}>
                                  (All slots booked)
                                </span>
                              )}
                            </h5>
                            {result.availability && result.availability.timeslots.length > 0 && (
                              <div style={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: '0.5rem'
                              }}>
                                {result.availability.timeslots.slice(0, 10).map((timeslot, slotIndex) => (
                                  <button
                                    key={slotIndex}
                                    onClick={() => handleSlotClick(result, timeslot)}
                                    style={{
                                      padding: '0.75rem',
                                      backgroundColor: '#f0f9ff',
                                      border: '2px solid #0ea5e9',
                                      borderRadius: '0.375rem',
                                      textAlign: 'center',
                                      fontSize: '0.875rem',
                                      cursor: 'pointer',
                                      color: '#1e40af',
                                      fontWeight: '500',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#0ea5e9';
                                      e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#f0f9ff';
                                      e.currentTarget.style.color = '#1e40af';
                                    }}
                                  >
                                    {formatDateTime(timeslot.start_time)}
                                  </button>
                                ))}
                                {result.availability.timeslots.length > 10 && (
                                  <div style={{
                                    padding: '0.75rem',
                                    backgroundColor: '#f3f4f6',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    textAlign: 'center',
                                    fontSize: '0.875rem',
                                    color: '#6b7280'
                                  }}>
                                    +{result.availability.timeslots.length - 10} more
                                  </div>
                                )}
                              </div>
                            )}
                            {result.availability && result.availability.timeslots.length === 0 && (
                              <div style={{
                                padding: '1rem',
                                backgroundColor: '#fef3c7',
                                border: '1px solid #f59e0b',
                                borderRadius: '0.375rem',
                                textAlign: 'center',
                                fontSize: '0.875rem',
                                color: '#92400e'
                              }}>
                                🎉 All available slots have been booked! Check back later for new availability.
                              </div>
                            )}
                          </div>

                          {/* Practice Info */}
                          <div>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                              Practice Information
                            </h5>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              <div><strong>Practice:</strong> {result.providerLocation.practice.practice_name}</div>
                              <div><strong>Insurance Accepted:</strong> {result.providerLocation.accepts_patient_insurance}</div>
                              <div><strong>First Available Date:</strong> {getFirstAvailableDateDisplay(result.providerLocation, result.availability)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal.isOpen && bookingModal.provider && bookingModal.selectedSlot && (
        <BookingModal
          isOpen={bookingModal.isOpen}
          onClose={closeBookingModal}
          provider={bookingModal.provider}
          selectedSlot={bookingModal.selectedSlot}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default ProviderSearch; 