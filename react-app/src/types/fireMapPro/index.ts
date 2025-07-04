/**
 * Fire Map Pro Type Definitions
 * 
 * Defines the core types for the Fire Map Pro application including
 * map features, layers, export configurations, and drawing tools.
 */

import * as L from 'leaflet';

// Core Geographic Types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Map Feature Types
export type FeatureType = 'marker' | 'polygon' | 'polyline' | 'circle' | 'rectangle';

export interface MapFeature {
  id: string;
  type: FeatureType;
  title: string;
  description: string;
  coordinates: number[] | number[][] | number[][][];
  style: FeatureStyle;
  properties: Record<string, any>;
  layerId: string;
  created: Date;
  modified: Date;
}

export interface FeatureStyle {
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  weight?: number;
  opacity?: number;
  dashArray?: string;
  icon?: MapIcon;
}

// Icon and Symbol Types
export interface MapIcon {
  id: string;
  name: string;
  category: IconCategory;
  url: string;
  size: IconSize;
  color: string;
  anchor: [number, number];
  popupAnchor: [number, number];
}

export type IconCategory = 
  | 'fire-apparatus' 
  | 'ems-units' 
  | 'incident-types' 
  | 'facilities' 
  | 'prevention' 
  | 'energy-systems'
  | 'custom';

export type IconSize = 'small' | 'medium' | 'large' | 'extra-large';

// Layer Management Types
export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  type: LayerType;
  features: MapFeature[];
  style?: LayerStyle;
  metadata: LayerMetadata;
}

export type LayerType = 'feature' | 'base' | 'overlay' | 'reference';

export interface LayerStyle {
  defaultStyle: FeatureStyle;
  hoverStyle?: FeatureStyle;
  selectedStyle?: FeatureStyle;
}

export interface LayerMetadata {
  description: string;
  source: string;
  created: Date;
  featureCount: number;
  bounds?: BoundingBox;
}

// Base Map Types
export interface BaseMapConfig {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  minZoom?: number;
  type: 'street' | 'satellite' | 'terrain' | 'hybrid';
}

// Drawing and Editing Types
export type DrawingMode = 
  | 'marker' 
  | 'polygon' 
  | 'polyline' 
  | 'circle' 
  | 'rectangle' 
  | 'edit' 
  | 'delete'
  | null;

export interface DrawingOptions {
  mode: DrawingMode;
  style: FeatureStyle;
  snapToGrid?: boolean;
  showMeasurements?: boolean;
  allowEdit?: boolean;
}

// Export and Layout Types
export interface ExportConfig {
  format: ExportFormat;
  dpi: number;
  paperSize: PaperSize;
  orientation: 'portrait' | 'landscape';
  layout: LayoutTemplate;
  includeMetadata: boolean;
  includeScale: boolean;
  includeLegend: boolean;
  includeNorthArrow: boolean;
}

export type ExportFormat = 'png' | 'pdf' | 'svg' | 'geojson' | 'kml';

export type PaperSize = 'letter' | 'legal' | 'tabloid' | 'a3' | 'a4' | 'a5' | 'custom';

export interface LayoutTemplate {
  id: string;
  name: string;
  type: 'standard' | 'professional' | 'presentation' | 'tactical';
  elements: LayoutElement[];
  margins: Margins;
  headerHeight: number;
  footerHeight: number;
}

export interface LayoutElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  content: any;
  style: ElementStyle;
  visible: boolean;
}

export type ElementType = 
  | 'title' 
  | 'subtitle' 
  | 'map' 
  | 'legend' 
  | 'scale' 
  | 'north-arrow' 
  | 'logo' 
  | 'text' 
  | 'image'
  | 'metadata';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  border?: string;
  borderRadius?: number;
  padding?: number;
  textAlign?: 'left' | 'center' | 'right';
}

// Map State and View Types
export interface MapView {
  center: Coordinates;
  zoom: number;
  bounds?: BoundingBox;
  rotation?: number;
}

export interface MapState {
  view: MapView;
  baseMaps: BaseMapConfig[];
  activeBaseMap: string;
  layers: MapLayer[];
  selectedFeatures: string[];
  drawingMode: DrawingMode;
  drawingOptions: DrawingOptions;
  exportConfig: ExportConfig;
  measurementUnits: 'metric' | 'imperial';
  showCoordinates: boolean;
  showGrid: boolean;
}

