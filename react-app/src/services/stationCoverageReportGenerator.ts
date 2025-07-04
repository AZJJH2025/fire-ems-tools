/**
 * Station Coverage PDF Report Generator
 * 
 * Generates professional PDF reports for station coverage analysis
 * Supports NFPA compliance reports, coverage assessments, and gap analysis
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface StationCoverageReportConfig {
  reportType: 'coverage' | 'compliance' | 'planning' | 'gaps' | 'custom';
  title: string;
  subtitle?: string;
  departmentName: string;
  departmentLogo?: string; // Base64 encoded image
  chiefName?: string;
  chiefTitle?: string;
  reportPeriod?: {
    startDate: string;
    endDate: string;
  };
  includeSections: {
    summary: boolean;
    stationInventory: boolean;
    coverageAnalysis: boolean;
    gapAssessment: boolean;
    recommendations: boolean;
    nfpaCompliance: boolean;
    performanceMetrics: boolean;
  };
  customBranding?: {
    primaryColor: string;
    secondaryColor: string;
    logoPosition: 'left' | 'center' | 'right';
  };
  customText?: {
    executiveSummary?: string;
    reportPurpose?: string;
    chiefMessage?: string;
  };
}

export interface StationCoverageReportData {
  stations: Array<{
    station_id: string;
    station_name: string;
    latitude: number;
    longitude: number;
    station_type: string;
    apparatus_count?: number;
    staffing_level?: number;
    operational_status: string;
  }>;
  coverageStandard: 'nfpa1710' | 'nfpa1720';
  jurisdictionBoundary?: any;
  analysisResults: {
    totalStations: number;
    coverageMetrics: {
      populationCovered: number;
      areaCovered: number;
      nfpaCompliance: number;
    };
    identifiedGaps: Array<{
      id: string;
      center: [number, number];
      bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
      };
      type: string;
      severity: string;
      estimatedPopulation: number;
    }>;
    recommendedStations: Array<{
      id: string;
      position: [number, number];
      type: string;
      priority: string;
      gapsCovered: number;
      estimatedPopulationServed: number;
      reasoning: string;
    }>;
    analysisDate: string;
  };
}

export class StationCoveragePDFReportGenerator {
  private pdf: jsPDF;
  private config: StationCoverageReportConfig;
  private data: StationCoverageReportData;
  private pageNumber: number = 1;
  private yPosition: number = 20;
  
  // Colors and styling
  private colors = {
    primary: '#1976d2',     // Professional blue
    secondary: '#0d47a1',   // Darker blue
    success: '#2e7d32',     // Green for compliant
    warning: '#f57c00',     // Orange for warnings
    error: '#d32f2f',       // Red for critical issues
    station: '#ff5722',     // Orange-red for stations
    coverage: '#4caf50',    // Green for coverage
    gap: '#f44336',         // Red for gaps
    recommendation: '#2196f3', // Blue for recommendations
    text: '#333333',        // Dark gray text
    lightGray: '#f5f5f5',   // Light background
    mediumGray: '#9e9e9e'   // Medium gray
  };
  
  constructor(config: StationCoverageReportConfig, data: StationCoverageReportData) {
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
      console.error('📋 PDF DEBUG: ❌ autoTable is not a function:', autoTable);
    }
    
    // Apply custom branding
    if (config.customBranding) {
      this.colors.primary = config.customBranding.primaryColor;
      this.colors.secondary = config.customBranding.secondaryColor;
    }
  }
  
  /**
   * Generate the complete PDF report
   */
  public async generateReport(): Promise<Blob> {
    console.log('🚀 GENERATING STATION COVERAGE REPORT');
    console.log('📋 PDF DEBUG: jsPDF instance created:', !!this.pdf);
    console.log('📋 PDF DEBUG: autoTable plugin loaded:', !!(this.pdf as any).autoTable);
    console.log('📋 PDF DEBUG: Report data:', this.data);
    console.log('📋 PDF DEBUG: Analysis results:', this.data.analysisResults);
    console.log('📋 PDF DEBUG: Stations array:', Array.isArray(this.data.stations), this.data.stations?.length);
    console.log('📋 PDF DEBUG: Gaps array:', Array.isArray(this.data.analysisResults?.identifiedGaps), this.data.analysisResults?.identifiedGaps);
    
    // Add title page
    this.addTitlePage();
    
    // Add sections based on configuration
    if (this.config.includeSections.summary) {
      this.addExecutiveSummary();
    }
    
    if (this.config.includeSections.stationInventory) {
      this.addStationInventory();
    }
    
    if (this.config.includeSections.coverageAnalysis) {
      this.addCoverageAnalysis();
    }
    
    if (this.config.includeSections.gapAssessment) {
      this.addGapAssessment();
    }
    
    if (this.config.includeSections.recommendations) {
      this.addRecommendations();
    }
    
    if (this.config.includeSections.nfpaCompliance) {
      this.addNFPACompliance();
    }
    
    if (this.config.includeSections.performanceMetrics) {
      this.addPerformanceMetrics();
    }
    
    // Add footer to all pages
    this.addFooterToAllPages();
    
    // Return PDF as blob
    return new Promise((resolve) => {
      const pdfBlob = this.pdf.output('blob');
      console.log('✅ PDF generated successfully, size:', pdfBlob.size, 'bytes');
      resolve(pdfBlob);
    });
  }
  
  /**
   * Add title page
   */
  private addTitlePage(): void {
    this.pdf.setFillColor(this.colors.primary);
    this.pdf.rect(0, 0, 210, 297, 'F'); // Full page background
    
    // Department logo (if provided)
    if (this.config.departmentLogo) {
      try {
        this.pdf.addImage(this.config.departmentLogo, 'PNG', 85, 50, 40, 40);
      } catch (error) {
        console.warn('Failed to add logo:', error);
      }
    }
    
    // Title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.centerText(this.config.title, 120);
    
    // Subtitle
    if (this.config.subtitle) {
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'normal');
      this.centerText(this.config.subtitle, 135);
    }
    
    // Department name
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.centerText(this.config.departmentName, 160);
    
    // Report date
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.centerText(`Generated: ${new Date().toLocaleDateString()}`, 180);
    
    // NFPA standard
    const standard = this.data.coverageStandard.toUpperCase();
    this.centerText(`Analysis Standard: ${standard}`, 195);
    
    // Chief information
    if (this.config.chiefName) {
      this.pdf.setFontSize(14);
      this.centerText(`${this.config.chiefTitle || 'Fire Chief'}: ${this.config.chiefName}`, 220);
    }
    
    this.addNewPage();
  }
  
  /**
   * Add executive summary
   */
  private addExecutiveSummary(): void {
    this.addSectionHeader('Executive Summary');
    
    const analysis = this.data.analysisResults || {};
    const standard = this.data.coverageStandard === 'nfpa1710' ? 'NFPA 1710' : 'NFPA 1720';
    
    // Safe getters with defaults
    const totalStations = analysis.totalStations || this.data.stations?.length || 0;
    const compliance = analysis.coverageMetrics?.nfpaCompliance || 0;
    const populationCovered = analysis.coverageMetrics?.populationCovered || 0;
    const areaCovered = analysis.coverageMetrics?.areaCovered || 0;
    const gapsCount = analysis.identifiedGaps?.length || 0;
    const recommendationsCount = analysis.recommendedStations?.length || 0;
    
    // Summary text
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.text);
    
    const summaryText = this.config.customText?.executiveSummary || 
      `This report presents a comprehensive analysis of fire station coverage for ${this.config.departmentName}. ` +
      `The analysis evaluated ${totalStations} fire stations against ${standard} standards, ` +
      `achieving ${compliance.toFixed(1)}% compliance. ` +
      `${gapsCount} coverage gaps were identified, with ${recommendationsCount} ` +
      `strategic station placements recommended to improve service delivery.`;
    
    this.addWrappedText(summaryText, 15);
    this.yPosition += 10;
    
    // Key metrics table
    this.addSubHeader('Key Performance Indicators');
    
    const metricsData = [
      ['Total Fire Stations', totalStations.toString()],
      ['Coverage Standard', standard],
      ['Population Coverage', `${populationCovered.toFixed(1)}%`],
      ['Area Coverage', `${areaCovered.toFixed(1)}%`],
      ['NFPA Compliance', `${compliance.toFixed(1)}%`],
      ['Identified Gaps', gapsCount.toString()],
      ['Recommended Stations', recommendationsCount.toString()]
    ];
    
    (this.pdf as any).autoTable({
      startY: this.yPosition,
      head: [['Metric', 'Value']],
      body: metricsData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: this.colors.primary },
      margin: { left: 15, right: 15 }
    });
    
    this.yPosition = (this.pdf as any).lastAutoTable.finalY + 10;
  }
  
  /**
   * Add station inventory
   */
  private addStationInventory(): void {
    this.addSectionHeader('Fire Station Inventory');
    
    // Ensure stations is always an array
    const stations = Array.isArray(this.data.stations) ? this.data.stations : [];
    
    // Prepare station data for table
    const stationData = stations.map(station => [
      station.station_id,
      station.station_name,
      station.station_type || 'N/A',
      station.apparatus_count?.toString() || 'N/A',
      station.staffing_level?.toString() || 'N/A',
      station.operational_status,
      `${station.latitude.toFixed(4)}, ${station.longitude.toFixed(4)}`
    ]);
    
    (this.pdf as any).autoTable({
      startY: this.yPosition,
      head: [['Station ID', 'Station Name', 'Type', 'Apparatus', 'Staffing', 'Status', 'Coordinates']],
      body: stationData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: this.colors.station },
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 35 }
      }
    });
    
    this.yPosition = (this.pdf as any).lastAutoTable.finalY + 15;
  }
  
  /**
   * Add coverage analysis
   */
  private addCoverageAnalysis(): void {
    this.addSectionHeader('Coverage Analysis');
    
    const analysis = this.data.analysisResults || {};
    const standard = this.data.coverageStandard === 'nfpa1710' ? 
      'NFPA 1710 (4-minute travel time)' : 'NFPA 1720 (8-minute travel time)';
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.text);
    
    const analysisText = `Coverage analysis was performed using ${standard} standards. ` +
      `The analysis evaluated response coverage across the jurisdiction to identify areas meeting ` +
      `NFPA compliance requirements and areas requiring improvement.`;
    
    this.addWrappedText(analysisText, 15);
    this.yPosition += 10;
    
    // Coverage metrics
    this.addSubHeader('Coverage Metrics');
    
    const populationCovered = analysis.coverageMetrics?.populationCovered || 0;
    const areaCovered = analysis.coverageMetrics?.areaCovered || 0;
    const compliance = analysis.coverageMetrics?.nfpaCompliance || 0;
    
    const coverageData = [
      ['Population Coverage', `${populationCovered.toFixed(1)}%`, this.getCoverageStatus(populationCovered)],
      ['Geographic Area Coverage', `${areaCovered.toFixed(1)}%`, this.getCoverageStatus(areaCovered)],
      ['Overall NFPA Compliance', `${compliance.toFixed(1)}%`, this.getCoverageStatus(compliance)]
    ];
    
    (this.pdf as any).autoTable({
      startY: this.yPosition,
      head: [['Coverage Type', 'Percentage', 'Status']],
      body: coverageData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: this.colors.coverage },
      margin: { left: 15, right: 15 }
    });
    
    this.yPosition = (this.pdf as any).lastAutoTable.finalY + 15;
  }
  
  /**
   * Add gap assessment
   */
  private addGapAssessment(): void {
    this.addSectionHeader('Coverage Gap Assessment');
    
    // DEBUG: Log the analysis results structure
    console.log('🔍 GAP ASSESSMENT DEBUG:', {
      analysisResults: this.data.analysisResults,
      identifiedGaps: this.data.analysisResults?.identifiedGaps,
      gapsType: typeof this.data.analysisResults?.identifiedGaps,
      gapsIsArray: Array.isArray(this.data.analysisResults?.identifiedGaps),
      gapsLength: this.data.analysisResults?.identifiedGaps?.length
    });
    
    // Ensure gaps is always an array
    const rawGaps = this.data.analysisResults?.identifiedGaps;
    const gaps = Array.isArray(rawGaps) ? rawGaps : [];
    
    // DEBUG: More specific logging
    console.log('🔍 PROCESSED GAPS:', { gaps, gapsLength: gaps.length });
    
    if (gaps.length === 0) {
      this.pdf.setFontSize(11);
      this.pdf.setTextColor(this.colors.warning); // Changed to warning color to make it obvious
      this.pdf.setFont('helvetica', 'normal');
      this.addWrappedText('⚠️ DEBUG: No gaps found in data structure. This may indicate a data flow issue - UI shows 684 gaps but PDF generator receives 0 gaps.', 15);
      this.yPosition += 15;
      return;
    }
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.text);
    this.addWrappedText(`${gaps.length} coverage gaps were identified through grid-based analysis. These areas do not meet NFPA response time requirements and should be prioritized for improvement.`, 15);
    this.yPosition += 10;
    
    // Gap details table
    const gapData = gaps.map((gap, index) => [
      `Gap ${index + 1}`,
      gap.severity.charAt(0).toUpperCase() + gap.severity.slice(1),
      gap.estimatedPopulation.toString(),
      `${gap.center[0].toFixed(4)}, ${gap.center[1].toFixed(4)}`,
      'Response time exceeds NFPA standards'
    ]);
    
    (this.pdf as any).autoTable({
      startY: this.yPosition,
      head: [['Gap ID', 'Severity', 'Est. Population', 'Location', 'Issue']],
      body: gapData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: this.colors.gap },
      margin: { left: 15, right: 15 }
    });
    
    this.yPosition = (this.pdf as any).lastAutoTable.finalY + 15;
  }
  
  /**
   * Add recommendations
   */
  private addRecommendations(): void {
    this.addSectionHeader('Station Placement Recommendations');
    
    // DEBUG: Log the recommendations structure
    console.log('🔍 RECOMMENDATIONS DEBUG:', {
      recommendedStations: this.data.analysisResults?.recommendedStations,
      recType: typeof this.data.analysisResults?.recommendedStations,
      recIsArray: Array.isArray(this.data.analysisResults?.recommendedStations),
      recLength: this.data.analysisResults?.recommendedStations?.length
    });
    
    // Ensure recommendations is always an array
    const rawRecommendations = this.data.analysisResults?.recommendedStations;
    const recommendations = Array.isArray(rawRecommendations) ? rawRecommendations : [];
    
    if (recommendations.length === 0) {
      this.pdf.setFontSize(11);
      this.pdf.setTextColor(this.colors.warning); // Changed to warning color
      this.pdf.setFont('helvetica', 'normal');
      this.addWrappedText('⚠️ DEBUG: No recommendations found in data structure. UI shows 39 stations recommended but PDF generator receives 0 recommendations.', 15);
      this.yPosition += 15;
      return;
    }
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.text);
    this.addWrappedText(`${recommendations.length} strategic station placements are recommended to improve coverage and NFPA compliance. These recommendations are based on gap analysis and population density.`, 15);
    this.yPosition += 10;
    
    // Recommendations table
    const recData = recommendations.map((rec, index) => [
      `Station ${index + 1}`,
      rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1),
      rec.gapsCovered.toString(),
      rec.estimatedPopulationServed.toString(),
      `${rec.position[0].toFixed(4)}, ${rec.position[1].toFixed(4)}`,
      rec.reasoning
    ]);
    
    (this.pdf as any).autoTable({
      startY: this.yPosition,
      head: [['Recommendation', 'Priority', 'Gaps Covered', 'Population Served', 'Location', 'Rationale']],
      body: recData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: this.colors.recommendation },
      margin: { left: 15, right: 15 },
      columnStyles: {
        5: { cellWidth: 50 } // Wider column for rationale
      }
    });
    
    this.yPosition = (this.pdf as any).lastAutoTable.finalY + 15;
  }
  
  /**
   * Add NFPA compliance section
   */
  private addNFPACompliance(): void {
    this.addSectionHeader('NFPA Compliance Assessment');
    
    const standard = this.data.coverageStandard;
    const compliance = this.data.analysisResults?.coverageMetrics?.nfpaCompliance || 0;
    
    // NFPA standard details
    this.addSubHeader(`${standard.toUpperCase()} Requirements`);
    
    const standardDetails = standard === 'nfpa1710' ? {
      department: 'Career Fire Departments',
      travelTime: '4 minutes',
      responseTime: '8 minutes total',
      coverage: '90%',
      crew: '4 firefighters minimum'
    } : {
      department: 'Volunteer Fire Departments', 
      travelTime: '8 minutes',
      responseTime: '10 minutes total',
      coverage: '80%',
      crew: 'Varies by department'
    };
    
    const complianceData = [
      ['Department Type', standardDetails.department],
      ['Travel Time Standard', standardDetails.travelTime],
      ['Total Response Time', standardDetails.responseTime],
      ['Coverage Requirement', standardDetails.coverage],
      ['Current Compliance', `${compliance.toFixed(1)}%`],
      ['Compliance Status', compliance >= (standard === 'nfpa1710' ? 90 : 80) ? 'COMPLIANT' : 'NON-COMPLIANT']
    ];
    
    (this.pdf as any).autoTable({
      startY: this.yPosition,
      head: [['Requirement', 'Value']],
      body: complianceData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: this.colors.primary },
      margin: { left: 15, right: 15 }
    });
    
    this.yPosition = (this.pdf as any).lastAutoTable.finalY + 15;
  }
  
  /**
   * Add performance metrics
   */
  private addPerformanceMetrics(): void {
    this.addSectionHeader('Performance Metrics');
    
    const analysis = this.data.analysisResults || {};
    
    // Analysis summary
    const analysisDate = analysis.analysisDate ? new Date(analysis.analysisDate).toLocaleDateString() : new Date().toLocaleDateString();
    const totalStations = analysis.totalStations || this.data.stations?.length || 0;
    const gapsCount = analysis.identifiedGaps?.length || 0;
    const recommendationsCount = analysis.recommendedStations?.length || 0;
    
    const metricsText = `Analysis completed on ${analysisDate} ` +
      `using advanced grid-based coverage algorithms. The assessment evaluated ${totalStations} stations ` +
      `across the jurisdiction to identify coverage gaps and optimization opportunities.`;
    
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.text);
    this.addWrappedText(metricsText, 15);
    this.yPosition += 10;
    
    // Performance summary
    this.addSubHeader('Analysis Summary');
    
    const performanceData = [
      ['Analysis Date', analysisDate],
      ['Total Stations Evaluated', totalStations.toString()],
      ['Coverage Gaps Identified', gapsCount.toString()],
      ['Recommended Improvements', recommendationsCount.toString()],
      ['Analysis Method', 'Grid-based geographic analysis'],
      ['Standard Applied', this.data.coverageStandard.toUpperCase()]
    ];
    
    (this.pdf as any).autoTable({
      startY: this.yPosition,
      head: [['Metric', 'Value']],
      body: performanceData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: this.colors.secondary },
      margin: { left: 15, right: 15 }
    });
    
    this.yPosition = (this.pdf as any).lastAutoTable.finalY + 15;
  }
  
  // Helper methods
  private addSectionHeader(title: string): void {
    // Ensure enough space for section header + some content with conservative margin
    if (this.yPosition > 230) {
      this.addNewPage();
    }
    
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(title, 15, this.yPosition);
    this.yPosition += 18; // More space after section headers
  }
  
  private addSubHeader(title: string): void {
    // Ensure enough space for subheader + some content with conservative margin
    if (this.yPosition > 250) {
      this.addNewPage();
    }
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.text);
    this.pdf.text(title, 15, this.yPosition);
    this.yPosition += 12; // More space after subheaders
  }
  
  private addWrappedText(text: string, leftMargin: number): void {
    const maxWidth = 155; // Further reduced to prevent text cutoff
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    
    // Ensure proper font settings before rendering text
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.text);
    
    for (const line of lines) {
      // Check for page break with more conservative margin
      if (this.yPosition > 245) {
        this.addNewPage();
      }
      this.pdf.text(line, leftMargin, this.yPosition);
      this.yPosition += 9; // More spacing to prevent overlap
    }
  }
  
  private centerText(text: string, y: number): void {
    const textWidth = this.pdf.getTextWidth(text);
    const x = (210 - textWidth) / 2;
    this.pdf.text(text, x, y);
  }
  
  private getCoverageStatus(percentage: number): string {
    const threshold = this.data.coverageStandard === 'nfpa1710' ? 90 : 80;
    if (percentage >= threshold) return 'COMPLIANT';
    if (percentage >= threshold - 10) return 'PARTIAL';
    return 'NON-COMPLIANT';
  }
  
  private addNewPage(): void {
    this.pdf.addPage();
    this.pageNumber++;
    this.yPosition = 20;
  }
  
  private addFooterToAllPages(): void {
    const totalPages = this.pageNumber;
    
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      
      // Footer line
      this.pdf.setDrawColor(this.colors.mediumGray);
      this.pdf.line(15, 285, 195, 285);
      
      // Footer text
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(this.colors.mediumGray);
      this.pdf.setFont('helvetica', 'normal');
      
      // Left side - department name
      this.pdf.text(this.config.departmentName, 15, 290);
      
      // Center - report title
      const centerText = this.config.title;
      const centerX = (210 - this.pdf.getTextWidth(centerText)) / 2;
      this.pdf.text(centerText, centerX, 290);
      
      // Right side - page number
      const pageText = `Page ${i} of ${totalPages}`;
      const pageX = 195 - this.pdf.getTextWidth(pageText);
      this.pdf.text(pageText, pageX, 290);
    }
  }
}

/**
 * Generate station coverage report
 */
export const generateStationCoverageReport = async (
  config: StationCoverageReportConfig,
  data: StationCoverageReportData
): Promise<Blob> => {
  const generator = new StationCoveragePDFReportGenerator(config, data);
  return await generator.generateReport();
};