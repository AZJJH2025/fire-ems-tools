/**
 * Water Supply CSV Importer Component
 * 
 * Provides CSV import functionality for water supply data (tanks and hydrants)
 * with field mapping, validation, and test data loading capabilities.
 */

import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Upload as UploadIcon,
  CloudDownload as DownloadIcon,
  Error as ErrorIcon,
  WaterDrop as HydrantIcon,
  LocalFireDepartment as TankIcon
} from '@mui/icons-material';

import { addTank, addHydrant } from '../../state/redux/waterSupplyCoverageSlice';

// Test data scenarios
const TEST_SCENARIOS = [
  {
    id: 'rural',
    name: 'Rural Fire Department',
    description: 'Mixed tanks and hydrants for rural coverage',
    file: '/src/test-data/water-supply-rural-dept.csv',
    preview: '6 Tanks + 4 Hydrants (Salt Lake Rural Area)',
    tanks: 6,
    hydrants: 4
  },
  {
    id: 'suburban', 
    name: 'Suburban Fire Department',
    description: 'Primarily hydrant-based suburban coverage',
    file: '/src/test-data/water-supply-suburban-dept.csv',
    preview: '2 Tanks + 10 Hydrants (Denver Suburban)',
    tanks: 2,
    hydrants: 10
  },
  {
    id: 'mixed',
    name: 'Mixed Coverage Area',
    description: 'Complex coverage with gaps and clusters',
    file: '/src/test-data/water-supply-mixed-coverage.csv', 
    preview: '6 Tanks + 7 Hydrants (Charlotte Mixed)',
    tanks: 6,
    hydrants: 7
  }
];

interface WaterSupplyImporterProps {
  open: boolean;
  onClose: () => void;
}

interface ImportResult {
  tanks: number;
  hydrants: number;
  errors: string[];
  warnings: string[];
}

