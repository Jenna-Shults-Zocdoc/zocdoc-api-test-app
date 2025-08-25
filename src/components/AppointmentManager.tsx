import React, { useState, useEffect } from 'react';
import { apiService, AppointmentListItem, AppointmentBookingRequest, CancelAppointmentRequest, RescheduleAppointmentRequest } from '../services/api';

interface AppointmentManagerProps {
  onBack: () => void;
}

const AppointmentManager: React.FC<AppointmentManagerProps> = ({ onBack }) => {
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentListItem | null>(null);
  const [isLoadingTestAppointment, setIsLoadingTestAppointment] = useState(false);

  useEffect(() => {
    loadAppointments();
    // Also load the known test appointment from sandbox
    loadTestAppointment();
  }, [currentPage]);

  const loadAppointments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiService.getAppointments(currentPage, 10);
      console.log('Appointments response:', response);
      console.log('Appointments data:', response.data);
      setAppointments(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load appointments';
      if (errorMessage.includes('404')) {
        // No appointments found yet - this is normal for new users
        setAppointments([]);
        setError('');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestAppointment = async () => {
    console.log('Loading test appointment...');
    setIsLoadingTestAppointment(true);
    setError('');
    try {
      // Load the known test appointment from sandbox
      const testAppointmentId = '2b29f79b-6d7f-472a-9603-d0c378bc9531';
      console.log('Fetching appointment with ID:', testAppointmentId);
      
      const testAppointment = await apiService.getAppointmentById(testAppointmentId);
      console.log('Test appointment loaded successfully:', testAppointment);
      console.log('Test appointment structure:', JSON.stringify(testAppointment, null, 2));
      
      // Add it to the appointments list if it's not already there
      setAppointments(prev => {
        const exists = prev.some(apt => apt.appointment_id === testAppointment.appointment_id);
        if (!exists) {
          console.log('Adding test appointment to list');
          return [testAppointment, ...prev];
        } else {
          console.log('Test appointment already exists in list');
          return prev;
        }
      });
    } catch (err) {
      console.error('Error loading test appointment:', err);
      setError(`Failed to load test appointment: ${err instanceof Error ? err.message : 'Unknown error'}`);
      // This is okay - the test appointment might not be available
    } finally {
      setIsLoadingTestAppointment(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string, reason?: string) => {
    try {
      const cancelRequest: CancelAppointmentRequest = {
        appointment_id: appointmentId,
        cancellation_reason: reason,
        cancellation_reason_type: 'patient_no_longer_needs_appointment'
      };
      await apiService.cancelAppointment(cancelRequest);
      setShowCancelModal(false);
      setSelectedAppointment(null);
      loadAppointments(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment');
    }
  };

  const handleRescheduleAppointment = async (appointmentId: string, newStartTime: string) => {
    try {
      const rescheduleRequest: RescheduleAppointmentRequest = {
        appointment_id: appointmentId,
        start_time: newStartTime
      };
      await apiService.rescheduleAppointment(rescheduleRequest);
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      loadAppointments(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule appointment');
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string): { color: string; backgroundColor: string } => {
    switch (status) {
      case 'confirmed': return { color: '#059669', backgroundColor: '#d1fae5' };
      case 'pending_booking': return { color: '#d97706', backgroundColor: '#fef3c7' };
      case 'cancelled': return { color: '#dc2626', backgroundColor: '#fee2e2' };
      case 'no_show': return { color: '#6b7280', backgroundColor: '#f3f4f6' };
      default: return { color: '#2563eb', backgroundColor: '#dbeafe' };
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            📅 Appointment Manager
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowBookingForm(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
              ➕ Book New Appointment
            </button>
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
        </div>

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

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>🔄 Loading appointments...</div>
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ fontSize: '1.5rem', color: '#374151', marginBottom: '0.5rem' }}>
              No Appointments Found
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              You don't have any appointments yet. Book your first appointment to get started!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowBookingForm(true)}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                🏥 Book Your First Appointment
              </button>
              <button
                onClick={loadTestAppointment}
                disabled={isLoadingTestAppointment}
                style={{
                  padding: '1rem 2rem',
                  background: isLoadingTestAppointment 
                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: isLoadingTestAppointment ? 'not-allowed' : 'pointer',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  opacity: isLoadingTestAppointment ? 0.7 : 1
                }}
              >
                {isLoadingTestAppointment ? '🔄 Loading...' : '🧪 Load Test Appointment'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {appointments
              .filter(appointment => appointment && appointment.appointment_id) // Filter out invalid appointments
              .map((appointment) => (
              <div
                key={appointment.appointment_id}
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                      👤 {appointment.patient?.first_name || 'Unknown'} {appointment.patient?.last_name || 'Patient'}
                    </h3>
                    <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      <div>📅 <strong>Date:</strong> {formatDateTime(appointment.start_time)}</div>
                      <div>📧 <strong>Email:</strong> {appointment.patient?.email_address || 'Not provided'}</div>
                      <div>📞 <strong>Phone:</strong> {appointment.patient?.phone_number || 'Not provided'}</div>
                      <div>🏥 <strong>Provider Location:</strong> {appointment.provider_location_id}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      ...getStatusColor(appointment.appointment_status)
                    }}>
                      {appointment.appointment_status.replace('_', ' ')}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {appointment.appointment_status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowRescheduleModal(true);
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}
                          >
                            🔄 Reschedule
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowCancelModal(true);
                            }}
                            style={{
                              padding: '0.5rem 1rem',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '500'
                            }}
                          >
                            ❌ Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {appointments.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              style={{
                padding: '0.75rem 1.5rem',
                background: currentPage === 0 ? '#e5e7eb' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: currentPage === 0 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              ← Previous
            </button>
            <span style={{ padding: '0.75rem 1.5rem', color: '#6b7280', fontWeight: '600' }}>
              Page {currentPage + 1}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              ❌ Cancel Appointment
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Are you sure you want to cancel the appointment for {selectedAppointment.patient?.first_name || 'Unknown'} {selectedAppointment.patient?.last_name || 'Patient'} on {formatDateTime(selectedAppointment.start_time)}?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedAppointment(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Keep Appointment
              </button>
              <button
                onClick={() => handleCancelAppointment(selectedAppointment.appointment_id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
              🔄 Reschedule Appointment
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Select a new date and time for the appointment.
            </p>
            <input
              type="datetime-local"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e2e8f0',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                marginBottom: '1.5rem'
              }}
              onChange={(e) => {
                // Handle date selection
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedAppointment(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle reschedule with selected date
                  const newDate = new Date();
                  newDate.setDate(newDate.getDate() + 1);
                  handleRescheduleAppointment(selectedAppointment.appointment_id, newDate.toISOString());
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager; 