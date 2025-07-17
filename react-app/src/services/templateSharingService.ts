/**
 * Template Sharing Service
 * Enables fire departments to share field mapping templates with each other
 * Supports import/export, community sharing, and collaborative template development
 */

import { FieldMappingTemplate } from '@/types/formatter';
import { TemplateService } from './templateService';

export interface ShareableTemplate {
  template: FieldMappingTemplate;
  sharedBy: {
    departmentName: string;
    contactEmail?: string;
    sharedAt: string;
  };
  shareMetadata: {
    downloadCount: number;
    rating: number;
    reviews: TemplateReview[];
    verified: boolean;
  };
}

export interface TemplateReview {
  id: string;
  departmentName: string;
  rating: number; // 1-5 stars
  comment: string;
  date: string;
  helpful: number; // Number of helpful votes
}

export interface TemplateExportData {
  version: string;
  exportedAt: string;
  exportedBy: string;
  templates: FieldMappingTemplate[];
  metadata: {
    totalTemplates: number;
    averageQuality: number;
    cadVendors: string[];
    tools: string[];
  };
}

export class TemplateSharingService {
  private static readonly EXPORT_VERSION = '1.0.0';
  private static readonly COMMUNITY_STORAGE_KEY = 'fireems_community_templates';
  // private static readonly SHARED_TEMPLATES_KEY = 'fireems_shared_templates'; // Reserved for future use

  /**
   * Export templates to shareable format
   */
  static exportTemplates(
    templateIds: string[], 
    departmentName: string,
    includePrivateData: boolean = false
  ): TemplateExportData {
    const allTemplates = TemplateService.getTemplates();
    const templatesToExport = allTemplates.filter(t => templateIds.includes(t.id));
    
    if (templatesToExport.length === 0) {
      throw new Error('No templates found to export');
    }

    // Clean templates for sharing (remove private data if requested)
    const cleanedTemplates = templatesToExport.map(template => ({
      ...template,
      // Remove private data unless explicitly included
      departmentName: includePrivateData ? template.departmentName : undefined,
      useCount: includePrivateData ? template.useCount : 0,
      lastUsed: undefined, // Never share usage timestamps
      // Reset ID for sharing to prevent conflicts
      id: `shared_${template.id}_${Date.now()}`,
      // Mark as shared template
      isPublic: true,
      metadata: {
        ...template.metadata,
        // Reset usage statistics for shared templates
        successRate: 100,
        // Add sharing metadata
        originalId: template.id,
        sharedBy: departmentName,
        sharedAt: new Date().toISOString()
      }
    }));

    const cadVendors = [...new Set(cleanedTemplates.map(t => t.cadVendor).filter(Boolean))] as string[];
    const tools = [...new Set(cleanedTemplates.map(t => t.targetTool).filter(Boolean))];
    const averageQuality = Math.round(
      cleanedTemplates.reduce((sum, t) => sum + (t.metadata?.qualityScore || 0), 0) / cleanedTemplates.length
    );

    const exportData: TemplateExportData = {
      version: this.EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      exportedBy: departmentName,
      templates: cleanedTemplates,
      metadata: {
        totalTemplates: cleanedTemplates.length,
        averageQuality,
        cadVendors,
        tools
      }
    };

    console.log(`📤 Exported ${cleanedTemplates.length} templates from ${departmentName}`);
    return exportData;
  }

