/**
 * PDF Report Generator Service
 * 
 * Generates professional PDF reports for fire departments using jsPDF
 * Supports NFPA 1710 compliance reports, executive summaries, and custom reports
 */

console.log('🔥🔥🔥 PDF REPORT GENERATOR MODULE LOADED - NEW VERSION WITH DEBUG! 🔥🔥🔥');

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IncidentRecord, ResponseTimeStatistics, ResponseTimeMetrics } from '@/types/analyzer';
import { formatResponseTime, calculateIncidentMetrics } from '@/utils/responseTimeCalculator';
import { generateStandardCharts, ChartImage } from './chartGenerator';

// Extend jsPDF type to include autoTable (added by jspdf-autotable plugin)
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ReportConfig {
  reportType: 'compliance' | 'executive' | 'detailed' | 'custom';
  title: string;
  subtitle?: string;
  departmentName: string;
  departmentLogo?: string; // Base64 encoded image
  chiefName?: string;
  chiefTitle?: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  includeSections: {
    summary: boolean;
    nfpaCompliance: boolean;
    incidentDetails: boolean;
    charts: boolean;
    recommendations: boolean;
  };
  customBranding?: {
    primaryColor: string;
    secondaryColor: string;
    logoPosition: 'left' | 'center' | 'right';
  };
  // 🎨 NEW: Custom text fields for user personalization
  customText?: {
    executiveSummaryDescription?: string;
    reportPurpose?: string;
    chiefMessage?: string;
    customSubtitle?: string; // Custom subtitle text
  };
  // Geographic analysis is now integrated into charts and incident details sections
}

export interface ReportData {
  incidents: IncidentRecord[];
  statistics: ResponseTimeStatistics;
  filters?: {
    dateRange?: { start: string; end: string };
    incidentTypes?: string[];
    units?: string[];
  };
}

export class PDFReportGenerator {
  private pdf: jsPDF;
  private config: ReportConfig;
  private data: ReportData;
  private pageNumber: number = 1;
  private yPosition: number = 20;
  
  // Colors and styling
  private colors = {
    primary: '#d32f2f',    // Fire department red
    secondary: '#1976d2',   // Professional blue
    success: '#2e7d32',     // NFPA compliant green
    warning: '#f57c00',     // Warning orange
    error: '#d32f2f',       // Non-compliant red
    text: '#333333',        // Dark gray text
    lightGray: '#f5f5f5',   // Light background
    mediumGray: '#9e9e9e'   // Medium gray
  };
  
  constructor(config: ReportConfig, data: ReportData) {
    this.pdf = new jsPDF('portrait', 'mm', 'a4');
    this.config = config;
    this.data = data;
    
    // Manually attach autoTable function - this ensures it works consistently
    console.log('📋 PDF DEBUG: autoTable import:', typeof autoTable);
    if (typeof autoTable === 'function') {
      // Attach autoTable as a method on the PDF instance
      (this.pdf as any).autoTable = autoTable.bind(null, this.pdf);
      console.log('📋 PDF DEBUG: ✅ autoTable attached successfully');
    } else {
      console.error('📋 PDF DEBUG: ❌ autoTable import failed');
    }
    
    // Apply custom branding if provided
    if (config.customBranding) {
      this.colors.primary = config.customBranding.primaryColor;
      this.colors.secondary = config.customBranding.secondaryColor;
    }
    
    // Debug the config
    console.log('📋 PDF DEBUG: ReportConfig received:', {
      departmentName: config.departmentName,
      hasDepartmentLogo: !!config.departmentLogo,
      logoLength: config.departmentLogo ? config.departmentLogo.length : 0
    });
  }
  
