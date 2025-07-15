/**
 * Water Supply Coverage Analysis Tool Type Definitions
 * 
 * Comprehensive types for fire department water supply analysis including
 * tanks, hydrants, and mixed infrastructure coverage optimization.
 * Builds on Fire Map Pro's foundation with water supply-specific data structures.
 */

import { /* MapFeature, */ Coordinates /* , BoundingBox */ } from '../fireMapPro';

// Tank-Specific Types
export interface WaterTank {
  id: string;
  name: string;
  location: Coordinates;
  capacity: number; // Gallons
  type: TankType;
  accessRating: AccessRating;
  lastInspected?: Date;
  operationalStatus: OperationalStatus;
  owner: string;
  contactInfo?: string;
  notes?: string;
  elevation?: number; // For pressure calculations
  created: Date;
  modified: Date;
}

export type TankType = 
  | 'municipal' 
  | 'private' 
  | 'emergency' 
  | 'industrial' 
  | 'agricultural'
  | 'portable';

export type AccessRating = 
  | 'excellent' // Easy access, good road conditions
  | 'good'      // Accessible but may require coordination
  | 'fair'      // Limited access, rough terrain
  | 'poor'      // Difficult access, requires special equipment
  | 'restricted'; // Permission required, security concerns

export type OperationalStatus = 
  | 'active'
  | 'inactive' 
  | 'maintenance'
  | 'seasonal'
  | 'unknown'
  | 'a'    // Abbreviated active
  | 'i'    // Abbreviated inactive
  | 'm'    // Abbreviated maintenance
  | 's'    // Abbreviated seasonal
  | 'u'    // Abbreviated unknown
  | 'ac'   // Cincinnati Water Works active
  | 'AC';  // Cincinnati Water Works active (uppercase)

// Hydrant-Specific Types
export interface FireHydrant {
  id: string;
  name: string;
  location: Coordinates;
  flowRate: number; // GPM at 20 psi residual
  staticPressure: number; // PSI
  residualPressure: number; // PSI at rated flow
  type: HydrantType;
  size: HydrantSize;
  operationalStatus: OperationalStatus;
  lastTested?: Date;
  owner: string;
  hydrantNumber?: string;
  notes?: string;
  elevation?: number;
  contactInfo?: string;
  created: Date;
  modified: Date;
}

export type HydrantType = 
  | 'municipal'     // Connected to municipal water system
  | 'industrial'    // Private industrial system
  | 'cistern'       // Fed by underground cistern
  | 'dry'           // Dry hydrant (suction source)
  | 'private';      // Private water system

export type HydrantSize = 
  | '4-inch'        // Standard 4" steamer port
  | '5-inch'        // Large 5" steamer port  
  | '6-inch'        // Extra large 6" steamer port
  | 'dual'          // Multiple steamer ports
  | 'unknown';

// Universal Water Supply Types
export type WaterSupplyType = 'tank' | 'hydrant';

export interface WaterSupply {
  id: string;
  type: WaterSupplyType;
  tank?: WaterTank;
  hydrant?: FireHydrant;
}

// Get location from either supply type
export const getSupplyLocation = (supply: WaterSupply): Coordinates => {
  return supply.type === 'tank' ? supply.tank!.location : supply.hydrant!.location;
};

// Get name from either supply type
export const getSupplyName = (supply: WaterSupply): string => {
  return supply.type === 'tank' ? supply.tank!.name : supply.hydrant!.name;
};

// Get operational status from either supply type
export const getSupplyStatus = (supply: WaterSupply): OperationalStatus => {
  return supply.type === 'tank' ? supply.tank!.operationalStatus : supply.hydrant!.operationalStatus;
};

// Coverage Analysis Types
export interface WaterSupplyCoverageZone {
  supplyId: string;
  supplyType: WaterSupplyType;
  coverage: CoverageArea[];
  effectiveRange: number; // Max effective distance in feet
  accessTime: number; // Estimated access time in minutes
  supplyCapability: SupplyCapability;
  reliabilityScore: number; // 0-100 based on access, status, etc.
}

