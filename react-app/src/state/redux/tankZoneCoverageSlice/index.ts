/**
 * Tank Zone Coverage Redux Slice
 * 
 * Manages state for the Tank Zone Coverage tool including tank data,
 * coverage analysis, and UI state. Built on Fire Map Pro's architecture
 * with tank-specific functionality.
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { 
  WaterTank, 
  TankCoverageZone, 
  CoverageAnalysis, 
  TankZoneCoverageUIState,
  AnalysisParameters,
  CoverageGap,
  CoverageRecommendation,
  TankSidebarTab,
  TankFilterCriteria,
  ExecutiveSummary
} from '../../types/tankZoneCoverage';

// Default analysis parameters optimized for typical rural fire departments
const defaultAnalysisParameters: AnalysisParameters = {
  maxEffectiveDistance: 1500, // 1500ft max hose deployment
  minimumFlowRate: 250, // 250 GPM minimum for structure fires
  terrainFactor: true, // Consider elevation changes
  roadAccessOnly: false, // Allow cross-country access
  seasonalFactors: true, // Consider weather constraints
  responseTimeWeight: 0.4, // 40% weight on quick access
  capacityWeight: 0.3, // 30% weight on tank capacity
  accessWeight: 0.3 // 30% weight on access quality
};

const defaultFilterCriteria: TankFilterCriteria = {
  tankTypes: ['municipal', 'private', 'emergency'],
  operationalStatus: ['active'],
  accessRating: ['excellent', 'good', 'fair'],
  capacityRange: [0, 1000000], // 0 to 1M gallons
  showInactive: false
};

const initialUIState: TankZoneCoverageUIState = {
  selectedTanks: [],
  highlightedGaps: [],
  analysisInProgress: false,
  showCoverageZones: true,
  showGapAreas: true,
  showRedundancyAreas: false,
  activeAnalysis: undefined,
  sidebarTab: 'tanks',
  filterCriteria: defaultFilterCriteria
};

interface TankZoneCoverageState {
  tanks: WaterTank[];
  coverageZones: TankCoverageZone[];
  activeAnalysis?: CoverageAnalysis;
  analysisHistory: CoverageAnalysis[];
  analysisParameters: AnalysisParameters;
  ui: TankZoneCoverageUIState;
  executiveSummary?: ExecutiveSummary;
  isLoading: boolean;
  error: string | null;
}

const initialState: TankZoneCoverageState = {
  tanks: [],
  coverageZones: [],
  activeAnalysis: undefined,
  analysisHistory: [],
  analysisParameters: defaultAnalysisParameters,
  ui: initialUIState,
  executiveSummary: undefined,
  isLoading: false,
  error: null
};

const tankZoneCoverageSlice = createSlice({
  name: 'tankZoneCoverage',
  initialState,
  reducers: {
    // Tank Management Actions
    addTank: (state, action: PayloadAction<Omit<WaterTank, 'id' | 'created' | 'modified'>>) => {
      const newTank: WaterTank = {
        ...action.payload,
        id: generateId(),
        created: new Date(),
        modified: new Date()
      };
      state.tanks.push(newTank);
      state.error = null;
    },

    updateTank: (state, action: PayloadAction<WaterTank>) => {
      const index = state.tanks.findIndex(tank => tank.id === action.payload.id);
      if (index !== -1) {
        state.tanks[index] = {
          ...action.payload,
          modified: new Date()
        };
      }
    },

    deleteTank: (state, action: PayloadAction<string>) => {
      const tankId = action.payload;
      state.tanks = state.tanks.filter(tank => tank.id !== tankId);
      state.ui.selectedTanks = state.ui.selectedTanks.filter(id => id !== tankId);
      // Remove any coverage zones for this tank
      state.coverageZones = state.coverageZones.filter(zone => zone.tankId !== tankId);
    },

    bulkImportTanks: (state, action: PayloadAction<Omit<WaterTank, 'id' | 'created' | 'modified'>[]>) => {
      const newTanks = action.payload.map(tankData => ({
        ...tankData,
        id: generateId(),
        created: new Date(),
        modified: new Date()
      }));
      state.tanks.push(...newTanks);
      state.error = null;
    },

    clearAllTanks: (state) => {
      state.tanks = [];
      state.coverageZones = [];
      state.activeAnalysis = undefined;
      state.ui.selectedTanks = [];
    },

    // Selection Actions
    selectTank: (state, action: PayloadAction<string>) => {
      const tankId = action.payload;
      if (!state.ui.selectedTanks.includes(tankId)) {
        state.ui.selectedTanks.push(tankId);
      }
    },

    deselectTank: (state, action: PayloadAction<string>) => {
      const tankId = action.payload;
      state.ui.selectedTanks = state.ui.selectedTanks.filter(id => id !== tankId);
    },

    selectMultipleTanks: (state, action: PayloadAction<string[]>) => {
      state.ui.selectedTanks = [...new Set([...state.ui.selectedTanks, ...action.payload])];
    },

    clearTankSelection: (state) => {
      state.ui.selectedTanks = [];
    },

    // Coverage Analysis Actions
    startAnalysis: (state) => {
      state.ui.analysisInProgress = true;
      state.error = null;
    },

    completeAnalysis: (state, action: PayloadAction<CoverageAnalysis>) => {
      state.activeAnalysis = action.payload;
      state.ui.activeAnalysis = action.payload;
      state.analysisHistory.unshift(action.payload);
      // Keep only last 10 analyses
      if (state.analysisHistory.length > 10) {
        state.analysisHistory = state.analysisHistory.slice(0, 10);
      }
      state.ui.analysisInProgress = false;
      state.error = null;
    },

    updateCoverageZones: (state, action: PayloadAction<TankCoverageZone[]>) => {
      state.coverageZones = action.payload;
    },

    updateAnalysisParameters: (state, action: PayloadAction<Partial<AnalysisParameters>>) => {
      state.analysisParameters = { ...state.analysisParameters, ...action.payload };
    },

    generateExecutiveSummary: (state, action: PayloadAction<ExecutiveSummary>) => {
      state.executiveSummary = action.payload;
    },

    // UI State Actions
    setSidebarTab: (state, action: PayloadAction<TankSidebarTab>) => {
      state.ui.sidebarTab = action.payload;
    },

    updateFilterCriteria: (state, action: PayloadAction<Partial<TankFilterCriteria>>) => {
      state.ui.filterCriteria = { ...state.ui.filterCriteria, ...action.payload };
    },

    toggleCoverageZones: (state) => {
      state.ui.showCoverageZones = !state.ui.showCoverageZones;
    },

    toggleGapAreas: (state) => {
      state.ui.showGapAreas = !state.ui.showGapAreas;
    },

    toggleRedundancyAreas: (state) => {
      state.ui.showRedundancyAreas = !state.ui.showRedundancyAreas;
    },

    highlightGaps: (state, action: PayloadAction<string[]>) => {
      state.ui.highlightedGaps = action.payload;
    },

    clearHighlightedGaps: (state) => {
      state.ui.highlightedGaps = [];
    },

    // Error Handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.ui.analysisInProgress = false;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Bulk Operations
    resetToDefaults: (state) => {
      return { ...initialState, tanks: state.tanks }; // Keep tanks but reset everything else
    },

    loadPresetConfiguration: (state, action: PayloadAction<{
      tanks: WaterTank[];
      parameters: AnalysisParameters;
    }>) => {
      state.tanks = action.payload.tanks;
      state.analysisParameters = action.payload.parameters;
      state.activeAnalysis = undefined;
      state.coverageZones = [];
      state.ui = { ...initialUIState };
      state.error = null;
    }
  }
});

// Helper Functions
function generateId(): string {
  return `tank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Selectors
export const selectTanks = (state: { tankZoneCoverage: TankZoneCoverageState }) => 
  state.tankZoneCoverage.tanks;

export const selectFilteredTanks = createSelector(
  [selectTanks, (state: { tankZoneCoverage: TankZoneCoverageState }) => state.tankZoneCoverage.ui.filterCriteria],
  (tanks, criteria) => {
    return tanks.filter(tank => {
      // Filter by tank type
      if (!criteria.tankTypes.includes(tank.type)) return false;
      
      // Filter by operational status
      if (!criteria.operationalStatus.includes(tank.operationalStatus)) return false;
      
      // Filter by access rating
      if (!criteria.accessRating.includes(tank.accessRating)) return false;
      
      // Filter by capacity range
      if (tank.capacity < criteria.capacityRange[0] || tank.capacity > criteria.capacityRange[1]) {
        return false;
      }
      
      // Show inactive filter
      if (!criteria.showInactive && tank.operationalStatus === 'inactive') {
        return false;
      }
      
      return true;
    });
  }
);

export const selectSelectedTanks = createSelector(
  [selectTanks, (state: { tankZoneCoverage: TankZoneCoverageState }) => state.tankZoneCoverage.ui.selectedTanks],
  (tanks, selectedIds) => tanks.filter(tank => selectedIds.includes(tank.id))
);

export const selectCoverageZones = (state: { tankZoneCoverage: TankZoneCoverageState }) => 
  state.tankZoneCoverage.coverageZones;

export const selectActiveAnalysis = (state: { tankZoneCoverage: TankZoneCoverageState }) => 
  state.tankZoneCoverage.activeAnalysis;

export const selectAnalysisParameters = (state: { tankZoneCoverage: TankZoneCoverageState }) => 
  state.tankZoneCoverage.analysisParameters;

export const selectUIState = (state: { tankZoneCoverage: TankZoneCoverageState }) => 
  state.tankZoneCoverage.ui;

export const selectExecutiveSummary = (state: { tankZoneCoverage: TankZoneCoverageState }) => 
  state.tankZoneCoverage.executiveSummary;

export const selectIsLoading = (state: { tankZoneCoverage: TankZoneCoverageState }) => 
  state.tankZoneCoverage.isLoading;

export const selectError = (state: { tankZoneCoverage: TankZoneCoverageState }) => 
  state.tankZoneCoverage.error;

// Export actions
export const {
  addTank,
  updateTank,
  deleteTank,
  bulkImportTanks,
  clearAllTanks,
  selectTank,
  deselectTank,
  selectMultipleTanks,
  clearTankSelection,
  startAnalysis,
  completeAnalysis,
  updateCoverageZones,
  updateAnalysisParameters,
  generateExecutiveSummary,
  setSidebarTab,
  updateFilterCriteria,
  toggleCoverageZones,
  toggleGapAreas,
  toggleRedundancyAreas,
  highlightGaps,
  clearHighlightedGaps,
  setError,
  setLoading,
  clearError,
  resetToDefaults,
  loadPresetConfiguration
} = tankZoneCoverageSlice.actions;

export default tankZoneCoverageSlice.reducer;