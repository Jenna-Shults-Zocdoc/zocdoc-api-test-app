import axios from 'axios';

// Using a CORS proxy to bypass CORS restrictions for testing
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const API_BASE_URL = 'https://api-developer-sandbox.zocdoc.com';
const AUTH_URL = 'https://auth-api-developer-sandbox.zocdoc.com/oauth/token';
const BACKEND_PROXY_URL = 'http://localhost:3001/api/auth';
const BACKEND_PROXY_BASE = 'http://localhost:3001/api';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface ApiError {
  error: string;
  error_description?: string;
}

export interface ProviderNpiResponse {
  request_id: string;
  page: number;
  page_size: number;
  total_count: number;
  next_url: string | null;
  data: {
    npis: string[];
  };
}

export interface ProviderResult {
  request_id: string;
  data: ProvidersByNpi[];
}

export interface ProvidersByNpi {
  npi: string;
  providers: ProviderDetails[];
}

export interface ProviderDetails {
  npi: string;
  first_name: string;
  last_name: string;
  title: string;
  full_name: string;
  gender_identity: string;
  specialties: string[];
  specialty_ids: string[];
  default_visit_reason_id: string;
  visit_reason_ids: string[];
  statement: string;
  provider_photo_url: string;
  languages: string[];
  credentials: ProviderCredentials;
  locations: Location[];
  virtual_locations: VirtualLocation[];
  practice: Practice;
}

export interface ProviderCredentials {
  certifications: string[];
  education: Education;
}

export interface Education {
  institutions: string[];
}

export interface Location {
  provider_location_id: string;
  accepts_patient_insurance: string;
  booking_requirements: BookingRequirements;
  first_availability_date_in_provider_local_time: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  distance_to_patient_mi?: number;
  practice: Practice;
}

export interface VirtualLocation {
  provider_location_id: string;
  accepts_patient_insurance: string;
  booking_requirements: BookingRequirements;
  first_availability_date_in_provider_local_time: string;
  state: string;
  location_name?: string;
  practice: Practice;
}

export interface Practice {
  practice_id: string;
  practice_name: string;
}

export interface BookingRequirements {
  required_fields: string[];
  accepts_booking_requests_from: string[];
}

export interface AvailabilityResult {
  request_id: string;
  data: Availability[];
}

export interface Availability {
  provider_location_id: string;
  first_availability?: Timeslot;
  timeslots: Timeslot[];
}

export interface Timeslot {
  start_time: string;
  visit_reason_id?: string;
}

export type PatientType = 'new' | 'existing';

export interface ProviderLocationSearchResult {
  request_id: string;
  page: number;
  page_size: number;
  total_count: number;
  next_url: string | null;
  data: {
    search_parameters: SearchParameters;
    provider_locations: ProviderLocation[];
  };
}

export interface SearchParameters {
  specialty_id: string;
  visit_reason_id: string;
}

export interface ProviderLocation {
  provider_location_id: string;
  provider_location_type: string;
  accepts_patient_insurance: string;
  first_availability_date_in_provider_local_time: string;
  provider: BaseProvider;
  location?: BaseLocationWithDistance;
  virtual_location?: BaseVirtualLocation;
  practice: Practice;
  booking_requirements: BookingRequirements;
}

export interface BaseProvider {
  npi: string;
  first_name: string;
  last_name: string;
  title: string;
  full_name: string;
  gender_identity: string;
  specialties: string[];
  specialty_ids: string[];
  default_visit_reason_id: string;
  visit_reason_ids: string[];
  statement: string;
  provider_photo_url: string;
  languages: string[];
  credentials: ProviderCredentials;
}

export interface BaseLocationWithDistance {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  distance_to_patient_mi: number;
}

export interface BaseVirtualLocation {
  state: string;
  location_name?: string;
}

export interface InsurancePlansResult {
  request_id: string;
  page: number;
  page_size: number;
  total_count: number;
  next_url: string | null;
  data: InsurancePlan[];
}

