/**
 * Layout Toolbox Component
 * 
 * Left panel of the layout designer containing:
 * - Draggable layout elements
 * - Professional template selection
 * - Page setup controls
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Divider
} from '@mui/material';
import {
  Map as MapIcon,
  Title as TitleIcon,
  List as LegendIcon,
  North as NorthIcon,
  StraightenSharp as ScaleIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Crop32 as ShapeIcon
} from '@mui/icons-material';

import { updateLayoutSettings, applyLayoutTemplate, addLayoutElement } from '@/state/redux/fireMapProSlice/index';
import { ExportConfiguration, LayoutElementType, LayoutTemplate } from '@/types/export';
import { RootState } from '@/state/redux/store';

interface LayoutToolboxProps {
  configuration: ExportConfiguration;
  disabled?: boolean;
}

const LayoutToolbox: React.FC<LayoutToolboxProps> = ({ 
  configuration, 
  disabled = false 
}) => {
  const dispatch = useDispatch();
  
  // Get Basic tab configuration for title/subtitle text
  const basicConfig = useSelector((state: RootState) => 
    state.fireMapPro.export.configuration.basic
  );

  // Layout elements that can be dragged to canvas
  const layoutElements = [
    { type: 'map' as LayoutElementType, label: 'Map Frame', icon: <MapIcon /> },
    { type: 'title' as LayoutElementType, label: 'Title', icon: <TitleIcon /> },
    { type: 'subtitle' as LayoutElementType, label: 'Subtitle', icon: <TextIcon /> },
    { type: 'legend' as LayoutElementType, label: 'Legend', icon: <LegendIcon /> },
    { type: 'north-arrow' as LayoutElementType, label: 'North Arrow', icon: <NorthIcon /> },
    { type: 'scale-bar' as LayoutElementType, label: 'Scale Bar', icon: <ScaleIcon /> },
    { type: 'text' as LayoutElementType, label: 'Text Box', icon: <TextIcon /> },
    { type: 'image' as LayoutElementType, label: 'Image', icon: <ImageIcon /> },
    { type: 'shape' as LayoutElementType, label: 'Shape', icon: <ShapeIcon /> }
  ];

  // Professional templates
  const templates = [
    { 
      id: 'standard' as LayoutTemplate, 
      name: 'Standard',
      description: 'Basic layout with map and legend'
    },
    { 
      id: 'professional' as LayoutTemplate, 
      name: 'Professional',
      description: 'Corporate layout with sidebar'
    },
    { 
      id: 'presentation' as LayoutTemplate, 
      name: 'Presentation',
      description: 'Landscape format for slides'
    },
    { 
      id: 'tactical' as LayoutTemplate, 
      name: 'Tactical',
      description: 'Emergency response layout'
    }
  ];

  const handleDragStart = (event: React.DragEvent, elementType: LayoutElementType) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'layout-element',
      elementType
    }));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const applyTemplate = (templateId: LayoutTemplate) => {
    if (disabled) return;
    
    console.log('[LayoutToolbox] Template clicked:', templateId);
    console.log('[LayoutToolbox] Basic config:', basicConfig);

    // Define template layouts
    const templateLayouts = {
      standard: [
        {
          type: 'map' as LayoutElementType,
          x: 5, y: 18, width: 90, height: 62, zIndex: 1, visible: true
        },
        {
          type: 'title' as LayoutElementType,
          x: 5, y: 5, width: 90, height: 6, zIndex: 2, visible: true,
          content: { 
            text: basicConfig.title || 'Map Title', 
            fontSize: 18, 
            textAlign: 'center' as const 
          }
        },
        {
          type: 'subtitle' as LayoutElementType,
          x: 5, y: 12, width: 90, height: 4, zIndex: 3, visible: true,
          content: { 
            text: basicConfig.subtitle || 'Map Subtitle', 
            fontSize: 14, 
            textAlign: 'center' as const 
          }
        },
        {
          type: 'legend' as LayoutElementType,
          x: 5, y: 82, width: 45, height: 15, zIndex: 4, visible: true
        },
        {
          type: 'scale-bar' as LayoutElementType,
          x: 60, y: 85, width: 25, height: 5, zIndex: 5, visible: true
        },
        {
          type: 'north-arrow' as LayoutElementType,
          x: 85, y: 85, width: 8, height: 10, zIndex: 6, visible: true
        }
      ],
      professional: [
        {
          type: 'map' as LayoutElementType,
          x: 5, y: 18, width: 65, height: 67, zIndex: 1, visible: true
        },
        {
          type: 'title' as LayoutElementType,
          x: 5, y: 5, width: 90, height: 6, zIndex: 2, visible: true,
          content: { 
            text: basicConfig.title || 'Professional Map', 
            fontSize: 18, 
            textAlign: 'center' as const 
          }
        },
        {
          type: 'subtitle' as LayoutElementType,
          x: 5, y: 12, width: 90, height: 4, zIndex: 3, visible: true,
          content: { 
            text: basicConfig.subtitle || 'Department Map', 
            fontSize: 14, 
            textAlign: 'center' as const 
          }
        },
        {
          type: 'legend' as LayoutElementType,
          x: 72, y: 18, width: 23, height: 37, zIndex: 4, visible: true
        },
        {
          type: 'text' as LayoutElementType,
          x: 72, y: 58, width: 23, height: 15, zIndex: 5, visible: true,
          content: { text: 'Notes and comments about the map', fontSize: 10 }
        },
        {
          type: 'scale-bar' as LayoutElementType,
          x: 5, y: 87, width: 25, height: 5, zIndex: 6, visible: true
        },
        {
          type: 'north-arrow' as LayoutElementType,
          x: 35, y: 85, width: 8, height: 10, zIndex: 7, visible: true
        }
      ],
      presentation: [
        {
          type: 'map' as LayoutElementType,
          x: 5, y: 20, width: 90, height: 65, zIndex: 1, visible: true
        },
        {
          type: 'title' as LayoutElementType,
          x: 5, y: 5, width: 90, height: 10, zIndex: 2, visible: true,
          content: { 
            text: basicConfig.title || 'Presentation Map', 
            fontSize: 20, 
            textAlign: 'center' as const 
          }
        },
        {
          type: 'legend' as LayoutElementType,
          x: 5, y: 87, width: 40, height: 10, zIndex: 3, visible: true
        },
        {
          type: 'scale-bar' as LayoutElementType,
          x: 50, y: 90, width: 25, height: 5, zIndex: 4, visible: true
        },
        {
          type: 'north-arrow' as LayoutElementType,
          x: 85, y: 87, width: 10, height: 10, zIndex: 5, visible: true
        }
      ],
      tactical: [
        {
          type: 'map' as LayoutElementType,
          x: 10, y: 10, width: 80, height: 80, zIndex: 1, visible: true
        },
        {
          type: 'title' as LayoutElementType,
          x: 10, y: 2, width: 80, height: 6, zIndex: 2, visible: true,
          content: { 
            text: basicConfig.title || 'TACTICAL MAP', 
            fontSize: 16, 
            textAlign: 'center' as const 
          }
        },
        {
          type: 'north-arrow' as LayoutElementType,
          x: 92, y: 10, width: 6, height: 8, zIndex: 3, visible: true
        },
        {
          type: 'scale-bar' as LayoutElementType,
          x: 10, y: 92, width: 30, height: 4, zIndex: 4, visible: true
        }
      ]
    };

    const elements = templateLayouts[templateId].map((element, index) => ({
      ...element,
      id: `${element.type}-${Date.now()}-${index}`
    }));

    dispatch(applyLayoutTemplate(templateId));
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Elements Section */}
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        Elements
      </Typography>
      
      <Grid container spacing={1} sx={{ mb: 3 }}>
        {layoutElements.map(element => (
          <Grid item xs={6} key={element.type}>
            <Paper
              sx={{
                p: 1,
                textAlign: 'center',
                cursor: disabled ? 'default' : 'grab',
                border: 1,
                borderColor: 'divider',
                transition: 'all 0.2s',
                opacity: disabled ? 0.5 : 1,
                '&:hover': disabled ? {} : {
                  bgcolor: 'action.hover',
                  transform: 'translateY(-2px)',
                  boxShadow: 1
                },
                '&:active': disabled ? {} : {
                  cursor: 'grabbing',
                  opacity: 0.7
                }
              }}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, element.type)}
            >
              <Box sx={{ color: 'primary.main', mb: 0.5 }}>
                {element.icon}
              </Box>
              <Typography variant="caption" display="block">
                {element.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Templates Section */}
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
        Templates
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {templates.map(template => (
          <Paper
            key={template.id}
            sx={{
              p: 1.5,
              cursor: disabled ? 'default' : 'pointer',
              border: 1,
              borderColor: configuration.layout.selectedTemplate === template.id 
                ? 'primary.main' 
                : 'divider',
              bgcolor: configuration.layout.selectedTemplate === template.id 
                ? 'primary.50' 
                : 'background.paper',
              transition: 'all 0.2s',
              opacity: disabled ? 0.5 : 1,
              '&:hover': disabled ? {} : {
                bgcolor: configuration.layout.selectedTemplate === template.id 
                  ? 'primary.100' 
                  : 'action.hover',
                transform: 'translateY(-1px)',
                boxShadow: 1
              }
            }}
            onClick={() => applyTemplate(template.id)}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {template.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {template.description}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Help Text */}
      <Box sx={{ mt: 3, p: 1, bgcolor: 'info.50', borderRadius: 1 }}>
        <Typography variant="caption" color="info.main">
          💡 Drag elements to the canvas or click a template to get started.
        </Typography>
      </Box>
    </Box>
  );
};

export default LayoutToolbox;