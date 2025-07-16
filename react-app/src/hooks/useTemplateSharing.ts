/**
 * Hook for managing template sharing functionality
 * Provides convenient methods for sharing templates between departments
 */

import { useState, useEffect } from 'react';
import { FieldMappingTemplate } from '@/types/formatter';
import { TemplateSharingService, ShareableTemplate, TemplateExportData } from '@/services/templateSharingService';

export interface TemplateShareState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export interface UseTemplateSharingReturn {
  // State
  shareState: TemplateShareState;
  communityTemplates: ShareableTemplate[];
  
  // Export/Import actions
  exportTemplates: (templateIds: string[], departmentName: string, includePrivate?: boolean) => Promise<Blob>;
  importTemplates: (data: TemplateExportData, options?: any) => Promise<{ imported: FieldMappingTemplate[]; skipped: FieldMappingTemplate[]; conflicts: FieldMappingTemplate[] }>;
  
  // Sharing actions
  generateShareLink: (templateIds: string[], departmentName: string) => Promise<string>;
  parseShareLink: (url: string) => TemplateExportData | null;
  
  // Community actions
  loadCommunityTemplates: () => Promise<void>;
  submitToCommunity: (template: FieldMappingTemplate, departmentName: string, contactEmail?: string) => Promise<ShareableTemplate>;
  downloadCommunityTemplate: (shareableTemplate: ShareableTemplate) => Promise<boolean>;
  reviewTemplate: (templateId: string, rating: number, comment: string, departmentName: string) => Promise<boolean>;
  searchCommunityTemplates: (query: string, filters?: any) => ShareableTemplate[];
  
  // Utility actions
  clearState: () => void;
}

export const useTemplateSharing = (
  onTemplateImported?: (templates: FieldMappingTemplate[]) => void
): UseTemplateSharingReturn => {
  const [shareState, setShareState] = useState<TemplateShareState>({
    loading: false,
    error: null,
    success: null
  });

  const [communityTemplates, setCommunityTemplates] = useState<ShareableTemplate[]>([]);

  const clearState = () => {
    setShareState({
      loading: false,
      error: null,
      success: null
    });
  };

  const setLoading = (loading: boolean) => {
    setShareState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string) => {
    setShareState(prev => ({ ...prev, error, loading: false }));
  };

  const setSuccess = (success: string) => {
    setShareState(prev => ({ ...prev, success, loading: false }));
  };

  const exportTemplates = async (
    templateIds: string[],
    departmentName: string,
    includePrivate: boolean = false
  ): Promise<Blob> => {
    setLoading(true);
    try {
      const exportData = TemplateSharingService.exportTemplates(templateIds, departmentName, includePrivate);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      
      setSuccess(`Successfully exported ${templateIds.length} templates`);
      return blob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export templates';
      setError(errorMessage);
      throw error;
    }
  };

  const importTemplates = async (
    data: TemplateExportData,
    options: any = {}
  ): Promise<{ imported: FieldMappingTemplate[]; skipped: FieldMappingTemplate[]; conflicts: FieldMappingTemplate[] }> => {
    setLoading(true);
    try {
      const result = TemplateSharingService.importTemplates(data, options);
      
      if (result.imported.length > 0) {
        setSuccess(`Successfully imported ${result.imported.length} templates`);
        if (onTemplateImported) {
          onTemplateImported(result.imported);
        }
      }

      if (result.conflicts.length > 0) {
        setError(`${result.conflicts.length} templates had name conflicts`);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import templates';
      setError(errorMessage);
      throw error;
    }
  };

  const generateShareLink = async (templateIds: string[], departmentName: string): Promise<string> => {
    setLoading(true);
    try {
      const shareLink = TemplateSharingService.generateShareLink(templateIds, departmentName);
      setSuccess('Share link generated successfully');
      return shareLink;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate share link';
      setError(errorMessage);
      throw error;
    }
  };

  const parseShareLink = (url: string): TemplateExportData | null => {
    try {
      const result = TemplateSharingService.parseShareLink(url);
      if (result) {
        setSuccess('Share link parsed successfully');
      } else {
        setError('Invalid share link format');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse share link';
      setError(errorMessage);
      return null;
    }
  };

  const loadCommunityTemplates = async (): Promise<void> => {
    setLoading(true);
    try {
      const templates = TemplateSharingService.getCommunityTemplates();
      setCommunityTemplates(templates);
      setSuccess(`Loaded ${templates.length} community templates`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load community templates';
      setError(errorMessage);
    }
  };

  const submitToCommunity = async (
    template: FieldMappingTemplate,
    departmentName: string,
    contactEmail?: string
  ): Promise<ShareableTemplate> => {
    setLoading(true);
    try {
      const shareableTemplate = TemplateSharingService.submitToCommunity(template, departmentName, contactEmail);
      setCommunityTemplates(prev => [...prev, shareableTemplate]);
      setSuccess(`Template "${template.name}" submitted to community`);
      return shareableTemplate;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit template to community';
      setError(errorMessage);
      throw error;
    }
  };

  const downloadCommunityTemplate = async (shareableTemplate: ShareableTemplate): Promise<boolean> => {
    setLoading(true);
    try {
      const exportData: TemplateExportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: shareableTemplate.sharedBy.departmentName,
        templates: [shareableTemplate.template],
        metadata: {
          totalTemplates: 1,
          averageQuality: shareableTemplate.template.metadata?.qualityScore || 0,
          cadVendors: shareableTemplate.template.cadVendor ? [shareableTemplate.template.cadVendor] : [],
          tools: [shareableTemplate.template.targetTool]
        }
      };

      const result = await importTemplates(exportData, { overwriteExisting: false });
      
      if (result.imported.length > 0) {
        // Update download count
        shareableTemplate.shareMetadata.downloadCount++;
        setCommunityTemplates(prev => [...prev]);
        setSuccess(`Downloaded template "${shareableTemplate.template.name}"`);
        return true;
      } else {
        setError('Template name conflicts with existing template');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download template';
      setError(errorMessage);
      return false;
    }
  };

  const reviewTemplate = async (
    templateId: string,
    rating: number,
    comment: string,
    departmentName: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const success = TemplateSharingService.reviewTemplate(templateId, rating, comment, departmentName);
      
      if (success) {
        // Refresh community templates to show updated review
        await loadCommunityTemplates();
        setSuccess('Review submitted successfully');
      } else {
        setError('Failed to submit review');
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit review';
      setError(errorMessage);
      return false;
    }
  };

  const searchCommunityTemplates = (query: string, filters: any = {}): ShareableTemplate[] => {
    try {
      const results = TemplateSharingService.searchCommunityTemplates(query, filters);
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search templates';
      setError(errorMessage);
      return [];
    }
  };

  // Auto-load community templates on hook initialization
  useEffect(() => {
    loadCommunityTemplates().catch(console.error);
  }, []);

  return {
    shareState,
    communityTemplates,
    exportTemplates,
    importTemplates,
    generateShareLink,
    parseShareLink,
    loadCommunityTemplates,
    submitToCommunity,
    downloadCommunityTemplate,
    reviewTemplate,
    searchCommunityTemplates,
    clearState
  };
};

export default useTemplateSharing;