export interface InsurancePlan {
  id: string;
  name: string;
  carrier: InsuranceCarrier;
  plan_type: string;
  program_type: string;
  care_categories: string[];
  status: string;
  coverage_area: CoverageArea;
  ref_metadata: ReferenceMetadata;
}

export interface InsuranceCarrier {
  id: string;
  name: string;
}

export interface CoverageArea {
  is_national: boolean;
  states?: string[];
}

export interface ReferenceMetadata {
  created_timestamp_utc: string;
  last_updated_timestamp_utc: string;
}

export interface AvailabilityAwareProvider {
  providerLocation: ProviderLocation;
  availability: Availability | null;
}

class ApiService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  async authenticate(clientId: string, clientSecret: string): Promise<AuthResponse> {
    try {
      console.log('Making authentication request via backend proxy...');
      console.log('Request payload:', {
        clientId: clientId,
        client_secret: '***hidden***'
      });

      // Use backend proxy to avoid CORS issues
      const response = await axios.post<AuthResponse>(BACKEND_PROXY_URL, {
        clientId: clientId,
        clientSecret: clientSecret
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      console.log('Auth response received via proxy:', {
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
        scope: response.data.scope,
        access_token_length: response.data.access_token.length
      });

      return response.data;
    } catch (error: any) {
      console.error('Authentication request failed:', error);

      // Check if it's an axios error by looking for response property
      if (error.response) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });

        if (error.response?.status === 401) {
          throw new Error('Invalid credentials. Please check your Client ID and Client Secret.');
        } else if (error.response?.status === 403) {
          const errorData = error.response.data;
          let errorMsg = 'Access forbidden. Please check your credentials and permissions.';

          if (errorData.error_description) {
            errorMsg += ` Details: ${errorData.error_description}`;
          } else if (errorData.error) {
            errorMsg += ` Error: ${errorData.error}`;
          }

          throw new Error(errorMsg);
        } else if (error.response?.status === 400) {
          const errorData = error.response.data;
          if (errorData.error_description) {
            throw new Error(errorData.error_description);
          } else if (errorData.error) {
            throw new Error(errorData.error);
          } else {
            throw new Error('Bad request. Please check your credentials format.');
          }
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please check your internet connection.');
        } else {
          throw new Error(`HTTP ${error.response?.status || 'unknown'}: ${error.response?.statusText || error.message}`);
        }
      } else {
        throw new Error(`Unexpected error: ${error.message || 'Unknown error occurred'}`);
      }
    }
  }

  async searchProviderLocations(
    zipCode: string,
    visitReasonId: string,
    insurancePlanId?: string,
    patientType: PatientType = 'new',
    startDate?: string,
    endDate?: string,
    maxDistance?: number,
    visitType?: string
  ): Promise<AvailabilityAwareProvider[]> {
    try {
      console.log('Searching for provider locations with availability...');
      console.log('Search parameters:', {
        zipCode,
        visitReasonId,
        insurancePlanId,
        patientType,
        startDate,
        endDate,
        maxDistance,
        visitType
      });
      
      // Step 1: Search for provider locations
      const searchParams: any = {
        zip_code: zipCode,
        visit_reason_id: visitReasonId,
        page_size: 50
      };
      
      if (insurancePlanId) {
        searchParams.insurance_plan_id = insurancePlanId;
      }
      
      if (maxDistance) {
        searchParams.max_distance_to_patient_mi = maxDistance;
      }
      
      if (visitType) {
        searchParams.visit_type = visitType;
      }
      
      console.log('Making provider location search request with params:', searchParams);
      
      const searchResponse = await axios.get<ProviderLocationSearchResult>(`${BACKEND_PROXY_BASE}/provider_locations`, {
        params: searchParams,
        timeout: 15000
      });

      const providerLocations = searchResponse.data.data.provider_locations;
      console.log(`Found ${providerLocations.length} provider locations`);

      if (providerLocations.length === 0) {
        console.log('No provider locations found, returning empty array');
        return [];
      }

      // Step 2: Get availability for all provider locations
      const locationIds = providerLocations.map(loc => loc.provider_location_id);
      console.log('Getting availability for location IDs:', locationIds);
      
      const availabilityParams: any = {
        provider_location_ids: locationIds.join(','),
        visit_reason_id: visitReasonId,
        patient_type: patientType
      };
      
      if (startDate) {
        availabilityParams.start_date_in_provider_local_time = startDate;
      }
      
      if (endDate) {
        availabilityParams.end_date_in_provider_local_time = endDate;
      }
      
      console.log('Making availability request with params:', availabilityParams);
      
      const availabilityResponse = await axios.get<AvailabilityResult>(`${BACKEND_PROXY_BASE}/availability`, {
        params: availabilityParams,
        timeout: 15000
      });

      const availabilityData = availabilityResponse.data.data;
      console.log(`Found availability for ${availabilityData.length} locations`);

      // Step 3: Combine provider locations with availability data
      const availabilityMap = new Map<string, Availability>();
      availabilityData.forEach(availability => {
        availabilityMap.set(availability.provider_location_id, availability);
      });

      // Step 4: Filter to only include providers with availability
      const availabilityAwareProviders: AvailabilityAwareProvider[] = providerLocations
        .map(providerLocation => ({
          providerLocation,
          availability: availabilityMap.get(providerLocation.provider_location_id) || null
        }))
        .filter(item => item.availability && item.availability.timeslots.length > 0);

      console.log(`Found ${availabilityAwareProviders.length} providers with available appointments`);
      return availabilityAwareProviders;
      
    } catch (error: any) {
      console.error('Error searching provider locations:', error);
      
      // Provide more detailed error information
      if (error.response) {
        console.error('Error response details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        const errorMessage = error.response.data?.error || 
                           error.response.data?.error_description || 
                           error.response.data?.message ||
                           `HTTP ${error.response.status}: ${error.response.statusText}`;
        
        throw new Error(`Search failed: ${errorMessage}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response received from server. Please check your connection.');
      } else {
        console.error('Request setup error:', error.message);
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }

  async getInsurancePlans(
    state?: string,
    planType?: string,
    programType?: string,
    careCategory?: string
  ): Promise<InsurancePlansResult> {
    try {
      console.log('Fetching insurance plans via backend proxy...');
      
      const params: any = {
        page: 0,
        page_size: 100,
        status: 'active'
      };
      
      if (state) params.state = state;
      if (planType) params.plan_type = planType;
      if (programType) params.program_type = programType;
      if (careCategory) params.care_category = careCategory;
      
      const response = await axios.get<InsurancePlansResult>(`${BACKEND_PROXY_BASE}/insurance_plans`, {
        params: params,
        timeout: 15000
      });

      console.log(`Successfully fetched ${response.data.data.length} insurance plans`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching insurance plans:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch insurance plans');
    }
  }

  async getProviderNpis(page: number = 0, pageSize: number = 60000): Promise<ProviderNpiResponse> {
    try {
      console.log('Fetching provider NPIs via backend proxy...');
      
      const response = await axios.get<ProviderNpiResponse>(`${BACKEND_PROXY_BASE}/providers/npis`, {
        params: {
          page: page,
          page_size: pageSize
        },
        timeout: 15000
      });

      console.log(`Successfully fetched ${response.data.data.npis.length} NPIs`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching NPIs:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch provider NPIs');
    }
  }

  async getProviders(npis: string[], insurancePlanId?: string): Promise<ProviderResult> {
    try {
      console.log('Fetching provider details via backend proxy...');
      
      const params: any = { npis: npis.join(',') };
      if (insurancePlanId) {
        params.insurance_plan_id = insurancePlanId;
      }
      
      const response = await axios.get<ProviderResult>(`${BACKEND_PROXY_BASE}/providers`, {
        params: params,
        timeout: 15000
      });

      console.log(`Successfully fetched details for ${response.data.data.length} providers`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch provider details');
    }
  }

  async getAvailability(
    providerLocationIds: string[],
    visitReasonId: string,
    patientType: PatientType,
    startDate?: string,
    endDate?: string
  ): Promise<AvailabilityResult> {
    try {
      console.log('Fetching availability via backend proxy...');
      
      const params: any = {
        provider_location_ids: providerLocationIds.join(','),
        visit_reason_id: visitReasonId,
        patient_type: patientType
      };
      
      if (startDate) {
        params.start_date_in_provider_local_time = startDate;
      }
      
      if (endDate) {
        params.end_date_in_provider_local_time = endDate;
      }
      
      const response = await axios.get<AvailabilityResult>(`${BACKEND_PROXY_BASE}/availability`, {
        params: params,
        timeout: 15000
      });

      console.log(`Successfully fetched availability for ${response.data.data.length} provider locations`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching availability:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch availability');
    }
  }

  async getAllProviders(insurancePlanId?: string): Promise<ProviderDetails[]> {
    try {
      console.log('Fetching all providers in directory...');
      
      // Step 1: Get all NPIs
      const npiResponse = await this.getProviderNpis();
      const npis = npiResponse.data.npis;
      
      console.log(`Found ${npis.length} NPIs in directory`);
      
      // Step 2: Get provider details for all NPIs
      // Note: API accepts max 50 NPIs per request, so we need to batch them
      const batchSize = 50;
      const allProviders: ProviderDetails[] = [];
      
      for (let i = 0; i < npis.length; i += batchSize) {
        const batchNpis = npis.slice(i, i + batchSize);
        console.log(`Fetching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(npis.length / batchSize)} (${batchNpis.length} NPIs)`);
        
        const providerResponse = await this.getProviders(batchNpis, insurancePlanId);
        
        // Flatten the providers array
        providerResponse.data.forEach(npiGroup => {
          allProviders.push(...npiGroup.providers);
        });
        
        // Add a small delay between batches to be respectful to the API
        if (i + batchSize < npis.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log(`Successfully fetched details for ${allProviders.length} providers`);
      return allProviders;
    } catch (error: any) {
      console.error('Error fetching all providers:', error);
      throw new Error(error.message || 'Failed to fetch all providers');
    }
  }

  // Legacy methods for direct API calls (kept for reference)
  async authenticateDirect(clientId: string, clientSecret: string): Promise<AuthResponse> {
    try {
      console.log('Making authentication request to:', AUTH_URL);
      console.log('Request payload:', {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: '***hidden***',
        scope: 'external.appointment.read',
        audience: 'https://api-developer-sandbox.zocdoc.com/'
      });

      // Try direct request first, then fallback to CORS proxy
      let response;
      let usedProxy = false;

      try {
        console.log('Attempting direct API call...');
        // Method 1: Try with Basic Auth header (like Postman)
        const basicAuth = btoa(`${clientId}:${clientSecret}`);
        response = await axios.post<AuthResponse>(AUTH_URL, {
          grant_type: 'client_credentials',
          scope: 'external.appointment.read',
          audience: 'https://api-developer-sandbox.zocdoc.com/'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`
          },
          timeout: 10000
        });
        console.log('Direct API call with Basic Auth successful!');
      } catch (basicAuthError: any) {
        console.log('Basic Auth failed:', basicAuthError.message);

        try {
          console.log('Trying with client_id/client_secret in body...');
          // Method 2: Try with client_id/client_secret in body
          response = await axios.post<AuthResponse>(AUTH_URL, {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'external.appointment.read',
            audience: 'https://api-developer-sandbox.zocdoc.com/'
          }, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
          console.log('Direct API call with body credentials successful!');
        } catch (bodyAuthError: any) {
          console.log('Body auth failed:', bodyAuthError.message);
          console.log('Trying with CORS proxy...');
          usedProxy = true;

          // Method 3: Fallback to CORS proxy with Basic Auth
          const basicAuth = btoa(`${clientId}:${clientSecret}`);
          response = await axios.post<AuthResponse>(`${CORS_PROXY}${AUTH_URL}`, {
            grant_type: 'client_credentials',
            scope: 'external.appointment.read',
            audience: 'https://api-developer-sandbox.zocdoc.com/'
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${basicAuth}`,
              'Origin': 'http://localhost:3000',
              'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 15000
          });
          console.log('CORS proxy call successful!');
        }
      }

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      console.log('Auth response received:', {
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
        scope: response.data.scope,
        access_token_length: response.data.access_token.length,
        used_proxy: usedProxy
      });

      return response.data;
    } catch (error: any) {
      console.error('Authentication request failed:', error);

      // Check if it's an axios error by looking for response property
      if (error.response) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          headers: error.response?.headers
        });

        if (error.response?.status === 401) {
          throw new Error('Invalid credentials. Please check your Client ID and Client Secret.');
        } else if (error.response?.status === 403) {
          const errorData = error.response.data;
          let errorMsg = 'Access forbidden. Please check your credentials and permissions.';

          if (errorData.error_description) {
            errorMsg += ` Details: ${errorData.error_description}`;
          } else if (errorData.error) {
            errorMsg += ` Error: ${errorData.error}`;
          }

          // Check if it's a CORS proxy issue
          if (error.response.headers && error.response.headers['x-cors-proxy']) {
            errorMsg += ' (This might be due to CORS proxy limitations)';
          }

          throw new Error(errorMsg);
        } else if (error.response?.status === 400) {
          const errorData = error.response.data;
          if (errorData.error_description) {
            throw new Error(errorData.error_description);
          } else if (errorData.error) {
            throw new Error(errorData.error);
          } else {
            throw new Error('Bad request. Please check your credentials format.');
          }
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please check your internet connection.');
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
          throw new Error('CORS/Network error. The API server is blocking requests from localhost. This is expected for security reasons.');
        } else {
          throw new Error(`HTTP ${error.response?.status || 'unknown'}: ${error.response?.statusText || error.message}`);
        }
      } else {
        throw new Error(`Unexpected error: ${error.message || 'Unknown error occurred'}`);
      }
    }
  }

  async getProvidersLegacy(npis: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/v1/providers`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        params: {
          npis: npis
        }
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response?.data?.errors?.[0]?.message || 'Failed to fetch providers');
      }
      throw error;
    }
  }

  async getProviderLocations(zipCode: string, specialtyId?: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    try {
      const params: any = { zip_code: zipCode };
      if (specialtyId) {
        params.specialty_id = specialtyId;
      }

      const response = await axios.get(`${API_BASE_URL}/v1/provider_locations`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        params
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response?.data?.errors?.[0]?.message || 'Failed to fetch provider locations');
      }
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null && (this.tokenExpiry === null || Date.now() < this.tokenExpiry);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  logout(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }
}

export const apiService = new ApiService();

// Global callback for token expiration
let onTokenExpired: (() => void) | null = null;

export const setTokenExpiredCallback = (callback: () => void) => {
  onTokenExpired = callback;
};

// Helper function to check if error is due to token expiration
const isTokenExpiredError = (error: any): boolean => {
  return (
    error.response?.status === 401 ||
    error.response?.status === 403 ||
    (error.response?.data?.error && 
     (error.response.data.error.includes('token') || 
      error.response.data.error.includes('unauthorized') ||
      error.response.data.error.includes('forbidden')))
  );
};

// Helper function to handle token expiration
const handleTokenExpiration = () => {
  if (onTokenExpired) {
    onTokenExpired();
  }
};

// Add response interceptor to detect token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isTokenExpiredError(error)) {
      console.log('Token expired detected, triggering re-authentication...');
      handleTokenExpiration();
    }
    return Promise.reject(error);
  }
); 