export interface SupplyCapability {
  // For tanks
  volumeCapacity?: number; // Available volume for firefighting (gallons)
  refillTime?: number; // Time to refill tank (minutes)
  
  // For hydrants  
  flowRate?: number; // Sustained flow rate (GPM)
  pressure?: number; // Available pressure (PSI)
  unlimited?: boolean; // Connected to municipal system
}

// Legacy support - keeping for backwards compatibility
export interface TankCoverageZone extends WaterSupplyCoverageZone {
  tankId: string;
  volumeCapacity: number;
}

export interface CoverageArea {
  radius: number; // Coverage radius in feet
  confidence: CoverageConfidence;
  constraints: CoverageConstraint[];
  geometry: number[][]; // Polygon coordinates considering terrain/roads
}

export type CoverageConfidence = 
  | 'high'    // <500ft, excellent access
  | 'medium'  // 500-1000ft, good access  
  | 'low'     // 1000-1500ft, fair access
  | 'minimal'; // >1500ft, poor access

export type CoverageConstraint = 
  | 'terrain'     // Hills, valleys affect hose deployment
  | 'roads'       // Road access limits positioning
  | 'structures'  // Buildings block direct access
  | 'property'    // Property boundaries restrict access
  | 'elevation'   // Significant elevation changes
  | 'seasonal';   // Weather-dependent access

// Analysis Results
export interface CoverageAnalysis {
  totalTanks: number;
  totalHydrants: number;
  totalSupplies: number;
  coveragePercentage: number; // % of area covered
  averageResponseTime: number;
  totalCoverageArea: number;
  gapAreas: CoverageGap[];
  redundancyAreas: RedundancyArea[];
  recommendations: CoverageRecommendation[];
  coverageZones: any[];
  generatedAt: Date;
  analysisParameters: AnalysisParameters;
}

export interface CoverageGap {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  area: number; // Square feet
  severity: GapSeverity;
  distance: number;
  affectedZones: any[];
  nearestSupply: {
    supplyId: any;
    supplyType: any;
    distance: number;
    accessTime: number;
  };
  riskAssessment: string;
  geometry?: number[][]; // Polygon of uncovered area
  nearestTank?: {
    tankId: string;
    distance: number;
    accessTime: number;
  };
  populationAffected?: number;
  structuresAffected?: number;
}

export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';
export type RiskLevel = 'very-high' | 'high' | 'medium' | 'low' | 'minimal';

export interface RedundancyArea {
  id: string;
  area: number;
  tankCount: number;
  totalCapacity: number;
  efficiency: number; // Resource utilization efficiency
  geometry: number[][];
}

export interface CoverageRecommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  proposedLocation?: Coordinates;
  estimatedCost?: number;
  expectedBenefit: string;
  implementation: string;
}

export type RecommendationType = 
  | 'new-tank'
  | 'relocate-tank'
  | 'upgrade-access'
  | 'increase-capacity'
  | 'mutual-aid'
  | 'equipment-upgrade';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

// Analysis Configuration
export interface AnalysisParameters {
  maxEffectiveDistance: number; // Default: 1500ft
  minimumFlowRate: number; // GPM required for firefighting
  terrainFactor: boolean; // Consider elevation changes
  roadAccessOnly: boolean; // Limit to road-accessible areas
  seasonalFactors: boolean; // Consider weather/seasonal constraints
  responseTimeWeight: number; // Importance of quick access (0-1)
  capacityWeight: number; // Importance of tank size (0-1)
  accessWeight: number; // Importance of access quality (0-1)
}

// Data Import/Export Types
export interface TankDataImport {
  tanks: Partial<WaterTank>[];
  source: string;
  format: 'csv' | 'excel' | 'json';
  fieldMapping: Record<string, string>;
  validationResults: ValidationResult[];
}

