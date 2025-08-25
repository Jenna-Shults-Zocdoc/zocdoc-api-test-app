const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Enable CORS for React app
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Store the access token for API calls
let currentAccessToken = null;

// Proxy endpoint for Zocdoc authentication
app.post('/api/auth', async (req, res) => {
  try {
    const { clientId, clientSecret } = req.body;
    
    if (!clientId || !clientSecret) {
      return res.status(400).json({
        error: 'Missing clientId or clientSecret'
      });
    }

    console.log('Proxying authentication request to Zocdoc API...');
    
    // Make request to Zocdoc API
    const response = await axios.post('https://auth-api-developer-sandbox.zocdoc.com/oauth/token', {
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

    // Store the access token for future API calls
    currentAccessToken = response.data.access_token;
    
    console.log('Authentication successful!');
    res.json(response.data);
    
  } catch (error) {
    console.error('Authentication error:', error.response?.data || error.message);
    
    if (error.response) {
      // API returned an error response
      res.status(error.response.status).json({
        error: error.response.data.error || 'Authentication failed',
        error_description: error.response.data.error_description,
        status: error.response.status
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({
        error: 'Request timeout',
        message: 'The request took too long to complete'
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Proxy endpoint for getting NPIs
app.get('/api/providers/npis', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({
        error: 'Not authenticated. Please authenticate first.'
      });
    }

    const { page = 0, page_size = 60000 } = req.query;
    
    console.log('Fetching NPIs from Zocdoc API...');
    
    const response = await axios.get('https://api-developer-sandbox.zocdoc.com/v1/reference/npi', {
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      },
      params: {
        page: page,
        page_size: page_size
      },
      timeout: 10000
    });

    console.log(`Successfully fetched ${response.data.data.npis.length} NPIs`);
    res.json(response.data);
    
  } catch (error) {
    console.error('Error fetching NPIs:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data.error || 'Failed to fetch NPIs',
        error_description: error.response.data.error_description,
        status: error.response.status
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Proxy endpoint for getting provider details by NPIs
app.get('/api/providers', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({
        error: 'Not authenticated. Please authenticate first.'
      });
    }

    const { npis, insurance_plan_id } = req.query;
    
    if (!npis) {
      return res.status(400).json({
        error: 'Missing npis parameter'
      });
    }

    console.log('Fetching provider details from Zocdoc API...');
    
    const params = { npis };
    if (insurance_plan_id) {
      params.insurance_plan_id = insurance_plan_id;
    }
    
    const response = await axios.get('https://api-developer-sandbox.zocdoc.com/v1/providers', {
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      },
      params: params,
      timeout: 10000
    });

    console.log(`Successfully fetched provider details for ${response.data.data.length} providers`);
    res.json(response.data);
    
  } catch (error) {
    console.error('Error fetching providers:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data.error || 'Failed to fetch providers',
        error_description: error.response.data.error_description,
        status: error.response.status
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Proxy endpoint for searching provider locations
app.get('/api/provider_locations', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({
        error: 'Not authenticated. Please authenticate first.'
      });
    }

    const { 
      zip_code, 
      specialty_id, 
      visit_reason_id, 
      insurance_plan_id,
      page = 0,
      page_size = 50,
      visit_type,
      max_distance_to_patient_mi
    } = req.query;
    
    if (!zip_code || (!specialty_id && !visit_reason_id)) {
      return res.status(400).json({
        error: 'Missing required parameters: zip_code and either specialty_id or visit_reason_id'
      });
    }

    console.log('Searching provider locations from Zocdoc API...');
    
    const params = { 
      zip_code,
      page,
      page_size
    };
    
    if (specialty_id) params.specialty_id = specialty_id;
    if (visit_reason_id) params.visit_reason_id = visit_reason_id;
    if (insurance_plan_id) params.insurance_plan_id = insurance_plan_id;
    if (visit_type) params.visit_type = visit_type;
    if (max_distance_to_patient_mi) params.max_distance_to_patient_mi = max_distance_to_patient_mi;
    
    const response = await axios.get('https://api-developer-sandbox.zocdoc.com/v1/provider_locations', {
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      },
      params: params,
      timeout: 15000
    });

    console.log(`Successfully found ${response.data.data.provider_locations.length} provider locations`);
    res.json(response.data);
    
  } catch (error) {
    console.error('Error searching provider locations:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data.error || 'Failed to search provider locations',
        error_description: error.response.data.error_description,
        status: error.response.status
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Proxy endpoint for getting availability
app.get('/api/availability', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({
        error: 'Not authenticated. Please authenticate first.'
      });
    }

    const { 
      provider_location_ids, 
      visit_reason_id, 
      patient_type,
      start_date_in_provider_local_time,
      end_date_in_provider_local_time
    } = req.query;
    
    if (!provider_location_ids || !visit_reason_id || !patient_type) {
      return res.status(400).json({
        error: 'Missing required parameters: provider_location_ids, visit_reason_id, patient_type'
      });
    }

    console.log('Fetching availability from Zocdoc API...');
    
    const params = { 
      provider_location_ids,
      visit_reason_id,
      patient_type
    };
    
    if (start_date_in_provider_local_time) {
      params.start_date_in_provider_local_time = start_date_in_provider_local_time;
    }
    
    if (end_date_in_provider_local_time) {
      params.end_date_in_provider_local_time = end_date_in_provider_local_time;
    }
    
    const response = await axios.get('https://api-developer-sandbox.zocdoc.com/v1/provider_locations/availability', {
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      },
      params: params,
      timeout: 15000
    });

    console.log(`Successfully fetched availability for ${response.data.data.length} provider locations`);
    res.json(response.data);
    
  } catch (error) {
    console.error('Error fetching availability:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data.error || 'Failed to fetch availability',
        error_description: error.response.data.error_description,
        status: error.response.status
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Proxy endpoint for getting insurance plans
app.get('/api/insurance_plans', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({
        error: 'Not authenticated. Please authenticate first.'
      });
    }

    const { 
      page = 0, 
      page_size = 100,
      status = 'active',
      state,
      plan_type,
      program_type,
      care_category
    } = req.query;
    
    console.log('Fetching insurance plans from Zocdoc API...');
    
    const params = { 
      page,
      page_size,
      status
    };
    
    if (state) params.state = state;
    if (plan_type) params.plan_type = plan_type;
    if (program_type) params.program_type = program_type;
    if (care_category) params.care_category = care_category;
    
    const response = await axios.get('https://api-developer-sandbox.zocdoc.com/v1/insurance_plans', {
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      },
      params: params,
      timeout: 10000
    });

    console.log(`Successfully fetched ${response.data.data.length} insurance plans`);
    res.json(response.data);
    
  } catch (error) {
    console.error('Error fetching insurance plans:', error.response?.data || error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.data.error || 'Failed to fetch insurance plans',
        error_description: error.response.data.error_description,
        status: error.response.status
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// Proxy endpoint for booking appointments
app.post('/api/appointments', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({ error: 'No access token available. Please authenticate first.' });
    }

    const bookingRequest = req.body;
    console.log('Booking appointment through Zocdoc API...');
    
    const response = await axios.post('https://api-developer-sandbox.zocdoc.com/v1/appointments', bookingRequest, {
      headers: { 
        'Authorization': `Bearer ${currentAccessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('Appointment booked successfully:', response.data.data.appointment_id);
    res.json(response.data);
  } catch (error) {
    console.error('Error booking appointment:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to book appointment',
      details: error.response?.data || error.message
    });
  }
});

// Proxy endpoint for getting appointments
app.get('/api/appointments', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({ error: 'No access token available. Please authenticate first.' });
    }

    const { page = 0, page_size = 10 } = req.query;
    console.log('Fetching appointments from Zocdoc API...');
    
    const response = await axios.get('https://api-developer-sandbox.zocdoc.com/v1/appointments', {
      headers: { 'Authorization': `Bearer ${currentAccessToken}` },
      params: { page, page_size },
      timeout: 10000
    });
    
    console.log(`Successfully fetched ${response.data.data.length} appointments`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching appointments:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch appointments',
      details: error.response?.data || error.message
    });
  }
});

// Proxy endpoint for cancelling appointments
app.post('/api/appointments/cancel', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({ error: 'No access token available. Please authenticate first.' });
    }

    const cancelRequest = req.body;
    console.log('Cancelling appointment through Zocdoc API...');
    
    const response = await axios.post('https://api-developer-sandbox.zocdoc.com/v1/appointments/cancel', cancelRequest, {
      headers: { 
        'Authorization': `Bearer ${currentAccessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('Appointment cancelled successfully');
    res.json(response.data);
  } catch (error) {
    console.error('Error cancelling appointment:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to cancel appointment',
      details: error.response?.data || error.message
    });
  }
});

// Proxy endpoint for rescheduling appointments
app.post('/api/appointments/reschedule', async (req, res) => {
  try {
    if (!currentAccessToken) {
      return res.status(401).json({ error: 'No access token available. Please authenticate first.' });
    }

    const rescheduleRequest = req.body;
    console.log('Rescheduling appointment through Zocdoc API...');
    
    const response = await axios.post('https://api-developer-sandbox.zocdoc.com/v1/appointments/reschedule', rescheduleRequest, {
      headers: { 
        'Authorization': `Bearer ${currentAccessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('Appointment rescheduled successfully');
    res.json(response.data);
  } catch (error) {
    console.error('Error rescheduling appointment:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to reschedule appointment',
      details: error.response?.data || error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend proxy is running',
    authenticated: !!currentAccessToken
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to proxy requests to Zocdoc API`);
  console.log(`🔗 Frontend should connect to: http://localhost:${PORT}/api/auth`);
}); 