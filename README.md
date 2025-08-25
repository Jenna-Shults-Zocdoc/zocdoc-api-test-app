# 🏥 Zocdoc API Test Application

A modern, colorful React application for testing and demonstrating Zocdoc API integration capabilities.

## ✨ Features

- **🔐 Authentication**: OAuth 2.0 Client Credentials Flow with Zocdoc API
- **👥 Provider Directory**: Browse all providers in your network
- **🔍 Availability-Aware Search**: Search providers with real-time availability
- **📅 Appointment Booking**: Interactive booking experience with timeslot selection
- **📋 Appointment Management**: View, cancel, and reschedule appointments
- **🎨 Modern UI**: Beautiful, responsive design with healthcare-themed colors
- **🔄 Token Management**: Automatic token refresh and expiration handling

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
- Use your Zocdoc sandbox credentials
- Enable "Use Backend Proxy" for real API testing
- Or use "Mock Authentication" for demo purposes

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
- **TokenExpirationModal**: Seamless re-authentication

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
- `/v1/appointments/cancel` - Cancel appointments
- `/v1/appointments/reschedule` - Reschedule appointments

## 🔐 Security Features

- **Token expiration handling**
- **Automatic re-authentication**
- **Credential storage in localStorage**
- **CORS proxy for secure API calls**

## 📈 Business Value

This application demonstrates:
- **Real-time provider availability**
- **Insurance plan integration**
- **Modern booking experience**
- **Professional healthcare UI/UX**
- **Scalable API integration patterns**

## 🤝 Support

For technical questions or issues, contact the development team.

---

**Built with ❤️ for Zocdoc API integration**
