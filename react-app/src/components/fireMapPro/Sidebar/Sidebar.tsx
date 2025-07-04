/**
 * Sidebar Component
 * 
 * Main sidebar containing all tool panels and controls.
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Layers as LayersIcon,
  Edit as DrawingIcon,
  Palette as IconsIcon,
  FileDownload as ExportIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

import { selectUIState, setActivePanel } from '@/state/redux/fireMapProSlice';
import LayerManager from './LayerManager';
import DrawingTools from './DrawingTools';
import IconLibrary from './IconLibrary';
import ExportPanel from './ExportPanel';
import SettingsPanel from './SettingsPanel';

interface SidebarProps {
  mode: 'create' | 'edit' | 'view';
}

const Sidebar: React.FC<SidebarProps> = ({ mode }) => {
  const dispatch = useDispatch();
  const uiState = useSelector(selectUIState);

  const tabs = [
    { id: 'layers', label: 'Layers', icon: <LayersIcon />, component: LayerManager },
    { id: 'drawing', label: 'Drawing', icon: <DrawingIcon />, component: DrawingTools, disabled: mode === 'view' },
    { id: 'icons', label: 'Icons', icon: <IconsIcon />, component: IconLibrary, disabled: mode === 'view' },
    { id: 'export', label: 'Export', icon: <ExportIcon />, component: ExportPanel },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon />, component: SettingsPanel }
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    dispatch(setActivePanel(newValue as any));
  };

  const activeTab = tabs.find(tab => tab.id === uiState.activePanel) || tabs[0];
  const ActiveComponent = activeTab.component;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tab Navigation */}
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={uiState.activePanel || 'layers'}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          orientation="horizontal"
          sx={{
            minHeight: 48,
            '& .MuiTab-root': {
              minWidth: 60,
              minHeight: 48
            }
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              icon={tab.icon}
              label={tab.label}
              disabled={tab.disabled}
              sx={{
                fontSize: '0.75rem',
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Active Panel Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <ActiveComponent />
      </Box>
    </Box>
  );
};

export default Sidebar;