import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { RootState } from '@/state/redux/store';
import { setSelectedIncidentId } from '@/state/redux/analyzerSlice';
import { calculateIncidentMetrics, formatResponseTime } from '@/utils/responseTimeCalculator';

// Utility functions to format date and time display
const formatDateOnly = (dateTimeString: string | undefined): string => {
  if (!dateTimeString) return 'N/A';
  try {
    // Handle MM/DD/YYYY HH:MM:SS format
    const parts = dateTimeString.split(' ');
    if (parts.length >= 1) {
      return parts[0]; // Return just the date part (MM/DD/YYYY)
    }
    return dateTimeString;
  } catch (error) {
    return dateTimeString;
  }
};

const formatTimeOnly = (dateTimeString: string | undefined): string => {
  if (!dateTimeString) return 'N/A';
  try {
    // Handle MM/DD/YYYY HH:MM:SS format
    const parts = dateTimeString.split(' ');
    if (parts.length >= 2) {
      return parts[1]; // Return just the time part (HH:MM:SS)
    }
    return dateTimeString;
  } catch (error) {
    return dateTimeString;
  }
};

// Type for sort order
type Order = 'asc' | 'desc';

// Type for table columns
interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string;
}

// Define table columns
const columns: Column[] = [
  { id: 'incidentId', label: 'Incident ID', minWidth: 120 },
  { id: 'incidentDate', label: 'Incident Date', minWidth: 110 },
  { id: 'incidentTime', label: 'Time', minWidth: 80 },
  { id: 'incidentType', label: 'Type', minWidth: 120 },
  { 
    id: 'dispatchTime', 
    label: 'Dispatch Time',
    align: 'right',
    minWidth: 100,
    format: (value: number | null) => value === null ? 'N/A' : formatResponseTime(value)
  },
  { 
    id: 'turnoutTime', 
    label: 'Turnout Time',
    align: 'right',
    minWidth: 100,
    format: (value: number | null) => value === null ? 'N/A' : formatResponseTime(value)
  },
  { 
    id: 'travelTime', 
    label: 'Travel Time',
    align: 'right',
    minWidth: 100,
    format: (value: number | null) => value === null ? 'N/A' : formatResponseTime(value)
  },
  { 
    id: 'totalResponseTime', 
    label: 'Total Response Time',
    align: 'right',
    minWidth: 150,
    format: (value: number | null) => value === null ? 'N/A' : formatResponseTime(value)
  },
  { id: 'respondingUnit', label: 'Unit', minWidth: 80 },
  { id: 'address', label: 'Location', minWidth: 200 }
];

