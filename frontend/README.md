# Zentix Protocol Frontend Dashboard

A comprehensive React + TypeScript dashboard for managing the Zentix Protocol's AI agents, guardians, transactions, and compliance monitoring.

## Features

- **Dashboard Overview**: Network health indicators, active guardians count, reports breakdown, and compliance scores
- **Guardian Management**: View all guardians with their DIDs, roles, and creation dates
- **Guardian Reports**: Filterable reports table with voting interface for pending reports
- **Relayer Service**: Transaction relay form, nonce lookup, and transaction history
- **Compliance & Audit**: Compliance scores, violation history, and audit export functionality

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety with strict mode
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling
- **React Router v7** - Client-side routing
- **Recharts** - Data visualization (ready to use)

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- At least 2GB free disk space

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Install additional packages (if not already installed):
```bash
npm install react-router-dom react-hook-form recharts lucide-react
npm install -D @tailwindcss/vite
```

3. Configure environment (optional):
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:3000
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Header, Layout)
│   │   └── ui/              # Reusable UI components (Card, Button)
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Guardians.tsx
│   │   ├── Reports.tsx
│   │   ├── Relayer.tsx
│   │   └── Compliance.tsx
│   ├── services/
│   │   └── api.ts           # API service layer
│   ├── hooks/
│   │   └── useApi.ts        # Custom API hook
│   ├── types/
│   │   ├── index.ts         # TypeScript type definitions
│   │   └── enums.ts         # Enums
│   ├── utils/
│   │   └── formatters.ts    # Utility functions
│   ├── data/
│   │   └── dashboardMockData.ts  # Mock data for development
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles with Tailwind
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## API Integration

The dashboard connects to the following API endpoints:

- `GET /api/dashboard` - Dashboard statistics
- `GET /api/guardians` - List of guardians
- `GET /api/guardians/reports` - Guardian reports (with filtering)
- `POST /api/guardians/reports/:id/vote` - Vote on a report
- `GET /health` - Relayer health check
- `GET /stats` - Relayer statistics
- `GET /nonce/:address` - Get nonce for address
- `POST /relay` - Relay a transaction
- `GET /api/compliance/:did` - Compliance score for DID
- `GET /api/compliance/audit/export` - Export audit data

### Mock Data

The app includes comprehensive mock data for development and testing. When API calls fail, it automatically falls back to mock data.

## Running with Backend

1. Start the Guardian API server:
```bash
cd ..
npm run guardian:api
```

2. In a separate terminal, start the frontend:
```bash
cd frontend
npm run dev
```

The frontend will connect to the API at `http://localhost:3000` by default.

## Features Implementation

### Filtering & Sorting
- Reports page includes status and severity filters
- Real-time filtering updates the displayed data

### Form Validation
- Transaction relay form validates all required fields
- Nonce lookup validates address format

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Optimized for desktop and mobile devices

### Error Handling
- Loading states for all API calls
- Error messages with retry functionality
- Graceful fallback to mock data

## Development Notes

- TypeScript strict mode is enabled
- All imports use the `type` modifier where applicable
- No unused imports or variables (enforced by tsconfig)
- Tailwind CSS v4 with custom theme variables
- Component-based architecture for reusability

## Future Enhancements

- [ ] Add shadcn/ui components for enhanced UI
- [ ] Implement dark/light theme toggle
- [ ] Add toast notifications
- [ ] Implement real-time updates with WebSockets
- [ ] Add data visualization charts
- [ ] Implement pagination for large datasets
- [ ] Add search functionality
- [ ] Implement user authentication

## License

MIT - Amrikyy Labs 2025