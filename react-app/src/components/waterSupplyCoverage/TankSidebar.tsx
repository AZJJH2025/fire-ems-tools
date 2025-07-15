/**
 * Water Supply Coverage Sidebar
 * 
 * Provides comprehensive water supply management (tanks & hydrants), analysis controls, 
 * and coverage review for the Water Supply Coverage Analysis tool. Supports dual 
 * supply type management with unified controls and filtering.
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  FormControlLabel,
  Switch,
  Slider,
  TextField,
  MenuItem,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  LocalFireDepartment as TankIcon,
  WaterDrop as HydrantIcon,
  Delete as DeleteIcon,
  PlayArrow as AnalyzeIcon,
  FilterList as FilterIcon,
  Settings as SettingsIcon,
  Assessment as ReportIcon,
  Upload as UploadIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

import {
  selectTanks,
  selectFilteredTanks,
  selectHydrants,
  selectFilteredHydrants,
  selectActiveAnalysis,
  selectUIState,
  selectAnalysisParameters,
  selectIsLoading,
  setSidebarTab,
  updateFilterCriteria,
  updateAnalysisParameters,
  startAnalysis,
  completeAnalysis,
  toggleCoverageZones,
  toggleGapAreas,
  toggleRedundancyAreas,
  addTank,
  deleteTank,
  selectTank,
  deselectTank,
  addHydrant,
  deleteHydrant,
  selectHydrant,
  deselectHydrant
} from '../../state/redux/waterSupplyCoverageSlice';

import { TankZoneCoverageProps, GapSeverity, RecommendationType, RecommendationPriority } from '../../types/tankZoneCoverage';
import WaterSupplyImporter from './WaterSupplyImporter';

interface WaterSupplySidebarProps {
  mode: TankZoneCoverageProps['mode'];
}

const WaterSupplySidebar: React.FC<WaterSupplySidebarProps> = ({ mode }) => {
  const dispatch = useDispatch();
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  
  const tanks = useSelector(selectTanks);
  const filteredTanks = useSelector(selectFilteredTanks);
  const hydrants = useSelector(selectHydrants);
  const filteredHydrants = useSelector(selectFilteredHydrants);
  // const allSupplies = useSelector(selectAllSupplies); // TODO: Use for future features
  // const _coverageZones = useSelector(selectCoverageZones);
  const activeAnalysis = useSelector(selectActiveAnalysis);
  const uiState = useSelector(selectUIState);
  const analysisParameters = useSelector(selectAnalysisParameters);
  const isLoading = useSelector(selectIsLoading);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    dispatch(setSidebarTab(newValue as any));
  };

  const handleAnalysisStart = () => {
    const totalSupplies = tanks.length + hydrants.length;
    if (totalSupplies === 0) {
      alert('Please add at least one water supply (tank or hydrant) before running analysis.');
      return;
    }
    
    dispatch(startAnalysis());
    console.log('🔬 Starting coverage analysis for', tanks.length, 'tanks and', hydrants.length, 'hydrants...');
    
    // Run actual coverage analysis
    setTimeout(() => {
      const analysisResults = performCoverageAnalysis(tanks, hydrants, analysisParameters);
      dispatch(completeAnalysis(analysisResults));
      console.log('✅ Analysis complete:', analysisResults);
    }, 2000);
  };

  const performCoverageAnalysis = (tanks: any[], hydrants: any[], params: any) => {
    // Step 1: Calculate coverage zones for each supply
    const coverageZones = [...tanks, ...hydrants].map(supply => 
      calculateSupplyCoverage(supply, params)
    );

    // Step 2: Analyze overall coverage and identify gaps
    const coverageMetrics = analyzeCoverageMetrics(coverageZones, params);
    
    // Step 3: Identify coverage gaps
    const gapAreas = identifyCoverageGaps(coverageZones, tanks, hydrants, params);
    
    // Step 4: Generate recommendations
    const recommendations = generateRecommendations(gapAreas, coverageMetrics, tanks, hydrants);

    return {
      totalTanks: tanks.length,
      totalHydrants: hydrants.length,
      totalSupplies: tanks.length + hydrants.length,
      coveragePercentage: coverageMetrics.overallCoverage,
      averageResponseTime: coverageMetrics.averageResponseTime,
      totalCoverageArea: coverageMetrics.totalArea,
      gapAreas,
      redundancyAreas: identifyRedundancyAreas(coverageZones),
      recommendations,
      coverageZones,
      generatedAt: new Date(),
      analysisParameters: params
    };
  };

  const calculateSupplyCoverage = (supply: any, params: any) => {
    const isHydrant = 'flowRate' in supply;
    
    // Calculate effective radius based on supply type and parameters
    let effectiveRadius; // in feet
    
    if (isHydrant) {
      // Hydrant coverage based on flow rate and pressure
      const baseRadius = 800; // NFPA baseline for hydrant coverage
      const flowMultiplier = Math.min(supply.flowRate / 1000, 2.0); // Scale by flow rate
      const pressureMultiplier = Math.min(supply.staticPressure / 50, 1.5); // Scale by pressure
      effectiveRadius = baseRadius * flowMultiplier * pressureMultiplier;
      
      // Apply parameter adjustments
      if (params.terrainFactor) effectiveRadius *= 0.9; // 10% reduction for terrain
      if (params.roadAccessOnly) effectiveRadius *= 0.8; // 20% reduction for road access
    } else {
      // Tank coverage based on capacity and access
      const baseRadius = 1000; // Base tank coverage
      const capacityMultiplier = Math.min(supply.capacity / 25000, 2.0); // Scale by capacity
      const accessMultiplier = supply.accessRating === 'excellent' ? 1.2 : 
                              supply.accessRating === 'good' ? 1.0 : 0.8;
      effectiveRadius = baseRadius * capacityMultiplier * accessMultiplier;
      
      // Apply parameter adjustments
      if (params.terrainFactor) effectiveRadius *= 0.85; // 15% reduction for terrain (tanks more affected)
      if (params.seasonalFactors) effectiveRadius *= 0.9; // 10% reduction for seasonal access
    }

    // Convert feet to meters for calculation
    const radiusMeters = effectiveRadius * 0.3048;
    
    return {
      supplyId: supply.id,
      supplyType: isHydrant ? 'hydrant' : 'tank',
      location: supply.location,
      effectiveRadius: effectiveRadius,
      radiusMeters: radiusMeters,
      coverageArea: Math.PI * Math.pow(radiusMeters, 2), // Area in square meters
      responseTime: calculateResponseTime(effectiveRadius, params),
      capacity: isHydrant ? supply.flowRate : supply.capacity,
      reliability: supply.operationalStatus === 'active' ? 1.0 : 0.5
    };
  };

  const calculateResponseTime = (distanceFeet: number, params: any) => {
    // Base response time calculation (NFPA standards)
    const travelTime = distanceFeet / 25; // Assume 25 ft/sec avg speed
    const setupTime = 120; // 2 minutes setup time
    const accessTime = params.roadAccessOnly ? 30 : 60; // Access time penalty
    
    return travelTime + setupTime + accessTime; // Total time in seconds
  };

  const analyzeCoverageMetrics = (coverageZones: any[], _params: any) => {
    const totalArea = coverageZones.reduce((sum, zone) => sum + zone.coverageArea, 0);
    const avgResponseTime = coverageZones.reduce((sum, zone) => sum + zone.responseTime, 0) / coverageZones.length;
    
    // Estimate coverage percentage based on zones (simplified)
    // In reality, this would require GIS polygon analysis
    const estimatedServiceArea = 50000000; // 50 sq km estimated service area
    const coveragePercentage = Math.min(totalArea / estimatedServiceArea * 100, 95);
    
    return {
      overallCoverage: Math.round(coveragePercentage * 10) / 10,
      averageResponseTime: Math.round(avgResponseTime),
      totalArea: Math.round(totalArea),
      supplyDensity: coverageZones.length / (estimatedServiceArea / 1000000) // supplies per sq km
    };
  };

  const identifyCoverageGaps = (coverageZones: any[], _tanks: any[], _hydrants: any[], _params: any) => {
    const gaps = [];
    
    // Identify areas with poor coverage (simplified analysis)
    const minCoverageRadius = _params.maxEffectiveDistance * 0.3048; // Convert to meters
    
    // Look for gaps between coverage zones
    if (coverageZones.length >= 2) {
      for (let i = 0; i < coverageZones.length; i++) {
        for (let j = i + 1; j < coverageZones.length; j++) {
          const zone1 = coverageZones[i];
          const zone2 = coverageZones[j];
          
          const distance = calculateDistance(zone1.location, zone2.location) * 1000; // km to meters
          const combinedRadius = zone1.radiusMeters + zone2.radiusMeters;
          
          if (distance > combinedRadius * 1.5) {
            // Gap identified between zones
            const gapCenter = {
              latitude: (zone1.location.latitude + zone2.location.latitude) / 2,
              longitude: (zone1.location.longitude + zone2.location.longitude) / 2
            };
            
            const gapDistance = distance - combinedRadius;
            const severity: GapSeverity = gapDistance > minCoverageRadius * 2 ? 'critical' : 
                           gapDistance > minCoverageRadius ? 'high' : 'medium';
            
            gaps.push({
              id: `gap-${i}-${j}`,
              location: gapCenter,
              area: Math.PI * Math.pow(gapDistance / 2, 2), // Estimated gap area
              severity,
              distance: gapDistance,
              affectedZones: [zone1.supplyId, zone2.supplyId],
              nearestSupply: {
                supplyId: zone1.supplyId,
                supplyType: zone1.supplyType,
                distance: gapDistance / 2,
                accessTime: calculateResponseTime(gapDistance / 2 / 0.3048, _params)
              },
              riskAssessment: severity === 'critical' ? 'high' : 'medium'
            });
          }
        }
      }
    }
    
    return gaps;
  };

  const identifyRedundancyAreas = (coverageZones: any[]) => {
    // Find areas with overlapping coverage (redundancy)
    const redundancyAreas = [];
    
    for (let i = 0; i < coverageZones.length; i++) {
      for (let j = i + 1; j < coverageZones.length; j++) {
        const zone1 = coverageZones[i];
        const zone2 = coverageZones[j];
        
        const distance = calculateDistance(zone1.location, zone2.location) * 1000; // km to meters
        const combinedRadius = zone1.radiusMeters + zone2.radiusMeters;
        
        if (distance < combinedRadius * 0.8) {
          // Significant overlap
          redundancyAreas.push({
            id: `redundancy-${i}-${j}`,
            area: Math.PI * Math.pow(Math.min(zone1.radiusMeters, zone2.radiusMeters), 2),
            tankCount: 2, // Number of supplies in this redundancy area
            totalCapacity: (zone1.capacity || 0) + (zone2.capacity || 0),
            efficiency: 1 - (distance / combinedRadius),
            geometry: [] // Empty geometry for now, would need GIS calculation
          });
        }
      }
    }
    
    return redundancyAreas;
  };

  const generateRecommendations = (gaps: any[], metrics: any, _tanks: any[], _hydrants: any[]) => {
    const recommendations = [];
    
    // Recommendation for critical gaps
    gaps.filter(gap => gap.severity === 'critical').forEach((gap, index) => {
      recommendations.push({
        id: `rec-gap-${index}`,
        type: 'new-tank' as RecommendationType,
        priority: 'high' as RecommendationPriority,
        title: `Address Critical Coverage Gap`,
        description: `Critical coverage gap of ${(gap.area / 4047).toFixed(1)} acres identified requiring immediate attention.`,
        proposedLocation: gap.location,
        estimatedCost: gap.area > 100000 ? 150000 : 75000, // Larger gaps cost more
        expectedBenefit: `Improve response time by ${Math.round(gap.nearestSupply.accessTime / 60)} minutes for affected area`,
        implementation: gap.area > 100000 ? 
          'Install 50,000 gallon tank with excellent road access' :
          'Install 25,000 gallon tank or high-flow hydrant (1500+ GPM)'
      });
    });

    // Recommendation for overall coverage improvement
    if (metrics.overallCoverage < 80) {
      recommendations.push({
        id: 'rec-coverage',
        type: 'increase-capacity' as RecommendationType,
        priority: 'medium' as RecommendationPriority,
        title: 'Improve Overall Coverage',
        description: `Current coverage at ${metrics.overallCoverage}% is below recommended 80% minimum.`,
        estimatedCost: 200000,
        expectedBenefit: `Increase coverage to 85%+ with ${Math.ceil((80 - metrics.overallCoverage) / 10)} additional supplies`,
        implementation: 'Strategic placement of 2-3 additional water supplies in underserved areas'
      });
    }

    // Recommendation for response time improvement
    if (metrics.averageResponseTime > 600) { // 10 minutes
      recommendations.push({
        id: 'rec-response-time',
        type: 'upgrade-access' as RecommendationType,
        priority: 'medium' as RecommendationPriority,
        title: 'Reduce Average Response Time',
        description: `Average response time of ${Math.round(metrics.averageResponseTime / 60)} minutes exceeds NFPA recommendations.`,
        estimatedCost: 100000,
        expectedBenefit: 'Reduce average response time to under 8 minutes',
        implementation: 'Optimize supply placement and improve access roads to existing supplies'
      });
    }

    return recommendations;
  };

  const calculateDistance = (coord1: any, coord2: any) => {
    // Haversine formula for distance between two coordinates (returns km)
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleTankSelect = (tankId: string) => {
    if (uiState.selectedTanks.includes(tankId)) {
      dispatch(deselectTank(tankId));
    } else {
      dispatch(selectTank(tankId));
    }
  };

  const handleTankDelete = (tankId: string) => {
    dispatch(deleteTank(tankId));
  };

  const handleAddTank = () => {
    // Create a new tank with default properties
    const newTank = {
      name: `Tank ${tanks.length + 1}`,
      location: {
        latitude: 39.8283 + (Math.random() - 0.5) * 0.1, // Random location near center
        longitude: -98.5795 + (Math.random() - 0.5) * 0.1
      },
      capacity: 25000, // Default capacity
      type: 'municipal' as any,
      accessRating: 'good' as any,
      operationalStatus: 'active' as any,
      owner: 'Fire Department',
      contactInfo: '',
      notes: 'Added via Add Tank button'
    };
    
    dispatch(addTank(newTank));
    console.log('🎯 Tank added:', newTank);
  };

  const handleAddHydrant = () => {
    // Create a new hydrant with default properties
    const newHydrant = {
      name: `Hydrant ${hydrants.length + 1}`,
      location: {
        latitude: 39.8283 + (Math.random() - 0.5) * 0.1, // Random location near center
        longitude: -98.5795 + (Math.random() - 0.5) * 0.1
      },
      flowRate: 1000, // Default 1000 GPM
      staticPressure: 65, // Default 65 PSI
      residualPressure: 20, // Default 20 PSI
      type: 'municipal' as any,
      size: '4.5-inch' as any,
      operationalStatus: 'active' as any,
      owner: 'Water Department',
      notes: 'Added via Add Hydrant button'
    };
    
    dispatch(addHydrant(newHydrant));
    console.log('🚰 Hydrant added:', newHydrant);
  };

  const handleImportCSV = () => {
    setImportDialogOpen(true);
  };

  /* const _parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      if (csvText) {
        try {
          const parsedData = parseCSVData(csvText);
          if (parsedData.tanks.length > 0 || parsedData.hydrants.length > 0) {
            // Import the parsed data
            parsedData.tanks.forEach(tank => dispatch(addTank(tank)));
            parsedData.hydrants.forEach(hydrant => dispatch(addHydrant(hydrant)));
            
            alert(`✅ Import Successful!\n\nImported:\n• ${parsedData.tanks.length} tanks\n• ${parsedData.hydrants.length} hydrants`);
            console.log('✅ CSV import successful:', parsedData);
          } else {
            alert('❌ No valid tank or hydrant data found in CSV file.\n\nExpected columns:\n• Tanks: name, latitude, longitude, capacity, type\n• Hydrants: name, latitude, longitude, flowRate, type');
          }
        } catch (error) {
          console.error('❌ CSV parsing error:', error);
          alert(`❌ Error parsing CSV file:\n\n${error}\n\nPlease check the file format and try again.`);
        }
      }
    };
    reader.readAsText(file);
  }; */

  /* const parseCSVData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    const header = lines[0].split(',').map(col => col.trim().toLowerCase());
    const tanks: any[] = [];
    const hydrants: any[] = [];

    // Check if this is tank data or hydrant data based on headers
    const hasTankColumns = header.includes('capacity') || header.includes('gallons');
    const hasHydrantColumns = header.includes('flowrate') || header.includes('flow_rate') || header.includes('gpm');

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(val => val.trim());
      if (values.length !== header.length) continue; // Skip malformed rows

      const record: any = {};
      header.forEach((col, index) => {
        record[col] = values[index];
      });

      // Parse coordinates
      const lat = parseFloat(record.latitude || record.lat);
      const lng = parseFloat(record.longitude || record.lng || record.lon);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.warn('Skipping row with invalid coordinates:', record);
        continue;
      }

      const location = { latitude: lat, longitude: lng };
      const name = record.name || record.id || `Supply ${i}`;

      if (hasTankColumns && !hasHydrantColumns) {
        // This is tank data
        const capacity = parseInt(record.capacity || record.gallons || '25000');
        const tank = {
          name,
          location,
          capacity: isNaN(capacity) ? 25000 : capacity,
          type: record.type || 'municipal',
          accessRating: record.access_rating || record.access || 'good',
          operationalStatus: record.status || record.operational_status || 'active',
          owner: record.owner || 'Fire Department',
          contactInfo: record.contact || record.phone || '',
          notes: record.notes || 'Imported from CSV'
        };
        tanks.push(tank);
      } else if (hasHydrantColumns && !hasTankColumns) {
        // This is hydrant data
        const flowRate = parseInt(record.flowrate || record.flow_rate || record.gpm || '1000');
        const staticPressure = parseInt(record.static_pressure || record.pressure || '65');
        const hydrant = {
          name,
          location,
          flowRate: isNaN(flowRate) ? 1000 : flowRate,
          staticPressure: isNaN(staticPressure) ? 65 : staticPressure,
          residualPressure: parseInt(record.residual_pressure || '20') || 20,
          type: record.type || 'municipal',
          size: record.size || '4-inch',
          operationalStatus: record.status || record.operational_status || 'active',
          owner: record.owner || 'Water Department',
          contactInfo: record.contact || record.phone || '',
          notes: record.notes || 'Imported from CSV'
        };
        hydrants.push(hydrant);
      } else {
        // Mixed data or unclear format - try to determine by other indicators
        if (record.capacity || record.gallons) {
          // Treat as tank
          const capacity = parseInt(record.capacity || record.gallons || '25000');
          tanks.push({
            name,
            location,
            capacity: isNaN(capacity) ? 25000 : capacity,
            type: record.type || 'municipal',
            accessRating: 'good',
            operationalStatus: 'active',
            owner: 'Fire Department',
            contactInfo: '',
            notes: 'Imported from CSV'
          });
        } else if (record.flowrate || record.flow_rate || record.gpm) {
          // Treat as hydrant
          const flowRate = parseInt(record.flowrate || record.flow_rate || record.gpm || '1000');
          hydrants.push({
            name,
            location,
            flowRate: isNaN(flowRate) ? 1000 : flowRate,
            staticPressure: 65,
            residualPressure: 20,
            type: record.type || 'municipal',
            size: '4-inch',
            operationalStatus: 'active',
            owner: 'Water Department',
            contactInfo: '',
            notes: 'Imported from CSV'
          });
        }
      }
    }

    return { tanks, hydrants };
  }; */

  const handleTankTypeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const tankTypes = value === 'all' ? [] : [value as any];
    dispatch(updateFilterCriteria({ tankTypes }));
    console.log('🔍 Tank type filter changed:', value);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const operationalStatus = value === 'all' ? [] : [value as any];
    dispatch(updateFilterCriteria({ operationalStatus }));
    console.log('🔍 Status filter changed:', value);
  };

  const handleCapacityRangeChange = (_event: Event, newValue: number | number[]) => {
    const capacityRange: [number, number] = Array.isArray(newValue) ? [newValue[0], newValue[1]] : [0, newValue as number];
    dispatch(updateFilterCriteria({ capacityRange }));
    console.log('🔍 Capacity range changed:', capacityRange);
  };

  const renderTanksTab = () => (
    <Box sx={{ p: 2 }}>
      {/* Tank Controls */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<TankIcon />}
          size="small"
          onClick={handleAddTank}
        >
          Add Tank
        </Button>
        <Button
          variant="outlined"
          startIcon={<HydrantIcon />}
          size="small"
          onClick={handleAddHydrant}
        >
          Add Hydrant
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          size="small"
          fullWidth
          onClick={handleImportCSV}
        >
          Import CSV
        </Button>
      </Box>

      {/* Tank Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filters
        </Typography>
        
        <TextField
          select
          size="small"
          label="Tank Type"
          fullWidth
          margin="dense"
          value={uiState.filterCriteria.tankTypes[0] || 'all'}
          onChange={handleTankTypeFilterChange}
        >
          <MenuItem value="all">All Types</MenuItem>
          <MenuItem value="municipal">Municipal</MenuItem>
          <MenuItem value="private">Private</MenuItem>
          <MenuItem value="emergency">Emergency</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Status"
          fullWidth
          margin="dense"
          value={uiState.filterCriteria.operationalStatus[0] || 'all'}
          onChange={handleStatusFilterChange}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="maintenance">Maintenance</MenuItem>
        </TextField>

        <Typography variant="caption" display="block" sx={{ mt: 1, mb: 1 }}>
          Capacity Range (gallons)
        </Typography>
        <Slider
          size="small"
          value={uiState.filterCriteria.capacityRange}
          onChange={handleCapacityRangeChange}
          min={0}
          max={100000}
          step={5000}
          valueLabelDisplay="auto"
          marks={[
            { value: 0, label: '0' },
            { value: 50000, label: '50K' },
            { value: 100000, label: '100K' }
          ]}
        />
      </Paper>

      {/* Water Supply List */}
      <Typography variant="subtitle2" gutterBottom>
        Water Tanks ({filteredTanks.length})
      </Typography>
      
      <List dense>
        {filteredTanks.map((tank) => (
          <ListItem
            key={tank.id}
            sx={{ border: 1, borderColor: 'divider', mb: 1, borderRadius: 1 }}
          >
            <ListItemButton
              selected={uiState.selectedTanks.includes(tank.id)}
              onClick={() => handleTankSelect(tank.id)}
            >
            <ListItemIcon>
              <TankIcon color={tank.operationalStatus === 'active' ? 'primary' : 'disabled'} />
            </ListItemIcon>
            <ListItemText
              primary={tank.name}
              secondary={
                <Box>
                  <Typography variant="caption" display="block">
                    {tank.capacity.toLocaleString()} gal • {tank.type}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={tank.accessRating} 
                    color={tank.accessRating === 'excellent' ? 'success' : 'default'}
                  />
                </Box>
              }
            />
            </ListItemButton>
            <ListItemSecondaryAction>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleTankDelete(tank.id);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
        Fire Hydrants ({filteredHydrants.length})
      </Typography>
      
      <List dense>
        {filteredHydrants.map((hydrant) => (
          <ListItem
            key={hydrant.id}
            sx={{ border: 1, borderColor: 'divider', mb: 1, borderRadius: 1 }}
          >
            <ListItemButton
              selected={uiState.selectedHydrants?.includes(hydrant.id)}
              onClick={() => {
                if (uiState.selectedHydrants?.includes(hydrant.id)) {
                  dispatch(deselectHydrant(hydrant.id));
                } else {
                  dispatch(selectHydrant(hydrant.id));
                }
              }}
            >
            <ListItemIcon>
              <HydrantIcon color={hydrant.operationalStatus === 'active' ? 'primary' : 'disabled'} />
            </ListItemIcon>
            <ListItemText
              primary={hydrant.name}
              secondary={
                <Box>
                  <Typography variant="caption" display="block">
                    {hydrant.flowRate} GPM • {hydrant.staticPressure}/{hydrant.residualPressure} PSI
                  </Typography>
                  <Chip 
                    size="small" 
                    label={hydrant.type} 
                    color={hydrant.type === 'municipal' ? 'success' : 'default'}
                  />
                </Box>
              }
            />
            </ListItemButton>
            <ListItemSecondaryAction>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(deleteHydrant(hydrant.id));
                }}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {filteredTanks.length === 0 && filteredHydrants.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No water supplies found. Add tanks/hydrants or adjust filters.
        </Alert>
      )}
    </Box>
  );

  const renderAnalysisTab = () => (
    <Box sx={{ p: 2 }}>
      {/* Analysis Controls */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Analysis Parameters
        </Typography>

        <TextField
          size="small"
          label="Max Effective Distance (ft)"
          fullWidth
          margin="dense"
          type="number"
          value={analysisParameters.maxEffectiveDistance}
          onChange={(e) => dispatch(updateAnalysisParameters({ 
            maxEffectiveDistance: parseInt(e.target.value) || 1500 
          }))}
        />

        <TextField
          size="small"
          label="Min Flow Rate (GPM)"
          fullWidth
          margin="dense"
          type="number"
          value={analysisParameters.minimumFlowRate}
          onChange={(e) => dispatch(updateAnalysisParameters({ 
            minimumFlowRate: parseInt(e.target.value) || 250 
          }))}
        />

        <FormControlLabel
          control={
            <Switch
              checked={analysisParameters.terrainFactor}
              onChange={(e) => dispatch(updateAnalysisParameters({ 
                terrainFactor: e.target.checked 
              }))}
            />
          }
          label="Consider Terrain"
        />

        <FormControlLabel
          control={
            <Switch
              checked={analysisParameters.seasonalFactors}
              onChange={(e) => dispatch(updateAnalysisParameters({ 
                seasonalFactors: e.target.checked 
              }))}
            />
          }
          label="Seasonal Factors"
        />
      </Paper>

      {/* Analysis Actions */}
      <Button
        variant="contained"
        startIcon={<AnalyzeIcon />}
        fullWidth
        size="large"
        onClick={handleAnalysisStart}
        disabled={(tanks.length + hydrants.length) === 0 || isLoading}
        sx={{ mb: 2 }}
      >
        {isLoading ? 'Analyzing...' : 'Analyze Coverage'}
      </Button>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Coverage Display Options */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Display Options
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={uiState.showCoverageZones}
              onChange={() => dispatch(toggleCoverageZones())}
            />
          }
          label="Coverage Zones"
        />

        <FormControlLabel
          control={
            <Switch
              checked={uiState.showGapAreas}
              onChange={() => dispatch(toggleGapAreas())}
            />
          }
          label="Gap Areas"
        />

        <FormControlLabel
          control={
            <Switch
              checked={uiState.showRedundancyAreas}
              onChange={() => dispatch(toggleRedundancyAreas())}
            />
          }
          label="Redundancy Areas"
        />
      </Paper>

      {/* Analysis Results Summary */}
      {activeAnalysis && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            <ReportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Analysis Results
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            Coverage: {activeAnalysis.coveragePercentage.toFixed(1)}%
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            Tanks: {activeAnalysis.totalTanks || 0} • Hydrants: {activeAnalysis.totalHydrants || 0}
          </Typography>
          
          <Typography variant="body2" gutterBottom>
            Critical Gaps: {activeAnalysis.gapAreas.filter(gap => gap.severity === 'critical').length}
          </Typography>

          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            fullWidth
            sx={{ mt: 1 }}
          >
            Export Report
          </Button>
        </Paper>
      )}
    </Box>
  );

  const renderGapsTab = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Coverage Gaps
      </Typography>
      
      {activeAnalysis ? (
        <List dense>
          {activeAnalysis.gapAreas.map((gap) => (
            <ListItem key={gap.id} sx={{ border: 1, borderColor: 'divider', mb: 1, borderRadius: 1 }}>
              <ListItemText
                primary={`Gap ${gap.id}`}
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      Severity: <Chip size="small" label={gap.severity} color={
                        gap.severity === 'critical' ? 'error' : 
                        gap.severity === 'high' ? 'warning' : 'default'
                      } />
                    </Typography>
                    <Typography variant="caption" display="block">
                      Area: {(gap.area / 43560).toFixed(1)} acres
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info">
          Run coverage analysis to identify gaps.
        </Alert>
      )}
    </Box>
  );

  const renderRecommendationsTab = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Recommendations
      </Typography>
      
      {activeAnalysis ? (
        <List dense>
          {activeAnalysis.recommendations.map((rec) => (
            <ListItem key={rec.id} sx={{ border: 1, borderColor: 'divider', mb: 1, borderRadius: 1 }}>
              <ListItemText
                primary={rec.title}
                secondary={
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      {rec.description}
                    </Typography>
                    <Chip size="small" label={rec.priority} color={
                      rec.priority === 'critical' ? 'error' :
                      rec.priority === 'high' ? 'warning' : 'default'
                    } />
                    {rec.estimatedCost && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Est. Cost: ${rec.estimatedCost.toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info">
          Run coverage analysis to see recommendations.
        </Alert>
      )}
    </Box>
  );

  const renderImportTab = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Data Import
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Import tank and hydrant locations from CSV files. The system automatically detects data type based on column headers.
      </Alert>

      <Button
        variant="contained"
        startIcon={<UploadIcon />}
        fullWidth
        sx={{ mb: 3 }}
        onClick={handleImportCSV}
      >
        Import Water Supply Data (CSV)
      </Button>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
        🏢 Tank CSV Format:
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
        name,latitude,longitude,capacity,type,owner{'\n'}
        Tank 1,40.7128,-74.0060,25000,municipal,Fire Dept{'\n'}
        Tank 2,40.7589,-73.9851,50000,private,Water Co
      </Typography>

      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
        🚰 Hydrant CSV Format:
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
        name,latitude,longitude,flowRate,type,owner{'\n'}
        Hydrant 1,40.7128,-74.0060,1000,municipal,Water Dept{'\n'}
        Hydrant 2,40.7589,-73.9851,1500,industrial,Private
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        <strong>Supported columns:</strong><br/>
        • Required: name, latitude, longitude<br/>
        • Tanks: capacity (gallons), type, access_rating<br/>
        • Hydrants: flowRate (GPM), static_pressure, size<br/>
        • Optional: owner, contact, notes, status
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Export Data
      </Typography>

      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        fullWidth
        disabled={(tanks.length + hydrants.length) === 0}
        onClick={() => {
          const exportData = {
            tanks: tanks.map(tank => ({
              name: tank.name,
              latitude: tank.location.latitude,
              longitude: tank.location.longitude,
              capacity: tank.capacity,
              type: tank.type,
              owner: tank.owner,
              access_rating: tank.accessRating,
              status: tank.operationalStatus,
              notes: tank.notes
            })),
            hydrants: hydrants.map(hydrant => ({
              name: hydrant.name,
              latitude: hydrant.location.latitude,
              longitude: hydrant.location.longitude,
              flowRate: hydrant.flowRate,
              static_pressure: hydrant.staticPressure,
              residual_pressure: hydrant.residualPressure,
              type: hydrant.type,
              size: hydrant.size,
              owner: hydrant.owner,
              status: hydrant.operationalStatus,
              notes: hydrant.notes
            })),
            exportedAt: new Date().toISOString(),
            summary: {
              totalTanks: tanks.length,
              totalHydrants: hydrants.length,
              totalSupplies: tanks.length + hydrants.length
            }
          };
          
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `water-supply-data-${new Date().toISOString().split('T')[0]}.json`;
          link.click();
          URL.revokeObjectURL(url);
          
          console.log('💾 Data exported:', exportData);
        }}
      >
        Export Supply Data (JSON)
      </Button>
    </Box>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sidebar Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
          <TankIcon sx={{ mr: 1 }} />
          Water Supply Coverage
        </Typography>
        {mode && (
          <Typography variant="caption" color="text.secondary">
            Mode: {mode}
          </Typography>
        )}
      </Box>

      {/* Tabs */}
      <Tabs
        value={uiState.sidebarTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Supplies" value="tanks" />
        <Tab label="Analysis" value="analysis" />
        <Tab label="Gaps" value="gaps" />
        <Tab label="Recommendations" value="recommendations" />
        <Tab label="Import" value="import" />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {uiState.sidebarTab === 'tanks' && renderTanksTab()}
        {uiState.sidebarTab === 'analysis' && renderAnalysisTab()}
        {uiState.sidebarTab === 'gaps' && renderGapsTab()}
        {uiState.sidebarTab === 'recommendations' && renderRecommendationsTab()}
        {uiState.sidebarTab === 'import' && renderImportTab()}
      </Box>
      
      {/* Enhanced Import Dialog */}
      <WaterSupplyImporter 
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
      />
    </Box>
  );
};

export default WaterSupplySidebar;