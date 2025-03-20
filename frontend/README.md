# Foreign Trading System - Frontend

This is the frontend application for the Foreign Trading System, built with React, TypeScript, and Material-UI.

## Features

- User authentication (login/register)
- Real-time market data visualization
- Trading interface with market and limit orders
- Account management and profile settings
- Transaction history
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend server running on port 8080

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── store/         # Redux store and slices
│   ├── theme.ts       # Material-UI theme configuration
│   ├── App.tsx        # Main application component
│   └── index.tsx      # Application entry point
├── package.json
└── README.md
```

## Dependencies

- React
- TypeScript
- Material-UI
- Redux Toolkit
- React Router
- Axios
- Recharts
- Socket.IO Client

## API Integration

The frontend communicates with the backend through REST APIs and WebSocket connections:

- REST API: `http://localhost:8080/api`
- WebSocket: `ws://localhost:8080/market-data`

## Testing

To run tests:

```bash
npm test
```

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 