  /**
   * Generate the complete PDF report
   */
  public async generateReport(): Promise<Blob> {
    console.log('🚀 GENERATE REPORT CALLED - Static AutoTable Import Version');
    console.log('📋 PDF DEBUG: jsPDF instance created:', !!this.pdf);
    console.log('📋 PDF DEBUG: autoTable plugin loaded:', !!(this.pdf as any).autoTable);
    
    // Add title page
    this.addTitlePage();
    
    // Add executive summary
    if (this.config.includeSections.summary) {
      this.addNewPage();
      this.addExecutiveSummary();
    }
    
    // Add NFPA compliance section
    if (this.config.includeSections.nfpaCompliance) {
      this.addNewPage();
      this.addNFPAComplianceSection();
    }
    
    // Add charts section
    if (this.config.includeSections.charts) {
      this.addNewPage();
      await this.addChartsSection();
    }
    
    // Add geographic analysis section (statistical analysis instead of visual maps)
    if (this.config.includeSections.charts || this.config.includeSections.incidentDetails) {
      this.addNewPage();
      this.addGeographicAnalysisSection();
    }
    
    // Add incident details
    if (this.config.includeSections.incidentDetails) {
      this.addNewPage();
      this.addIncidentDetailsSection();
    }
    
    // Add recommendations
    if (this.config.includeSections.recommendations) {
      this.addNewPage();
      this.addRecommendationsSection();
    }
    
    // Add footer to all pages
    this.addFootersToAllPages();
    
    return this.pdf.output('blob');
  }
  