  /**
   * Import templates from shareable format
   */
  static importTemplates(
    exportData: TemplateExportData,
    options: {
      overwriteExisting?: boolean;
      onlyHighQuality?: boolean;
      minimumQuality?: number;
    } = {}
  ): {
    imported: FieldMappingTemplate[];
    skipped: FieldMappingTemplate[];
    conflicts: FieldMappingTemplate[];
  } {
    const { overwriteExisting = false, onlyHighQuality = false, minimumQuality = 60 } = options;
    
    // Validate export data
    if (!exportData.version || !exportData.templates) {
      throw new Error('Invalid export data format');
    }

    if (exportData.version !== this.EXPORT_VERSION) {
      console.warn(`⚠️ Version mismatch: Expected ${this.EXPORT_VERSION}, got ${exportData.version}`);
    }

    const existingTemplates = TemplateService.getTemplates();
    const imported: FieldMappingTemplate[] = [];
    const skipped: FieldMappingTemplate[] = [];
    const conflicts: FieldMappingTemplate[] = [];

    for (const template of exportData.templates) {
      // Quality filter
      if (onlyHighQuality && (template.metadata?.qualityScore || 0) < minimumQuality) {
        skipped.push(template);
        continue;
      }

      // Check for name conflicts
      const existingTemplate = existingTemplates.find(t => t.name === template.name);
      if (existingTemplate) {
        if (overwriteExisting) {
          // Import with conflict resolution
          const resolvedTemplate = this.resolveTemplateConflict(template, existingTemplate);
          imported.push(resolvedTemplate);
        } else {
          conflicts.push(template);
          continue;
        }
      }

      // Import the template
      try {
        // Generate new ID to prevent conflicts
        const importedTemplate: FieldMappingTemplate = {
          ...template,
          id: this.generateImportId(template),
          // Mark as imported
          metadata: {
            ...template.metadata,
            tags: [...(template.metadata?.tags || []), 'imported']
          }
        };

        // Save to local storage
        const allTemplates = TemplateService.getTemplates();
        allTemplates.push(importedTemplate);
        localStorage.setItem('fireems_field_mapping_templates', JSON.stringify(allTemplates));

        imported.push(importedTemplate);
        console.log(`✅ Imported template: ${template.name}`);

      } catch (error) {
        console.error(`❌ Failed to import template ${template.name}:`, error);
        skipped.push(template);
      }
    }

    console.log(`📥 Import complete: ${imported.length} imported, ${skipped.length} skipped, ${conflicts.length} conflicts`);
    
    return { imported, skipped, conflicts };
  }

  /**
   * Generate shareable link for templates
   */
  static generateShareLink(templateIds: string[], departmentName: string): string {
    const exportData = this.exportTemplates(templateIds, departmentName, false);
    
    // Encode export data as base64 for URL sharing
    const encodedData = btoa(JSON.stringify(exportData));
    
    // Generate shareable URL (in real app, this would be a proper URL)
    const shareUrl = `${window.location.origin}/app/data-formatter?import=${encodedData}`;
    
    console.log(`🔗 Generated share link for ${templateIds.length} templates`);
    return shareUrl;
  }

  /**
   * Parse share link and extract templates
   */
  static parseShareLink(url: string): TemplateExportData | null {
    try {
      const urlObj = new URL(url);
      const importParam = urlObj.searchParams.get('import');
      
      if (!importParam) {
        return null;
      }

      const decodedData = atob(importParam);
      const exportData: TemplateExportData = JSON.parse(decodedData);
      
      console.log(`🔗 Parsed share link with ${exportData.templates.length} templates`);
      return exportData;
      
    } catch (error) {
      console.error('❌ Failed to parse share link:', error);
      return null;
    }
  }

