import { useEffect } from 'react';
import { FieldFieldMappingTemplate, FieldMapping } from '@/types/formatter';

/**
 * Custom hook to synchronize mapping templates with localStorage and server
 * @param template The current template to sync
 * @param dirty Whether the template has unsaved changes
 * @returns Object with methods for template operations
 */
const useTemplateSync = (template: FieldMappingTemplate, dirty: boolean) => {
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
   * Load templates from localStorage with enhanced filtering and sorting
   */
  const loadTemplates = (toolId?: string): FieldMappingTemplate[] => {
    try {
      // Get all localStorage keys
      const keys = Object.keys(localStorage);
      // Filter for template keys
      const templateKeys = keys.filter(key => key.startsWith('tmpl:'));
      // Load each template
      let templates = templateKeys.map(key => {
        const templateJson = localStorage.getItem(key);
        return templateJson ? JSON.parse(templateJson) as FieldMappingTemplate : null;
      }).filter(Boolean) as FieldMappingTemplate[];
      
      // Filter by tool ID if specified
      if (toolId) {
        templates = templates.filter(t => t.targetTool === toolId);
      }
      
      // Sort by creation date (newest first)
      return templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
  const loadFromServer = async (): Promise<FieldMappingTemplate[]> => {
    // This is a placeholder for a real API call
    // In a real app, this would GET templates from a server endpoint
    
    // For now, just return the local templates
    return loadTemplates();
  };
  
  /**
   * Auto-save template with smart naming
   */
  const autoSaveTemplate = (mappings: FieldMapping[], toolId: string) => {
    if (!mappings || mappings.length === 0) return;
    
    const autoTemplate: FieldMappingTemplate = {
      id: `auto-${toolId}-${Date.now()}`,
      name: `Auto-saved ${toolId} mapping`,
      description: 'Automatically saved field mapping configuration',
      targetTool: toolId,
      fieldMappings: mappings,
      sourceFieldPattern: {
        fieldNames: mappings.map(m => m.sourceField),
        fieldCount: mappings.length,
        hasHeaderRow: true,
        commonPatterns: [],
        cadVendorSignature: ''
      },
      metadata: {
        qualityScore: 70,
        tags: ['auto-saved'],
        fieldAccuracy: 0.7,
        completeness: mappings.length > 0 ? 1.0 : 0.0,
        compatibility: { [toolId]: 1.0 },
        usage: {
          totalUses: 0,
          successRate: 0.0,
          lastUsed: undefined,
          averageProcessingTime: 0,
          errorRate: 0.0
        },
        validation: {
          isValid: mappings.length > 0,
          errors: [],
          warnings: [],
          lastValidated: new Date().toISOString()
        }
      },
      createdAt: new Date().toISOString(),
      useCount: 0,
      isPublic: false
    };
    
    try {
      localStorage.setItem(`tmpl:${autoTemplate.id}`, JSON.stringify(autoTemplate));
      console.log('Template auto-saved:', autoTemplate.name);
    } catch (error) {
      console.error('Failed to auto-save template:', error);
    }
  };
  
  /**
   * Get template statistics
   */
  const getTemplateStats = () => {
    const templates = loadTemplates();
    const stats = {
      total: templates.length,
      byTool: {} as Record<string, number>,
      mostRecent: templates[0] ? new Date(templates[0].createdAt).getTime() : 0,
      totalMappings: templates.reduce((sum, t) => sum + (t.fieldMappings?.length || 0), 0)
    };
    
    templates.forEach(template => {
      const toolId = template.targetTool || 'unknown';
      stats.byTool[toolId] = (stats.byTool[toolId] || 0) + 1;
    });
    
    return stats;
  };
  
  /**
   * Find similar templates based on field patterns
   */
  const findSimilarTemplates = (currentMappings: FieldMapping[], toolId?: string): FieldMappingTemplate[] => {
    if (!currentMappings || currentMappings.length === 0) return [];
    
    const templates = loadTemplates(toolId);
    const currentSourceFields = new Set(currentMappings.map(m => m.sourceField.toLowerCase()));
    
    return templates
      .map(template => {
        const templateSourceFields = new Set(template.fieldMappings.map(m => m.sourceField.toLowerCase()));
        const intersection = new Set([...currentSourceFields].filter(x => templateSourceFields.has(x)));
        const similarity = intersection.size / Math.max(currentSourceFields.size, templateSourceFields.size);
        return { template, similarity };
      })
      .filter(({ similarity }) => similarity > 0.3) // 30% similarity threshold
      .sort((a, b) => b.similarity - a.similarity)
      .map(({ template }) => template);
  };
  
  /**
   * Clean up old auto-saved templates (keep only last 5)
   */
  const cleanupAutoSaved = () => {
    try {
      const templates = loadTemplates();
      const autoSaved = templates
        .filter(t => t.name.startsWith('Auto-saved'))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Delete old auto-saved templates (keep only 5 most recent)
      autoSaved.slice(5).forEach(template => {
        deleteTemplate(template.id);
      });
    } catch (error) {
      console.error('Failed to cleanup auto-saved templates:', error);
    }
  };
  
  return {
    loadTemplates,
    deleteTemplate,
    saveToServer,
    loadFromServer,
    autoSaveTemplate,
    getTemplateStats,
    findSimilarTemplates,
    cleanupAutoSaved
  };
};

export default useTemplateSync;