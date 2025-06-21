import { useEffect } from 'react';
import { MappingTemplate } from '@/components/formatter/FieldMapping/FieldMappingContainer';

/**
 * Custom hook to synchronize mapping templates with localStorage and server
 * @param template The current template to sync
 * @param dirty Whether the template has unsaved changes
 * @returns Object with methods for template operations
 */
const useTemplateSync = (template: MappingTemplate, dirty: boolean) => {
  // Sync to localStorage whenever template changes and is dirty
  useEffect(() => {
    if (!dirty) return;
    
    try {
      // Save to localStorage for crash recovery
      localStorage.setItem(`tmpl:${template.id}`, JSON.stringify(template));
      console.log(`Template "${template.name}" saved to localStorage`);
    } catch (error) {
      console.error('Failed to save template to localStorage:', error);
    }
  }, [template, dirty]);
  
  /**
   * Load templates from localStorage
   */
  const loadTemplates = (): MappingTemplate[] => {
    try {
      // Get all localStorage keys
      const keys = Object.keys(localStorage);
      // Filter for template keys
      const templateKeys = keys.filter(key => key.startsWith('tmpl:'));
      // Load each template
      const templates = templateKeys.map(key => {
        const templateJson = localStorage.getItem(key);
        return templateJson ? JSON.parse(templateJson) as MappingTemplate : null;
      }).filter(Boolean) as MappingTemplate[];
      
      // Sort by last modified date (newest first)
      return templates.sort((a, b) => b.lastModified - a.lastModified);
    } catch (error) {
      console.error('Failed to load templates from localStorage:', error);
      return [];
    }
  };
  
  /**
   * Delete a template from localStorage
   */
  const deleteTemplate = (templateId: string) => {
    try {
      localStorage.removeItem(`tmpl:${templateId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  };
  
  /**
   * Save template to server (API)
   * In a real app, this would make an API call
   */
  const saveToServer = async () => {
    // This is a placeholder for a real API call
    // In a real app, this would POST the template to a server endpoint
    console.log('Saving template to server:', template);
    
    // Simulate API call with a delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Template saved to server successfully');
        resolve();
      }, 500);
    });
  };
  
  /**
   * Load templates from server
   * In a real app, this would make an API call
   */
  const loadFromServer = async (): Promise<MappingTemplate[]> => {
    // This is a placeholder for a real API call
    // In a real app, this would GET templates from a server endpoint
    
    // For now, just return the local templates
    return loadTemplates();
  };
  
  return {
    loadTemplates,
    deleteTemplate,
    saveToServer,
    loadFromServer
  };
};

export default useTemplateSync;