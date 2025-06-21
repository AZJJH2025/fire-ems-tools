/**
 * Export System Types
 * 
 * Type definitions for the professional export system
 * matching the legacy Fire Map Pro functionality.
 */

// Export format options
export type ExportFormat = 
  | 'png' | 'jpg' | 'tiff' | 'webp'           // Raster formats
  | 'pdf' | 'svg' | 'eps'                     // Vector formats  
  | 'geojson' | 'kml' | 'geopdf';             // GIS formats

// Paper size presets
export type PaperSize = 
  | 'letter' | 'legal' | 'tabloid' 
  | 'a4' | 'a3' | 'a2' | 'a1' | 'a0' 
  | 'custom';

// Print orientation
export type PrintOrientation = 'portrait' | 'landscape';

// DPI resolution options
export type DPIResolution = 96 | 150 | 300 | 450 | 600;

// Color modes for professional printing
export type ColorMode = 'rgb' | 'cmyk';

// ICC color profiles
export type ColorProfile = 
  | 'srgb' | 'adobergb' 
  | 'cmyk-swop' | 'cmyk-fogra' 
  | 'custom';

// Print units
export type PrintUnits = 'in' | 'cm' | 'mm';

// Layout template types
export type LayoutTemplate = 'standard' | 'professional' | 'presentation' | 'tactical';

// Layout element types
export type LayoutElementType = 
  | 'map' | 'title' | 'subtitle' | 'legend' | 'north-arrow' 
  | 'scale-bar' | 'text' | 'image' | 'shape';

// Export tabs
export type ExportTab = 'basic' | 'advanced' | 'layout-designer';

// Basic export settings
export interface BasicExportSettings {
  title: string;
  subtitle: string;
  logo?: File | string;
  format: ExportFormat;
  dpi: DPIResolution;
  paperSize: PaperSize;
  orientation: PrintOrientation;
  includeLegend: boolean;
  includeScale: boolean;
  includeNorth: boolean;
  includeTitle: boolean;
}

// Advanced export settings
export interface AdvancedExportSettings {
  colorMode: ColorMode;
  colorProfile: ColorProfile;
  customProfile?: File;
  customWidth: number;
  customHeight: number;
  printUnits: PrintUnits;
  
  // Professional print options
  addBleed: boolean;
  showCropMarks: boolean;
  includeColorBars: boolean;
  addRegistrationMarks: boolean;
  embedICCProfile: boolean;
  
  // Large format printing
  enableTiledPrinting: boolean;
  tileSize: PaperSize;
  tileOverlap: number;
  
  // Layer controls
  exportAllLayers: boolean;
  selectedLayers: string[];
}

// Layout element definition
export interface LayoutElement {
  id: string;
  type: LayoutElementType;
  x: number;          // Position as percentage
  y: number;
  width: number;      // Size as percentage  
  height: number;
  zIndex: number;
  visible: boolean;
  
  // Element-level styling properties
  showBorder?: boolean;
  borderWidth?: number;
  borderColor?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  
  // Legend-specific properties
  legendTitle?: string;
  legendStyle?: string;
  showLegendBorder?: boolean;
  
  // North arrow properties
  arrowStyle?: string;
  rotation?: number;
  
  // Scale bar properties
  units?: string;
  scaleStyle?: string;
  divisions?: number;
  
  // Shape properties
  shapeType?: string;
  
  // Type-specific properties
  content?: {
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    imageSrc?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    shapeType?: string;
    imageFit?: string;
    altText?: string;
  };
}

// Layout designer settings
export interface LayoutDesignerSettings {
  selectedTemplate: LayoutTemplate | null;
  customLayout: boolean;
  pageOrientation: PrintOrientation;
  elements: LayoutElement[];
  selectedElementId: string | null;
  
  // Canvas state
  canvasWidth: number;
  canvasHeight: number;
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
}

// Complete export configuration
export interface ExportConfiguration {
  activeTab: ExportTab;
  basic: BasicExportSettings;
  advanced: AdvancedExportSettings;
  layout: LayoutDesignerSettings;
}

// Export process state
export interface ExportProcessState {
  isExporting: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
  success: boolean;
}

// Export result
export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  fileName: string;
  fileSize: number;
  downloadUrl?: string;
  errors: string[];
  warnings: string[];
  processingTime: number;
}

// Template definition for layout system
export interface TemplateDefinition {
  id: LayoutTemplate;
  name: string;
  description: string;
  orientation: PrintOrientation;
  previewImage: string;
  elements: Omit<LayoutElement, 'id'>[];
}

// Export modal state
export interface ExportModalState {
  open: boolean;
  activeTab: ExportTab;
  configuration: ExportConfiguration;
  process: ExportProcessState;
  availableTemplates: TemplateDefinition[];
}

// Component prop types
export interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  mapInstance?: any; // Leaflet map instance
}

export interface ExportTabProps {
  isActive: boolean;
  configuration: ExportConfiguration;
  onConfigurationChange: (updates: Partial<ExportConfiguration>) => void;
}

// Hook return types
export interface UseExportSettings {
  configuration: ExportConfiguration;
  updateBasicSettings: (updates: Partial<BasicExportSettings>) => void;
  updateAdvancedSettings: (updates: Partial<AdvancedExportSettings>) => void;
  updateLayoutSettings: (updates: Partial<LayoutDesignerSettings>) => void;
  resetToDefaults: () => void;
  validateConfiguration: () => { valid: boolean; errors: string[] };
}

export interface UseLayoutDesigner {
  elements: LayoutElement[];
  selectedElement: LayoutElement | null;
  addElement: (type: LayoutElementType, position: { x: number; y: number }) => void;
  updateElement: (id: string, updates: Partial<LayoutElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  applyTemplate: (template: LayoutTemplate) => void;
  clearLayout: () => void;
}

export interface UseExportProcess {
  startExport: (configuration: ExportConfiguration) => Promise<ExportResult>;
  cancelExport: () => void;
  exportState: ExportProcessState;
  lastResult: ExportResult | null;
}