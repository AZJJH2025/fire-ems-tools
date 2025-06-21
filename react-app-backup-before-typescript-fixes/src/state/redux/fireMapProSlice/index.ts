/**
 * Fire Map Pro Redux Slice
 * 
 * Manages the complete state for Fire Map Pro including map view,
 * layers, features, drawing tools, and export configurations.
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { 
  MapState, 
  MapFeature, 
  MapLayer, 
  MapView, 
  DrawingMode, 
  DrawingOptions,
  ExportConfig,
  BaseMapConfig,
  FeatureType,
  LayerType
} from '@/types/fireMapPro';
import { 
  ExportModalState, 
  ExportConfiguration, 
  ExportTab,
  BasicExportSettings,
  AdvancedExportSettings,
  LayoutDesignerSettings,
  ExportProcessState,
  TemplateDefinition,
  LayoutTemplate,
  LayoutElement
} from '@/types/export';

// Default configurations
const defaultBaseMap: BaseMapConfig = {
  id: 'osm',
  name: 'OpenStreetMap',
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19,
  minZoom: 1,
  type: 'street'
};

const defaultBaseMaps: BaseMapConfig[] = [
  defaultBaseMap,
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
    minZoom: 1,
    type: 'satellite'
  },
  {
    id: 'terrain',
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors',
    maxZoom: 17,
    type: 'terrain'
  }
];

const defaultDrawingOptions: DrawingOptions = {
  mode: null,
  style: {
    color: '#3388ff',
    fillColor: '#3388ff',
    fillOpacity: 0.3,
    weight: 3,
    opacity: 1
  },
  snapToGrid: false,
  showMeasurements: true,
  allowEdit: true
};

const defaultExportConfig: ExportConfig = {
  format: 'png',
  dpi: 300,
  paperSize: 'letter',
  orientation: 'landscape',
  layout: {
    id: 'standard',
    name: 'Standard Layout',
    type: 'standard',
    elements: [],
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    headerHeight: 60,
    footerHeight: 40
  },
  includeMetadata: true,
  includeScale: true,
  includeLegend: true,
  includeNorthArrow: true
};

const initialMapState: MapState = {
  view: {
    center: { latitude: 39.8283, longitude: -98.5795 }, // Geographic center of US  
    zoom: 6 // Start zoomed out to see all tiles load properly
  },
  baseMaps: defaultBaseMaps,
  activeBaseMap: 'osm',
  layers: [], // Will be loaded from defaultMapLayers
  selectedFeatures: [],
  drawingMode: null,
  drawingOptions: defaultDrawingOptions,
  exportConfig: defaultExportConfig,
  measurementUnits: 'imperial',
  showCoordinates: true,
  showGrid: false
};

// Additional UI state
interface FireMapProUIState {
  sidebarOpen: boolean;
  activePanel: 'layers' | 'drawing' | 'icons' | 'export' | 'settings' | null;
  fullscreen: boolean;
  showWelcome: boolean;
  isLoading: boolean;
  error: string | null;
}

// Default export configuration
const defaultBasicSettings: BasicExportSettings = {
  title: '',
  subtitle: '',
  format: 'png',
  dpi: 300,
  paperSize: 'letter',
  orientation: 'portrait',
  includeLegend: true,
  includeScale: true,
  includeNorth: true,
  includeTitle: true
};

const defaultAdvancedSettings: AdvancedExportSettings = {
  colorMode: 'rgb',
  colorProfile: 'srgb',
  customWidth: 8.5,
  customHeight: 11,
  printUnits: 'in',
  addBleed: false,
  showCropMarks: false,
  includeColorBars: false,
  addRegistrationMarks: false,
  embedICCProfile: false,
  enableTiledPrinting: false,
  tileSize: 'letter',
  tileOverlap: 0.5,
  exportAllLayers: true,
  selectedLayers: []
};

const defaultLayoutSettings: LayoutDesignerSettings = {
  selectedTemplate: null,
  customLayout: false,
  pageOrientation: 'portrait',
  elements: [],
  selectedElementId: null,
  canvasWidth: 400,
  canvasHeight: 520,
  snapToGrid: false,
  gridSize: 10,
  showGrid: false
};

const defaultExportConfiguration: ExportConfiguration = {
  activeTab: 'basic',
  basic: defaultBasicSettings,
  advanced: defaultAdvancedSettings,
  layout: defaultLayoutSettings
};

const defaultExportProcess: ExportProcessState = {
  isExporting: false,
  progress: 0,
  currentStep: '',
  error: null,
  success: false
};

const defaultExportModal: ExportModalState = {
  open: false,
  activeTab: 'basic',
  configuration: defaultExportConfiguration,
  process: defaultExportProcess,
  availableTemplates: []
};

interface FireMapProState {
  map: MapState;
  ui: FireMapProUIState;
  export: ExportModalState;
  history: MapState[];
  historyIndex: number;
  clipboard: MapFeature[];
}

const initialState: FireMapProState = {
  map: initialMapState,
  ui: {
    sidebarOpen: true,
    activePanel: 'layers',
    fullscreen: false,
    showWelcome: true,
    isLoading: false,
    error: null
  },
  export: defaultExportModal,
  history: [initialMapState],
  historyIndex: 0,
  clipboard: []
};

const fireMapProSlice = createSlice({
  name: 'fireMapPro',
  initialState,
  reducers: {
    // Map State Actions
    updateMapView: (state, action: PayloadAction<Partial<MapView>>) => {
      state.map.view = { ...state.map.view, ...action.payload };
      addToHistory(state);
    },

    setActiveBaseMap: (state, action: PayloadAction<string>) => {
      state.map.activeBaseMap = action.payload;
    },

    updateMapSettings: (state, action: PayloadAction<{
      measurementUnits?: 'metric' | 'imperial';
      showCoordinates?: boolean;
      showGrid?: boolean;
    }>) => {
      Object.assign(state.map, action.payload);
    },

    // Layer Management Actions
    addLayer: (state, action: PayloadAction<Omit<MapLayer, 'id'>>) => {
      const newLayer: MapLayer = {
        ...action.payload,
        id: generateId(),
        metadata: {
          ...action.payload.metadata,
          created: new Date(),
          featureCount: action.payload.features.length
        }
      };
      state.map.layers.push(newLayer);
      addToHistory(state);
    },

    updateLayer: (state, action: PayloadAction<{ layerId: string; updates: Partial<MapLayer> }>) => {
      const { layerId, updates } = action.payload;
      const layerIndex = state.map.layers.findIndex(layer => layer.id === layerId);
      if (layerIndex !== -1) {
        state.map.layers[layerIndex] = { 
          ...state.map.layers[layerIndex], 
          ...updates 
        };
        // Update feature count if features changed
        if (updates.features) {
          state.map.layers[layerIndex].metadata.featureCount = updates.features.length;
        }
        addToHistory(state);
      }
    },

    deleteLayer: (state, action: PayloadAction<string>) => {
      const layerId = action.payload;
      state.map.layers = state.map.layers.filter(layer => layer.id !== layerId);
      // Remove any selected features from this layer
      state.map.selectedFeatures = state.map.selectedFeatures.filter(featureId => 
        !state.map.layers.some(layer => 
          layer.id === layerId && layer.features.some(feature => feature.id === featureId)
        )
      );
      addToHistory(state);
    },

    reorderLayers: (state, action: PayloadAction<string[]>) => {
      const orderedLayers = action.payload.map(layerId => 
        state.map.layers.find(layer => layer.id === layerId)
      ).filter(Boolean) as MapLayer[];
      
      state.map.layers = orderedLayers;
      addToHistory(state);
    },

    toggleLayerVisibility: (state, action: PayloadAction<{ layerId: string; visible: boolean }>) => {
      const { layerId, visible } = action.payload;
      const layer = state.map.layers.find(layer => layer.id === layerId);
      if (layer) {
        layer.visible = visible;
      }
    },

    updateLayerOpacity: (state, action: PayloadAction<{ layerId: string; opacity: number }>) => {
      const { layerId, opacity } = action.payload;
      const layer = state.map.layers.find(layer => layer.id === layerId);
      if (layer) {
        layer.opacity = Math.max(0, Math.min(1, opacity));
      }
    },

    // Feature Management Actions
    addFeature: (state, action: PayloadAction<{ layerId: string; feature: Omit<MapFeature, 'id' | 'created' | 'modified'> }>) => {
      const { layerId, feature } = action.payload;
      const layer = state.map.layers.find(layer => layer.id === layerId);
      if (layer) {
        const newFeature: MapFeature = {
          ...feature,
          id: generateId(),
          created: new Date(),
          modified: new Date()
        };
        layer.features.push(newFeature);
        layer.metadata.featureCount = layer.features.length;
        addToHistory(state);
      }
    },

    updateFeature: (state, action: PayloadAction<{ featureId: string; updates: Partial<MapFeature> }>) => {
      const { featureId, updates } = action.payload;
      
      for (const layer of state.map.layers) {
        const featureIndex = layer.features.findIndex(feature => feature.id === featureId);
        if (featureIndex !== -1) {
          layer.features[featureIndex] = {
            ...layer.features[featureIndex],
            ...updates,
            modified: new Date()
          };
          addToHistory(state);
          break;
        }
      }
    },

    deleteFeature: (state, action: PayloadAction<string>) => {
      const featureId = action.payload;
      
      for (const layer of state.map.layers) {
        const initialLength = layer.features.length;
        layer.features = layer.features.filter(feature => feature.id !== featureId);
        if (layer.features.length !== initialLength) {
          layer.metadata.featureCount = layer.features.length;
          break;
        }
      }
      
      state.map.selectedFeatures = state.map.selectedFeatures.filter(id => id !== featureId);
      addToHistory(state);
    },

    deleteSelectedFeatures: (state) => {
      for (const layer of state.map.layers) {
        layer.features = layer.features.filter(feature => 
          !state.map.selectedFeatures.includes(feature.id)
        );
        layer.metadata.featureCount = layer.features.length;
      }
      state.map.selectedFeatures = [];
      addToHistory(state);
    },

    // Selection Actions
    selectFeature: (state, action: PayloadAction<string>) => {
      const featureId = action.payload;
      if (!state.map.selectedFeatures.includes(featureId)) {
        state.map.selectedFeatures.push(featureId);
      }
    },

    deselectFeature: (state, action: PayloadAction<string>) => {
      const featureId = action.payload;
      state.map.selectedFeatures = state.map.selectedFeatures.filter(id => id !== featureId);
    },

    selectMultipleFeatures: (state, action: PayloadAction<string[]>) => {
      state.map.selectedFeatures = [...new Set([...state.map.selectedFeatures, ...action.payload])];
    },

    clearSelection: (state) => {
      state.map.selectedFeatures = [];
    },

    selectAllFeatures: (state) => {
      const allFeatureIds = state.map.layers.flatMap(layer => 
        layer.features.map(feature => feature.id)
      );
      state.map.selectedFeatures = allFeatureIds;
    },

    // Drawing Actions
    setDrawingMode: (state, action: PayloadAction<DrawingMode>) => {
      console.log('[Redux] setDrawingMode called with:', action.payload);
      state.map.drawingMode = action.payload;
      console.log('[Redux] drawingMode set to:', state.map.drawingMode);
      // Clear selection when entering drawing mode
      if (action.payload) {
        state.map.selectedFeatures = [];
      }
    },

    updateDrawingOptions: (state, action: PayloadAction<Partial<DrawingOptions>>) => {
      console.log('[Redux] updateDrawingOptions called with:', action.payload);
      console.log('[Redux] Current drawingOptions before update:', state.map.drawingOptions);
      state.map.drawingOptions = { ...state.map.drawingOptions, ...action.payload };
      console.log('[Redux] New drawingOptions after update:', state.map.drawingOptions);
    },

    // Export Actions
    updateExportConfig: (state, action: PayloadAction<Partial<ExportConfig>>) => {
      state.map.exportConfig = { ...state.map.exportConfig, ...action.payload };
    },

    // Clipboard Actions
    copySelectedFeatures: (state) => {
      const selectedFeatures = state.map.layers.flatMap(layer => 
        layer.features.filter(feature => state.map.selectedFeatures.includes(feature.id))
      );
      state.clipboard = selectedFeatures;
    },

    pasteFeatures: (state, action: PayloadAction<{ layerId: string; offset?: { x: number; y: number } }>) => {
      const { layerId, offset = { x: 0.001, y: 0.001 } } = action.payload;
      const layer = state.map.layers.find(layer => layer.id === layerId);
      
      if (layer && state.clipboard.length > 0) {
        const pastedFeatures = state.clipboard.map(feature => ({
          ...feature,
          id: generateId(),
          created: new Date(),
          modified: new Date(),
          layerId,
          // Apply offset to coordinates
          coordinates: offsetCoordinates(feature.coordinates, offset)
        }));
        
        layer.features.push(...pastedFeatures);
        layer.metadata.featureCount = layer.features.length;
        addToHistory(state);
      }
    },

    // History Actions
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.map = state.history[state.historyIndex];
      }
    },

    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.map = state.history[state.historyIndex];
      }
    },

    // UI Actions
    toggleSidebar: (state) => {
      state.ui.sidebarOpen = !state.ui.sidebarOpen;
    },

    setActivePanel: (state, action: PayloadAction<FireMapProUIState['activePanel']>) => {
      state.ui.activePanel = action.payload;
      if (action.payload && !state.ui.sidebarOpen) {
        state.ui.sidebarOpen = true;
      }
    },

    toggleFullscreen: (state) => {
      state.ui.fullscreen = !state.ui.fullscreen;
    },

    dismissWelcome: (state) => {
      state.ui.showWelcome = false;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.ui.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.ui.error = action.payload;
    },

    // Bulk Actions
    loadMapState: (state, action: PayloadAction<MapState>) => {
      state.map = action.payload;
      state.history = [action.payload];
      state.historyIndex = 0;
      state.ui.isLoading = false;
      state.ui.error = null;
    },

    resetMap: (state) => {
      state.map = initialMapState;
      state.history = [initialMapState];
      state.historyIndex = 0;
      state.clipboard = [];
      state.ui.error = null;
    },

    clearMap: (state) => {
      state.map.layers = [];
      state.map.selectedFeatures = [];
      state.clipboard = [];
      addToHistory(state);
    },

    // Load default fire/EMS data
    loadDefaultData: (state) => {
      // This will be handled by the component via dispatch
      // We can't import here due to browser environment limitations
      state.ui.isLoading = false;
      addToHistory(state);
    },

    // Import incident data from Data Formatter
    importIncidentData: (state, action: PayloadAction<{ layer: MapLayer; features: MapFeature[] }>) => {
      const { layer, features } = action.payload;
      
      // Remove any existing imported incident layer
      state.map.layers = state.map.layers.filter(l => l.id !== 'imported-incidents');
      
      // Add the new incident layer
      state.map.layers.push(layer);
      
      // Calculate bounds if we have features and center the map
      if (features.length > 0) {
        const coords = features
          .filter(f => f.type === 'marker')
          .map(f => f.coordinates as [number, number]);
          
        if (coords.length > 0) {
          const lats = coords.map(c => c[1]);
          const lngs = coords.map(c => c[0]);
          
          const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
          const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
          
          // Update map view to center on incidents
          state.map.view.center = { latitude: centerLat, longitude: centerLng };
          
          // Calculate appropriate zoom level based on feature spread
          const latRange = Math.max(...lats) - Math.min(...lats);
          const lngRange = Math.max(...lngs) - Math.min(...lngs);
          const maxRange = Math.max(latRange, lngRange);
          
          let zoom = 10; // Default zoom
          if (maxRange > 10) zoom = 5;
          else if (maxRange > 5) zoom = 6;
          else if (maxRange > 2) zoom = 7;
          else if (maxRange > 1) zoom = 8;
          else if (maxRange > 0.5) zoom = 9;
          else if (maxRange > 0.1) zoom = 10;
          else zoom = 12;
          
          state.map.view.zoom = zoom;
        }
      }
      
      state.ui.isLoading = false;
      state.ui.error = null;
      addToHistory(state);
    },

    // Export Modal Actions
    openExportModal: (state) => {
      state.export.open = true;
      // Set default title from current map or department
      if (!state.export.configuration.basic.title) {
        state.export.configuration.basic.title = 'Fire Department Map';
      }
    },

    closeExportModal: (state) => {
      state.export.open = false;
      // Keep configuration for next time but reset process state
      state.export.process = defaultExportProcess;
    },

    setExportTab: (state, action: PayloadAction<ExportTab>) => {
      state.export.activeTab = action.payload;
      state.export.configuration.activeTab = action.payload;
    },

    updateBasicExportSettings: (state, action: PayloadAction<Partial<BasicExportSettings>>) => {
      state.export.configuration.basic = {
        ...state.export.configuration.basic,
        ...action.payload
      };
    },

    updateAdvancedExportSettings: (state, action: PayloadAction<Partial<AdvancedExportSettings>>) => {
      state.export.configuration.advanced = {
        ...state.export.configuration.advanced,
        ...action.payload
      };
    },

    updateLayoutSettings: (state, action: PayloadAction<Partial<LayoutDesignerSettings>>) => {
      state.export.configuration.layout = {
        ...state.export.configuration.layout,
        ...action.payload
      };
    },

    setExportProcess: (state, action: PayloadAction<Partial<ExportProcessState>>) => {
      state.export.process = {
        ...state.export.process,
        ...action.payload
      };
    },

    resetExportConfiguration: (state) => {
      state.export.configuration = defaultExportConfiguration;
      state.export.process = defaultExportProcess;
    },

    // Layout Designer Actions
    addLayoutElement: (state, action: PayloadAction<Omit<LayoutElement, 'id'>>) => {
      const newElement: LayoutElement = {
        ...action.payload,
        id: generateId()
      };
      state.export.configuration.layout.elements.push(newElement);
      state.export.configuration.layout.selectedElementId = newElement.id;
      // Enable custom layout when user adds elements manually
      state.export.configuration.layout.customLayout = true;
    },

    updateLayoutElement: (state, action: PayloadAction<{ id: string; updates: Partial<LayoutElement> }>) => {
      const { id, updates } = action.payload;
      const element = state.export.configuration.layout.elements.find(el => el.id === id);
      if (element) {
        Object.assign(element, updates);
      }
    },

    removeLayoutElement: (state, action: PayloadAction<string>) => {
      const elementId = action.payload;
      state.export.configuration.layout.elements = state.export.configuration.layout.elements.filter(
        el => el.id !== elementId
      );
      // Clear selection if the removed element was selected
      if (state.export.configuration.layout.selectedElementId === elementId) {
        state.export.configuration.layout.selectedElementId = null;
      }
    },

    selectLayoutElement: (state, action: PayloadAction<string | null>) => {
      state.export.configuration.layout.selectedElementId = action.payload;
    },

    duplicateLayoutElement: (state, action: PayloadAction<string>) => {
      const elementId = action.payload;
      const element = state.export.configuration.layout.elements.find(el => el.id === elementId);
      if (element) {
        const duplicatedElement: LayoutElement = {
          ...element,
          id: generateId(),
          x: element.x + 5, // Offset by 5% to avoid overlap
          y: element.y + 5
        };
        state.export.configuration.layout.elements.push(duplicatedElement);
        state.export.configuration.layout.selectedElementId = duplicatedElement.id;
      }
    },

    moveLayoutElement: (state, action: PayloadAction<{ id: string; deltaX: number; deltaY: number }>) => {
      const { id, deltaX, deltaY } = action.payload;
      const element = state.export.configuration.layout.elements.find(el => el.id === id);
      if (element) {
        element.x = Math.max(0, Math.min(100, element.x + deltaX));
        element.y = Math.max(0, Math.min(100, element.y + deltaY));
      }
    },

    resizeLayoutElement: (state, action: PayloadAction<{ id: string; width: number; height: number }>) => {
      const { id, width, height } = action.payload;
      const element = state.export.configuration.layout.elements.find(el => el.id === id);
      if (element) {
        element.width = Math.max(1, Math.min(100, width));
        element.height = Math.max(1, Math.min(100, height));
      }
    },

    clearLayoutElements: (state) => {
      state.export.configuration.layout.elements = [];
      state.export.configuration.layout.selectedElementId = null;
    },

    applyLayoutTemplate: (state, action: PayloadAction<LayoutTemplate>) => {
      const template = action.payload;
      state.export.configuration.layout.selectedTemplate = template;
      state.export.configuration.layout.customLayout = true;
      
      // Clear existing elements
      state.export.configuration.layout.elements = [];
      state.export.configuration.layout.selectedElementId = null;

      // Apply template-specific elements
      let templateElements: Omit<LayoutElement, 'id'>[] = [];
      
      switch (template) {
        case 'standard':
          templateElements = [
            { type: 'map', x: 5, y: 15, width: 90, height: 65, zIndex: 1, visible: true },
            { type: 'title', x: 5, y: 5, width: 90, height: 8, zIndex: 2, visible: true, content: { text: state.export.configuration.basic.title || 'Map Title', fontSize: 18, textAlign: 'center' } },
            { type: 'subtitle', x: 5, y: 12, width: 90, height: 4, zIndex: 3, visible: true, content: { text: state.export.configuration.basic.subtitle || 'Map Subtitle', fontSize: 14, textAlign: 'center' } },
            { type: 'legend', x: 5, y: 82, width: 45, height: 15, zIndex: 4, visible: true },
            { type: 'scale-bar', x: 60, y: 85, width: 25, height: 5, zIndex: 5, visible: true },
            { type: 'north-arrow', x: 85, y: 85, width: 8, height: 10, zIndex: 6, visible: true }
          ];
          break;
        case 'professional':
          templateElements = [
            { type: 'map', x: 5, y: 15, width: 65, height: 70, zIndex: 1, visible: true },
            { type: 'title', x: 5, y: 5, width: 90, height: 8, zIndex: 2, visible: true, content: { text: state.export.configuration.basic.title || 'Professional Map', fontSize: 18, textAlign: 'center' } },
            { type: 'subtitle', x: 5, y: 12, width: 90, height: 4, zIndex: 3, visible: true, content: { text: state.export.configuration.basic.subtitle || 'Department Map', fontSize: 14, textAlign: 'center' } },
            { type: 'legend', x: 72, y: 15, width: 23, height: 40, zIndex: 4, visible: true },
            { type: 'scale-bar', x: 72, y: 60, width: 23, height: 5, zIndex: 5, visible: true },
            { type: 'north-arrow', x: 85, y: 70, width: 10, height: 12, zIndex: 6, visible: true }
          ];
          break;
        case 'presentation':
          templateElements = [
            { type: 'title', x: 10, y: 5, width: 80, height: 12, zIndex: 2, visible: true, content: { text: state.export.configuration.basic.title || 'Presentation Title', fontSize: 24, textAlign: 'center' } },
            { type: 'map', x: 10, y: 20, width: 80, height: 60, zIndex: 1, visible: true },
            { type: 'legend', x: 10, y: 82, width: 35, height: 15, zIndex: 3, visible: true },
            { type: 'north-arrow', x: 75, y: 85, width: 10, height: 12, zIndex: 5, visible: true }
          ];
          break;
        case 'tactical':
          templateElements = [
            { type: 'map', x: 2, y: 2, width: 96, height: 86, zIndex: 1, visible: true },
            { type: 'scale-bar', x: 5, y: 90, width: 20, height: 4, zIndex: 4, visible: true },
            { type: 'north-arrow', x: 85, y: 88, width: 8, height: 10, zIndex: 5, visible: true }
          ];
          break;
      }

      // Add elements with generated IDs
      templateElements.forEach(elementData => {
        const element: LayoutElement = {
          ...elementData,
          id: generateId()
        };
        state.export.configuration.layout.elements.push(element);
      });
    }
  }
});

// Helper Functions
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function addToHistory(state: FireMapProState): void {
  // Remove any future history if we're not at the end
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }
  
  // Add new state to history
  state.history.push(JSON.parse(JSON.stringify(state.map)));
  state.historyIndex = state.history.length - 1;
  
  // Limit history to 50 states
  if (state.history.length > 50) {
    state.history = state.history.slice(-50);
    state.historyIndex = state.history.length - 1;
  }
}

function offsetCoordinates(coordinates: number[] | number[][] | number[][][], offset: { x: number; y: number }): number[] | number[][] | number[][][] {
  if (typeof coordinates[0] === 'number') {
    // Point coordinates [lng, lat]
    return [(coordinates as number[])[0] + offset.x, (coordinates as number[])[1] + offset.y];
  } else if (Array.isArray(coordinates[0]) && typeof (coordinates[0] as number[])[0] === 'number') {
    // LineString or Polygon outer ring coordinates [[lng, lat], [lng, lat], ...]
    return (coordinates as number[][]).map(coord => [coord[0] + offset.x, coord[1] + offset.y]);
  } else {
    // MultiPolygon or Polygon with holes coordinates [[[lng, lat], [lng, lat], ...], ...]
    return (coordinates as number[][][]).map(ring => 
      ring.map(coord => [coord[0] + offset.x, coord[1] + offset.y])
    );
  }
}

// Selectors
export const selectMapState = (state: { fireMapPro: FireMapProState }) => state.fireMapPro.map;
export const selectUIState = (state: { fireMapPro: FireMapProState }) => state.fireMapPro.ui;
export const selectExportState = (state: { fireMapPro: FireMapProState }) => state.fireMapPro.export;
export const selectLayers = (state: { fireMapPro: FireMapProState }) => state.fireMapPro.map.layers;
export const selectSelectedFeatures = (state: { fireMapPro: FireMapProState }) => state.fireMapPro.map.selectedFeatures;
export const selectDrawingState = createSelector(
  (state: { fireMapPro: FireMapProState }) => state.fireMapPro.map.drawingMode,
  (state: { fireMapPro: FireMapProState }) => state.fireMapPro.map.drawingOptions,
  (mode, options) => {
    console.log('[Redux] selectDrawingState memoized result:', { mode, options });
    return { mode, options };
  }
);
export const selectCanUndo = (state: { fireMapPro: FireMapProState }) => state.fireMapPro.historyIndex > 0;
export const selectCanRedo = (state: { fireMapPro: FireMapProState }) => state.fireMapPro.historyIndex < state.fireMapPro.history.length - 1;
export const selectClipboard = (state: { fireMapPro: FireMapProState }) => state.fireMapPro.clipboard;

export const {
  updateMapView,
  setActiveBaseMap,
  updateMapSettings,
  addLayer,
  updateLayer,
  deleteLayer,
  reorderLayers,
  toggleLayerVisibility,
  updateLayerOpacity,
  addFeature,
  updateFeature,
  deleteFeature,
  deleteSelectedFeatures,
  selectFeature,
  deselectFeature,
  selectMultipleFeatures,
  clearSelection,
  selectAllFeatures,
  setDrawingMode,
  updateDrawingOptions,
  updateExportConfig,
  copySelectedFeatures,
  pasteFeatures,
  undo,
  redo,
  toggleSidebar,
  setActivePanel,
  toggleFullscreen,
  dismissWelcome,
  setLoading,
  setError,
  loadMapState,
  resetMap,
  clearMap,
  loadDefaultData,
  importIncidentData,
  openExportModal,
  closeExportModal,
  setExportTab,
  updateBasicExportSettings,
  updateAdvancedExportSettings,
  updateLayoutSettings,
  setExportProcess,
  resetExportConfiguration,
  addLayoutElement,
  updateLayoutElement,
  removeLayoutElement,
  selectLayoutElement,
  duplicateLayoutElement,
  moveLayoutElement,
  resizeLayoutElement,
  clearLayoutElements,
  applyLayoutTemplate
} = fireMapProSlice.actions;

export default fireMapProSlice.reducer;