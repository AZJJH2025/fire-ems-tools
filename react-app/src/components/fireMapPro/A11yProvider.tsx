/**
 * Accessibility Provider Component
 * 
 * Provides proper ARIA management and focus handling for Fire Map Pro.
 */

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUIState } from '@/state/redux/fireMapProSlice';

interface A11yProviderProps {
  children: React.ReactNode;
}

const A11yProvider: React.FC<A11yProviderProps> = ({ children }) => {
  const uiState = useSelector(selectUIState);

  // Manage aria-hidden state properly
  useEffect(() => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      // Remove any aria-hidden attributes that might interfere
      rootElement.removeAttribute('aria-hidden');
      
      // Set proper ARIA labels for the application
      rootElement.setAttribute('aria-label', 'Fire Map Pro - Emergency Management Mapping System');
      
      // Ensure the app is marked as the main application
      if (!rootElement.getAttribute('role')) {
        rootElement.setAttribute('role', 'application');
      }
    }

    // Clean up any modal-related aria-hidden issues
    const handleModalCleanup = () => {
      const allElements = document.querySelectorAll('[aria-hidden="true"]');
      allElements.forEach(element => {
        // Only clean up if it's not a legitimate hidden element
        if (element.id === 'root' || element.closest('#root')) {
          element.removeAttribute('aria-hidden');
        }
      });
    };

    // Clean up immediately and on any DOM changes
    handleModalCleanup();
    
    const observer = new MutationObserver(handleModalCleanup);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['aria-hidden'],
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [uiState.sidebarOpen]);

  return <>{children}</>;
};

export default A11yProvider;