// File Import Types
export interface ImportConfig {
  fileType: 'csv' | 'geojson' | 'kml' | 'gpx' | 'shapefile';
  coordinateMapping: CoordinateMapping;
  layerName: string;
  defaultStyle: FeatureStyle;
  geometryType?: FeatureType;
}

export interface CoordinateMapping {
  latitudeField: string;
  longitudeField: string;
  coordinateSystem: 'wgs84' | 'utm' | 'custom';
  customProjection?: string;
}

// Data Processing Types
export interface ProcessingResult {
  success: boolean;
  features: MapFeature[];
  errors: ProcessingError[];
  warnings: string[];
  statistics: ProcessingStatistics;
}

export interface ProcessingError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ProcessingStatistics {
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  featuresCreated: number;
  processingTime: number;
}

// Component Props Types
export interface FireMapProContainerProps {
  initialMapState?: Partial<MapState>;
  mode: 'create' | 'edit' | 'view';
  onSave?: (mapState: MapState) => void;
  onExport?: (exportConfig: ExportConfig) => void;
}

export interface MapContainerProps {
  mapState: MapState;
  onMapStateChange: (updates: Partial<MapState>) => void;
  onFeatureCreate: (feature: MapFeature) => void;
  onFeatureUpdate: (featureId: string, updates: Partial<MapFeature>) => void;
  onFeatureDelete: (featureId: string) => void;
}

export interface LayerManagerProps {
  layers: MapLayer[];
  onLayerToggle: (layerId: string, visible: boolean) => void;
  onLayerReorder: (layerIds: string[]) => void;
  onLayerUpdate: (layerId: string, updates: Partial<MapLayer>) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerCreate: (layer: Omit<MapLayer, 'id'>) => void;
}

export interface DrawingToolsProps {
  drawingMode: DrawingMode;
  drawingOptions: DrawingOptions;
  onDrawingModeChange: (mode: DrawingMode) => void;
  onDrawingOptionsChange: (options: Partial<DrawingOptions>) => void;
  availableStyles: FeatureStyle[];
}

export interface IconLibraryProps {
  categories: IconCategory[];
  selectedCategory: IconCategory;
  onCategoryChange: (category: IconCategory) => void;
  onIconDrop: (icon: MapIcon, coordinates: Coordinates) => void;
  selectedIconColor: string;
  selectedIconSize: IconSize;
  onIconColorChange: (color: string) => void;
  onIconSizeChange: (size: IconSize) => void;
}

export interface ExportManagerProps {
  mapInstance?: L.Map;
  exportConfig: ExportConfig;
  onExportConfigChange: (config: Partial<ExportConfig>) => void;
  onExport: (format: ExportFormat) => Promise<void>;
  isExporting: boolean;
}

// Hook Return Types
export interface UseMapManagement {
  mapState: MapState;
  updateMapState: (updates: Partial<MapState>) => void;
  createFeature: (feature: Omit<MapFeature, 'id' | 'created' | 'modified'>) => void;
  updateFeature: (featureId: string, updates: Partial<MapFeature>) => void;
  deleteFeature: (featureId: string) => void;
  createLayer: (layer: Omit<MapLayer, 'id'>) => void;
  updateLayer: (layerId: string, updates: Partial<MapLayer>) => void;
  deleteLayer: (layerId: string) => void;
  clearMap: () => void;
  saveMap: () => Promise<void>;
  loadMap: (mapId: string) => Promise<void>;
}

export interface UseFileImport {
  importFile: (file: File, config: ImportConfig) => Promise<ProcessingResult>;
  isProcessing: boolean;
  progress: number;
  lastResult?: ProcessingResult;
}

export interface UseMapExport {
  exportMap: (format: ExportFormat, config?: Partial<ExportConfig>) => Promise<void>;
  isExporting: boolean;
  progress: number;
  lastExport?: { format: ExportFormat; url: string; timestamp: Date };
}

// Error Types
export interface FireMapProError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: FireMapProError;
  message?: string;
}

export interface SaveMapResponse {
  mapId: string;
  version: number;
  savedAt: Date;
}

export interface LoadMapResponse {
  mapState: MapState;
  metadata: {
    id: string;
    name: string;
    version: number;
    createdAt: Date;
    modifiedAt: Date;
    owner: string;
  };
}