  /**
   * Add title page with department branding
   */
  private addTitlePage(): void {
    this.yPosition = 40;
    
    // Department logo (if provided)
    if (this.config.departmentLogo) {
      console.log('🖼️ LOGO DEBUG: Logo data exists, length:', this.config.departmentLogo.length);
      console.log('🖼️ LOGO DEBUG: Logo data preview:', this.config.departmentLogo.substring(0, 100) + '...');
      
      const logoSize = 30;
      const logoX = this.config.customBranding?.logoPosition === 'center' ? 
        (210 - logoSize) / 2 : 
        this.config.customBranding?.logoPosition === 'right' ? 
        210 - logoSize - 20 : 20;
      
      try {
        // Auto-detect image format from base64 data
        let format: 'PNG' | 'JPEG' | 'JPG' = 'PNG';
        if (this.config.departmentLogo.includes('data:image/jpeg') || this.config.departmentLogo.includes('data:image/jpg')) {
          format = 'JPEG';
        } else if (this.config.departmentLogo.includes('data:image/png')) {
          format = 'PNG';
        }
        
        console.log('🖼️ LOGO DEBUG: Detected format:', format);
        console.log('🖼️ LOGO DEBUG: Adding logo at position:', { x: logoX, y: this.yPosition, size: logoSize });
        
        // Try adding the image
        this.pdf.addImage(this.config.departmentLogo, format, logoX, this.yPosition, logoSize, logoSize);
        console.log('🖼️ LOGO DEBUG: ✅ Logo added successfully!');
        this.yPosition += logoSize + 10;
      } catch (error) {
        console.error('🖼️ LOGO DEBUG: ❌ Failed to add logo:', error);
        console.error('🖼️ LOGO DEBUG: Error details:', {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          logoDataType: typeof this.config.departmentLogo,
          logoDataStart: this.config.departmentLogo.substring(0, 50)
        });
        
        // Add text fallback if logo fails
        this.pdf.setFontSize(12);
        this.pdf.setTextColor(this.colors.mediumGray);
        this.pdf.text('[Department Logo - Failed to Load]', logoX, this.yPosition + 15);
        this.yPosition += 25;
      }
    } else {
      console.log('🖼️ LOGO DEBUG: No logo data provided');
    }
    
    // Main title
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(this.colors.primary);
    this.addCenteredText(this.config.title, this.yPosition);
    this.yPosition += 15;
    
    // Subtitle (use custom subtitle if provided, otherwise use default)
    const subtitleText = this.config.customText?.customSubtitle || this.config.subtitle;
    if (subtitleText) {
      this.pdf.setFontSize(16);
      this.pdf.setTextColor(this.colors.text);
      this.addCenteredText(subtitleText, this.yPosition);
      this.yPosition += 10;
    }
    
    // Department name
    this.pdf.setFontSize(18);
    this.pdf.setTextColor(this.colors.secondary);
    this.addCenteredText(this.config.departmentName, this.yPosition);
    this.yPosition += 20;
    
    // Report period
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(this.colors.text);
    const periodText = `Report Period: ${this.config.reportPeriod.startDate} to ${this.config.reportPeriod.endDate}`;
    this.addCenteredText(periodText, this.yPosition);
    this.yPosition += 20;
    
    // Generated date
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.mediumGray);
    const generatedText = `Generated on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
    this.addCenteredText(generatedText, this.yPosition);
    this.yPosition += 30;
    
    // Chief's message (if provided)
    if (this.config.customText?.chiefMessage) {
      this.yPosition += 20;
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(this.colors.text);
      this.pdf.text('Message from Fire Chief:', 20, this.yPosition);
      this.yPosition += 10;
      
      // Split long message into lines
      const messageLines = this.pdf.splitTextToSize(this.config.customText.chiefMessage, 170);
      messageLines.forEach((line: string) => {
        this.pdf.text(line, 20, this.yPosition);
        this.yPosition += 6;
      });
    }
    
    // Chief signature area (if provided)
    if (this.config.chiefName) {
      this.yPosition = 220; // Bottom of page
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(this.colors.text);
      this.pdf.text('Prepared by:', 20, this.yPosition);
      this.yPosition += 8;
      this.pdf.setFontSize(14);
      this.pdf.text(this.config.chiefName, 20, this.yPosition);
      if (this.config.chiefTitle) {
        this.yPosition += 6;
        this.pdf.setFontSize(12);
        this.pdf.setTextColor(this.colors.mediumGray);
        this.pdf.text(this.config.chiefTitle, 20, this.yPosition);
      }
    }
  }
  
  /**
   * Add executive summary section
   */
  private addExecutiveSummary(): void {
    this.addSectionHeader('Executive Summary');
    
    const stats = this.data.statistics;
    const incidents = this.data.incidents;
    
    // Key metrics summary
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.text);
    
    // Use custom text if provided, otherwise use defaults
    const reportPurpose = this.config.customText?.reportPurpose || 
      `During the reporting period, ${this.config.departmentName} responded to ${incidents.length} incidents.`;
    
    const executiveDescription = this.config.customText?.executiveSummaryDescription || 
      `High-level overview for mayors and department leadership`;
    
    const summaryText = [
      reportPurpose,
      ``,
      executiveDescription,
      ``,
      `Key Performance Indicators:`,
      `• Average Response Time: ${this.formatStatistic(stats.mean.totalResponseTime)}`,
      `• Average Dispatch Time: ${this.formatStatistic(stats.mean.dispatchTime)}`,
      `• Average Turnout Time: ${this.formatStatistic(stats.mean.turnoutTime)}`,
      `• 90th Percentile Response: ${this.formatStatistic(stats.ninetiethPercentile.totalResponseTime)}`,
      ``,
      `NFPA 1710 Compliance Overview:`,
      `${this.calculateCompliancePercentage()}% of metrics meet NFPA standards`
    ];
    
    summaryText.forEach(line => {
      if (this.yPosition > 250) {
        this.addNewPage();
      }
      // Simple text output - lines are now short enough
      this.pdf.text(line, 20, this.yPosition);
      this.yPosition += 6;
    });
  }
  
  /**
   * Add NFPA 1710 compliance section
   */
  private addNFPAComplianceSection(): void {
    this.addSectionHeader('NFPA 1710 Compliance Analysis');
    
    // Create compliance table
    const complianceData = this.calculateNFPACompliance();
    
    // Create professional compliance table with autoTable
    try {
      const complianceTableData = [
        [
          'Dispatch Time',
          this.formatStatistic(this.data.statistics.mean.dispatchTime),
          '≤60 seconds',
          complianceData.dispatchCompliance ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'
        ],
        [
          'Turnout Time',
          this.formatStatistic(this.data.statistics.mean.turnoutTime),
          '≤60 seconds',
          complianceData.turnoutCompliance ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'
        ],
        [
          'Total Response Time',
          this.formatStatistic(this.data.statistics.mean.totalResponseTime),
          '≤5 minutes',
          complianceData.responseCompliance ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'
        ]
      ];

      console.log('📋 Creating NFPA compliance table with autoTable');
      
      this.pdf.autoTable({
        head: [['Metric', 'Department Average', 'NFPA Standard', 'Status']],
        body: complianceTableData,
        startY: this.yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: [211, 47, 47], // Fire department red
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold',
          cellPadding: 5,
          valign: 'middle',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 11,
          cellPadding: 4,
          lineColor: [240, 240, 240],
          lineWidth: 0.1,
          valign: 'middle',
          halign: 'left',
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        columnStyles: {
          0: { cellWidth: 45 }, // Metric - increased for longer names
          1: { cellWidth: 35 }, // Department Average - increased
          2: { cellWidth: 35 }, // NFPA Standard - increased for "≤60 seconds"
          3: { 
            cellWidth: 55, // Status - increased for COMPLIANT/NON-COMPLIANT
            textColor: (data: any) => {
              return data.cell.text[0].includes('✓') ? [46, 125, 50] : [211, 47, 47];
            }
          }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data: any) => {
          // Use the data parameter instead of this.pdf.previousAutoTable
          this.yPosition = data.cursor.y + 10;
        }
      });
      
      // Position is already set by didDrawPage callback
      this.yPosition = this.yPosition || this.yPosition + 20;
    } catch (error) {
      console.error('Could not create autoTable, falling back to text:', error);
      // Fallback to text-based table
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(this.colors.text);
      
      const complianceText = [
        'NFPA 1710 Compliance Analysis:',
        '',
        'DISPATCH TIME:',
        `  Department: ${this.formatStatistic(this.data.statistics.mean.dispatchTime)}`,
        `  NFPA Standard: ≤60 seconds`,
        `  Status: ${complianceData.dispatchCompliance ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'}`,
        '',
        'TURNOUT TIME:',
        `  Department: ${this.formatStatistic(this.data.statistics.mean.turnoutTime)}`,
        `  NFPA Standard: ≤60 seconds`,
        `  Status: ${complianceData.turnoutCompliance ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'}`,
        '',
        'TOTAL RESPONSE TIME:',
        `  Department: ${this.formatStatistic(this.data.statistics.mean.totalResponseTime)}`,
        `  NFPA Standard: ≤5 minutes`,
        `  Status: ${complianceData.responseCompliance ? '✓ COMPLIANT' : '✗ NON-COMPLIANT'}`,
        ''
      ];
      
