import React, { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  IconButton,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

import { RootState } from '@/state/redux/store';
import {
  setDateRangeFilter,
  setIncidentTypesFilter,
  setUnitsFilter,
  setGeographicBoundsFilter,
  setTimeOfDayFilter,
  setPriorityFilter,
  resetFilters
} from '@/state/redux/analyzerSlice';
import { AnalyzerFilters, GeoBounds } from '@/types/analyzer';

// Incident Type selector component
const IncidentTypeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { incidents } = useSelector((state: RootState) => state.analyzer.rawData);
  const selectedTypes = useSelector((state: RootState) => state.analyzer.filters.incidentTypes);
  
  // Extract unique incident types from data
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    incidents.forEach(incident => {
      if (incident.incidentType) {
        types.add(incident.incidentType);
      }
    });
    return Array.from(types).sort();
  }, [incidents]);
  
  // Handle checkbox change
  const handleTypeChange = (type: string) => {
    const currentTypes = selectedTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    dispatch(setIncidentTypesFilter(newTypes.length > 0 ? newTypes : null));
  };
  
  // Clear all selections
  const handleClearAll = () => {
    dispatch(setIncidentTypesFilter(null));
  };
  
  // Select all incident types
  const handleSelectAll = () => {
    dispatch(setIncidentTypesFilter(availableTypes));
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2">Incident Types</Typography>
        <Box>
          <Button size="small" onClick={handleSelectAll}>Select All</Button>
          <Button size="small" onClick={handleClearAll}>Clear</Button>
        </Box>
      </Box>
      
      {availableTypes.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No incident types available in the data.
        </Typography>
      ) : (
        <FormGroup>
          <Grid container spacing={1}>
            {availableTypes.map(type => (
              <Grid item xs={6} key={type}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedTypes?.includes(type) || false}
                      onChange={() => handleTypeChange(type)}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">{type}</Typography>}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      )}
    </Box>
  );
};

// Unit selector component
const UnitSelector: React.FC = () => {
  const dispatch = useDispatch();
  const { incidents } = useSelector((state: RootState) => state.analyzer.rawData);
  const selectedUnits = useSelector((state: RootState) => state.analyzer.filters.units);
  
  // Extract unique units from data
  const availableUnits = useMemo(() => {
    const units = new Set<string>();
    incidents.forEach(incident => {
      if (incident.respondingUnit) {
        units.add(incident.respondingUnit);
      }
    });
    return Array.from(units).sort();
  }, [incidents]);
  
  // Handle checkbox change
  const handleUnitChange = (unit: string) => {
    const currentUnits = selectedUnits || [];
    const newUnits = currentUnits.includes(unit)
      ? currentUnits.filter(u => u !== unit)
      : [...currentUnits, unit];
    
    dispatch(setUnitsFilter(newUnits.length > 0 ? newUnits : null));
  };
  
  // Clear all selections
  const handleClearAll = () => {
    dispatch(setUnitsFilter(null));
  };
  
  // Select all units
  const handleSelectAll = () => {
    dispatch(setUnitsFilter(availableUnits));
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2">Responding Units</Typography>
        <Box>
          <Button size="small" onClick={handleSelectAll}>Select All</Button>
          <Button size="small" onClick={handleClearAll}>Clear</Button>
        </Box>
      </Box>
      
      {availableUnits.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No responding unit data available.
        </Typography>
      ) : (
        <FormGroup>
          <Grid container spacing={1}>
            {availableUnits.map(unit => (
              <Grid item xs={6} key={unit}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedUnits?.includes(unit) || false}
                      onChange={() => handleUnitChange(unit)}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">{unit}</Typography>}
                />
              </Grid>
            ))}
          </Grid>
        </FormGroup>
      )}
    </Box>
  );
};

// Date range selector component
const DateRangeSelector: React.FC = () => {
  const dispatch = useDispatch();
  const dateRange = useSelector((state: RootState) => state.analyzer.filters.dateRange);
  const { incidents } = useSelector((state: RootState) => state.analyzer.rawData);
  
  // Default date range (min and max dates from the data)
  const [dataDateRange, setDataDateRange] = useState<{min: Date | null, max: Date | null}>({
    min: null,
    max: null
  });
  
  // Find min and max dates in the data
  useEffect(() => {
    if (incidents.length > 0) {
      const dates = incidents
        .map(inc => inc.incidentDate)
        .filter(date => date)
        .map(date => new Date(date));
      
      if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        setDataDateRange({ min: minDate, max: maxDate });
      }
    }
  }, [incidents]);
  
  // Handle date change
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      const endDate = dateRange ? dateRange[1] : null;
      dispatch(setDateRangeFilter(endDate ? [date, endDate] : null));
    }
  };
  
  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      const startDate = dateRange ? dateRange[0] : null;
      dispatch(setDateRangeFilter(startDate ? [startDate, date] : null));
    }
  };
  
  // Clear date range
  const handleClearDates = () => {
    dispatch(setDateRangeFilter(null));
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2">Date Range</Typography>
          <Button size="small" onClick={handleClearDates}>Clear</Button>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <DatePicker
              label="Start Date"
              value={dateRange ? dateRange[0] : null}
              onChange={handleStartDateChange}
              minDate={dataDateRange.min}
              maxDate={dataDateRange.max}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  variant: 'outlined'
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePicker
              label="End Date"
              value={dateRange ? dateRange[1] : null}
              onChange={handleEndDateChange}
              minDate={dataDateRange.min}
              maxDate={dataDateRange.max}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  variant: 'outlined'
                }
              }}
            />
          </Grid>
        </Grid>
        
        {dataDateRange.min && dataDateRange.max && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Data range: {dataDateRange.min.toLocaleDateString()} to {dataDateRange.max.toLocaleDateString()}
          </Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
};

