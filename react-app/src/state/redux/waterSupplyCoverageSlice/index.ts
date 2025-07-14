/**
 * Water Supply Coverage Analysis Redux Slice
 * 
 * Manages state for the Water Supply Coverage Analysis tool including
 * tanks, hydrants, coverage analysis, and UI state. Built on the Tank Zone
 * Coverage foundation with expanded multi-supply functionality.
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { 
  WaterTank,
  FireHydrant,
  WaterSupply,
  WaterSupplyType,
  WaterSupplyCoverageZone, 
  CoverageAnalysis, 
  WaterSupplyCoverageUIState,
  AnalysisParameters,
  CoverageGap,
  CoverageRecommendation,
  WaterSupplySidebarTab,
  WaterSupplyFilterCriteria,
  ExecutiveSummary,
  getSupplyLocation,
  getSupplyName,
  getSupplyStatus
} from '../../../types/tankZoneCoverage';

// Default analysis parameters optimized for mixed water supply systems
const defaultAnalysisParameters: AnalysisParameters = {
  maxEffectiveDistance: 1500, // 1500ft max hose deployment
  minimumFlowRate: 250, // 250 GPM minimum for structure fires
  terrainFactor: true, // Consider elevation changes
  roadAccessOnly: false, // Allow cross-country access
  seasonalFactors: true, // Consider weather constraints
  responseTimeWeight: 0.4, // 40% weight on quick access
  capacityWeight: 0.3, // 30% weight on supply capacity
  accessWeight: 0.3 // 30% weight on access quality
};

const defaultFilterCriteria: WaterSupplyFilterCriteria = {
  // Supply type visibility
  showTanks: true,
  showHydrants: true,
  
  // Tank filters
  tankTypes: ['municipal', 'private', 'emergency'],
  accessRating: ['excellent', 'good', 'fair'],
  capacityRange: [0, 1000000], // 0 to 1M gallons
  
  // Hydrant filters  
  hydrantTypes: ['municipal', 'industrial', 'cistern', 'dry', 'private'],
  flowRateRange: [0, 5000], // 0 to 5000 GPM
  pressureRange: [0, 150], // 0 to 150 PSI
  
  // Common filters
  operationalStatus: ['active', 'inactive', 'maintenance', 'seasonal', 'unknown'],
  showInactive: true
};

const initialUIState: WaterSupplyCoverageUIState = {
  selectedSupplies: [],
  selectedTanks: [], // Legacy support
  selectedHydrants: [],
  highlightedGaps: [],
  analysisInProgress: false,
  showCoverageZones: true,
  showGapAreas: true,
  showRedundancyAreas: false,
  showTanks: true,
  showHydrants: true,
  activeAnalysis: undefined,
  sidebarTab: 'supplies',
  filterCriteria: defaultFilterCriteria
};

interface WaterSupplyCoverageState {
  tanks: WaterTank[];
  hydrants: FireHydrant[];
  coverageZones: WaterSupplyCoverageZone[];
  activeAnalysis?: CoverageAnalysis;
  analysisParameters: AnalysisParameters;
  ui: WaterSupplyCoverageUIState;
  isLoading: boolean;
  error?: string;
}

const initialState: WaterSupplyCoverageState = {
  tanks: [],
  hydrants: [],
  coverageZones: [],
  activeAnalysis: undefined,
  analysisParameters: defaultAnalysisParameters,
  ui: initialUIState,
  isLoading: false,
  error: undefined
};

const waterSupplyCoverageSlice = createSlice({
  name: 'waterSupplyCoverage',
  initialState,
  reducers: {
    // Tank management actions
    addTank: (state, action: PayloadAction<Omit<WaterTank, 'id' | 'created' | 'modified'>>) => {
      const newTank: WaterTank = {
        ...action.payload,
        id: `tank-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created: new Date(),
        modified: new Date()
      };
      state.tanks.push(newTank);
      
      console.log('🎯 Tank added to state:', newTank.name);
    },

    updateTank: (state, action: PayloadAction<WaterTank>) => {
      const index = state.tanks.findIndex(tank => tank.id === action.payload.id);
      if (index !== -1) {
        state.tanks[index] = { ...action.payload, modified: new Date() };
        console.log('💾 Tank updated in state:', action.payload.name);
      }
    },

    deleteTank: (state, action: PayloadAction<string>) => {
      state.tanks = state.tanks.filter(tank => tank.id !== action.payload);
      state.ui.selectedTanks = state.ui.selectedTanks.filter(id => id !== action.payload);
      state.ui.selectedSupplies = state.ui.selectedSupplies.filter(id => id !== action.payload);
      console.log('🗑️ Tank deleted from state:', action.payload);
    },

    // Hydrant management actions
    addHydrant: (state, action: PayloadAction<Omit<FireHydrant, 'id' | 'created' | 'modified'>>) => {
      const newHydrant: FireHydrant = {
        ...action.payload,
        id: `hydrant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created: new Date(),
        modified: new Date()
      };
      state.hydrants.push(newHydrant);
      
      console.log('🚰 Hydrant added to state:', newHydrant.name);
    },

    updateHydrant: (state, action: PayloadAction<FireHydrant>) => {
      const index = state.hydrants.findIndex(hydrant => hydrant.id === action.payload.id);
      if (index !== -1) {
        state.hydrants[index] = { ...action.payload, modified: new Date() };
        console.log('💾 Hydrant updated in state:', action.payload.name);
      }
    },

    deleteHydrant: (state, action: PayloadAction<string>) => {
      state.hydrants = state.hydrants.filter(hydrant => hydrant.id !== action.payload);
      state.ui.selectedHydrants = state.ui.selectedHydrants.filter(id => id !== action.payload);
      state.ui.selectedSupplies = state.ui.selectedSupplies.filter(id => id !== action.payload);
      console.log('🗑️ Hydrant deleted from state:', action.payload);
    },

    // Selection management
    selectSupply: (state, action: PayloadAction<string>) => {
      const supplyId = action.payload;
      if (!state.ui.selectedSupplies.includes(supplyId)) {
        state.ui.selectedSupplies.push(supplyId);
        
        // Update legacy arrays for backwards compatibility
        const isTank = state.tanks.some(tank => tank.id === supplyId);
        const isHydrant = state.hydrants.some(hydrant => hydrant.id === supplyId);
        
        if (isTank && !state.ui.selectedTanks.includes(supplyId)) {
          state.ui.selectedTanks.push(supplyId);
        }
        if (isHydrant && !state.ui.selectedHydrants.includes(supplyId)) {
          state.ui.selectedHydrants.push(supplyId);
        }
      }
    },

    deselectSupply: (state, action: PayloadAction<string>) => {
      const supplyId = action.payload;
      state.ui.selectedSupplies = state.ui.selectedSupplies.filter(id => id !== supplyId);
      state.ui.selectedTanks = state.ui.selectedTanks.filter(id => id !== supplyId);
      state.ui.selectedHydrants = state.ui.selectedHydrants.filter(id => id !== supplyId);
    },

    // Legacy tank selection support
    selectTank: (state, action: PayloadAction<string>) => {
      waterSupplyCoverageSlice.caseReducers.selectSupply(state, action);
    },

    deselectTank: (state, action: PayloadAction<string>) => {
      waterSupplyCoverageSlice.caseReducers.deselectSupply(state, action);
    },

    // Hydrant selection support
    selectHydrant: (state, action: PayloadAction<string>) => {
      waterSupplyCoverageSlice.caseReducers.selectSupply(state, action);
    },

    deselectHydrant: (state, action: PayloadAction<string>) => {
      waterSupplyCoverageSlice.caseReducers.deselectSupply(state, action);
    },

    // Coverage zone management
    setCoverageZones: (state, action: PayloadAction<WaterSupplyCoverageZone[]>) => {
      state.coverageZones = action.payload;
    },

    addCoverageZone: (state, action: PayloadAction<WaterSupplyCoverageZone>) => {
      const existingIndex = state.coverageZones.findIndex(zone => zone.supplyId === action.payload.supplyId);
      if (existingIndex !== -1) {
        state.coverageZones[existingIndex] = action.payload;
      } else {
        state.coverageZones.push(action.payload);
      }
    },

    // Analysis management
    startAnalysis: (state) => {
      state.ui.analysisInProgress = true;
      state.isLoading = true;
      state.error = undefined;
      console.log('🔬 Starting water supply coverage analysis...');
    },

    completeAnalysis: (state, action: PayloadAction<CoverageAnalysis>) => {
      state.activeAnalysis = action.payload;
      state.ui.analysisInProgress = false;
      state.ui.activeAnalysis = action.payload;
      state.isLoading = false;
      console.log('✅ Water supply coverage analysis complete');
    },

    clearAnalysis: (state) => {
      state.activeAnalysis = undefined;
      state.ui.activeAnalysis = undefined;
      state.coverageZones = [];
    },

    // UI state management
    setSidebarTab: (state, action: PayloadAction<WaterSupplySidebarTab>) => {
      state.ui.sidebarTab = action.payload;
    },

    updateFilterCriteria: (state, action: PayloadAction<Partial<WaterSupplyFilterCriteria>>) => {
      state.ui.filterCriteria = { ...state.ui.filterCriteria, ...action.payload };
    },

    updateAnalysisParameters: (state, action: PayloadAction<Partial<AnalysisParameters>>) => {
      state.analysisParameters = { ...state.analysisParameters, ...action.payload };
    },

    // Visibility toggles
    toggleCoverageZones: (state) => {
      state.ui.showCoverageZones = !state.ui.showCoverageZones;
    },

    toggleGapAreas: (state) => {
      state.ui.showGapAreas = !state.ui.showGapAreas;
    },

    toggleRedundancyAreas: (state) => {
      state.ui.showRedundancyAreas = !state.ui.showRedundancyAreas;
    },

    toggleTankVisibility: (state) => {
      state.ui.showTanks = !state.ui.showTanks;
      state.ui.filterCriteria.showTanks = state.ui.showTanks;
    },

    toggleHydrantVisibility: (state) => {
      state.ui.showHydrants = !state.ui.showHydrants;
      state.ui.filterCriteria.showHydrants = state.ui.showHydrants;
    },

    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = undefined;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

// Export actions
export const {
  addTank,
  updateTank,
  deleteTank,
  addHydrant,
  updateHydrant,
  deleteHydrant,
  selectSupply,
  deselectSupply,
  selectTank,
  deselectTank,
  selectHydrant,
  deselectHydrant,
  setCoverageZones,
  addCoverageZone,
  startAnalysis,
  completeAnalysis,
  clearAnalysis,
  setSidebarTab,
  updateFilterCriteria,
  updateAnalysisParameters,
  toggleCoverageZones,
  toggleGapAreas,
  toggleRedundancyAreas,
  toggleTankVisibility,
  toggleHydrantVisibility,
  setError,
  clearError,
  setLoading
} = waterSupplyCoverageSlice.actions;

// Selectors
export const selectTanks = (state: { waterSupplyCoverage: WaterSupplyCoverageState }) => 
  state.waterSupplyCoverage.tanks;

export const selectHydrants = (state: { waterSupplyCoverage: WaterSupplyCoverageState }) => 
  state.waterSupplyCoverage.hydrants;

export const selectAllSupplies = createSelector(
  [selectTanks, selectHydrants],
  (tanks, hydrants): WaterSupply[] => {
    const tankSupplies: WaterSupply[] = tanks.map(tank => ({
      id: tank.id,
      type: 'tank' as WaterSupplyType,
      tank
    }));
    
    const hydrantSupplies: WaterSupply[] = hydrants.map(hydrant => ({
      id: hydrant.id,
      type: 'hydrant' as WaterSupplyType,
      hydrant
    }));
    
    return [...tankSupplies, ...hydrantSupplies];
  }
);

export const selectFilteredTanks = createSelector(
  [selectTanks, (state: { waterSupplyCoverage: WaterSupplyCoverageState }) => state.waterSupplyCoverage.ui.filterCriteria],
  (tanks, criteria) => {
    if (!criteria.showTanks) return [];
    
    return tanks.filter(tank => {
      // Filter by tank type
      if (criteria.tankTypes.length > 0 && !criteria.tankTypes.includes(tank.type)) {
        return false;
      }
      
      // Filter by operational status
      if (criteria.operationalStatus.length > 0 && !criteria.operationalStatus.includes(tank.operationalStatus)) {
        return false;
      }
      
      // Filter by access rating
      if (criteria.accessRating.length > 0 && !criteria.accessRating.includes(tank.accessRating)) {
        return false;
      }
      
      // Filter by capacity range
      if (tank.capacity < criteria.capacityRange[0] || tank.capacity > criteria.capacityRange[1]) {
        return false;
      }
      
      // Filter inactive if not showing them
      if (!criteria.showInactive && tank.operationalStatus !== 'active') {
        return false;
      }
      
      return true;
    });
  }
);

export const selectFilteredHydrants = createSelector(
  [selectHydrants, (state: { waterSupplyCoverage: WaterSupplyCoverageState }) => state.waterSupplyCoverage.ui.filterCriteria],
  (hydrants, criteria) => {
    console.log('🔍 selectFilteredHydrants - Debug info:', {
      hydrantsCount: hydrants.length,
      showHydrants: criteria.showHydrants,
      criteria: criteria
    });
    
    if (!criteria.showHydrants) {
      console.log('🚨 Hydrants filtered out by showHydrants=false');
      return [];
    }
    
    return hydrants.filter(hydrant => {
      // Filter by hydrant type
      if (criteria.hydrantTypes.length > 0 && !criteria.hydrantTypes.includes(hydrant.type)) {
        return false;
      }
      
      // Filter by operational status
      if (criteria.operationalStatus.length > 0 && !criteria.operationalStatus.includes(hydrant.operationalStatus)) {
        return false;
      }
      
      // Filter by flow rate range
      if (hydrant.flowRate < criteria.flowRateRange[0] || hydrant.flowRate > criteria.flowRateRange[1]) {
        return false;
      }
      
      // Filter by pressure range
      if (hydrant.staticPressure < criteria.pressureRange[0] || hydrant.staticPressure > criteria.pressureRange[1]) {
        return false;
      }
      
      // Filter inactive if not showing them
      if (!criteria.showInactive && hydrant.operationalStatus !== 'active') {
        return false;
      }
      
      return true;
    });
  }
);

export const selectFilteredSupplies = createSelector(
  [selectFilteredTanks, selectFilteredHydrants],
  (tanks, hydrants): WaterSupply[] => {
    const tankSupplies: WaterSupply[] = tanks.map(tank => ({
      id: tank.id,
      type: 'tank' as WaterSupplyType,
      tank
    }));
    
    const hydrantSupplies: WaterSupply[] = hydrants.map(hydrant => ({
      id: hydrant.id,
      type: 'hydrant' as WaterSupplyType,
      hydrant
    }));
    
    return [...tankSupplies, ...hydrantSupplies];
  }
);

export const selectCoverageZones = (state: { waterSupplyCoverage: WaterSupplyCoverageState }) => 
  state.waterSupplyCoverage.coverageZones;

export const selectActiveAnalysis = (state: { waterSupplyCoverage: WaterSupplyCoverageState }) => 
  state.waterSupplyCoverage.activeAnalysis;

export const selectUIState = (state: { waterSupplyCoverage: WaterSupplyCoverageState }) => 
  state.waterSupplyCoverage.ui;

export const selectAnalysisParameters = (state: { waterSupplyCoverage: WaterSupplyCoverageState }) => 
  state.waterSupplyCoverage.analysisParameters;

export const selectIsLoading = (state: { waterSupplyCoverage: WaterSupplyCoverageState }) => 
  state.waterSupplyCoverage.isLoading;

export const selectError = (state: { waterSupplyCoverage: WaterSupplyCoverageState }) => 
  state.waterSupplyCoverage.error;

export default waterSupplyCoverageSlice.reducer;