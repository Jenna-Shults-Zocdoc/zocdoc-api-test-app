# 🏥 Zocdoc API Test Application

A modern, colorful React application for testing and demonstrating Zocdoc API integration capabilities.

## ✨ Features

- **🔐 Authentication**: OAuth 2.0 Client Credentials Flow with Zocdoc API
- **🌍 Environment Toggle**: Switch between Sandbox and Production environments
- **👥 Provider Directory**: Browse all providers in your network
- **🔍 Availability-Aware Search**: Search providers with real-time availability
- **📅 Appointment Booking**: Interactive booking experience with timeslot selection
- **📋 Appointment Management**: View, cancel, and reschedule appointments
- **🔌 Webhook Simulator**: Mock webhook events for testing
- **🎨 Modern UI**: Beautiful, responsive design with healthcare-themed colors
- **🔄 Token Management**: Automatic token refresh and expiration handling
- **🔒 HIPAA Compliance**: Secure handling of patient data with appropriate fallbacks

## 🚀 Quick Start

### Option 1: Live Demo (Recommended)
Visit the deployed application: **[Your Vercel URL]**

### Option 2: Local Development
1. Clone this repository
2. Install dependencies: `npm install`
3. Start the backend proxy: `npm run server`
4. Start the frontend: `npm start`
5. Open http://localhost:3000

## 🔧 Configuration

### Authentication
- Use your Zocdoc credentials for the selected environment
- **Sandbox**: Use sandbox credentials for testing
- **Production**: Use production credentials for live data
- Enable "Use Backend Proxy" for real API testing
- Or use "Mock Authentication" for demo purposes

### Environment Selection
- **🧪 Sandbox**: Test environment with mock data and special test cases
- **🚀 Production**: Live environment with real provider and appointment data
- Environment indicator shows in the header and authentication form
- All API calls automatically use the correct endpoints for the selected environment

### Backend Proxy
The app includes a Node.js proxy server to handle CORS and API requests:
- Runs on port 3001
- Proxies requests to Zocdoc API
- Handles authentication and token management

## 📱 Application Flow

1. **Authentication** → Enter credentials or use mock auth
2. **Provider Search** → Search by location, specialty, insurance
3. **Availability Check** → View real-time appointment slots
4. **Booking Experience** → Interactive appointment booking flow
5. **Appointment Management** → View, cancel, and reschedule appointments
6. **Webhook Testing** → Simulate webhook events for integration testing

## 🎨 Design Features

- **Healthcare-themed color palette**
- **Gradient backgrounds and modern UI**
- **Responsive design for all devices**
- **Interactive animations and hover effects**
- **Professional shadows and depth**

## 🔍 Key Components

- **AuthForm**: OAuth 2.0 authentication interface
- **ProviderSearch**: Advanced search with availability filtering
- **ProviderList**: Complete provider directory view
- **BookingModal**: Interactive appointment booking
- **AppointmentManager**: Full appointment lifecycle management
- **WebhookSimulator**: Mock webhook event testing
- **TokenExpirationModal**: Seamless re-authentication
- **EnvironmentToggle**: Switch between Sandbox and Production

## 🛠 Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, Axios
- **Styling**: CSS-in-JS with gradients and animations
- **Deployment**: Vercel (recommended)

## 📊 API Endpoints Used

- `/v1/reference/npi` - Get provider NPIs
- `/v1/providers` - Get provider details
- `/v1/provider_locations` - Search provider locations
- `/v1/provider_locations/availability` - Get appointment availability
- `/v1/insurance_plans` - Get insurance plans
- `/v1/appointments` - Book new appointments
- `/v1/appointments` (GET) - List existing appointments
- `/v1/appointments/{appointment_id}` - Get specific appointment details
- `/v1/appointments/cancel` - Cancel appointments
- `/v1/appointments/reschedule` - Reschedule appointments
- `/v1/webhook/mock-request` - Simulate webhook events (Sandbox only)

## 🔐 Security Features

- **Token expiration handling**
- **Automatic re-authentication**
- **Credential storage in localStorage**
- **CORS proxy for secure API calls**
- **HIPAA-compliant patient data handling**

## 📋 Appointment Management Features

### Supported Appointment Statuses
- **pending_booking**: Can be cancelled and rescheduled
- **confirmed**: Can be cancelled and rescheduled
- **pending_reschedule**: Can be cancelled and rescheduled
- **rescheduled**: Can be cancelled and rescheduled
- **cancelled**: No further actions available
- **booking_failed**: No further actions available
- **no_show**: No further actions available

### Patient Data Handling
- **HIPAA Compliance**: Patient information is not displayed when not available
- **Fallback Display**: Uses developer patient ID or appointment ID when patient data is protected
- **Secure Messaging**: Clear indicators when patient data is not available for security reasons

## 🔌 Webhook Simulator

### Features
- **Mock Webhook Events**: Simulate appointment updates, cancellations, and creations
- **Sandbox Testing**: Test webhook integration without affecting production data
- **Multiple Event Types**: Support for `updated`, `cancelled`, `created`, `arrived`, and `no_show` events
- **Custom Webhook URLs**: Test with your own webhook endpoints
- **Signature Verification**: Test webhook signature validation

### Usage
1. Navigate to "🔌 Webhook Simulator" in the app
2. Enter your webhook URL (e.g., `https://webhook.site/your-unique-url`)
3. Use the provided webhook key: `g9Y9hjTUk9KKH7ffBRbtRmJYo2OISsdMK4flbfDa3zR=`
4. Select the event type you want to simulate
5. Click "🚀 Simulate Webhook" to send the mock event

## 🌍 Environment-Specific Features

### Sandbox Environment
- **Test Data**: Pre-populated with sample appointments and providers
- **Webhook Testing**: Full webhook simulation capabilities
- **Special Test Cases**: Error scenarios and edge cases for testing
- **Mock Authentication**: Quick testing without real credentials

### Production Environment
- **Real Data**: Live provider and appointment data
- **Actual Bookings**: Real appointment creation and management
- **Live Webhooks**: Real webhook events (when configured)
- **Production Credentials**: Requires valid production API credentials

## 📈 Business Value

This application demonstrates:
- **Real-time provider availability**
- **Insurance plan integration**
- **Modern booking experience**
- **Professional healthcare UI/UX**
- **Scalable API integration patterns**
- **Complete appointment lifecycle management**
- **Webhook integration testing**
- **HIPAA-compliant data handling**
- **Multi-environment testing capabilities**

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables for API credentials
3. Deploy with automatic builds on push

### Local Development
- Backend proxy runs on port 3001
- Frontend runs on port 3000
- Use `npm run dev` for concurrent development

## 🤝 Support

For technical questions or issues, contact the development team.

---

**Built with ❤️ for Zocdoc API integration**