  /**
   * Import templates from a share link parameter
   */
  static importFromShareLink(templateParam: string): { success: boolean; templates: FieldMappingTemplate[]; error?: string } {
    try {
      const decodedData = atob(templateParam);
      const exportData: TemplateExportData = JSON.parse(decodedData);
      
      const result = this.importTemplates(exportData, {
        overwriteExisting: false,
        onlyHighQuality: false,
        minimumQuality: 0
      });
      
      return {
        success: result.imported.length > 0,
        templates: result.imported,
        error: result.imported.length === 0 ? 'No templates could be imported' : undefined
      };
      
    } catch (error) {
      console.error('❌ Failed to import from share link:', error);
      return {
        success: false,
        templates: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get community templates (simulated - in real app would be from server)
   */
  static getCommunityTemplates(): ShareableTemplate[] {
    try {
      const stored = localStorage.getItem(this.COMMUNITY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load community templates:', error);
      return [];
    }
  }

  /**
   * Submit template to community (simulated)
   */
  static submitToCommunity(
    template: FieldMappingTemplate,
    departmentName: string,
    contactEmail?: string
  ): ShareableTemplate {
    const shareableTemplate: ShareableTemplate = {
      template: {
        ...template,
        id: `community_${template.id}_${Date.now()}`,
        isPublic: true,
        metadata: {
          ...template.metadata,
          tags: [...(template.metadata?.tags || []), 'community', 'shared']
        }
      },
      sharedBy: {
        departmentName,
        contactEmail,
        sharedAt: new Date().toISOString()
      },
      shareMetadata: {
        downloadCount: 0,
        rating: 0,
        reviews: [],
        verified: false
      }
    };

    // Save to community templates
    const communityTemplates = this.getCommunityTemplates();
    communityTemplates.push(shareableTemplate);
    localStorage.setItem(this.COMMUNITY_STORAGE_KEY, JSON.stringify(communityTemplates));

    console.log(`🌐 Submitted template "${template.name}" to community`);
    return shareableTemplate;
  }

  /**
   * Rate and review a community template
   */
  static reviewTemplate(
    templateId: string,
    rating: number,
    comment: string,
    departmentName: string
  ): boolean {
    try {
      const communityTemplates = this.getCommunityTemplates();
      const template = communityTemplates.find(t => t.template.id === templateId);

      if (!template) {
        return false;
      }

      const review: TemplateReview = {
        id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        departmentName,
        rating: Math.max(1, Math.min(5, rating)),
        comment: comment.trim(),
        date: new Date().toISOString(),
        helpful: 0
      };

      template.shareMetadata.reviews.push(review);
      
      // Recalculate average rating
      const totalRating = template.shareMetadata.reviews.reduce((sum, r) => sum + r.rating, 0);
      template.shareMetadata.rating = totalRating / template.shareMetadata.reviews.length;

      // Save updated community templates
      localStorage.setItem(this.COMMUNITY_STORAGE_KEY, JSON.stringify(communityTemplates));

      console.log(`⭐ Added review for template "${template.template.name}": ${rating} stars`);
      return true;

    } catch (error) {
      console.error('❌ Failed to submit review:', error);
      return false;
    }
  }

  /**
   * Search community templates
   */
  static searchCommunityTemplates(query: string, filters: {
    cadVendor?: string;
    tool?: string;
    minRating?: number;
    verified?: boolean;
  } = {}): ShareableTemplate[] {
    const communityTemplates = this.getCommunityTemplates();
    
    return communityTemplates.filter(shareableTemplate => {
      const template = shareableTemplate.template;
      const metadata = shareableTemplate.shareMetadata;

      // Text search
      if (query) {
        const searchText = `${template.name} ${template.description} ${template.departmentName} ${template.metadata?.tags?.join(' ')}`.toLowerCase();
        if (!searchText.includes(query.toLowerCase())) {
          return false;
        }
      }

      // CAD vendor filter
      if (filters.cadVendor && template.cadVendor !== filters.cadVendor) {
        return false;
      }

      // Tool filter
      if (filters.tool && template.targetTool !== filters.tool) {
        return false;
      }

      // Rating filter
      if (filters.minRating && metadata.rating < filters.minRating) {
        return false;
      }

      // Verified filter
      if (filters.verified && !metadata.verified) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by rating, then by download count
      if (a.shareMetadata.rating !== b.shareMetadata.rating) {
        return b.shareMetadata.rating - a.shareMetadata.rating;
      }
      return b.shareMetadata.downloadCount - a.shareMetadata.downloadCount;
    });
  }

  // Private helper methods

  private static resolveTemplateConflict(
    newTemplate: FieldMappingTemplate,
    _existingTemplate: FieldMappingTemplate
  ): FieldMappingTemplate {
    // Create a merged template with conflict resolution
    return {
      ...newTemplate,
      id: this.generateImportId(newTemplate),
      name: `${newTemplate.name} (Imported)`,
      metadata: {
        ...newTemplate.metadata,
        tags: [...(newTemplate.metadata?.tags || []), 'imported', 'conflict-resolved']
      }
    };
  }

  private static generateImportId(template: FieldMappingTemplate): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `imported_${template.id}_${timestamp}_${random}`;
  }
}

export default TemplateSharingService;