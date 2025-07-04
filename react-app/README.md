# FireEMS Data Formatter

A modern, React-based application for transforming and formatting Fire and EMS incident data.

## Features

- Upload and parse CSV, Excel, JSON, and XML files
- Map source fields to target fields with an intuitive interface
- Preview and validate transformed data
- Export to various formats and send to analysis tools

## Tech Stack

- React 19 with TypeScript
- Material UI for user interface components
- Redux Toolkit for state management
- PapaParse for CSV parsing
- SheetJS for Excel parsing
- Yup for data validation

## Development

### Prerequisites

- Node.js 18+ 
- npm 9+

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Build without TypeScript checking (for integration with Flask):

```bash
npm run build-no-check
```

## Integration with Flask

The React app is designed to be served from the Flask application. To integrate it:

1. **Build the React app**:
   ```bash
   cd /Users/josephhester/fire-ems-tools/react-app
   npm run build-no-check
   ```

2. **Deploy to Flask static directory**:
   ```bash
   ./deploy_react.sh
   ```
   
   The script copies the build files to `/Users/josephhester/fire-ems-tools/static/react-data-formatter/`.

3. **Register the React route in Flask**:
   ```bash
   cd /Users/josephhester/fire-ems-tools
   ./integrate_react_route.py
   ```

4. **Start the Flask server**:
   ```bash
   cd /Users/josephhester/fire-ems-tools
   python app.py
   ```

5. **Access the React app**:
   Open a browser and visit:
   ```
   http://localhost:5005/data-formatter-react
   ```

## API Integration

The React app communicates with the Flask backend through these API endpoints:

- `/tools-api/data-formatter/upload` - For file upload
- `/tools-api/data-formatter/transform` - For data transformation
- `/tools-api/data-formatter/download` - For downloading transformed data
- `/tools-api/data-formatter/send-to-tool` - For sending data to other tools

## Project Structure

- `src/components` - React components
- `src/hooks` - Custom React hooks
- `src/state` - Redux store and context providers
- `src/services` - Core services for file parsing, validation, etc.
- `src/types` - TypeScript type definitions
- `src/utils` - Utility functions

## Troubleshooting

### React App Not Loading

If the React app doesn't load correctly:

1. Check the browser console for errors
2. Verify that the build files were copied correctly
3. Check that the URLs in the HTML file are correct (they should include `/static/react-data-formatter/` prefix)
4. Ensure the Flask route is registered correctly

### API Requests Failing

If API requests are failing:

1. Check the browser console for error details
2. Verify that the Flask server is running
3. Check the API endpoints in the Flask app
4. Verify CORS settings if necessary

## License

Private - FireEMS Tools