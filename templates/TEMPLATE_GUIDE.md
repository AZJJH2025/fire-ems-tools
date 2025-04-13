# FireEMS.ai Template Inheritance System

This document describes the template inheritance system used in the FireEMS.ai application.

## Overview

The FireEMS.ai application uses Jinja2 template inheritance to reduce duplication and improve maintainability. The system consists of:

1. **Base Template**: A common base template (`base.html`) that defines the overall HTML structure
2. **Component Templates**: Reusable UI components in the `components/` directory
3. **Page Templates**: Individual page templates that extend the base template

## Base Template

The base template (`base.html`) provides:

- HTML document structure
- Common CSS and JavaScript imports
- Navigation bar
- Common header
- Footer
- Template blocks that can be overridden by child templates

### Available Blocks

| Block Name | Purpose | Default Content |
|------------|---------|-----------------|
| `title` | Page title | "FireEMS.ai - Fire & EMS AI Analytics Tools" |
| `styles` | Page-specific CSS | Empty |
| `header_scripts` | Scripts to load in head | Empty |
| `header` | Page header section | Standard tool header |
| `header_icon` | Icon in header | "fas fa-tools" |
| `header_title` | Title in header | "FireEMS.ai Tools" |
| `header_subtitle` | Subtitle in header | "Advanced AI-Powered Analytics for Fire & EMS Agencies" |
| `content` | Main page content | Empty |
| `scripts` | Page-specific scripts | Empty |

## Component Templates

Component templates are located in the `components/` directory and provide reusable UI elements:

### Available Components

| Component | File | Purpose |
|-----------|------|---------|
| `file_upload` | `file_upload.html` | Standardized file upload UI with formatter link |
| `map_container` | `map_container.html` | Leaflet map container with optional legend |
| `notification` | `notification.html` | Toast-style notification component |

### Using Components

Components are imported using Jinja2's `import` statement and used as macros. Example:

```html
{% from "components/file_upload.html" import file_upload %}

{% block content %}
  {{ file_upload(form_id="upload-form", file_id="call-data-file", accept=".csv, .xlsx, .xls") }}
{% endblock %}
```

Some components use the caller pattern to allow customizing their content:

```html
{% from "components/map_container.html" import map_container %}

{% block content %}
  {% call map_container(map_id="my-map", legend_title="My Legend") %}
    <!-- Custom legend items go here -->
    <div class="legend-item">
      <span class="color-box" style="background-color: red;"></span>
      <span>Important</span>
    </div>
  {% endcall %}
{% endblock %}
```

## Creating New Page Templates

To create a new page using template inheritance:

1. Extend the base template:
   ```html
   {% extends "base.html" %}
   ```

2. Override necessary blocks:
   ```html
   {% block title %}My Page Title{% endblock %}
   
   {% block styles %}
     <link rel="stylesheet" href="/static/my-page.css">
   {% endblock %}
   
   {% block header_icon %}fas fa-star{% endblock %}
   {% block header_title %}My Page{% endblock %}
   {% block header_subtitle %}My page description{% endblock %}
   
   {% block content %}
     <!-- Page content here -->
   {% endblock %}
   
   {% block scripts %}
     <script src="/static/my-page.js"></script>
   {% endblock %}
   ```

3. Import and use components as needed:
   ```html
   {% from "components/file_upload.html" import file_upload %}
   {% from "components/notification.html" import notification %}
   
   {% block content %}
     {{ file_upload(form_id="my-form") }}
     
     {% call notification(id="success-notice", type="success") %}
       Data processed successfully!
     {% endcall %}
   {% endblock %}
   ```

## Best Practices

1. **Always extend the base template** for new pages
2. **Use components** for common UI patterns
3. **Override only what you need** - leverage the defaults
4. **Keep style consistency** by using common CSS classes
5. **Add new components** when you find duplicate patterns
6. **Document any new blocks or components** in this guide

## Active Page Navigation

The navigation bar automatically highlights the current page using the `active_page` variable set in the context processor. This variable contains the current route path.

## Template Globals

The following variables are available in all templates:

- `app_name`: The application name ("FireEMS.ai")
- `current_year`: The current year (for copyright notices)
- `version`: The application version
- `active_page`: The current route path

## Emergency Mode Scripts

The application features a resilience framework with emergency mode functionality to handle edge cases when resources fail to load. These scripts have been extracted from inline code into separate files for better maintainability:

### Location

Emergency mode scripts are stored in `/static/js/emergency-scripts/` directory.

### Available Scripts

| Script | Purpose |
|--------|---------|
| `framework-initialization.js` | Loads the FireEMS framework with fallback paths |
| `chartjs-loader.js` | Loads Chart.js with error handling and fallbacks |
| `emergency-mode-debugging.js` | Handles emergency mode detection and diagnostics |
| `emergency-mode-library.js` | Processes emergency data from localStorage |
| `chart-syntax-fix.js` | Fixes Chart.js initialization problems |
| `chart-manager-loader.js` | Loads the chart manager with fallback paths |
| `fallback-loader.js` | Loads chart fallback scripts for resilience |
| `prevent-mode-switch-loader.js` | Prevents mode switching during emergency |
| `dashboard-loader.js` | Loads dashboard scripts with version control |

A complementary CSS file is also provided at `/static/emergency-mode.css` with styles for emergency notifications and data displays.

### Using Emergency Scripts

In templates that require emergency mode functionality, reference the scripts in appropriate blocks:

```html
{% block header_scripts %}
<!-- FireEMS Resilience Framework -->
<script src="/static/js/emergency-scripts/framework-initialization.js"></script>

<!-- Chart.js with better error handling -->
<script src="/static/js/emergency-scripts/chartjs-loader.js"></script>

<!-- EMERGENCY MODE DEBUGGING -->
<script src="/static/js/emergency-scripts/emergency-mode-debugging.js"></script>
{% endblock %}

{% block scripts %}
<!-- Add emergency libraries at the end of body -->
<script src="/static/js/emergency-scripts/emergency-mode-library.js"></script>
<!-- Other emergency scripts as needed -->
{% endblock %}
```

## Future Enhancements

- Add more specialized components
- Create section-specific layouts extending the base template
- Implement better mobile responsiveness
- Add theme switching capabilities
- Extract more inline scripts to external files
- Centralize resilience logic in a core library