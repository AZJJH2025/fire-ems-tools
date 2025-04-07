# FireMapPro Export Functionality Test Plan

## Overview
This test plan verifies the functionality of the export features in FireMapPro, with a focus on the integration between the Layout Designer and the export process.

## Prerequisites
- FireMapPro application running with all dependencies
- Sample data loaded on the map (stations, incidents, etc.)
- Image files available for logo/image uploads

## Test Scenarios

### 1. Basic Export Tab
- [x] Set map title and subtitle
- [x] Upload department logo
- [x] Select different export formats (PNG, JPG, PDF)
- [x] Change DPI settings
- [x] Select different paper sizes
- [x] Toggle layout elements (legend, scale, north arrow, title)
- [x] Verify export output contains all selected elements

### 2. Advanced Export Tab
- [x] Change color mode (RGB, CMYK)
- [x] Set custom print dimensions
- [x] Enable professional print options (crop marks, color bars, etc.)
- [x] Configure layer visibility for export
- [x] Enable tiled printing for large formats
- [x] Verify export output respects these advanced settings

### 3. Layout Designer Tab
- [x] Switch between portrait and landscape orientations
- [x] Drag and drop elements onto the layout canvas
- [x] Apply different templates (Standard, Professional, Presentation, Tactical)
- [x] Customize element properties (size, position, color, etc.)
- [x] Add and upload images to the layout
- [x] Verify captured layout configuration for export
- [x] Verify export output matches the designed layout

### 4. Export Process and Output
- [x] Export with basic settings only
- [x] Export with advanced settings only
- [x] Export with layout designer configuration
- [x] Verify the correct tab settings are applied to the export
- [x] Check preview before export
- [x] Verify output file format matches selection
- [x] Verify image quality at different DPI settings

### 5. Image Upload Functionality
- [x] Upload logo in basic export tab
- [x] Upload logo in map title modal
- [x] Upload images in layout designer
- [x] Verify images appear correctly in layout
- [x] Verify images are included in exports

## Bug Verification
- [x] Terrain layer appears correctly
- [x] Layout designer templates are visible and can be selected
- [x] Images can be uploaded and displayed in the layout
- [x] No JavaScript errors when displaying the map
- [x] Export functionality applies the settings from the selected tab

## Test Matrix for Export Formats

| Format | Basic Export | Advanced Export | Layout Designer Export |
|--------|-------------|----------------|------------------------|
| PNG    | ✅ | ✅ | ✅ |
| JPG    | ✅ | ✅ | ✅ |
| TIFF   | ❌ | ❌ | ❌ |
| PDF    | ✅ | ✅ | ✅ |
| SVG    | ❌ | ❌ | ❌ |
| EPS    | ❌ | ❌ | ❌ |
| GeoJSON| ❌ | ❌ | N/A |
| KML    | ❌ | ❌ | N/A |

## Implementation Status
- ✅ Complete: Basic PNG, JPG, PDF export for all tabs
- ✅ Complete: Layout designer template application
- ✅ Complete: Image uploads in layout elements
- ✅ Complete: Tab switching and settings capture
- ❌ Pending: Vector export (SVG, EPS)
- ❌ Pending: GIS format export (GeoJSON, KML)
- ❌ Pending: TIFF export

## Notes
- For each combination in the test matrix, verify that the output file contains the expected settings
- Document any inconsistencies or missing features
- Test different browsers if possible (Chrome, Firefox, Safari)

## Future Enhancements
- Implement vector export formats (SVG, EPS)
- Add support for GIS data formats (GeoJSON, KML)
- Implement TIFF export with compression options
- Add more customization options for layout elements
- Provide a library of preset symbols and icons for layout design