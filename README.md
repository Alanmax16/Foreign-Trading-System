# Foreign Trading System

A comprehensive foreign currency trading system built with Spring Boot and React.

## Features

### Backend
- User authentication and authorization
- Real-time market data processing
- Trade execution and management
- Account management
- Transaction history
- Risk management
- WebSocket support for real-time updates

### Frontend
- Modern, responsive UI with Material-UI
- Real-time market data visualization
- Interactive trading interface
- Account management dashboard
- Transaction history
- Profile settings

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Node.js 14 or higher
- npm 6 or higher
- PostgreSQL 13 or higher

## Project Structure

```
foreign-trading-system/
├── backend/           # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/foreigntrading/
│   │   │   │       ├── config/     # Configuration classes
│   │   │   │       ├── controller/ # REST controllers
│   │   │   │       ├── model/      # Data models
│   │   │   │       ├── repository/ # Data access layer
│   │   │   │       ├── service/    # Business logic
│   │   │   │       └── util/       # Utility classes
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                   # Test classes
│   └── pom.xml
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── store/      # Redux store and slices
│   │   └── App.tsx     # Main application component
│   └── package.json
└── README.md
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/foreign-trading-system.git
   cd foreign-trading-system
   ```

2. Install all dependencies:
   ```bash
   npm run install-all
   ```

3. Configure the database:
   - Create a PostgreSQL database
   - Update the database configuration in `backend/src/main/resources/application.properties`

## Development

To start both the backend and frontend servers in development mode:

```bash
npm start
```

This will start:
- Backend server on http://localhost:8080
- Frontend development server on http://localhost:3000

### Running Servers Separately

- Backend only:
  ```bash
  npm run backend
  ```

- Frontend only:
  ```bash
  npm run frontend
  ```

## Testing

To run tests for both backend and frontend:

```bash
npm test
```

## Building for Production

To create production builds:

```bash
npm run build
```

This will:
1. Build the Spring Boot application
2. Create a production build of the React application

## API Documentation

The API documentation is available at `http://localhost:8080/swagger-ui.html` when the backend server is running.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- All API endpoints are secured with JWT authentication
- Passwords are hashed using BCrypt
- HTTPS is enforced in production
- Rate limiting is implemented for API endpoints
- Input validation and sanitization are performed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Spring Boot team for the excellent framework
- React team for the amazing frontend library
- Material-UI team for the beautiful components
- All contributors and maintainers of the open-source libraries used in this project
