import React, { useState } from 'react';
import { Container, Paper, Typography, Tabs, Tab } from '@mui/material';
import App from './App';
import IntegrationTest from './IntegrationTest';

const AppWithIntegrationTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          FireEMS Tools
        </Typography>
        
        <Typography variant="body1" paragraph>
          This application includes the complete Data Formatter and Response Time Analyzer tools.
          You can switch between the regular app view and the integration test view using the tabs below.
        </Typography>
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Data Formatter" />
          <Tab label="Integration Test" />
        </Tabs>
      </Paper>
      
      {activeTab === 0 && <App />}
      {activeTab === 1 && <IntegrationTest />}
    </Container>
  );
};

export default AppWithIntegrationTest;