export interface ValidationResult {
  row: number;
  field: string;
  issue: ValidationIssue;
  value: any;
  suggestion?: string;
}

export type ValidationIssue = 
  | 'missing-required'
  | 'invalid-coordinates'
  | 'invalid-capacity'
  | 'invalid-type'
  | 'duplicate-location'
  | 'invalid-format';

// UI State Types
export interface WaterSupplyCoverageUIState {
  selectedSupplies: string[]; // IDs of selected water supplies
  selectedTanks: string[]; // Legacy support - maps to selectedSupplies filtered by type
  selectedHydrants: string[]; // IDs of selected hydrants
  highlightedGaps: string[];
  analysisInProgress: boolean;
  showCoverageZones: boolean;
  showGapAreas: boolean;
  showRedundancyAreas: boolean;
  showTanks: boolean; // Toggle tank visibility
  showHydrants: boolean; // Toggle hydrant visibility
  activeAnalysis?: CoverageAnalysis;
  sidebarTab: WaterSupplySidebarTab;
  filterCriteria: WaterSupplyFilterCriteria;
}

// Legacy support
export interface TankZoneCoverageUIState extends WaterSupplyCoverageUIState {}

export type WaterSupplySidebarTab = 
  | 'supplies'      // All water supplies (tanks + hydrants)
  | 'tanks'         // Tank-specific management
  | 'hydrants'      // Hydrant-specific management
  | 'analysis'      // Coverage analysis
  | 'gaps'          // Coverage gaps
  | 'recommendations' // Improvement suggestions
  | 'import';       // Data import/export

// Legacy support
export type TankSidebarTab = WaterSupplySidebarTab;

export interface WaterSupplyFilterCriteria {
  // Supply type filters
  showTanks: boolean;
  showHydrants: boolean;
  
  // Tank-specific filters
  tankTypes: TankType[];
  accessRating: AccessRating[];
  capacityRange: [number, number];
  
  // Hydrant-specific filters  
  hydrantTypes: HydrantType[];
  flowRateRange: [number, number]; // GPM range
  pressureRange: [number, number]; // PSI range
  
  // Common filters
  operationalStatus: OperationalStatus[];
  showInactive: boolean;
}

// Legacy support
export interface TankFilterCriteria {
  tankTypes: TankType[];
  operationalStatus: OperationalStatus[];
  accessRating: AccessRating[];
  capacityRange: [number, number];
  showInactive: boolean;
}

// Fire Chief-Focused Summary Types
export interface ExecutiveSummary {
  totalCoverage: number;
  criticalGaps: number;
  totalTankCapacity: number;
  averageResponseTime: number;
  topRecommendations: CoverageRecommendation[];
  budgetPriorities: BudgetPriority[];
  complianceStatus: ComplianceStatus;
}

export interface BudgetPriority {
  item: string;
  estimatedCost: number;
  expectedBenefit: string;
  timeframe: string;
  fundingSources: string[];
}

export interface ComplianceStatus {
  nfpaCompliance: boolean;
  localRequirements: boolean;
  insuranceStandards: boolean;
  gaps: string[];
  improvements: string[];
}

// Water Supply Coverage Analysis Tool Container Props
export interface WaterSupplyCoverageProps {
  initialTanks?: WaterTank[];
  initialHydrants?: FireHydrant[];
  initialAnalysisParams?: Partial<AnalysisParameters>;
  onAnalysisComplete?: (analysis: CoverageAnalysis) => void;
  onSupplyUpdate?: (supply: WaterSupply) => void;
  onTankUpdate?: (tank: WaterTank) => void; // Legacy support
  onHydrantUpdate?: (hydrant: FireHydrant) => void;
  mode?: 'analysis' | 'planning' | 'presentation';
}

// Legacy support
export interface TankZoneCoverageProps extends WaterSupplyCoverageProps {}