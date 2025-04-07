# FireMapPro Export Functionality Test Plan

## Overview
This test plan verifies the functionality of the export features in FireMapPro, with a focus on the integration between the Layout Designer and the export process.

## Prerequisites
- FireMapPro application running with all dependencies
- Sample data loaded on the map (stations, incidents, etc.)
- Image files available for logo/image uploads

## Test Scenarios

### 1. Basic Export Tab
- [ ] Set map title and subtitle
- [ ] Upload department logo
- [ ] Select different export formats (PNG, JPG, PDF)
- [ ] Change DPI settings
- [ ] Select different paper sizes
- [ ] Toggle layout elements (legend, scale, north arrow, title)
- [ ] Verify export output contains all selected elements

### 2. Advanced Export Tab
- [ ] Change color mode (RGB, CMYK)
- [ ] Set custom print dimensions
- [ ] Enable professional print options (crop marks, color bars, etc.)
- [ ] Configure layer visibility for export
- [ ] Enable tiled printing for large formats
- [ ] Verify export output respects these advanced settings

### 3. Layout Designer Tab
- [ ] Switch between portrait and landscape orientations
- [ ] Drag and drop elements onto the layout canvas
- [ ] Apply different templates (Standard, Professional, Presentation, Tactical)
- [ ] Customize element properties (size, position, color, etc.)
- [ ] Add and upload images to the layout
- [ ] Verify captured layout configuration for export
- [ ] Verify export output matches the designed layout

### 4. Export Process and Output
- [ ] Export with basic settings only
- [ ] Export with advanced settings only
- [ ] Export with layout designer configuration
- [ ] Verify the correct tab settings are applied to the export
- [ ] Check preview before export
- [ ] Verify output file format matches selection
- [ ] Verify image quality at different DPI settings

### 5. Image Upload Functionality
- [ ] Upload logo in basic export tab
- [ ] Upload logo in map title modal
- [ ] Upload images in layout designer
- [ ] Verify images appear correctly in layout
- [ ] Verify images are included in exports

## Bug Verification
- [ ] Terrain layer appears correctly
- [ ] Layout designer templates are visible and can be selected
- [ ] Images can be uploaded and displayed in the layout
- [ ] No JavaScript errors when displaying the map
- [ ] Export functionality applies the settings from the selected tab

## Test Matrix for Export Formats

| Format | Basic Export | Advanced Export | Layout Designer Export |
|--------|-------------|----------------|------------------------|
| PNG    | | | |
| JPG    | | | |
| TIFF   | | | |
| PDF    | | | |
| SVG    | | | |
| EPS    | | | |
| GeoJSON| | | |
| KML    | | | |

## Notes
- For each combination in the test matrix, verify that the output file contains the expected settings
- Document any inconsistencies or missing features
- Test different browsers if possible (Chrome, Firefox, Safari)