// Time of day selector component
const TimeOfDaySelector: React.FC = () => {
  const dispatch = useDispatch();
  const timeOfDay = useSelector((state: RootState) => state.analyzer.filters.timeOfDay);
  
  // Time periods
  const timePeriods = [
    { label: 'Morning (6AM-12PM)', value: [6, 12] },
    { label: 'Afternoon (12PM-6PM)', value: [12, 18] },
    { label: 'Evening (6PM-12AM)', value: [18, 24] },
    { label: 'Night (12AM-6AM)', value: [0, 6] }
  ];
  
  // Handle time period selection
  const handleTimeChange = (hours: [number, number]) => {
    const newTimeOfDay = timeOfDay && 
                        timeOfDay[0] === hours[0] && 
                        timeOfDay[1] === hours[1] 
                          ? null 
                          : hours;
    dispatch(setTimeOfDayFilter(newTimeOfDay));
  };
  
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Time of Day
      </Typography>
      
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {timePeriods.map((period) => (
          <Chip
            key={period.label}
            label={period.label}
            clickable
            onClick={() => handleTimeChange(period.value as [number, number])}
            color={timeOfDay && 
                  timeOfDay[0] === period.value[0] && 
                  timeOfDay[1] === period.value[1] 
                    ? 'primary' 
                    : 'default'}
            variant={timeOfDay && 
                    timeOfDay[0] === period.value[0] && 
                    timeOfDay[1] === period.value[1] 
                      ? 'filled' 
                      : 'outlined'}
          />
        ))}
      </Stack>
    </Box>
  );
};

// Main filter panel component
const FilterPanel: React.FC = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.analyzer.filters);
  const { incidents } = useSelector((state: RootState) => state.analyzer.rawData);
  
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateRange !== null ||
      filters.incidentTypes !== null ||
      filters.units !== null ||
      filters.geographicBounds !== null ||
      filters.timeOfDay !== null ||
      filters.priority !== null
    );
  }, [filters]);
  
  // Count filtered incidents
  const filteredCount = useMemo(() => {
    // If no filters are active, return all incidents
    if (!hasActiveFilters) return incidents.length;
    
    // Apply filters
    return incidents.filter(incident => {
      // Date range filter
      if (filters.dateRange) {
        const incidentDate = new Date(incident.incidentDate);
        const [startDate, endDate] = filters.dateRange;
        
        if (incidentDate < startDate || incidentDate > endDate) {
          return false;
        }
      }
      
      // Incident type filter
      if (filters.incidentTypes && incident.incidentType) {
        if (!filters.incidentTypes.includes(incident.incidentType)) {
          return false;
        }
      }
      
      // Unit filter
      if (filters.units && incident.respondingUnit) {
        if (!filters.units.includes(incident.respondingUnit)) {
          return false;
        }
      }
      
      // Time of day filter
      if (filters.timeOfDay && incident.incidentTime) {
        const timeStr = incident.incidentTime;
        const hour = parseInt(timeStr.split(':')[0], 10);
        
        if (hour < filters.timeOfDay[0] || hour >= filters.timeOfDay[1]) {
          return false;
        }
      }
      
      // Priority filter (not implemented in this example)
      if (filters.priority && incident.priority) {
        if (!filters.priority.includes(incident.priority)) {
          return false;
        }
      }
      
      return true;
    }).length;
  }, [incidents, filters, hasActiveFilters]);
  
  // Reset all filters
  const handleResetFilters = () => {
    dispatch(resetFilters());
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          <FilterListIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Filters
        </Typography>
        
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ClearIcon />}
          disabled={!hasActiveFilters}
          onClick={handleResetFilters}
        >
          Reset All
        </Button>
      </Box>
      
      {hasActiveFilters && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Showing {filteredCount} of {incidents.length} incidents after applying filters
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <DateRangeSelector />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <TimeOfDaySelector />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <IncidentTypeSelector />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <UnitSelector />
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Saved Filters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Saved filters feature coming soon
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default FilterPanel;