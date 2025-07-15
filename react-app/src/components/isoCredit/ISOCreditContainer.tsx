/**
 * ISO Credit Calculator Container
 * 
 * Provides comprehensive ISO Fire Suppression Rating Schedule (FSRS) analysis
 * for fire departments. Helps calculate current ISO classification (1-10 scale),
 * identify improvement opportunities, and quantify community insurance savings.
 */

import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Menu as MenuIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Save as SaveIcon,
  FileDownload as ExportIcon,
  Security as ISOIcon,
  Assessment as ScoreIcon,
  TrendingUp as ImprovementIcon
} from '@mui/icons-material';

// Import Fire Map Pro components for reuse
import A11yProvider from '../fireMapPro/A11yProvider';

// Import ISO Credit Calculator specific components
import ISOSidebar from './ISOSidebar';
import ISOScoreCalculator from './ISOScoreCalculator';
import ISOImprovementPlanner from './ISOImprovementPlanner';
import ISOReportGenerator from './ISOReportGenerator';

const SIDEBAR_WIDTH = 320;

interface ISOCreditContainerProps {
  initialAssessment?: any;
  onAssessmentComplete?: (assessment: any) => void;
  mode?: 'assessment' | 'planning' | 'presentation';
}

const ISOCreditContainer: React.FC<ISOCreditContainerProps> = ({
  initialAssessment,
  onAssessmentComplete,
  mode = 'assessment'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // UI state for sidebar management (leveraging Fire Map Pro pattern)
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [showReportGenerator, setShowReportGenerator] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);
  
  // Mock state - will be replaced with Redux in next step
  const [currentAssessment, setCurrentAssessment] = React.useState(null);
  const [currentScore, setCurrentScore] = React.useState(0);
  const [classification, setClassification] = React.useState(10);
  const [isLoading, _setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Community profile for cost-benefit analysis
  const [communityProfile] = React.useState({
    population: 25000,
    avgHomePremium: 1200,
    commercialPremiums: 500000
  });
  
  // Set browser tab title
  useEffect(() => {
    document.title = 'FireEMS ISO Credit Calculator';
  }, []);
  
  // Initialize with any provided data
  useEffect(() => {
    if (initialAssessment) {
      setCurrentAssessment(initialAssessment);
      console.log('Loading initial ISO assessment:', initialAssessment);
    }
  }, [initialAssessment]);

  // Handle assessment completion callback
  useEffect(() => {
    if (currentAssessment && onAssessmentComplete) {
      onAssessmentComplete(currentAssessment);
    }
  }, [currentAssessment, onAssessmentComplete]);

  // Handlers
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleToggleFullscreen = () => {
    setFullscreen(!fullscreen);
    
    if (!fullscreen) {
      // Enter fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSave = () => {
    // Save current ISO assessment
    const assessmentData = {
      assessment: currentAssessment,
      score: currentScore,
      classification: classification,
      timestamp: new Date()
    };
    
    localStorage.setItem('iso_credit_calculator_autosave', JSON.stringify(assessmentData));
    console.log('ISO assessment data saved');
  };

  const handleExport = () => {
    console.log('🏆 ISO EXPORT BUTTON CLICKED - Starting export process');
    
    // Check if we have assessment data
    const hasData = currentAssessment !== null;
    
    console.log('🏆 ISO EXPORT DATA CHECK:', {
      hasAssessment: hasData,
      currentScore: currentScore,
      classification: classification
    });
    
    if (!hasData) {
      console.log('🏆 NO ISO DATA - Showing alert');
      alert('No ISO assessment data to export. Please complete the assessment first.');
      return;
    }

    console.log('🏆 OPENING ISO REPORT GENERATOR - Setting state');
    // Open the professional report generator
    setShowReportGenerator(true);
    
    console.log('📊 Opening professional ISO credit report generator:', {
      score: currentScore,
      classification: classification,
      hasAssessment: !!currentAssessment,
      showReportGenerator: true
    });
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <A11yProvider>
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          bgcolor: 'background.default',
          position: fullscreen ? 'fixed' : 'relative',
          top: fullscreen ? 0 : 'auto',
          left: fullscreen ? 0 : 'auto',
          right: fullscreen ? 0 : 'auto',
          bottom: fullscreen ? 0 : 'auto',
          zIndex: fullscreen ? 1300 : 'auto',
        }}
        role="main"
        aria-label="ISO Credit Calculator Tool"
      >
        {/* App Bar */}
        {!fullscreen && (
          <AppBar
            position="fixed"
            sx={{
              zIndex: theme.zIndex.drawer + 1,
              bgcolor: 'primary.main',
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="toggle sidebar"
                onClick={handleToggleSidebar}
                edge="start"
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              
              <ISOIcon sx={{ mr: 1 }} />
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                ISO Credit Calculator
                {mode === 'planning' && ' - Planning Mode'}
                {mode === 'presentation' && ' - Presentation Mode'}
              </Typography>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  color="inherit"
                  onClick={handleSave}
                  title="Save Assessment"
                >
                  <SaveIcon />
                </IconButton>

                <IconButton
                  color="inherit"
                  onClick={handleExport}
                  title="Generate Professional ISO Report"
                  disabled={!currentAssessment}
                >
                  <ExportIcon />
                </IconButton>

                <IconButton
                  color="inherit"
                  onClick={handleToggleFullscreen}
                  title="Toggle Fullscreen"
                >
                  {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
        )}

        {/* Sidebar */}
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          anchor="left"
          open={sidebarOpen}
          onClose={handleToggleSidebar}
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              marginTop: fullscreen ? 0 : '56px',
              height: fullscreen ? '100vh' : 'calc(100vh - 56px)',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          ModalProps={{
            keepMounted: true,
            disablePortal: false,
            hideBackdrop: !isMobile,
            disableAutoFocus: true,
            disableEnforceFocus: true,
            disableRestoreFocus: true,
          }}
          PaperProps={{
            'aria-hidden': false,
            role: 'complementary',
            'aria-label': 'ISO Credit Calculator Tools',
          }}
        >
          <ISOSidebar 
            mode={mode}
            onAssessmentChange={setCurrentAssessment}
            onScoreChange={setCurrentScore}
            onClassificationChange={setClassification}
          />
        </Drawer>

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            position: 'relative',
            marginLeft: !isMobile && sidebarOpen ? `${SIDEBAR_WIDTH}px` : 0,
            width: !isMobile && sidebarOpen ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
            marginTop: fullscreen ? 0 : '56px',
            height: fullscreen ? '100vh' : 'calc(100vh - 56px)',
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Navigation Tabs */}
          <Paper
            elevation={1}
            sx={{
              borderRadius: 0,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              aria-label="ISO Credit Calculator Tabs"
              sx={{ px: 2 }}
            >
              <Tab 
                icon={<ScoreIcon />} 
                label="Score Calculator" 
                id="iso-tab-0"
                aria-controls="iso-tabpanel-0"
              />
              <Tab 
                icon={<ImprovementIcon />} 
                label="Improvement Planner" 
                id="iso-tab-1"
                aria-controls="iso-tabpanel-1"
                disabled={!currentAssessment}
              />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              position: 'relative',
            }}
          >
            {/* Score Calculator Tab */}
            {activeTab === 0 && (
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  width: '100%',
                  borderRadius: 0,
                  overflow: 'auto',
                  position: 'relative',
                  minHeight: '500px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                role="tabpanel"
                id="iso-tabpanel-0"
                aria-labelledby="iso-tab-0"
              >
                <ISOScoreCalculator 
                  assessment={currentAssessment}
                  currentScore={currentScore}
                  classification={classification}
                  sidebarOpen={sidebarOpen}
                  isMobile={isMobile}
                />
              </Paper>
            )}

            {/* Improvement Planner Tab */}
            {activeTab === 1 && (
              <Box
                sx={{
                  height: '100%',
                  overflow: 'auto',
                }}
                role="tabpanel"
                id="iso-tabpanel-1"
                aria-labelledby="iso-tab-1"
              >
                <ISOImprovementPlanner
                  assessment={currentAssessment}
                  currentScore={currentScore}
                  classification={classification}
                  communityProfile={communityProfile}
                />
              </Box>
            )}
          </Box>

          {/* Loading Overlay */}
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              <Typography variant="h6">Calculating ISO Score...</Typography>
            </Box>
          )}
        </Box>

        {/* Error Snackbar */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        {/* Professional Report Generator */}
        <ISOReportGenerator
          open={showReportGenerator}
          onClose={() => setShowReportGenerator(false)}
          assessment={currentAssessment}
          score={currentScore}
          classification={classification}
        />
      </Box>
    </A11yProvider>
  );
};

export default ISOCreditContainer;