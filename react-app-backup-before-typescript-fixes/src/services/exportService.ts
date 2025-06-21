/**
 * Export Service
 * 
 * Handles all map export functionality including:
 * - Raster image export (PNG, JPG, TIFF, WebP)
 * - Vector export (PDF, SVG, EPS)
 * - GIS export (GeoJSON, KML, GeoPDF)
 * - Layout template application
 * - Professional print features
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ExportConfiguration, LayoutElement } from '@/types/export';

export class ExportService {
  /**
   * Main export function that routes to appropriate format handler
   */
  static async exportMap(
    mapElement: HTMLElement, 
    configuration: ExportConfiguration,
    onProgress?: (progress: number, step: string) => void
  ): Promise<void> {
    console.error('[EMERGENCY DEBUG] ExportService.exportMap() STARTED');
    console.error('[EMERGENCY DEBUG] Configuration received:', configuration);
    
    const { basic, layout } = configuration;
    
    try {
      console.error('[EMERGENCY DEBUG] Starting export process...');
      onProgress?.(10, 'Preparing export...');
      
      // Validate configuration
      if (!mapElement) {
        throw new Error('Map element not found');
      }

      onProgress?.(20, 'Capturing map data...');
      
      // Route to appropriate export method
      console.error('[EMERGENCY DEBUG] Routing to format:', basic.format);
      switch (basic.format) {
        case 'png':
        case 'jpg':
        case 'tiff':
        case 'webp':
          console.error('[EMERGENCY DEBUG] Calling exportRasterImage');
          await this.exportRasterImage(mapElement, configuration, onProgress);
          console.error('[EMERGENCY DEBUG] exportRasterImage completed');
          break;
        case 'pdf':
          await this.exportPDF(mapElement, configuration, onProgress);
          break;
        case 'svg':
          await this.exportSVG(mapElement, configuration, onProgress);
          break;
        case 'eps':
          await this.exportEPS(mapElement, configuration, onProgress);
          break;
        case 'geojson':
        case 'kml':
        case 'geopdf':
          await this.exportGISFormat(mapElement, configuration, onProgress);
          break;
        default:
          throw new Error(`Export format ${basic.format} not supported`);
      }
      
      onProgress?.(100, 'Export completed successfully');
      
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Export raster image formats (PNG, JPG, TIFF, WebP)
   */
  private static async exportRasterImage(
    mapElement: HTMLElement,
    configuration: ExportConfiguration,
    onProgress?: (progress: number, step: string) => void
  ): Promise<void> {
    console.error('[EMERGENCY DEBUG] exportRasterImage() STARTED');
    const { basic, layout } = configuration;
    console.error('[EMERGENCY DEBUG] Basic config:', basic);
    console.error('[EMERGENCY DEBUG] Layout config:', layout);
    
    onProgress?.(30, 'Capturing map screenshot...');
    
    console.error('[EMERGENCY DEBUG] About to capture map with html2canvas');
    console.error('[EMERGENCY DEBUG] Map element:', mapElement);
    console.error('[EMERGENCY DEBUG] Map element dimensions:', {
      width: mapElement.offsetWidth,
      height: mapElement.offsetHeight,
      innerHTML: mapElement.innerHTML.substring(0, 200) + '...'
    });
    
    // Capture map with html2canvas
    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      allowTaint: true,
      scale: basic.dpi / 96,
      backgroundColor: '#ffffff'
    });
    
    console.error('[EMERGENCY DEBUG] html2canvas completed, canvas size:', {
      width: canvas.width,
      height: canvas.height
    });
    
    console.error('[EMERGENCY DEBUG] html2canvas completed - canvas ready for layout');

    onProgress?.(60, 'Processing layout elements...');
    
    // Debug layout configuration
    console.log('[Export] Full export configuration:', {
      basic: configuration.basic,
      layout: {
        customLayout: layout.customLayout,
        selectedTemplate: layout.selectedTemplate,
        elementsCount: layout.elements.length,
        elements: layout.elements
      }
    });
    
    // Apply layout if using Layout Designer
    let finalCanvas = canvas;
    if (layout.customLayout && (layout.selectedTemplate || layout.elements.length > 0)) {
      console.log('[Export] Applying custom layout with', layout.elements.length, 'elements');
      console.error('[EMERGENCY DEBUG] About to call applyLayoutTemplate');
      try {
        finalCanvas = await this.applyLayoutTemplate(canvas, configuration);
        console.error('[EMERGENCY DEBUG] applyLayoutTemplate completed successfully');
        console.error('[EMERGENCY DEBUG] Returned final canvas dimensions:', finalCanvas.width, 'x', finalCanvas.height);
        
        console.error('[EMERGENCY DEBUG] Layout template applied successfully');
      } catch (error) {
        console.error('[EMERGENCY DEBUG] applyLayoutTemplate FAILED:', error);
        throw error;
      }
    } else {
      console.log('[Export] Using basic layout - no custom elements');
    }

    onProgress?.(80, 'Generating final image...');
    
    // Convert to desired format and download
    const format = basic.format === 'jpg' ? 'jpeg' : basic.format;
    const quality = basic.format === 'jpg' ? 0.9 : undefined;
    
    console.error('[EMERGENCY DEBUG] Final canvas before conversion:', {
      canvasSize: { width: finalCanvas.width, height: finalCanvas.height },
      format,
      quality
    });
    
    console.error('[EMERGENCY DEBUG] Ready to convert canvas to blob');
    
    finalCanvas.toBlob((blob) => {
      console.error('[EMERGENCY DEBUG] toBlob callback executed, blob size:', blob?.size);
      if (blob) {
        console.error('[EMERGENCY DEBUG] Downloading blob with filename:', `${basic.title || 'fire-map'}.${basic.format}`);
        this.downloadBlob(blob, `${basic.title || 'fire-map'}.${basic.format}`);
      } else {
        console.error('[EMERGENCY DEBUG] toBlob failed - blob is null!');
      }
    }, `image/${format}`, quality);
  }

  /**
   * Export PDF format
   */
  private static async exportPDF(
    mapElement: HTMLElement,
    configuration: ExportConfiguration,
    onProgress?: (progress: number, step: string) => void
  ): Promise<void> {
    const { basic, advanced, layout } = configuration;
    
    onProgress?.(30, 'Capturing map for PDF...');
    
    // Capture map
    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      allowTaint: true,
      scale: basic.dpi / 96
    });

    onProgress?.(50, 'Creating PDF document...');
    
    // Calculate PDF dimensions
    const { width, height } = this.getPaperDimensions(basic.paperSize, basic.orientation);
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: basic.orientation,
      unit: 'mm',
      format: basic.paperSize === 'custom' 
        ? [advanced.customWidth, advanced.customHeight]
        : basic.paperSize
    });

    onProgress?.(70, 'Adding elements to PDF...');
    
    // Add map image to PDF
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = width - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

    // Add title if specified
    if (basic.includeTitle && basic.title) {
      pdf.setFontSize(16);
      pdf.text(basic.title, width / 2, imgHeight + 25, { align: 'center' });
    }

    // Add subtitle if specified
    if (basic.subtitle) {
      pdf.setFontSize(12);
      pdf.text(basic.subtitle, width / 2, imgHeight + 35, { align: 'center' });
    }

    // Apply layout elements if using Layout Designer
    if (layout.customLayout && layout.elements.length > 0) {
      await this.addLayoutElementsToPDF(pdf, layout.elements, { width, height });
    }

    onProgress?.(90, 'Finalizing PDF...');
    
    // Download PDF
    pdf.save(`${basic.title || 'fire-map'}.pdf`);
  }

  /**
   * Export SVG format
   */
  private static async exportSVG(
    _mapElement: HTMLElement,
    _configuration: ExportConfiguration,
    onProgress?: (progress: number, step: string) => void
  ): Promise<void> {
    onProgress?.(50, 'Generating SVG...');
    
    // SVG export implementation would go here
    // For now, throw an error indicating it's not implemented
    throw new Error('SVG export is not yet implemented. Please use PNG or PDF format.');
  }

  /**
   * Export EPS format
   */
  private static async exportEPS(
    _mapElement: HTMLElement,
    _configuration: ExportConfiguration,
    _onProgress?: (progress: number, step: string) => void
  ): Promise<void> {
    throw new Error('EPS export is not yet implemented. Please use PNG or PDF format.');
  }

  /**
   * Export GIS formats (GeoJSON, KML, GeoPDF)
   */
  private static async exportGISFormat(
    _mapElement: HTMLElement,
    _configuration: ExportConfiguration,
    _onProgress?: (progress: number, step: string) => void
  ): Promise<void> {
    throw new Error('GIS format export is not yet implemented. Please use PNG or PDF format.');
  }

  /**
   * Apply layout template to canvas
   */
  private static async applyLayoutTemplate(
    mapCanvas: HTMLCanvasElement,
    configuration: ExportConfiguration
  ): Promise<HTMLCanvasElement> {
    console.error('[EMERGENCY DEBUG] applyLayoutTemplate ENTRY');
    const { basic, layout } = configuration;
    console.error('[EMERGENCY DEBUG] Getting paper dimensions for:', basic.paperSize, basic.orientation);
    const { width, height } = this.getPaperDimensions(basic.paperSize, basic.orientation);
    console.error('[EMERGENCY DEBUG] Paper dimensions:', { width, height });
    
    // Create layout canvas with willReadFrequently for better performance
    const layoutCanvas = document.createElement('canvas');
    const ctx = layoutCanvas.getContext('2d', { willReadFrequently: true })!;
    
    // Set canvas size (convert mm to pixels at specified DPI)
    const pixelWidth = (width / 25.4) * basic.dpi;
    const pixelHeight = (height / 25.4) * basic.dpi;
    layoutCanvas.width = pixelWidth;
    layoutCanvas.height = pixelHeight;
    
    console.error('[EMERGENCY DEBUG] Layout canvas dimensions:', layoutCanvas.width, 'x', layoutCanvas.height);
    console.error('[EMERGENCY DEBUG] Map canvas dimensions:', mapCanvas.width, 'x', mapCanvas.height);
    
    console.error('[EMERGENCY DEBUG] Layout canvas setup complete');
    
    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pixelWidth, pixelHeight);
    
    console.error('[EMERGENCY DEBUG] Layout canvas created:', {
      pixelSize: { width: pixelWidth, height: pixelHeight },
      paperSize: { width, height },
      dpi: basic.dpi,
      mapCanvasSize: { width: mapCanvas.width, height: mapCanvas.height }
    });
    
    // Apply template-specific layout
    console.log('[Export] Applying layout template:', layout.selectedTemplate);
    
    switch (layout.selectedTemplate) {
      case 'standard':
        console.log('[Export] Using standard template with custom layout');
        await this.applyCustomLayout(ctx, mapCanvas, configuration, pixelWidth, pixelHeight);
        break;
      case 'professional':
        console.log('[Export] Using professional template');
        await this.applyProfessionalTemplate(ctx, mapCanvas, configuration, pixelWidth, pixelHeight);
        break;
      case 'presentation':
        console.log('[Export] Using presentation template');
        await this.applyPresentationTemplate(ctx, mapCanvas, configuration, pixelWidth, pixelHeight);
        break;
      case 'tactical':
        console.log('[Export] Using tactical template');
        await this.applyTacticalTemplate(ctx, mapCanvas, configuration, pixelWidth, pixelHeight);
        break;
      default:
        console.log('[Export] Using custom layout with elements');
        // Custom layout using layout.elements
        await this.applyCustomLayout(ctx, mapCanvas, configuration, pixelWidth, pixelHeight);
    }
    
    console.error('[EMERGENCY DEBUG] Layout canvas complete - returning to caller');
    
    return layoutCanvas;
  }

  /**
   * Apply standard template layout
   */
  private static async applyStandardTemplate(
    ctx: CanvasRenderingContext2D,
    mapCanvas: HTMLCanvasElement,
    configuration: ExportConfiguration,
    width: number,
    height: number
  ): Promise<void> {
    const { basic } = configuration;
    const margin = width * 0.05; // 5% margin
    
    // Department logo (top-left corner)
    if (basic.logo) {
      await this.drawLogo(ctx, basic.logo, margin, margin, width * 0.15, width * 0.1);
    }
    
    // Title area (top 15%)
    let titleY = margin * 2;
    if (basic.includeTitle && basic.title) {
      ctx.fillStyle = '#333333';
      ctx.font = `bold ${width * 0.03}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(basic.title, width / 2, titleY);
      titleY += width * 0.035; // Add spacing after title
    }
    
    // Subtitle (below title)
    if (basic.subtitle) {
      ctx.fillStyle = '#666666';
      ctx.font = `${width * 0.02}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(basic.subtitle, width / 2, titleY);
    }
    
    // Map area (70% of height)
    const mapTop = height * 0.15;
    const mapHeight = height * 0.7;
    const mapWidth = width - (margin * 2);
    
    // Scale and draw map
    const scale = Math.min(mapWidth / mapCanvas.width, mapHeight / mapCanvas.height);
    const scaledWidth = mapCanvas.width * scale;
    const scaledHeight = mapCanvas.height * scale;
    const mapX = (width - scaledWidth) / 2;
    const mapY = mapTop + (mapHeight - scaledHeight) / 2;
    
    ctx.drawImage(mapCanvas, mapX, mapY, scaledWidth, scaledHeight);
    
    // Legend area (bottom 15%)
    if (basic.includeLegend) {
      const legendY = height * 0.85;
      ctx.fillStyle = '#666666';
      ctx.font = `${width * 0.015}px Arial`;
      ctx.textAlign = 'left';
      ctx.fillText('Legend', margin, legendY + margin);
    }
  }

  /**
   * Apply professional template layout
   */
  private static async applyProfessionalTemplate(
    ctx: CanvasRenderingContext2D,
    mapCanvas: HTMLCanvasElement,
    configuration: ExportConfiguration,
    width: number,
    height: number
  ): Promise<void> {
    // Professional template should use custom layout with defined elements
    console.log('[Export] Professional template using custom layout logic');
    await this.applyCustomLayout(ctx, mapCanvas, configuration, width, height);
  }

  /**
   * Apply presentation template layout
   */
  private static async applyPresentationTemplate(
    ctx: CanvasRenderingContext2D,
    mapCanvas: HTMLCanvasElement,
    configuration: ExportConfiguration,
    width: number,
    height: number
  ): Promise<void> {
    // Presentation template should use custom layout with defined elements
    console.log('[Export] Presentation template using custom layout logic');
    await this.applyCustomLayout(ctx, mapCanvas, configuration, width, height);
  }

  /**
   * Apply tactical template layout
   */
  private static async applyTacticalTemplate(
    ctx: CanvasRenderingContext2D,
    mapCanvas: HTMLCanvasElement,
    configuration: ExportConfiguration,
    width: number,
    height: number
  ): Promise<void> {
    // Tactical template should use custom layout with defined elements
    console.log('[Export] Tactical template using custom layout logic');
    await this.applyCustomLayout(ctx, mapCanvas, configuration, width, height);
  }

  /**
   * Apply custom layout using layout elements
   */
  private static async applyCustomLayout(
    ctx: CanvasRenderingContext2D,
    mapCanvas: HTMLCanvasElement,
    configuration: ExportConfiguration,
    canvasWidth: number,
    canvasHeight: number
  ): Promise<void> {
    console.error('[EMERGENCY DEBUG] applyCustomLayout ENTRY POINT');
    console.error('[EMERGENCY DEBUG] Canvas size:', { width: canvasWidth, height: canvasHeight });
    const { layout, basic } = configuration;
    console.error('[EMERGENCY DEBUG] Configuration received:', { layout, basic });
    console.log('[Export] Layout data:', {
      elementsCount: layout.elements.length,
      elements: layout.elements.map(e => ({ type: e.type, visible: e.visible, id: e.id }))
    });
    
    // Sort elements by zIndex to render in correct order
    const sortedElements = [...layout.elements].sort((a, b) => a.zIndex - b.zIndex);
    
    console.log('[Export] Processing', sortedElements.length, 'layout elements:', sortedElements.map(e => ({type: e.type, visible: e.visible})));
    
    for (const element of sortedElements) {
      console.log('[Export] Processing element:', {
        type: element.type,
        visible: element.visible,
        position: { x: element.x, y: element.y },
        size: { width: element.width, height: element.height },
        content: element.content
      });
      
      if (!element.visible) {
        console.log('[Export] Skipping invisible element:', element.type);
        continue;
      }
      
      // Calculate actual pixel positions using canvas dimensions
      // Convert percentage values (0-100) to decimal (0-1) then multiply by canvas size
      const x = (element.x / 100) * canvasWidth;
      const y = (element.y / 100) * canvasHeight;
      const w = (element.width / 100) * canvasWidth;
      const h = (element.height / 100) * canvasHeight;
      
      console.error('[CANVAS DEBUG] Element', element.type, 'position:', { x, y, w, h }, 'Canvas:', { width: canvasWidth, height: canvasHeight });
      
      console.log('[Export] Rendering element:', element.type, 'at', { x, y, w, h });
      
      switch (element.type) {
        case 'map':
          // Draw map at specified position and size
          console.error('[EMERGENCY DEBUG] Drawing map canvas:', {
            mapCanvasSize: { width: mapCanvas.width, height: mapCanvas.height },
            drawPosition: { x, y, w, h },
            layoutCanvasSize: { width: ctx.canvas.width, height: ctx.canvas.height },
            elementPosition: { x: element.x, y: element.y, width: element.width, height: element.height }
          });
          
          console.error('[EMERGENCY DEBUG] Drawing map canvas to layout');
          
          ctx.drawImage(mapCanvas, x, y, w, h);
          
          console.error('[EMERGENCY DEBUG] Map canvas drawn to layout canvas');
          break;
          
        case 'title':
          // Draw title text
          console.log('[Export] Title element debug:', {
            elementContent: element.content,
            textAlign: element.content?.textAlign,
            elementType: element.type
          });
          
          ctx.fillStyle = element.content?.color || '#333333';
          const fontSize = element.content?.fontSize || Math.max(16, w * 0.05);
          const fontWeight = (element.content as any)?.fontWeight || 'bold';
          ctx.font = `${fontWeight} ${fontSize}px ${element.content?.fontFamily || 'Arial'}`;
          ctx.textAlign = element.content?.textAlign || 'left';
          
          console.log('[Export] Title canvas textAlign set to:', ctx.textAlign);
          
          // Adjust X position based on text alignment
          let titleX = x;
          if (ctx.textAlign === 'center') {
            titleX = x + w / 2;
          } else if (ctx.textAlign === 'right') {
            titleX = x + w;
          }
          
          console.log('[Export] Title position:', { originalX: x, adjustedX: titleX, width: w, alignment: ctx.textAlign });
          
          ctx.fillText(element.content?.text || basic.title || 'Untitled Map', titleX, y + fontSize);
          break;
          
        case 'subtitle':
          // Draw subtitle text
          console.log('[Export] Rendering subtitle:', {
            elementContent: element.content,
            basicSubtitle: basic.subtitle,
            finalText: element.content?.text || basic.subtitle || 'Map Subtitle'
          });
          
          ctx.fillStyle = element.content?.color || '#666666';
          const subtitleSize = element.content?.fontSize || Math.max(12, w * 0.04);
          const subtitleWeight = (element.content as any)?.fontWeight || 'normal';
          ctx.font = `${subtitleWeight} ${subtitleSize}px ${element.content?.fontFamily || 'Arial'}`;
          ctx.textAlign = element.content?.textAlign || 'left';
          const subtitleText = element.content?.text || basic.subtitle || 'Map Subtitle';
          
          // Adjust X position based on text alignment
          let subtitleX = x;
          if (ctx.textAlign === 'center') {
            subtitleX = x + w / 2;
          } else if (ctx.textAlign === 'right') {
            subtitleX = x + w;
          }
          
          console.log('[Export] Drawing subtitle text:', subtitleText, 'at position:', { x: subtitleX, y: y + subtitleSize });
          console.log('[Export] Subtitle canvas state:', {
            fillStyle: ctx.fillStyle,
            font: ctx.font,
            textAlign: ctx.textAlign,
            canvasSize: { width: ctx.canvas.width, height: ctx.canvas.height },
            elementBounds: { x, y, w, h }
          });
          
          ctx.fillText(subtitleText, subtitleX, y + subtitleSize);
          break;
          
        case 'text':
          // Draw custom text
          ctx.fillStyle = element.content?.color || '#333333';
          const textSize = element.content?.fontSize || Math.max(12, w * 0.03);
          const textFontWeight = (element.content as any)?.fontWeight || 'normal';
          ctx.font = `${textFontWeight} ${textSize}px ${element.content?.fontFamily || 'Arial'}`;
          ctx.textAlign = element.content?.textAlign || 'left';
          
          // Handle multi-line text
          const text = element.content?.text || '';
          const lines = text.split('\n');
          const lineHeight = textSize * 1.2;
          lines.forEach((line, index) => {
            ctx.fillText(line, x, y + textSize + (index * lineHeight));
          });
          break;
          
        case 'legend':
          // Draw legend background and border
          ctx.strokeStyle = (element.content as any)?.borderColor || '#cccccc';
          ctx.fillStyle = element.content?.backgroundColor || '#ffffff';
          ctx.fillRect(x, y, w, h);
          if ((element as any).showLegendBorder !== false) {
            ctx.strokeRect(x, y, w, h);
          }
          
          // Legend title
          ctx.fillStyle = element.content?.color || '#333333';
          const legendTitleSize = element.content?.fontSize || Math.max(12, w * 0.04);
          const legendTitleWeight = (element.content as any)?.fontWeight || 'bold';
          ctx.font = `${legendTitleWeight} ${legendTitleSize}px ${element.content?.fontFamily || 'Arial'}`;
          ctx.textAlign = element.content?.textAlign || 'left';
          
          // Use custom legend title or fallback to content text or default
          const legendTitle = (element as any).legendTitle || element.content?.text || 'Legend';
          ctx.fillText(legendTitle, x + 10, y + legendTitleSize + 5);
          
          // Add legend items based on style
          const legendStyle = (element as any).legendStyle || 'standard';
          const itemStartY = y + legendTitleSize + 20;
          const itemHeight = 16;
          const itemSpacing = 18;
          
          if (legendStyle === 'detailed') {
            // Detailed legend with sample items
            const legendItems = [
              { color: '#ff4444', label: 'Fire Stations' },
              { color: '#4444ff', label: 'Hydrants' },
              { color: '#44ff44', label: 'EMS Units' },
              { color: '#ffaa44', label: 'Incidents' }
            ];
            
            legendItems.forEach((item, index) => {
              const itemY = itemStartY + (index * itemSpacing);
              if (itemY + itemHeight < y + h - 10) {
                // Draw color swatch
                ctx.fillStyle = item.color;
                ctx.fillRect(x + 10, itemY, 12, 12);
                ctx.strokeStyle = '#333';
                ctx.strokeRect(x + 10, itemY, 12, 12);
                
                // Draw label
                ctx.fillStyle = '#333333';
                ctx.font = `${Math.max(10, w * 0.025)}px Arial`;
                ctx.fillText(item.label, x + 28, itemY + 10);
              }
            });
          } else if (legendStyle === 'compact') {
            // Compact legend with minimal items
            ctx.fillStyle = '#333333';
            ctx.font = `${Math.max(9, w * 0.02)}px Arial`;
            ctx.fillText('Map elements and symbols', x + 10, itemStartY);
          }
          // Standard style shows just the title (already rendered above)
          break;
          
        case 'north-arrow':
          // Get north arrow properties
          const arrowStyle = (element as any).arrowStyle || 'classic';
          const rotation = (element as any).rotation || 0;
          const arrowColor = element.content?.color || '#333333';
          
          console.log('[Export] Rendering north arrow:', {
            arrowStyle,
            rotation,
            arrowColor,
            elementProperties: element,
            position: { x, y, w, h }
          });
          
          ctx.strokeStyle = arrowColor;
          ctx.fillStyle = arrowColor;
          ctx.lineWidth = 2;
          
          const centerX = x + w / 2;
          const centerY = y + h / 2;
          const arrowSize = Math.min(w, h) * 0.3;
          
          // Save context for rotation
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate((rotation * Math.PI) / 180);
          
          switch (arrowStyle) {
            case 'classic':
              // Traditional north arrow with triangle and tail
              ctx.beginPath();
              ctx.moveTo(0, -arrowSize);
              ctx.lineTo(-arrowSize / 3, arrowSize / 3);
              ctx.lineTo(0, 0);
              ctx.lineTo(arrowSize / 3, arrowSize / 3);
              ctx.closePath();
              ctx.fill();
              
              // Arrow shaft
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(0, arrowSize);
              ctx.stroke();
              break;
              
            case 'modern':
              // Sleek modern arrow
              ctx.beginPath();
              ctx.moveTo(0, -arrowSize);
              ctx.lineTo(-arrowSize / 4, arrowSize / 4);
              ctx.lineTo(0, arrowSize / 8);
              ctx.lineTo(arrowSize / 4, arrowSize / 4);
              ctx.closePath();
              ctx.fill();
              break;
              
            case 'simple':
              // Simple triangle
              ctx.beginPath();
              ctx.moveTo(0, -arrowSize);
              ctx.lineTo(-arrowSize / 2, arrowSize / 2);
              ctx.lineTo(arrowSize / 2, arrowSize / 2);
              ctx.closePath();
              ctx.fill();
              break;
              
            case 'compass':
              // Compass-style with four directions
              // North point (red)
              ctx.fillStyle = '#cc0000';
              ctx.beginPath();
              ctx.moveTo(0, -arrowSize);
              ctx.lineTo(-arrowSize / 4, 0);
              ctx.lineTo(arrowSize / 4, 0);
              ctx.closePath();
              ctx.fill();
              
              // South point (white/light)
              ctx.fillStyle = '#ffffff';
              ctx.strokeStyle = arrowColor;
              ctx.beginPath();
              ctx.moveTo(0, arrowSize);
              ctx.lineTo(-arrowSize / 4, 0);
              ctx.lineTo(arrowSize / 4, 0);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
              
              // East/West points
              ctx.fillStyle = arrowColor;
              ctx.beginPath();
              ctx.moveTo(-arrowSize * 0.7, 0);
              ctx.lineTo(0, -arrowSize / 4);
              ctx.lineTo(0, arrowSize / 4);
              ctx.closePath();
              ctx.fill();
              
              ctx.beginPath();
              ctx.moveTo(arrowSize * 0.7, 0);
              ctx.lineTo(0, -arrowSize / 4);
              ctx.lineTo(0, arrowSize / 4);
              ctx.closePath();
              ctx.fill();
              break;
          }
          
          ctx.restore(); // Restore context before drawing label
          
          console.log('[Export] North arrow rendered, adding label');
          
          // Debug rectangle removed for clean export
          
          // Add "N" label (always upright)
          if (arrowStyle !== 'compass') {
            ctx.fillStyle = arrowColor;
            ctx.font = `bold ${Math.max(10, arrowSize * 0.6)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('N', centerX, centerY + arrowSize + 15);
            console.log('[Export] North arrow "N" label drawn at:', { x: centerX, y: centerY + arrowSize + 15 });
          }
          break;
          
        case 'scale-bar':
          // Calculate actual scale based on map view
          const scaleBarUnits = (element as any).units || 'feet';
          const scaleBarStyle = (element as any).scaleStyle || 'bar';
          const divisions = (element as any).divisions || 4;
          
          // Get map view from configuration (should be passed from Redux state)
          const mapCenter = (configuration as any).mapView?.center || { latitude: 40, longitude: -95 };
          const mapZoom = (configuration as any).mapView?.zoom || 10;
          
          // Calculate meters per pixel at this zoom level and latitude
          const metersPerPixel = this.calculateMetersPerPixel(mapZoom, mapCenter.latitude);
          
          // Choose appropriate scale length
          const scaleInfo = this.getScaleBarInfo(metersPerPixel, scaleBarUnits, w * 0.8);
          
          // Draw scale bar styling
          ctx.strokeStyle = element.content?.color || '#333333';
          ctx.fillStyle = element.content?.color || '#333333';
          ctx.lineWidth = 2;
          
          const barY = y + h / 2;
          const barLength = scaleInfo.pixelLength;
          const barStart = x + (w - barLength) / 2;
          
          if (scaleBarStyle === 'alternating') {
            // Alternating black and white segments
            const segmentLength = barLength / divisions;
            for (let i = 0; i < divisions; i++) {
              const segmentStart = barStart + (i * segmentLength);
              ctx.fillStyle = i % 2 === 0 ? '#333333' : '#ffffff';
              ctx.fillRect(segmentStart, barY - 3, segmentLength, 6);
              ctx.strokeStyle = '#333333';
              ctx.strokeRect(segmentStart, barY - 3, segmentLength, 6);
            }
          } else {
            // Standard bar or line style
            if (scaleBarStyle === 'bar') {
              // Draw bar background
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(barStart, barY - 3, barLength, 6);
              ctx.strokeRect(barStart, barY - 3, barLength, 6);
            }
            
            // Draw main scale line
            ctx.strokeStyle = element.content?.color || '#333333';
            ctx.beginPath();
            ctx.moveTo(barStart, barY);
            ctx.lineTo(barStart + barLength, barY);
            ctx.stroke();
            
            // Draw tick marks
            ctx.beginPath();
            for (let i = 0; i <= divisions; i++) {
              const tickX = barStart + (i * barLength / divisions);
              ctx.moveTo(tickX, barY - 5);
              ctx.lineTo(tickX, barY + 5);
            }
            ctx.stroke();
          }
          
          // Add scale text
          ctx.fillStyle = element.content?.color || '#333333';
          ctx.font = `${Math.max(10, h * 0.3)}px Arial`;
          ctx.textAlign = 'center';
          ctx.fillText(scaleInfo.label, barStart + barLength / 2, barY + 20);
          break;
          
        case 'image':
          // Draw actual image if provided, otherwise placeholder
          if (element.content?.imageSrc) {
            const imageFit = (element.content as any)?.imageFit || 'cover';
            await this.drawImageFromSrc(ctx, element.content.imageSrc, x, y, w, h, imageFit);
          } else {
            // Draw image placeholder
            ctx.strokeStyle = '#cccccc';
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(x, y, w, h);
            ctx.strokeRect(x, y, w, h);
            
            // Image placeholder text
            ctx.fillStyle = '#999999';
            ctx.font = `${Math.max(12, w * 0.05)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('Image', x + w / 2, y + h / 2);
          }
          break;
          
        case 'shape':
          // Draw shapes using correct property names from PropertiesPanel
          const shapeStrokeColor = (element as any).strokeColor || (element.content as any)?.borderColor || '#333333';
          const shapeFillColor = (element as any).fillColor || element.content?.backgroundColor || 'transparent';
          const shapeStrokeWidth = (element as any).strokeWidth || (element.content as any)?.borderWidth || 1;
          const shapeType = (element as any).shapeType || (element.content as any)?.shapeType || 'rectangle';
          
          console.log('[Export] Rendering shape:', {
            shapeType,
            shapeStrokeColor,
            shapeFillColor,
            shapeStrokeWidth,
            elementProperties: element,
            position: { x, y, w, h }
          });
          
          ctx.strokeStyle = shapeStrokeColor;
          ctx.fillStyle = shapeFillColor;
          ctx.lineWidth = shapeStrokeWidth;
          
          switch (shapeType) {
            case 'rectangle':
              if (shapeFillColor !== 'transparent') {
                ctx.fillRect(x, y, w, h);
              }
              ctx.strokeRect(x, y, w, h);
              break;
              
            case 'circle':
              const radius = Math.min(w, h) / 2;
              const circleX = x + w / 2;
              const circleY = y + h / 2;
              ctx.beginPath();
              ctx.arc(circleX, circleY, radius, 0, 2 * Math.PI);
              if (shapeFillColor !== 'transparent') {
                ctx.fill();
              }
              ctx.stroke();
              break;
              
            case 'ellipse':
              const ellipseX = x + w / 2;
              const ellipseY = y + h / 2;
              const radiusX = w / 2;
              const radiusY = h / 2;
              ctx.beginPath();
              ctx.ellipse(ellipseX, ellipseY, radiusX, radiusY, 0, 0, 2 * Math.PI);
              if (shapeFillColor !== 'transparent') {
                ctx.fill();
              }
              ctx.stroke();
              break;
              
            case 'triangle':
              const triangleCenterX = x + w / 2;
              const triangleTopY = y;
              const triangleBottomY = y + h;
              ctx.beginPath();
              ctx.moveTo(triangleCenterX, triangleTopY);
              ctx.lineTo(x, triangleBottomY);
              ctx.lineTo(x + w, triangleBottomY);
              ctx.closePath();
              if (shapeFillColor !== 'transparent') {
                ctx.fill();
              }
              ctx.stroke();
              break;
              
            case 'line':
              ctx.beginPath();
              ctx.moveTo(x, y + h / 2);
              ctx.lineTo(x + w, y + h / 2);
              ctx.stroke();
              break;
              
            default:
              // Fallback to rectangle
              if (shapeFillColor !== 'transparent') {
                ctx.fillRect(x, y, w, h);
              }
              ctx.strokeRect(x, y, w, h);
              break;
          }
          break;
          
        default:
          console.warn('[Export] Unknown element type:', element.type);
          break;
      }
      
      console.error('[EMERGENCY DEBUG] Element rendered successfully:', element.type);
      
      console.log('[Export] Finished rendering element:', element.type);
    }
    
    console.log('[Export] Completed rendering all', sortedElements.length, 'elements');
  }

  /**
   * Add layout elements to PDF
   */
  private static async addLayoutElementsToPDF(
    pdf: jsPDF,
    elements: LayoutElement[],
    _dimensions: { width: number; height: number }
  ): Promise<void> {
    // Implementation for adding layout elements to PDF
    for (const element of elements) {
      switch (element.type) {
        case 'text':
          pdf.text(element.content?.text || '', element.x, element.y);
          break;
        case 'image':
          if (element.content?.imageSrc) {
            pdf.addImage(element.content.imageSrc, 'PNG', element.x, element.y, element.width, element.height);
          }
          break;
        // Add more element types
      }
    }
  }

  /**
   * Draw department logo on canvas
   */
  private static async drawLogo(
    ctx: CanvasRenderingContext2D,
    logo: File | string,
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number
  ): Promise<void> {
    try {
      let logoUrl: string;
      
      if (logo instanceof File) {
        logoUrl = URL.createObjectURL(logo);
      } else {
        logoUrl = logo;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Calculate aspect ratio and fit within max dimensions
          const aspectRatio = img.width / img.height;
          let drawWidth = maxWidth;
          let drawHeight = maxWidth / aspectRatio;
          
          if (drawHeight > maxHeight) {
            drawHeight = maxHeight;
            drawWidth = maxHeight * aspectRatio;
          }
          
          ctx.drawImage(img, x, y, drawWidth, drawHeight);
          
          // Cleanup object URL if created from File
          if (logo instanceof File) {
            URL.revokeObjectURL(logoUrl);
          }
          
          resolve();
        };
        
        img.onerror = () => {
          console.warn('[Export] Failed to load logo:', logoUrl);
          // Draw placeholder logo box
          ctx.strokeStyle = '#ccc';
          ctx.fillStyle = '#f5f5f5';
          ctx.fillRect(x, y, maxWidth, maxHeight);
          ctx.strokeRect(x, y, maxWidth, maxHeight);
          ctx.fillStyle = '#999';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Logo', x + maxWidth/2, y + maxHeight/2);
          
          if (logo instanceof File) {
            URL.revokeObjectURL(logoUrl);
          }
          
          resolve();
        };
        
        img.src = logoUrl;
      });
    } catch (error) {
      console.error('[Export] Error drawing logo:', error);
    }
  }

  /**
   * Draw image from source (File or URL) on canvas with fit options
   */
  private static async drawImageFromSrc(
    ctx: CanvasRenderingContext2D,
    imageSrc: File | string,
    x: number,
    y: number,
    width: number,
    height: number,
    imageFit: string = 'cover'
  ): Promise<void> {
    try {
      let imageUrl: string;
      
      if (imageSrc instanceof File) {
        imageUrl = URL.createObjectURL(imageSrc);
      } else {
        imageUrl = imageSrc;
      }
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = () => {
          // Calculate positioning based on fit mode
          let drawX = x;
          let drawY = y;
          let drawWidth = width;
          let drawHeight = height;
          
          const imgAspectRatio = img.width / img.height;
          const targetAspectRatio = width / height;
          
          switch (imageFit) {
            case 'contain':
              // Fit entire image within bounds, maintaining aspect ratio
              if (imgAspectRatio > targetAspectRatio) {
                // Image is wider, fit to width
                drawHeight = width / imgAspectRatio;
                drawY = y + (height - drawHeight) / 2;
              } else {
                // Image is taller, fit to height
                drawWidth = height * imgAspectRatio;
                drawX = x + (width - drawWidth) / 2;
              }
              break;
              
            case 'cover':
              // Cover entire area, maintaining aspect ratio (may crop)
              if (imgAspectRatio > targetAspectRatio) {
                // Image is wider, fit to height and crop width
                drawWidth = height * imgAspectRatio;
                drawX = x - (drawWidth - width) / 2;
              } else {
                // Image is taller, fit to width and crop height
                drawHeight = width / imgAspectRatio;
                drawY = y - (drawHeight - height) / 2;
              }
              break;
              
            case 'fill':
              // Fill entire area, ignoring aspect ratio (may distort)
              // Use default values (already set)
              break;
              
            case 'scale-down':
              // Same as contain but only if image is larger than container
              if (img.width > width || img.height > height) {
                // Apply contain logic
                if (imgAspectRatio > targetAspectRatio) {
                  drawHeight = width / imgAspectRatio;
                  drawY = y + (height - drawHeight) / 2;
                } else {
                  drawWidth = height * imgAspectRatio;
                  drawX = x + (width - drawWidth) / 2;
                }
              } else {
                // Use original size, centered
                drawWidth = img.width;
                drawHeight = img.height;
                drawX = x + (width - drawWidth) / 2;
                drawY = y + (height - drawHeight) / 2;
              }
              break;
          }
          
          // Draw with clipping for cover mode
          if (imageFit === 'cover') {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.clip();
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();
          } else {
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          }
          
          // Cleanup object URL if created from File
          if (imageSrc instanceof File) {
            URL.revokeObjectURL(imageUrl);
          }
          
          resolve();
        };
        
        img.onerror = () => {
          console.warn('[Export] Failed to load image:', imageUrl);
          // Draw placeholder
          ctx.strokeStyle = '#ccc';
          ctx.fillStyle = '#f5f5f5';
          ctx.fillRect(x, y, width, height);
          ctx.strokeRect(x, y, width, height);
          ctx.fillStyle = '#999';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Failed to load', x + width/2, y + height/2 - 6);
          ctx.fillText('image', x + width/2, y + height/2 + 6);
          
          if (imageSrc instanceof File) {
            URL.revokeObjectURL(imageUrl);
          }
          
          resolve();
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('[Export] Error drawing image:', error);
    }
  }

  /**
   * Get paper dimensions in millimeters
   */
  private static getPaperDimensions(
    paperSize: string,
    orientation: 'portrait' | 'landscape'
  ): { width: number; height: number } {
    let width: number, height: number;
    
    switch (paperSize) {
      case 'letter':
        width = 215.9; // 8.5 inches
        height = 279.4; // 11 inches
        break;
      case 'a4':
        width = 210;
        height = 297;
        break;
      case 'legal':
        width = 215.9;
        height = 355.6; // 14 inches
        break;
      case 'tabloid':
        width = 279.4;
        height = 431.8; // 17 inches
        break;
      default:
        width = 215.9;
        height = 279.4;
    }
    
    if (orientation === 'landscape') {
      [width, height] = [height, width];
    }
    
    return { width, height };
  }

  /**
   * Calculate meters per pixel at given zoom level and latitude
   */
  private static calculateMetersPerPixel(zoom: number, latitude: number): number {
    // Web Mercator projection calculation
    // At zoom level 0, the entire world is 256 pixels wide
    // Each zoom level doubles the resolution
    const earthCircumference = 40075017; // meters at equator
    const pixelsAtZoom0 = 256;
    const pixelsAtCurrentZoom = pixelsAtZoom0 * Math.pow(2, zoom);
    const metersPerPixelAtEquator = earthCircumference / pixelsAtCurrentZoom;
    
    // Adjust for latitude (Mercator projection stretches towards poles)
    const latitudeRadians = latitude * Math.PI / 180;
    const metersPerPixel = metersPerPixelAtEquator * Math.cos(latitudeRadians);
    
    return metersPerPixel;
  }

  /**
   * Get appropriate scale bar length and label for display
   */
  private static getScaleBarInfo(metersPerPixel: number, units: string, maxPixelLength: number): {
    pixelLength: number;
    label: string;
  } {
    // Calculate what distance the max pixel length represents
    const maxDistanceMeters = metersPerPixel * maxPixelLength;
    
    // Define nice scale increments for different units
    let scaleIncrements: number[];
    let unitLabel: string;
    let conversionFactor: number;
    
    switch (units) {
      case 'feet':
        conversionFactor = 3.28084; // meters to feet
        unitLabel = 'ft';
        scaleIncrements = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]; // feet
        break;
      case 'miles':
        conversionFactor = 0.000621371; // meters to miles
        unitLabel = 'mi';
        scaleIncrements = [0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100]; // miles
        break;
      case 'kilometers':
        conversionFactor = 0.001; // meters to kilometers
        unitLabel = 'km';
        scaleIncrements = [0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100]; // kilometers
        break;
      case 'meters':
      default:
        conversionFactor = 1; // meters to meters
        unitLabel = 'm';
        scaleIncrements = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]; // meters
        break;
    }
    
    const maxDistanceInUnits = maxDistanceMeters * conversionFactor;
    
    // Find the largest scale increment that fits within our max length
    let chosenScale = scaleIncrements[0];
    for (const scale of scaleIncrements) {
      if (scale <= maxDistanceInUnits * 0.8) { // Use 80% of available space
        chosenScale = scale;
      } else {
        break;
      }
    }
    
    // Calculate pixel length for chosen scale
    const scaleDistanceMeters = chosenScale / conversionFactor;
    const pixelLength = scaleDistanceMeters / metersPerPixel;
    
    // Format label
    let label: string;
    if (chosenScale < 1) {
      // For decimal values, show appropriate precision
      label = `${chosenScale.toFixed(1)} ${unitLabel}`;
    } else if (chosenScale >= 1000 && (units === 'feet' || units === 'meters')) {
      // Convert large values to miles/kilometers
      const largeUnit = units === 'feet' ? 'mi' : 'km';
      const largeConversion = units === 'feet' ? 5280 : 1000;
      const largeValue = chosenScale / largeConversion;
      label = `${largeValue.toFixed(largeValue < 1 ? 1 : 0)} ${largeUnit}`;
    } else {
      label = `${chosenScale} ${unitLabel}`;
    }
    
    return {
      pixelLength: Math.round(pixelLength),
      label
    };
  }

  /**
   * Download blob as file
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}