// Main component
const IncidentTable: React.FC = () => {
  const dispatch = useDispatch();
  const { incidents } = useSelector((state: RootState) => state.analyzer.rawData);
  const { responseTimeStats } = useSelector((state: RootState) => state.analyzer.calculatedMetrics);
  const selectedIncidentId = useSelector((state: RootState) => state.analyzer.ui.selectedIncidentId);
  
  // Local state for table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<string>('incidentDate');
  const [order, setOrder] = useState<Order>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Calculate response times for each incident
  const incidentsWithMetrics = useMemo(() => {
    return incidents.map(incident => {
      const metrics = calculateIncidentMetrics(incident);
      return {
        ...incident,
        ...metrics
      };
    });
  }, [incidents]);
  
  // Filter incidents based on search term
  const filteredIncidents = useMemo(() => {
    if (!searchTerm) return incidentsWithMetrics;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return incidentsWithMetrics.filter(incident => {
      return (
        (incident.incidentId && incident.incidentId.toLowerCase().includes(lowercaseSearch)) ||
        (incident.incidentType && (typeof incident.incidentType === 'string' ? incident.incidentType : String(incident.incidentType)).toLowerCase().includes(lowercaseSearch)) ||
        (incident.respondingUnit && incident.respondingUnit.toLowerCase().includes(lowercaseSearch)) ||
        (incident.address && incident.address.toLowerCase().includes(lowercaseSearch))
      );
    });
  }, [incidentsWithMetrics, searchTerm]);
  
  // Sort the filtered incidents
  const sortedIncidents = useMemo(() => {
    if (!filteredIncidents.length) return [];
    
    return [...filteredIncidents].sort((a, b) => {
      const aValue = a[orderBy as keyof typeof a];
      const bValue = b[orderBy as keyof typeof b];
      
      // Handle null and undefined values
      if ((aValue === null || aValue === undefined) && (bValue === null || bValue === undefined)) return 0;
      if (aValue === null || aValue === undefined) return order === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return order === 'asc' ? 1 : -1;
      
      // Compare values based on sort order
      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });
  }, [filteredIncidents, orderBy, order]);
  
  // Get current page of incidents
  const currentPageIncidents = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedIncidents.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedIncidents, page, rowsPerPage]);
  
  // Handle sort request
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Handle incident selection
  const handleSelectIncident = (incidentId: string) => {
    dispatch(setSelectedIncidentId(incidentId === selectedIncidentId ? null : incidentId));
  };
  
  // Function to determine response time status
  const getResponseTimeStatus = (responseTime: number | null) => {
    if (responseTime === null || !responseTimeStats) return 'unknown';
    
    const ninetiethPercentile = responseTimeStats.ninetiethPercentile.totalResponseTime || 0;
    const mean = responseTimeStats.mean.totalResponseTime || 0;
    
    if (responseTime > ninetiethPercentile) return 'slow';
    if (responseTime < mean) return 'fast';
    return 'average';
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Incident Data
          <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
            ({filteredIncidents.length} incidents)
          </Typography>
        </Typography>
        
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search incidents..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ width: 250 }}
        />
      </Box>
      
      <Paper variant="outlined">
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map(column => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell style={{ minWidth: 50 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPageIncidents.map(incident => {
                const responseTimeStatus = getResponseTimeStatus(incident.totalResponseTime);
                
                return (
                  <TableRow
                    hover
                    key={incident.incidentId}
                    selected={incident.incidentId === selectedIncidentId}
                    onClick={() => handleSelectIncident(incident.incidentId)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{incident.incidentId}</TableCell>
                    <TableCell>{formatDateOnly(incident.incidentDate || incident.incidentTime)}</TableCell>
                    <TableCell>{formatTimeOnly(incident.incidentTime || incident.incidentDate)}</TableCell>
                    <TableCell>
                      {incident.incidentType ? (
                        <Chip
                          size="small"
                          label={incident.incidentType}
                          color={
                            incident.incidentType.toLowerCase().includes('fire') ? 'error' :
                            incident.incidentType.toLowerCase().includes('ems') ? 'primary' :
                            'default'
                          }
                          variant="outlined"
                        />
                      ) : (
                        'Unknown'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {columns[4].format ? columns[4].format(incident.dispatchTime) : incident.dispatchTime || 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {columns[5].format ? columns[5].format(incident.turnoutTime) : incident.turnoutTime || 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {columns[6].format ? columns[6].format(incident.travelTime) : incident.travelTime || 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {responseTimeStatus === 'fast' && (
                          <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                        )}
                        {responseTimeStatus === 'average' && (
                          <InfoIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                        )}
                        {responseTimeStatus === 'slow' && (
                          <WarningIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                        )}
                        {columns[7].format ? columns[7].format(incident.totalResponseTime) : incident.totalResponseTime || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>{incident.respondingUnit || 'N/A'}</TableCell>
                    <TableCell>
                      {incident.address && incident.address !== 'N/A' ? (
                        <Box>
                          <Typography variant="body2">{incident.address}</Typography>
                          {(incident.city || incident.state) && (
                            <Typography variant="caption" color="text.secondary">
                              {incident.city}{incident.city && incident.state ? ', ' : ''}{incident.state}
                            </Typography>
                          )}
                          {(incident.latitude && incident.longitude) && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                            </Typography>
                          )}
                        </Box>
                      ) : (incident.latitude && incident.longitude) ? (
                        <Typography variant="caption" color="text.secondary">
                          {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No location data</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectIncident(incident.incidentId);
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {currentPageIncidents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center">
                    {filteredIncidents.length === 0 && searchTerm ? (
                      <Typography variant="body2" sx={{ py: 2 }}>
                        No matching incidents found for "{searchTerm}". Try a different search term.
                      </Typography>
                    ) : incidents.length === 0 ? (
                      <Typography variant="body2" sx={{ py: 2 }}>
                        No incident data available. Please load incident data.
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ py: 2 }}>
                        No incidents to display.
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredIncidents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          * Response time status indicators: 
          <CheckCircleIcon fontSize="small" color="success" sx={{ ml: 1, mr: 0.5, verticalAlign: 'middle' }} />
          Fast (below average),
          <InfoIcon fontSize="small" color="primary" sx={{ ml: 1, mr: 0.5, verticalAlign: 'middle' }} />
          Average (within normal range),
          <WarningIcon fontSize="small" color="error" sx={{ ml: 1, mr: 0.5, verticalAlign: 'middle' }} />
          Slow (above 90th percentile)
        </Typography>
      </Box>
    </Box>
  );
};

export default IncidentTable;