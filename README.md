# FireEMS.ai - Fire & EMS Analytics Tools

FireEMS.ai is a comprehensive suite of analytics tools designed for Fire and Emergency Medical Services agencies. The platform provides data visualization, incident logging, response time analysis, and more to help emergency services improve operations and decision-making.

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

## Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/fire-ems-tools.git
cd fire-ems-tools
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Run the application
```bash
python app.py
```

4. Access the application
```
http://localhost:5005
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

## Data Formatter Testing

For testing the Data Formatter specifically, refer to [DATA_FORMATTER_TESTING.md](DATA_FORMATTER_TESTING.md).

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.