      complianceText.forEach(line => {
        if (this.yPosition > 250) {
          this.addNewPage();
        }
        this.pdf.text(line, 20, this.yPosition);
        this.yPosition += 6;
      });
    }
    
    this.yPosition += 10;
    
    // Add compliance summary
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.text);
    this.pdf.text('Compliance Summary:', 20, this.yPosition);
    this.yPosition += 10;
    
    const compliancePercentage = Math.round(
      (Object.values(complianceData).filter(Boolean).length / 3) * 100
    );
    
    this.pdf.setFontSize(11);
    this.pdf.text(`Overall NFPA 1710 Compliance: ${compliancePercentage}%`, 20, this.yPosition);
    this.yPosition += 15;
    
    // Add recommendations based on compliance
    if (compliancePercentage < 100) {
      this.addNonComplianceRecommendations(complianceData);
    }
  }
  
  /**
   * Add incident details section
   */
  private addIncidentDetailsSection(): void {
    this.addSectionHeader('Incident Details');
    
    // Prepare incident data for table
    const incidentData = this.data.incidents.slice(0, 50).map(incident => { // Limit to first 50 for PDF space
      const metrics = this.calculateMetricsForIncident(incident);
      return [
        incident.incidentId,
        incident.incidentDate,
        incident.incidentType || 'N/A',
        this.formatMetric(metrics.dispatchTime),
        this.formatMetric(metrics.turnoutTime),
        this.formatMetric(metrics.totalResponseTime)
      ];
    });
    
    // Create professional incident table with autoTable
    try {
      // Limit to first 20 incidents for PDF space
      const limitedIncidents = incidentData.slice(0, 20);
      
      this.pdf.autoTable({
        head: [[
          'Incident ID',
          'Date',
          'Type',
          'Dispatch',
          'Turnout',
          'Response'
        ]],
        body: limitedIncidents,
        startY: this.yPosition,
        theme: 'striped',
        headStyles: {
          fillColor: [25, 118, 210], // Professional blue
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold',
          cellPadding: 4,
          valign: 'middle',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
          valign: 'middle',
          halign: 'left',
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Incident ID - increased
          1: { cellWidth: 25 }, // Date - increased
          2: { cellWidth: 30 }, // Type - increased for longer incident types
          3: { cellWidth: 22 }, // Dispatch - increased
          4: { cellWidth: 22 }, // Turnout - increased
          5: { cellWidth: 26 }  // Response - increased
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data: any) => {
          // Use the data parameter for position tracking
          this.yPosition = data.cursor.y + 10;
        }
      });
      
      // Position is already set by didDrawPage callback
      this.yPosition = this.yPosition || this.yPosition + 20;
    } catch (error) {
      console.error('Could not create incident table, falling back to text:', error);
      // Fallback to text-based incident list
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(this.colors.text);
      
      this.pdf.text('Incident Summary (First 10 incidents):', 20, this.yPosition);
      this.yPosition += 10;
      
      const limitedIncidents = incidentData.slice(0, 10);
      limitedIncidents.forEach((incident, index) => {
        if (this.yPosition > 250) {
          this.addNewPage();
        }
        const incidentHeader = `${index + 1}. ${incident[0]} - ${incident[1]}`;
        const incidentDetails = `   Type: ${incident[2]} | Response: ${incident[5]}`;
        
        this.pdf.text(incidentHeader, 20, this.yPosition);
        this.yPosition += 5;
        this.pdf.text(incidentDetails, 20, this.yPosition);
        this.yPosition += 5;
      });
    }
    
    this.yPosition += 10;
    
    if (this.data.incidents.length > 20) {
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(this.colors.mediumGray);
      this.pdf.text(`Note: Showing first 20 of ${this.data.incidents.length} incidents. Full data available in detailed export.`, 20, this.yPosition);
    }
  }
  
  /**
   * Add charts section with performance visualizations
   */
  private async addChartsSection(): Promise<void> {
    this.addSectionHeader('Performance Analysis & Charts');
    
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.text);
    
    // Introduction text
    const introText = [
      'This section provides visual analysis of department performance metrics.',
      'Charts help identify trends, compliance status, and areas for improvement.',
      ''
    ];
    
    introText.forEach(line => {
      if (this.yPosition > 250) {
        this.addNewPage();
      }
      this.pdf.text(line, 20, this.yPosition);
      this.yPosition += 6;
    });
    
    try {
      // Generate all charts
      console.log('📊 PDF: Generating charts for report...');
      const charts = await generateStandardCharts(this.data.incidents, this.data.statistics);
      
      // Add each chart to the PDF
      for (const chart of charts) {
        await this.addChartToPDF(chart);
        this.yPosition += 15; // Space between charts
      }
      
      console.log(`📊 PDF: Successfully added ${charts.length} charts to report`);
      
    } catch (error) {
      console.error('📊 PDF: Error generating charts:', error);
      
      // Fallback: Add text explaining chart generation issue
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(this.colors.error);
      this.pdf.text('Chart generation temporarily unavailable.', 20, this.yPosition);
      this.yPosition += 10;
      
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(this.colors.mediumGray);
      this.pdf.text('Charts will be available in future report versions.', 20, this.yPosition);
      this.yPosition += 15;
    }
  }
  
  /**
   * Add a single chart image to the PDF
   */
  private async addChartToPDF(chart: ChartImage): Promise<void> {
    // Check if we need a new page
    const chartHeight = (chart.height * 170) / chart.width; // Scale to fit page width
    if (this.yPosition + chartHeight + 30 > 250) {
      this.addNewPage();
    }
    
    // Add chart title
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(chart.title, 20, this.yPosition);
    this.yPosition += 10;
    
    try {
      // Add chart image to PDF
      const chartWidth = 170; // Fit within page margins (210mm - 40mm margins)
      const scaledHeight = (chart.height * chartWidth) / chart.width;
      
      this.pdf.addImage(
        chart.dataUrl,
        'PNG',
        20, // x position
        this.yPosition, // y position
        chartWidth, // width
        scaledHeight // height
      );
      
      this.yPosition += scaledHeight + 5;
      
      console.log(`📊 PDF: Added chart "${chart.title}" to PDF`);
      
    } catch (error) {
      console.error(`📊 PDF: Error adding chart "${chart.title}":`, error);
      
      // Fallback: Add placeholder text
      this.pdf.setDrawColor(this.colors.mediumGray);
      this.pdf.setFillColor(245, 245, 245);
      this.pdf.rect(20, this.yPosition, 170, 80, 'FD');
      
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(this.colors.mediumGray);
      this.pdf.text('[Chart generation failed]', 105, this.yPosition + 35, { align: 'center' });
      this.pdf.text('Data available in detailed analysis', 105, this.yPosition + 50, { align: 'center' });
      
      this.yPosition += 85;
    }
  }

  /**
   * Add geographic analysis section with statistical analysis
   */
  private addGeographicAnalysisSection(): void {
    this.addSectionHeader('Geographic Analysis & Service Area Performance');
    
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.text);
    
    // Introduction text
    const introText = [
      'This section provides statistical analysis of emergency response across service areas.',
      'Analysis includes incident distribution, response time variations by location, and coverage assessment.',
      ''
    ];
    
    introText.forEach(line => {
      if (this.yPosition > 250) {
        this.addNewPage();
      }
      this.pdf.text(line, 20, this.yPosition);
      this.yPosition += 6;
    });
    
    // Add incident distribution analysis
    this.addIncidentDistributionAnalysis();
    this.yPosition += 10;
    
    // Add response time by area analysis
    this.addResponseTimeByAreaAnalysis();
    this.yPosition += 10;
    
    // Add coverage assessment
    this.addCoverageAssessment();
  }
  
  /**
   * Add incident distribution analysis
   */
  private addIncidentDistributionAnalysis(): void {
    if (this.yPosition > 200) {
      this.addNewPage();
    }
    
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text('Incident Distribution Analysis', 20, this.yPosition);
    this.yPosition += 10;
    
    // Analyze incident distribution by city/area
    const cityDistribution = this.analyzeIncidentsByCity();
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.text);
    
    if (cityDistribution.length > 0) {
      this.pdf.text('Incident distribution by service area:', 20, this.yPosition);
      this.yPosition += 8;
      
      cityDistribution.forEach(item => {
        if (this.yPosition > 250) {
          this.addNewPage();
        }
        this.pdf.text(`• ${item.area}: ${item.count} incidents (${item.percentage}%)`, 25, this.yPosition);
        this.yPosition += 6;
      });
    } else {
      this.pdf.text('Geographic data analysis requires city/location information in incident records.', 20, this.yPosition);
      this.yPosition += 6;
      this.pdf.text('Consider adding location fields to enable detailed geographic analysis.', 20, this.yPosition);
      this.yPosition += 6;
    }
  }
  
  /**
   * Add response time by area analysis
   */
  private addResponseTimeByAreaAnalysis(): void {
    if (this.yPosition > 200) {
      this.addNewPage();
    }
    
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text('Response Time by Service Area', 20, this.yPosition);
    this.yPosition += 10;
    
    const responseTimeByArea = this.analyzeResponseTimesByArea();
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.text);
    
    if (responseTimeByArea.length > 0) {
      responseTimeByArea.forEach(item => {
        if (this.yPosition > 250) {
          this.addNewPage();
        }
        const complianceStatus = item.avgResponseTime <= 300 ? '✓ COMPLIANT' : '⚠ REVIEW NEEDED';
        this.pdf.text(`• ${item.area}: ${this.formatTime(item.avgResponseTime)} avg response - ${complianceStatus}`, 25, this.yPosition);
        this.yPosition += 6;
      });
    } else {
      this.pdf.text('Response time geographic analysis requires location data in incident records.', 20, this.yPosition);
      this.yPosition += 6;
    }
  }
  
  /**
   * Add coverage assessment
   */
  private addCoverageAssessment(): void {
    if (this.yPosition > 200) {
      this.addNewPage();
    }
    
    this.pdf.setFontSize(14);
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text('Service Coverage Assessment', 20, this.yPosition);
    this.yPosition += 10;
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.text);
    
    const stats = this.data.statistics;
    const avgResponseTime = stats.mean.totalResponseTime || 0;
    const ninetiethPercentile = stats.ninetiethPercentile.totalResponseTime || 0;
    
    const coverageAnalysis = [
      `Total incidents analyzed: ${this.data.incidents.length}`,
      `Average response time: ${this.formatTime(avgResponseTime)}`,
      `90th percentile response time: ${this.formatTime(ninetiethPercentile)}`,
      '',
      'Coverage recommendations:',
    ];
    
    // Add recommendations based on performance
    if (avgResponseTime > 300) {
      coverageAnalysis.push('• Consider evaluating station locations for optimal coverage');
      coverageAnalysis.push('• Review deployment strategies to reduce response times');
    } else {
      coverageAnalysis.push('• Current response times meet NFPA 1710 standards');
      coverageAnalysis.push('• Maintain current operational strategies');
    }
    
    if (ninetiethPercentile > 480) { // 8 minutes
      coverageAnalysis.push('• 90th percentile suggests some areas may need additional coverage');
    }
    
    coverageAnalysis.forEach(line => {
      if (this.yPosition > 250) {
        this.addNewPage();
      }
      this.pdf.text(line, 20, this.yPosition);
      this.yPosition += 6;
    });
  }
  
  /**
   * Add recommendations section
   */
  private addRecommendationsSection(): void {
    this.addSectionHeader('Recommendations & Action Items');
    
    const complianceData = this.calculateNFPACompliance();
    const recommendations: string[] = [];
    
    if (!complianceData.dispatchCompliance) {
      recommendations.push(
        '• Dispatch Time Improvement: Review dispatcher training and implement automated dispatch systems to achieve <60 second dispatch times.'
      );
    }
    
    if (!complianceData.turnoutCompliance) {
      recommendations.push(
        '• Turnout Time Optimization:',
        '  - Evaluate station layout and equipment placement',
        '  - Review crew readiness procedures',
        '  - Target: Reduce turnout time to <60 seconds'
      );
    }
    
    if (!complianceData.responseCompliance) {
      recommendations.push(
        '• Response Time Enhancement:',
        '  - Analyze travel routes and station coverage',
        '  - Consider additional stations or unit deployment',
        '  - Review deployment strategies'
      );
    }
    
    if (recommendations.length === 0) {
      recommendations.push(
        '• Maintain Excellence: Continue current operational practices to maintain NFPA 1710 compliance across all metrics.',
        '• Performance Monitoring: Implement regular performance reviews to ensure continued compliance.',
        '• Staff Training: Provide ongoing training to maintain response time standards.'
      );
    }
    
    // Add general recommendations
    recommendations.push(
      '',
      'General Recommendations:',
      '• Implement regular performance monitoring and monthly reporting',
      '• Consider technology upgrades (GPS tracking, mobile data terminals)',
      '• Review and update standard operating procedures annually',
      '• Evaluate station locations and coverage areas for optimal response times'
    );
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.text);
    
    recommendations.forEach(rec => {
      if (this.yPosition > 250) {
        this.addNewPage();
      }
      this.pdf.text(rec, 20, this.yPosition);
      this.yPosition += 6;
    });
  }
  
  /**
   * Helper methods
   */
  private addNewPage(): void {
    this.pdf.addPage();
    this.pageNumber++;
    this.yPosition = 20;
  }
  
  private addSectionHeader(title: string): void {
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(title, 20, this.yPosition);
    this.yPosition += 12;
    
    // Add underline
    this.pdf.setDrawColor(this.colors.primary);
    this.pdf.line(20, this.yPosition - 2, 190, this.yPosition - 2);
    this.yPosition += 8;
  }
  
  private addCenteredText(text: string, y: number): void {
    const textWidth = this.pdf.getTextWidth(text);
    const x = (210 - textWidth) / 2; // A4 width is 210mm
    this.pdf.text(text, x, y);
  }
  
  private addFootersToAllPages(): void {
    const pageCount = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      // Footer line
      this.pdf.setDrawColor(this.colors.mediumGray);
      this.pdf.line(20, 280, 190, 280);
      
      // Page number
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(this.colors.mediumGray);
      this.pdf.text(`Page ${i} of ${pageCount}`, 170, 285);
      
      // Department name
      this.pdf.text(this.config.departmentName, 20, 285);
    }
  }
  
  private formatStatistic(value: number | null): string {
    if (value === null) return 'N/A';
    return formatResponseTime(value);
  }
  
  private formatMetric(value: number | null): string {
    if (value === null) return 'N/A';
    return formatResponseTime(value, 'full');
  }
  
  private calculateNFPACompliance() {
    const stats = this.data.statistics;
    return {
      dispatchCompliance: (stats.mean.dispatchTime || 0) <= 60,
      turnoutCompliance: (stats.mean.turnoutTime || 0) <= 60,
      responseCompliance: (stats.mean.totalResponseTime || 0) <= 300 // 5 minutes
    };
  }
  
  
  private addNonComplianceRecommendations(compliance: any): void {
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.error);
    this.pdf.text('Areas Requiring Attention:', 20, this.yPosition);
    this.yPosition += 8;
    
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(this.colors.text);
    
    if (!compliance.dispatchCompliance) {
      this.pdf.text('• Dispatch times exceed NFPA 1710 standard of 60 seconds', 25, this.yPosition);
      this.yPosition += 6;
    }
    if (!compliance.turnoutCompliance) {
      this.pdf.text('• Turnout times exceed NFPA 1710 standard of 60 seconds', 25, this.yPosition);
      this.yPosition += 6;
    }
    if (!compliance.responseCompliance) {
      this.pdf.text('• Total response times exceed NFPA 1710 standard of 5 minutes', 25, this.yPosition);
      this.yPosition += 6;
    }
  }
  
  private calculateMetricsForIncident(incident: IncidentRecord): ResponseTimeMetrics {
    return calculateIncidentMetrics(incident);
  }
  
  
  private calculateCompliancePercentage(): number {
    const compliance = this.calculateNFPACompliance();
    const compliantCount = Object.values(compliance).filter(Boolean).length;
    const totalMetrics = Object.keys(compliance).length;
    return Math.round((compliantCount / totalMetrics) * 100);
  }
  
  /**
   * Analyze incidents by city/area
   */
  private analyzeIncidentsByCity(): Array<{ area: string; count: number; percentage: number }> {
    const cityCount: Record<string, number> = {};
    let totalIncidents = 0;
    
    this.data.incidents.forEach(incident => {
      const city = incident.city || incident.address?.split(',').slice(-2, -1)[0]?.trim() || 'Unknown';
      cityCount[city] = (cityCount[city] || 0) + 1;
      totalIncidents++;
    });
    
    return Object.entries(cityCount)
      .map(([area, count]) => ({
        area,
        count,
        percentage: Math.round((count / totalIncidents) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 areas
  }
  
  /**
   * Analyze response times by area
   */
  private analyzeResponseTimesByArea(): Array<{ area: string; avgResponseTime: number; count: number }> {
    const areaStats: Record<string, { total: number; count: number }> = {};
    
    this.data.incidents.forEach(incident => {
      const city = incident.city || incident.address?.split(',').slice(-2, -1)[0]?.trim() || 'Unknown';
      const metrics = this.calculateMetricsForIncident(incident);
      
      if (metrics.totalResponseTime && metrics.totalResponseTime > 0) {
        if (!areaStats[city]) {
          areaStats[city] = { total: 0, count: 0 };
        }
        areaStats[city].total += metrics.totalResponseTime;
        areaStats[city].count += 1;
      }
    });
    
    return Object.entries(areaStats)
      .map(([area, stats]) => ({
        area,
        avgResponseTime: stats.total / stats.count,
        count: stats.count
      }))
      .filter(item => item.count >= 2) // Only areas with 2+ incidents
      .sort((a, b) => a.avgResponseTime - b.avgResponseTime)
      .slice(0, 8); // Top 8 areas
  }
  
  /**
   * Format time in seconds to readable format
   */
  private formatTime(seconds: number): string {
    if (!seconds || seconds <= 0) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    
    if (minutes === 0) {
      return `${remainingSeconds} sec`;
    } else {
      return `${minutes} min ${remainingSeconds} sec`;
    }
  }
}

/**
 * Convenience function to generate a PDF report
 */
export async function generateResponseTimeReport(
  config: ReportConfig,
  data: ReportData
): Promise<Blob> {
  console.log('🔥🔥🔥 GENERATE RESPONSE TIME REPORT FUNCTION CALLED! 🔥🔥🔥');
  console.log('📋 Config received:', {
    departmentName: config.departmentName,
    hasDepartmentLogo: !!config.departmentLogo,
    logoLength: config.departmentLogo ? config.departmentLogo.length : 0
  });
  console.log('📋 Data received:', {
    incidentsCount: data.incidents.length,
    statisticsExists: !!data.statistics
  });
  
  const generator = new PDFReportGenerator(config, data);
  return await generator.generateReport();
}