const WaterSupplyImporter: React.FC<WaterSupplyImporterProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Parse CSV text into structured data with robust parsing
  const parseCSV = useCallback((csvText: string): any[] => {
    try {
      // Clean the input text
      const cleanText = csvText.trim();
      if (!cleanText) return [];

      // Split into lines, handling different line endings
      const lines = cleanText.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) return [];

      // Parse CSV properly handling quoted fields, commas inside quotes, etc.
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Double quote inside quoted field
              current += '"';
              i++; // Skip next quote
            } else {
              // Start or end of quoted field
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // Field separator
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        
        // Add the last field
        result.push(current.trim());
        return result;
      };

      // Parse headers with robust cleaning
      const headers = parseCSVLine(lines[0]).map(h => 
        h.replace(/^["']|["']$/g, '').trim() // Remove quotes and trim
      );

      // Debug: Log the column headers found
      console.log('🔍 WATER SUPPLY CSV HEADERS FOUND:', headers);

      // Parse data rows
      const records = lines.slice(1).map((line, _lineIndex) => {
        const values = parseCSVLine(line);
        const record: any = {};
        
        headers.forEach((header, index) => {
          let value = values[index] || '';
          // Clean the value - remove quotes and trim
          value = value.replace(/^["']|["']$/g, '').trim();
          record[header] = value;
        });
        
        return record;
      }).filter(record => {
        // Filter out empty records
        return Object.values(record).some(value => value !== '');
      });

      // Debug: Log first few records to see what fields are available
      if (records.length > 0) {
        console.log('🔍 FIRST RECORD SAMPLE:', records[0]);
        console.log('🔍 TOTAL RECORDS PARSED:', records.length);
        
        // Log available coordinate-related fields
        const coordFields = headers.filter(h => 
          /^(x|y|lat|lng|lon|latitude|longitude)$/i.test(h) ||
          h.toLowerCase().includes('coord')
        );
        console.log('🔍 COORDINATE-RELATED FIELDS FOUND:', coordFields);
      }

      return records;
    } catch (error) {
      console.error('🔥 CSV PARSING ERROR:', error);
      return [];
    }
  }, []);

  // Convert CSV record to tank object
  const csvToTank = useCallback((record: any, lat: number, lng: number, name: string): any => {
    const capacity = parseInt(record.Capacity_Gallons || record.Capacity || '25000');

    return {
      name: name,
      location: { latitude: lat, longitude: lng },
      capacity: isNaN(capacity) ? 25000 : capacity,
      type: 'municipal' as any,
      accessRating: (record.Access_Rating || 'good') as any,
      operationalStatus: (record.Operational_Status || 'active') as any,
      owner: record.Owner || 'Fire Department',
      contactInfo: '',
      notes: record.Notes || '',
      created: new Date(),
      modified: new Date()
    };
  }, []);

  // Convert CSV record to hydrant object  
  const csvToHydrant = useCallback((record: any, lat: number, lng: number, name: string): any => {
    const flowRate = parseInt(record.Flow_Rate_GPM || record.FlowRate || '1000');
    const staticPressure = parseInt(record.Static_Pressure_PSI || record.Pressure || '50');

    return {
      name: name,
      location: { latitude: lat, longitude: lng },
      flowRate: isNaN(flowRate) ? 1000 : flowRate,
      staticPressure: isNaN(staticPressure) ? 50 : staticPressure,
      residualPressure: Math.max(staticPressure - 30, 20), // Estimate residual
      type: 'municipal' as any,
      size: '4-inch' as any,
      operationalStatus: (record.Operational_Status || 'active') as any,
      owner: record.Owner || 'Water Department',
      contactInfo: '',
      notes: record.Notes || '',
      created: new Date(),
      modified: new Date()
    };
  }, []);

  // Process CSV data and import water supplies
  const processCSVData = useCallback(async (csvText: string): Promise<ImportResult> => {
    try {
      const records = parseCSV(csvText);
      const result: ImportResult = { tanks: 0, hydrants: 0, errors: [], warnings: [] };

      for (const record of records) {
        try {
          // Debug: Show what fields are available for this record (only first few records)
          if (result.tanks + result.hydrants < 3) {
            console.log(`🔍 PROCESSING RECORD #${result.tanks + result.hydrants + 1}:`, record);
          }
          
          // Smart coordinate detection - try multiple approaches
          let lat: number | undefined, lng: number | undefined;
          let latSource = '', lngSource = '';
          
          // Approach 1: Standard coordinate field names
          const latFields = ['Latitude', 'latitude', 'LAT', 'lat', 'Y', 'y', 'LATITUDE'];
          const lngFields = ['Longitude', 'longitude', 'LNG', 'lng', 'LON', 'lon', 'X', 'x', 'LONGITUDE'];
          
          // Find latitude
          for (const field of latFields) {
            if (record[field] && record[field] !== '') {
              const val = parseFloat(record[field]);
              if (!isNaN(val) && Math.abs(val) <= 90) { // Valid latitude range
                lat = val;
                latSource = field;
                break;
              }
            }
          }
          
          // Find longitude  
          for (const field of lngFields) {
            if (record[field] && record[field] !== '') {
              const val = parseFloat(record[field]);
              if (!isNaN(val) && Math.abs(val) <= 180) { // Valid longitude range
                lng = val;
                lngSource = field;
                break;
              }
            }
          }
          
          // Approach 2: If standard fields don't work, look for any numeric fields that might be coordinates
          if (isNaN(lat!) || isNaN(lng!)) {
            const numericFields = Object.keys(record).filter(key => {
              const val = parseFloat(record[key]);
              return !isNaN(val) && record[key] !== '';
            });
            
            console.log('🔍 FALLBACK: Looking for coordinates in numeric fields:', numericFields);
            
            for (const field of numericFields) {
              const val = parseFloat(record[field]);
              if (Math.abs(val) <= 90 && isNaN(lat!)) {
                lat = val;
                latSource = `${field} (auto-detected)`;
              } else if (Math.abs(val) <= 180 && isNaN(lng!)) {
                lng = val;
                lngSource = `${field} (auto-detected)`;
              }
            }
          }
          
          const name = record.Name || record.name || record.NAME || record.HYD_ID || record.ST_NAME || 
                      record.STATION || record.station || record.ID || record.id || `Item ${result.tanks + result.hydrants + 1}`;
          
          console.log(`🔍 COORDINATE PARSING: lat=${lat} (from ${latSource}), lng=${lng} (from ${lngSource})`);
          
          if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
            // More helpful error message showing what was tried
            const availableFields = Object.keys(record).filter(k => record[k] !== '');
            result.errors.push(`Invalid coordinates for ${name}: Could not find valid lat/lng. Available fields: ${availableFields.join(', ')}. Tried lat from: ${latFields.join(', ')}. Tried lng from: ${lngFields.join(', ')}.`);
            continue;
          }

          // Determine if this is a tank or hydrant
          const type = (record.Type || '').toLowerCase();
          const hasCapacity = record.Capacity_Gallons || record.Capacity;
          const hasFlowRate = record.Flow_Rate_GPM || record.FlowRate;

          if (type === 'tank' || (hasCapacity && !hasFlowRate)) {
            // Process as tank
            const tank = csvToTank(record, lat!, lng!, name);
            dispatch(addTank(tank));
            result.tanks++;
          } else if (type === 'hydrant' || hasFlowRate) {
            // Process as hydrant
            const hydrant = csvToHydrant(record, lat!, lng!, name);
            dispatch(addHydrant(hydrant));
            result.hydrants++;
          } else {
            result.warnings.push(`Unclear type for ${name} - defaulting to hydrant`);
            const hydrant = csvToHydrant(record, lat!, lng!, name);
            dispatch(addHydrant(hydrant));
            result.hydrants++;
          }
        } catch (error) {
          result.errors.push(`Error processing ${record.Name}: ${error}`);
        }
      }

      return result;
    } catch (error) {
      throw new Error(`CSV parsing failed: ${error}`);
    }
  }, [parseCSV, csvToTank, csvToHydrant, dispatch]);

  // Handle file drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setLoading(true);

    try {
      const files = Array.from(e.dataTransfer.files);
      const csvFile = files.find(file => file.name.endsWith('.csv'));
      
      if (!csvFile) {
        throw new Error('Please drop a CSV file');
      }

      const text = await csvFile.text();
      const result = await processCSVData(text);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        tanks: 0,
        hydrants: 0,
        errors: [`Import failed: ${error}`],
        warnings: []
      });
    } finally {
      setLoading(false);
    }
  }, [processCSVData]);

  // Handle file input
  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const result = await processCSVData(text);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        tanks: 0,
        hydrants: 0,
        errors: [`Import failed: ${error}`],
        warnings: []
      });
    } finally {
      setLoading(false);
    }
  }, [processCSVData]);

  // Load test scenario
  const loadTestScenario = useCallback(async (scenario: typeof TEST_SCENARIOS[0]) => {
    setLoading(true);
    try {
      // In a real implementation, we'd fetch the CSV file
      // For now, we'll create mock data based on the scenario
      let csvText = 'Name,Type,Latitude,Longitude,Capacity_Gallons,Flow_Rate_GPM,Static_Pressure_PSI,Access_Rating,Operational_Status,Owner,Notes\n';
      
      // Generate sample data based on scenario
      const baseCoords = { lat: 39.8283, lng: -98.5795 }; // Center of US
      
      for (let i = 0; i < scenario.tanks; i++) {
        const lat = baseCoords.lat + (Math.random() - 0.5) * 0.1;
        const lng = baseCoords.lng + (Math.random() - 0.5) * 0.1;
        const capacity = [25000, 50000, 75000][Math.floor(Math.random() * 3)];
        csvText += `"${scenario.name} Tank ${i + 1}",tank,${lat},${lng},${capacity},,,"good","active","${scenario.name}","Test tank"\n`;
      }
      
      for (let i = 0; i < scenario.hydrants; i++) {
        const lat = baseCoords.lat + (Math.random() - 0.5) * 0.1;
        const lng = baseCoords.lng + (Math.random() - 0.5) * 0.1;
        const flowRate = [1000, 1200, 1500][Math.floor(Math.random() * 3)];
        const pressure = [50, 65, 80][Math.floor(Math.random() * 3)];
        csvText += `"${scenario.name} Hydrant ${i + 1}",hydrant,${lat},${lng},,${flowRate},${pressure},"excellent","active","City Water","Test hydrant"\n`;
      }

      const result = await processCSVData(csvText);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        tanks: 0,
        hydrants: 0,
        errors: [`Test scenario load failed: ${error}`],
        warnings: []
      });
    } finally {
      setLoading(false);
    }
  }, [processCSVData]);

  const handleClose = () => {
    setImportResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <UploadIcon />
          Water Supply Data Import
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {loading && (
          <Box mb={2}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Processing water supply data...
            </Typography>
          </Box>
        )}

        {importResult && (
          <Alert 
            severity={importResult.errors.length > 0 ? "error" : "success"} 
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2">
              Import Complete: {importResult.tanks} tanks, {importResult.hydrants} hydrants added
            </Typography>
            {importResult.errors.length > 0 && (
              <List dense>
                {importResult.errors.map((error, i) => (
                  <ListItem key={i}>
                    <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
                    <ListItemText primary={error} />
                  </ListItem>
                ))}
              </List>
            )}
            {importResult.warnings.length > 0 && (
              <List dense>
                {importResult.warnings.map((warning, i) => (
                  <ListItem key={i}>
                    <ListItemIcon><ErrorIcon color="warning" /></ListItemIcon>
                    <ListItemText primary={warning} />
                  </ListItem>
                ))}
              </List>
            )}
          </Alert>
        )}

        {/* CSV Upload Area */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Upload CSV File</Typography>
            <Box
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              sx={{
                border: 2,
                borderColor: dragOver ? 'primary.main' : 'grey.300',
                borderStyle: 'dashed',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                bgcolor: dragOver ? 'primary.50' : 'grey.50',
                cursor: 'pointer'
              }}
            >
              <UploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                Drag and drop your CSV file here, or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports: Name, Type, Latitude, Longitude, Capacity, Flow Rate, Pressure
              </Typography>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                style={{ display: 'none' }}
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="contained" component="span" sx={{ mt: 2 }}>
                  Browse Files
                </Button>
              </label>
            </Box>
          </CardContent>
        </Card>

        {/* Test Scenarios */}
        <Typography variant="h6" gutterBottom>
          Quick Test Scenarios
        </Typography>
        <Grid container spacing={2}>
          {TEST_SCENARIOS.map((scenario) => (
            <Grid size={{ xs: 12, md: 4 }} key={scenario.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {scenario.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {scenario.description}
                  </Typography>
                  <Box display="flex" gap={1} mb={1}>
                    <Chip 
                      icon={<TankIcon />} 
                      label={`${scenario.tanks} Tanks`} 
                      size="small" 
                      color="primary"
                    />
                    <Chip 
                      icon={<HydrantIcon />} 
                      label={`${scenario.hydrants} Hydrants`} 
                      size="small" 
                      color="secondary"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {scenario.preview}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => loadTestScenario(scenario)}
                    disabled={loading}
                    startIcon={<DownloadIcon />}
                  >
                    Load Test Data
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WaterSupplyImporter;