# Amrikyy-Zentix Pilot Test

This is a proof-of-concept integration between Amrikyy AIOS and Zentix Protocol, demonstrating real API integrations with Google Gemini and Pexels.

## Features

1. **System Health Monitoring** - Real-time metrics dashboard
2. **Atlas Finance Widget** - Arbitrage opportunity detection
3. **Mini Creator Studio** - AI-powered video generation with:
   - Google Gemini content generation
   - Pexels image search
   - Video compilation workflow

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd protocol && npm install
   cd ../desktop && npm install
   cd ..
   ```

2. **Configure API keys (optional but recommended):**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   PEXELS_API_KEY=your_pexels_api_key
   ```

3. **Run the application:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## API Endpoints

### System Health
- `GET /api/pilot/system-health` - Get real-time system metrics

### Atlas Finance
- `GET /api/pilot/atlas/opportunities` - Get arbitrage opportunities

### Mini Creator Studio
- `POST /api/pilot/creator/generate` - Start video generation
- `GET /api/pilot/creator/status/:workflowId` - Get workflow status

## Technology Stack

- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **APIs:** Google Gemini, Pexels
- **Tools:** ffmpeg (simulated in this demo)

## Next Steps

1. Implement actual video generation with ffmpeg
2. Add authentication and user management
3. Deploy to cloud infrastructure