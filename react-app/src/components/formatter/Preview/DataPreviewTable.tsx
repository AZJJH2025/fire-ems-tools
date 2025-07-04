import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  InputAdornment,
  IconButton,
  GlobalStyles
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { ValidationError } from '@/types/formatter';

interface DataPreviewTableProps {
  data: Record<string, any>[];
  validationErrors: ValidationError[];
  highlightedCell?: { rowIndex: number; field: string } | null;
}

const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ data, validationErrors, highlightedCell }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterField, setFilterField] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-navigate to highlighted cell's page
  useEffect(() => {
    if (highlightedCell) {
      const targetPage = Math.floor(highlightedCell.rowIndex / rowsPerPage);
      if (targetPage !== page) {
        setPage(targetPage);
      }
    }
  }, [highlightedCell, rowsPerPage, page]);

  // Get all columns from the data
  const columns = data.length > 0 
    ? Object.keys(data[0])
    : [];

  // Create a map of errors by row index and field
  const errorMap: Record<number, Record<string, ValidationError[]>> = {};
  validationErrors.forEach(error => {
    if (error.rowIndex !== undefined) {
      if (!errorMap[error.rowIndex]) {
        errorMap[error.rowIndex] = {};
      }
      if (!errorMap[error.rowIndex][error.field]) {
        errorMap[error.rowIndex][error.field] = [];
      }
      errorMap[error.rowIndex][error.field].push(error);
    }
  });

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle filtering
  const handleFilterFieldChange = (event: SelectChangeEvent) => {
    setFilterField(event.target.value);
    setPage(0);
  };

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  // Filter the data based on the search term and filter field
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    
    // If a specific field is selected for filtering
    if (filterField) {
      const value = row[filterField];
      return value !== undefined && 
             String(value).toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // If no specific field is selected, search all fields
    return Object.values(row).some(value => 
      value !== undefined && 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Apply pagination
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Check if there is any data
  if (data.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          No data available for preview
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <GlobalStyles
        styles={{
          '@keyframes pulse': {
            '0%': {
              opacity: 0.7,
            },
            '100%': {
              opacity: 1,
            },
          },
        }}
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={handleSearchTermChange}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={clearSearch} edge="end" size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="filter-field-label">Filter Field</InputLabel>
          <Select
            labelId="filter-field-label"
            id="filter-field"
            value={filterField}
            label="Filter Field"
            onChange={handleFilterFieldChange}
          >
            <MenuItem value="">All Fields</MenuItem>
            {columns.map(column => (
              <MenuItem key={column} value={column}>{column}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader aria-label="data preview table">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                {columns.map(column => (
                  <TableCell key={column}>
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, rowIndex) => {
                const actualRowIndex = page * rowsPerPage + rowIndex;
                const rowHasErrors = errorMap[actualRowIndex];
                
                return (
                  <TableRow 
                    key={rowIndex}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: rowHasErrors ? '#fff8f8' : 'inherit'
                    }}
                  >
                    <TableCell>{actualRowIndex + 1}</TableCell>
                    {columns.map(column => {
                      const cellErrors = rowHasErrors?.[column] || [];
                      const cellHasErrors = cellErrors.length > 0;
                      const isHighlighted = highlightedCell && 
                                           highlightedCell.rowIndex === actualRowIndex && 
                                           highlightedCell.field === column;
                      
                      return (
                        <TableCell 
                          key={column}
                          sx={{ 
                            backgroundColor: isHighlighted 
                              ? '#fff3e0' // Orange highlight for focused cell
                              : cellHasErrors 
                                ? '#ffebee' // Pink for error cells
                                : 'inherit',
                            position: 'relative',
                            border: isHighlighted ? '2px solid #ff9800' : 'inherit',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {row[column] !== undefined ? String(row[column]) : ''}
                          {cellHasErrors && (
                            <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                              <Chip 
                                color="error" 
                                size="small" 
                                label={cellErrors.length} 
                                sx={{ height: 16, fontSize: '0.6rem' }}
                              />
                            </Box>
                          )}
                          {isHighlighted && (
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%',
                                border: '2px solid #ff9800',
                                borderRadius: '4px',
                                pointerEvents: 'none',
                                animation: 'pulse 1s ease-in-out infinite alternate'
                              }}
                            />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default DataPreviewTable;