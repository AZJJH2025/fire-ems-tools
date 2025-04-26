# FireEMS.ai - Fire & EMS Analytics Tools

FireEMS.ai is a comprehensive suite of analytics tools designed for Fire and Emergency Medical Services agencies. This platform empowers emergency response organizations to optimize their operations through advanced data analytics, visualization, and reporting tools.

Our suite provides essential tools for:

- Analyzing response times and improving coverage areas
- Tracking incidents with HIPAA-compliant logging
- Visualizing call volumes and identifying service gaps
- Standardizing and transforming data from various CAD systems
- Evaluating station performance metrics
- Creating interactive maps for operational planning

By combining modern web technologies with specialized analytics designed for emergency services, FireEMS.ai helps departments make data-driven decisions to enhance public safety and operational efficiency.

## Features

- **Response Time Analyzer**: Visualize and analyze emergency response times
- **Call Density Heatmap**: Map call volumes across service areas
- **Isochrone Map**: Visualize response time coverage areas 
- **Incident Logger**: Document incidents with HIPAA compliance and CAD integration
- **Data Formatter**: Transform and standardize data from various sources
- **Station Overview**: Analyze station performance and coverage
- **FireMapPro**: Advanced mapping tools for incident analysis

## Technical Overview

The application is built using:

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript, Jinja2 templates
- **Data Visualization**: Chart.js, Leaflet.js
- **Data Processing**: Pandas, SQLAlchemy

## Template Inheritance System

We've implemented a comprehensive template inheritance system to improve code organization and maintainability. This system includes:

### Base Template

A common base template (`base.html`) provides:
- HTML document structure
- Common CSS and JavaScript imports
- Navigation bar
- Common header
- Footer
- Template blocks that can be overridden by child templates

### Components

Reusable UI components in the `components/` directory:
- `file_upload.html`: Standardized file upload UI
- `map_container.html`: Leaflet map container with legend
- `notification.html`: Toast-style notification component

### Template Documentation

For developers working on the frontend, we've created comprehensive documentation in `templates/TEMPLATE_GUIDE.md` that covers:
- Available template blocks
- How to use components
- Best practices for creating new pages
- Active page navigation system

### Emergency Scripts

The application includes a resilience framework with emergency mode functionality to handle edge cases when resources fail to load:
- Extracted inline scripts to `/static/js/emergency-scripts/`
- Created dedicated emergency-mode CSS
- Documented the emergency scripts system

## Project Status

### Template Inheritance Implementation

✅ **Complete** - All main templates now use the template inheritance system:
- ✅ index.html
- ✅ call-density-heatmap.html
- ✅ isochrone-map.html
- ✅ fire-ems-dashboard.html (with emergency mode scripts extracted)
- ✅ incident-logger.html

### Next Steps

- Additional component extraction
- Further modularization of JavaScript
- Enhanced resilience testing
- Mobile UI improvements

## Backend Setup

The FireEMS.ai platform is built on a Flask backend with Python, providing RESTful APIs and server-side rendering for the analytics tools.

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/fire-ems-tools.git
cd fire-ems-tools
```

2. Create and activate a virtual environment (recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

### Running the Development Server

Start the Flask development server:
```bash
python app.py
```

The application will be accessible at:
```
http://localhost:5005
```

For development with automatic reloading:
```bash
FLASK_ENV=development python app.py
```

## React Data Formatter Setup

The React frontend code is located in `/static/js/react-data-formatter/`. This component provides an interactive interface for mapping and transforming data fields.

### Building the React Application

The React application is built using Webpack. To build the production bundle, navigate to `/static/js/react-data-formatter/` and run `npm run build`.

```bash
cd static/js/react-data-formatter/
npm install
npm run build
```

The `dist/` directory contains the compiled and bundled JavaScript, CSS, and HTML files that are served by the Flask application.

### Dependencies

The React application uses dependencies like `@material-ui/core` and `react-beautiful-dnd`. Run `npm install` in the `/static/js/react-data-formatter/` directory before building.

### MapFieldsManager

The `MapFieldsManager.js` file in `/static/js/utils/` provides utility functions for mapping data fields in the application's UI. It works in conjunction with the React data formatter to standardize and transform field values.

## Deployment

FireEMS.ai is designed to be deployed to various production environments depending on your organization's needs.

### Docker Deployment

The application includes a Dockerfile and docker-compose.yml for containerized deployment:

```bash
docker-compose up -d
```

### Production Server

For production deployment, we recommend using Gunicorn as a WSGI server:

```bash
gunicorn --workers=4 --bind=0.0.0.0:8000 wsgi:app
```

### Render Deployment

The application includes a render.yaml configuration file for deployment to the Render platform. Refer to [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed instructions.

## Testing

FireEMS.ai includes comprehensive test suites for both backend and frontend components.

### Backend Tests

Run the backend Python tests using pytest:

```bash
pytest
```

For specific test categories:

```bash
# Run API tests
pytest tests/api/

# Run route tests
pytest tests/routes/

# Run with coverage report
pytest --cov=. tests/
```

### Frontend Tests

For testing React components:

```bash
cd static/js/react-data-formatter
npm test
```

### End-to-End Tests

Run end-to-end tests with Playwright:

```bash
cd e2e
npm install
npx playwright test
```

## Environment Variables

FireEMS.ai uses environment variables for configuration in production environments:

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Environment setting (development, testing, production) | `development` |
| `DATABASE_URL` | Database connection string | `sqlite:///instance/fire_ems.db` |
| `SECRET_KEY` | Flask secret key for session management | Generated randomly |
| `REDIS_URL` | Redis connection URL (if using Redis) | None |
| `LOG_LEVEL` | Logging level (DEBUG, INFO, WARNING, ERROR) | `INFO` |

## Data Formatter Testing

For testing the Data Formatter specifically, refer to [DATA_FORMATTER_TESTING.md](DATA_FORMATTER_TESTING.md).

## Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and commit (`git commit -m 'Add some amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For more details, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.