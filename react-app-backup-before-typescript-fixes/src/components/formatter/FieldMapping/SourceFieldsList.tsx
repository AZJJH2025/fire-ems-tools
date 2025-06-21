import React, { useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Chip,
  InputAdornment,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LinkIcon from '@mui/icons-material/Link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { FieldMapping } from '@/types/formatter';

interface SortableItemProps {
  id: string;
  isMapped: boolean;
  targetFields: string[];
  sampleValue?: any;
  dataType?: string;
}

// SIMPLIFIED: Remove dual dragging system complexity to fix duplicate text issues
const SortableItem: React.FC<SortableItemProps> = ({ id, isMapped, targetFields, sampleValue, dataType }) => {
  // FIXED: Use a simpler approach to avoid duplicate displays
  // We'll use only HTML5 drag and drop and skip dnd-kit for source items
  const style = {
    backgroundColor: isMapped ? '#f0f7ff' : undefined,
    border: isMapped ? '1px solid #90caf9' : '1px solid #e0e0e0',
    cursor: 'grab',
    padding: '8px 12px',
    borderRadius: '4px',
    marginBottom: '8px',
    position: 'relative' as const
  };
  
  // Handle HTML5 drag and drop
  const handleDragStart = (e: React.DragEvent) => {
    console.log("DRAG START on source field:", id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Debug check if data was set
    console.log("Verifying dataTransfer was set:", e.dataTransfer.types);
    
    // Add a drag ghost
    const dragIcon = document.createElement('div');
    dragIcon.className = 'drag-ghost';
    dragIcon.innerHTML = `<div style="padding: 10px; background: #1976d2; color: white; border-radius: 4px;">Dragging: ${id}</div>`;
    document.body.appendChild(dragIcon);
    e.dataTransfer.setDragImage(dragIcon, 20, 20);
    
    // Direct style modification for better visual feedback
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = '0.6';
    el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    
    // Remove the ghost element after drag is complete
    setTimeout(() => {
      document.body.removeChild(dragIcon);
    }, 0);
    
    console.log('Drag started with field:', id);
  };
  
  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    // Restore original styles
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = '';
    el.style.boxShadow = '';
    
    console.log('Drag ended for field:', id);
  };

  return (
    <div 
      style={style} 
      data-field-id={id}
      className="draggable-source-field"
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body2" fontWeight="medium">{id}</Typography>
          {isMapped && (
            <Chip
              size="small"
              icon={<LinkIcon fontSize="small" />}
              label={targetFields.length === 1 ? targetFields[0] : `${targetFields.length} fields`}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        {sampleValue !== undefined && (
          <Box
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontFamily: 'monospace',
                bgcolor: 'grey.100',
                px: 0.5,
                borderRadius: 0.5,
                maxWidth: '150px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {typeof sampleValue === 'object' ? JSON.stringify(sampleValue) : String(sampleValue)}
            </Typography>

            {dataType && (
              <Chip
                label={dataType}
                size="small"
                variant="outlined"
                sx={{
                  height: '16px',
                  fontSize: '0.65rem',
                  '& .MuiChip-label': {
                    px: 0.5,
                    py: 0
                  }
                }}
              />
            )}
          </Box>
        )}
      </Box>
    </div>
  );
};

interface SourceFieldsListProps {
  sourceColumns: string[];
  filter: string;
  setFilter: (filter: string) => void;
  mappings: FieldMapping[];
  sampleData?: Record<string, any>[];
}

const SourceFieldsList: React.FC<SourceFieldsListProps> = ({
  sourceColumns,
  filter,
  setFilter,
  mappings,
  sampleData = []
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter columns based on search term
  const filteredColumns = useMemo(() => {
    if (!filter) return sourceColumns;
    
    const lowerFilter = filter.toLowerCase();
    return sourceColumns.filter(column => 
      column.toLowerCase().includes(lowerFilter)
    );
  }, [sourceColumns, filter]);
  
  // Create a map of source fields to their mapped target fields
  const sourceFieldMappings = useMemo(() => {
    const result: Record<string, string[]> = {};
    
    mappings.forEach(mapping => {
      if (!result[mapping.sourceField]) {
        result[mapping.sourceField] = [];
      }
      result[mapping.sourceField].push(mapping.targetField);
    });
    
    return result;
  }, [mappings]);
  
  // Calculate the count of mapped fields
  const mappedFieldsCount = useMemo(() => {
    return Object.keys(sourceFieldMappings).length;
  }, [sourceFieldMappings]);

  // Extract sample values and data types from the first row of sample data
  const sampleValues = useMemo(() => {
    if (!sampleData || sampleData.length === 0) return {};

    const sampleRow = sampleData[0];
    const values: Record<string, any> = {};

    sourceColumns.forEach(column => {
      values[column] = sampleRow[column];
    });

    return values;
  }, [sampleData, sourceColumns]);

  // Determine data types for each field based on sample values
  const dataTypes = useMemo(() => {
    const types: Record<string, string> = {};

    Object.entries(sampleValues).forEach(([column, value]) => {
      if (value === undefined || value === null) {
        types[column] = 'Unknown';
        return;
      }

      // Check if it's a date
      if (typeof value === 'string') {
        // Simple date pattern check (can be enhanced for more formats)
        const datePatterns = [
          /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
          /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // MM/DD/YYYY or DD/MM/YYYY
          /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
        ];

        if (datePatterns.some(pattern => pattern.test(value))) {
          types[column] = 'Date';
          return;
        }

        // Simple time pattern check
        const timePatterns = [
          /^\d{1,2}:\d{2}(:\d{2})?$/, // HH:MM or HH:MM:SS
          /^\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)$/i, // HH:MM AM/PM
        ];

        if (timePatterns.some(pattern => pattern.test(value))) {
          types[column] = 'Time';
          return;
        }

        // Check if it's numeric despite being a string
        if (!isNaN(Number(value))) {
          types[column] = 'Number';
          return;
        }

        // Default to text for other strings
        types[column] = 'Text';
        return;
      }

      // Simple type checks for non-strings
      if (typeof value === 'number') {
        types[column] = 'Number';
      } else if (typeof value === 'boolean') {
        types[column] = 'Boolean';
      } else if (Array.isArray(value)) {
        types[column] = 'Array';
      } else if (typeof value === 'object') {
        types[column] = 'Object';
      } else {
        types[column] = typeof value;
      }
    });

    return types;
  }, [sampleValues]);

  return (
    <Paper
      sx={{
        height: '100%',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {/* Hide the original title as we now have it in the parent container */}
      {/*
      <Typography variant="h6" gutterBottom>
        Source Fields
      </Typography>
      */}

      <TextField
        size="small"
        placeholder="Search source fields..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredColumns.length} fields
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {mappedFieldsCount} mapped
        </Typography>
      </Box>

      <Box sx={{
        mb: 2,
        p: 1,
        bgcolor: 'rgba(25, 118, 210, 0.08)',
        borderRadius: 1,
        border: '1px dashed',
        borderColor: 'primary.main'
      }}>
        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
          Drag fields from here to the Target Fields panel
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          maxHeight: 'calc(100% - 180px)',
          scrollbarWidth: 'thin',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '8px',
          backgroundColor: '#fafafa',
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#2196f3',
            borderRadius: '4px',
            '&:hover': {
              background: '#1976d2',
            },
          },
        }}
      >
        {/* FIXED: Remove DndContext and SortableContext to simplify implementation */}
        {filteredColumns.map(column => (
          <SortableItem
            key={column}
            id={column}
            isMapped={!!sourceFieldMappings[column]}
            targetFields={sourceFieldMappings[column] || []}
            sampleValue={sampleValues[column]}
            dataType={dataTypes[column]}
          />
        ))}

        {filteredColumns.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No fields match your search
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SourceFieldsList;