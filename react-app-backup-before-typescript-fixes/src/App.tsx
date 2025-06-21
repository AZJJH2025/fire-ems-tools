import React from 'react';
import { Container, Paper, Stepper, Step, StepLabel, Typography, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from './state/redux/store';
import FileUpload from './components/formatter/FileUpload/FileUpload';
import FieldMappingContainer from './components/formatter/FieldMapping/FieldMappingContainer';
import PreviewValidationContainer from './components/formatter/Preview/PreviewValidationContainer';
import ExportContainer from './components/formatter/Export/ExportContainer';

const steps = ['Upload File', 'Map Fields', 'Preview & Validate', 'Export'];

const App: React.FC = () => {
  const { currentStep } = useSelector((state: RootState) => state.formatter);
  
  // Determine the app title based on current URL
  const getAppTitle = () => {
    const path = window.location.pathname;
    console.log('[DEBUG] Current pathname:', path);
    if (path.includes('fire-map-pro')) {
      console.log('[DEBUG] Detected fire-map-pro in path, setting title to Fire Map Pro');
      return 'FireEMS Fire Map Pro';
    }
    if (path.includes('response-time-analyzer')) {
      console.log('[DEBUG] Detected response-time-analyzer in path, setting title to Response Time Analyzer');
      return 'FireEMS Response Time Analyzer';
    }
    console.log('[DEBUG] Setting title to Data Formatter');
    return 'FireEMS Data Formatter';
  };

  // Set browser tab title dynamically
  React.useEffect(() => {
    const title = getAppTitle();
    console.log('[DEBUG] Setting document.title to:', title);
    document.title = title;
    console.log('[DEBUG] document.title is now:', document.title);
  }, []);


  // Render the current step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <FileUpload />;
      case 1:
        return <FieldMappingContainer />;
      case 2:
        return <PreviewValidationContainer />;
      case 3:
        return <ExportContainer />;
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {getAppTitle()}
        </Typography>
        
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 2 }}>
          {renderStepContent(currentStep)}
        </Box>
      </Paper>
    </Container>
  );
};

export default App;