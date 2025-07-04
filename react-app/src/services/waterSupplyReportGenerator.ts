/**
 * Water Supply Coverage PDF Report Generator
 * 
 * Generates professional PDF reports for water supply coverage analysis
 * Supports PA 17 compliance reports, coverage assessments, and planning documents
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface WaterSupplyReportConfig {
  reportType: 'coverage' | 'compliance' | 'planning' | 'custom';
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
    tankInventory: boolean;
    hydrantInventory: boolean;
    coverageAnalysis: boolean;
    gapAssessment: boolean;
    recommendations: boolean;
    compliance: boolean; // PA 17 compliance
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

export interface WaterSupplyReportData {
  tanks: Array<{
    id: string;
    name: string;
    location: { latitude: number; longitude: number };
    capacity: number;
    type: string;
    accessRating: string;
    operationalStatus: string;
    owner: string;
    notes?: string;
  }>;
  hydrants: Array<{
    id: string;
    name: string;
    location: { latitude: number; longitude: number };
    flowRate: number;
    staticPressure: number;
    residualPressure: number;
    type: string;
    size: string;
    operationalStatus: string;
    owner: string;
    notes?: string;
  }>;
  coverageZones?: Array<{
    id: string;
    center: { latitude: number; longitude: number };
    radius: number;
    supplyId: string;
    supplyType: 'tank' | 'hydrant';
  }>;
  analysis?: {
    totalCoverage: number;
    gaps: Array<{
      id: string;
      location: { latitude: number; longitude: number };
      severity: 'high' | 'medium' | 'low';
    }>;
    redundancy: Array<{
      location: { latitude: number; longitude: number };
      supplyCount: number;
    }>;
  };
}

export class WaterSupplyPDFReportGenerator {
  private pdf: jsPDF;
  private config: WaterSupplyReportConfig;
  private data: WaterSupplyReportData;
  private pageNumber: number = 1;
  private yPosition: number = 20;
  
  // Colors and styling
  private colors = {
    primary: '#1976d2',     // Professional blue
    secondary: '#0d47a1',   // Darker blue
    success: '#2e7d32',     // Green for compliant
    warning: '#f57c00',     // Orange for warnings
    error: '#d32f2f',       // Red for critical issues
    tank: '#ff9800',        // Orange for tanks
    hydrant: '#2196f3',     // Blue for hydrants
    text: '#333333',        // Dark gray text
    lightGray: '#f5f5f5',   // Light background
    mediumGray: '#9e9e9e'   // Medium gray
  };
  
  constructor(config: WaterSupplyReportConfig, data: WaterSupplyReportData) {
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
    console.log('🚀 GENERATING WATER SUPPLY COVERAGE REPORT');
    console.log('📋 PDF DEBUG: jsPDF instance created:', !!this.pdf);
    console.log('📋 PDF DEBUG: autoTable plugin loaded:', !!(this.pdf as any).autoTable);
    
    // Add title page
    this.addTitlePage();
    
    // Add executive summary
    if (this.config.includeSections.summary) {
      this.addNewPage();
      this.addExecutiveSummary();
    }
    
    // Add tank inventory
    if (this.config.includeSections.tankInventory) {
      this.addNewPage();
      this.addTankInventorySection();
    }
    
    // Add hydrant inventory
    if (this.config.includeSections.hydrantInventory) {
      this.addNewPage();
      this.addHydrantInventorySection();
    }
    
    // Add coverage analysis
    if (this.config.includeSections.coverageAnalysis) {
      this.addNewPage();
      this.addCoverageAnalysisSection();
    }
    
    // Add gap assessment
    if (this.config.includeSections.gapAssessment) {
      this.addNewPage();
      this.addGapAssessmentSection();
    }
    
    // Add compliance section
    if (this.config.includeSections.compliance) {
      this.addNewPage();
      this.addComplianceSection();
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
      const logoSize = 30;
      const logoX = this.config.customBranding?.logoPosition === 'center' ? 
        (210 - logoSize) / 2 : 
        this.config.customBranding?.logoPosition === 'right' ? 
        210 - logoSize - 20 : 20;
      
      try {
        let format: 'PNG' | 'JPEG' | 'JPG' = 'PNG';
        if (this.config.departmentLogo.includes('data:image/jpeg') || this.config.departmentLogo.includes('data:image/jpg')) {
          format = 'JPEG';
        }
        
        this.pdf.addImage(this.config.departmentLogo, format, logoX, this.yPosition, logoSize, logoSize);
        this.yPosition += logoSize + 10;
      } catch (error) {
        console.error('Failed to add logo:', error);
        this.pdf.setFontSize(12);
        this.pdf.setTextColor(this.colors.mediumGray);
        this.pdf.text('[Department Logo - Failed to Load]', logoX, this.yPosition + 15);
        this.yPosition += 25;
      }
    }
    
    // Main title
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(this.colors.primary);
    this.addCenteredText(this.config.title, this.yPosition);
    this.yPosition += 15;
    
    // Subtitle
    if (this.config.subtitle) {
      this.pdf.setFontSize(16);
      this.pdf.setTextColor(this.colors.text);
      this.addCenteredText(this.config.subtitle, this.yPosition);
      this.yPosition += 10;
    }
    
    // Department name
    this.pdf.setFontSize(18);
    this.pdf.setTextColor(this.colors.secondary);
    this.addCenteredText(this.config.departmentName, this.yPosition);
    this.yPosition += 20;
    
    // Report period (if provided)
    if (this.config.reportPeriod) {
      this.pdf.setFontSize(14);
      this.pdf.setTextColor(this.colors.text);
      const periodText = `Analysis Period: ${this.config.reportPeriod.startDate} to ${this.config.reportPeriod.endDate}`;
      this.addCenteredText(periodText, this.yPosition);
      this.yPosition += 20;
    }
    
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
      
      const messageLines = this.pdf.splitTextToSize(this.config.customText.chiefMessage, 170);
      messageLines.forEach((line: string) => {
        this.pdf.text(line, 20, this.yPosition);
        this.yPosition += 6;
      });
    }
    
    // Chief signature area
    if (this.config.chiefName) {
      this.yPosition = 220;
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
    
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.text);
    
    const summaryText = this.config.customText?.executiveSummary || 
      `This report provides a comprehensive analysis of water supply coverage for ${this.config.departmentName}.`;
    
    const summaryContent = [
      summaryText,
      '',
      'Water Supply Infrastructure:',
      `• Total Tanks: ${this.data.tanks.length}`,
      `• Total Hydrants: ${this.data.hydrants.length}`,
      `• Total Water Sources: ${this.data.tanks.length + this.data.hydrants.length}`,
      '',
      'Capacity Analysis:',
      `• Total Tank Capacity: ${this.getTotalTankCapacity().toLocaleString()} gallons`,
      `• Average Tank Capacity: ${this.getAverageTankCapacity().toLocaleString()} gallons`,
      `• Total Hydrant Flow Rate: ${this.getTotalHydrantFlow().toLocaleString()} GPM`,
      '',
      'Coverage Assessment:',
      this.getCoverageOverview()
    ];
    
    summaryContent.forEach(line => {
      if (this.yPosition > 250) {
        this.addNewPage();
      }
      this.pdf.text(line, 20, this.yPosition);
      this.yPosition += 6;
    });
  }
  
  /**
   * Add tank inventory section
   */
  private addTankInventorySection(): void {
    this.addSectionHeader('Tank Inventory');
    
    if (this.data.tanks.length === 0) {
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(this.colors.text);
      this.pdf.text('No tanks recorded in the system.', 20, this.yPosition);
      return;
    }
    
    // Create tank table
    try {
      const tankData = this.data.tanks.map(tank => [
        tank.name,
        `${tank.capacity.toLocaleString()} gal`,
        tank.type,
        tank.accessRating,
        tank.operationalStatus,
        tank.owner
      ]);

      this.pdf.autoTable({
        head: [['Tank Name', 'Capacity', 'Type', 'Access', 'Status', 'Owner']],
        body: tankData,
        startY: this.yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: [255, 152, 0], // Orange for tanks
          textColor: 255
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Tank Name
          1: { cellWidth: 25 }, // Capacity
          2: { cellWidth: 25 }, // Type
          3: { cellWidth: 20 }, // Access
          4: { cellWidth: 20 }, // Status
          5: { cellWidth: 25 }  // Owner
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data: any) => {
          this.yPosition = data.cursor.y + 10;
        }
      });
    } catch (error) {
      console.error('Could not create tank table:', error);
      this.addTextFallbackTable('Tanks', this.data.tanks);
    }
  }
  
  /**
   * Add hydrant inventory section
   */
  private addHydrantInventorySection(): void {
    this.addSectionHeader('Hydrant Inventory');
    
    if (this.data.hydrants.length === 0) {
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(this.colors.text);
      this.pdf.text('No hydrants recorded in the system.', 20, this.yPosition);
      return;
    }
    
    // Create hydrant table
    try {
      const hydrantData = this.data.hydrants.map(hydrant => [
        hydrant.name,
        `${hydrant.flowRate} GPM`,
        `${hydrant.staticPressure} PSI`,
        hydrant.size,
        hydrant.operationalStatus,
        hydrant.owner
      ]);

      this.pdf.autoTable({
        head: [['Hydrant Name', 'Flow Rate', 'Pressure', 'Size', 'Status', 'Owner']],
        body: hydrantData,
        startY: this.yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: [33, 150, 243], // Blue for hydrants
          textColor: 255
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Hydrant Name
          1: { cellWidth: 25 }, // Flow Rate
          2: { cellWidth: 25 }, // Pressure
          3: { cellWidth: 20 }, // Size
          4: { cellWidth: 20 }, // Status
          5: { cellWidth: 25 }  // Owner
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data: any) => {
          this.yPosition = data.cursor.y + 10;
        }
      });
    } catch (error) {
      console.error('Could not create hydrant table:', error);
      this.addTextFallbackTable('Hydrants', this.data.hydrants);
    }
  }
  
  /**
   * Add coverage analysis section
   */
  private addCoverageAnalysisSection(): void {
    this.addSectionHeader('Coverage Analysis');
    
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.text);
    
    const coverageContent = [
      'Water Supply Coverage Assessment:',
      '',
      'Tank Coverage Analysis:',
      `• Number of Tanks: ${this.data.tanks.length}`,
      `• Average Coverage Radius: ${this.getAverageCoverageRadius()} feet`,
      `• Total Area Covered by Tanks: ${this.calculateTankCoverageArea()} square miles`,
      '',
      'Hydrant Coverage Analysis:',
      `• Number of Hydrants: ${this.data.hydrants.length}`,
      `• Average Flow Rate: ${this.getAverageHydrantFlow()} GPM`,
      `• Hydrant Distribution: ${this.getHydrantDistribution()}`,
      '',
      'Combined Coverage:',
      this.getCombinedCoverageAnalysis()
    ];
    
    coverageContent.forEach(line => {
      if (this.yPosition > 250) {
        this.addNewPage();
      }
      this.pdf.text(line, 20, this.yPosition);
      this.yPosition += 6;
    });
  }
  
  /**
   * Add gap assessment section
   */
  private addGapAssessmentSection(): void {
    this.addSectionHeader('Coverage Gap Assessment');
    
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.text);
    
    const gapContent = [
      'Coverage Gap Analysis:',
      '',
      'Identified Coverage Gaps:',
      this.getGapAnalysis(),
      '',
      'Recommendations for Gap Coverage:',
      ...this.getGapRecommendations()
    ];
    
    gapContent.forEach(line => {
      if (this.yPosition > 250) {
        this.addNewPage();
      }
      this.pdf.text(line, 20, this.yPosition);
      this.yPosition += 6;
    });
  }
  
  /**
   * Add compliance section (PA 17, etc.)
   */
  private addComplianceSection(): void {
    this.addSectionHeader('Regulatory Compliance');
    
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.text);
    
    const complianceContent = [
      'PA 17 Compliance Assessment:',
      '',
      'Tank Requirements:',
      `✓ Tank locations documented: ${this.data.tanks.length > 0 ? 'YES' : 'NO'}`,
      `✓ Capacity information available: ${this.hasCapacityInfo() ? 'YES' : 'NO'}`,
      `✓ Access ratings documented: ${this.hasAccessRatings() ? 'YES' : 'NO'}`,
      '',
      'Hydrant Requirements:',
      `✓ Hydrant locations documented: ${this.data.hydrants.length > 0 ? 'YES' : 'NO'}`,
      `✓ Flow rate testing data: ${this.hasFlowRateData() ? 'YES' : 'NO'}`,
      `✓ Pressure testing data: ${this.hasPressureData() ? 'YES' : 'NO'}`,
      '',
      'Overall Compliance Status:',
      this.getOverallComplianceStatus()
    ];
    
    complianceContent.forEach(line => {
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
    
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(this.colors.text);
    
    const recommendations = this.generateRecommendations();
    
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
    const x = (210 - textWidth) / 2;
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
  
  private addTextFallbackTable(type: string, data: any[]): void {
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(this.colors.text);
    
    data.slice(0, 10).forEach((item, index) => {
      if (this.yPosition > 250) {
        this.addNewPage();
      }
      this.pdf.text(`${index + 1}. ${item.name}`, 20, this.yPosition);
      this.yPosition += 5;
    });
  }
  
  // Analysis helper methods
  private getTotalTankCapacity(): number {
    return this.data.tanks.reduce((total, tank) => total + tank.capacity, 0);
  }
  
  private getAverageTankCapacity(): number {
    if (this.data.tanks.length === 0) return 0;
    return this.getTotalTankCapacity() / this.data.tanks.length;
  }
  
  private getTotalHydrantFlow(): number {
    return this.data.hydrants.reduce((total, hydrant) => total + hydrant.flowRate, 0);
  }
  
  private getAverageHydrantFlow(): number {
    if (this.data.hydrants.length === 0) return 0;
    return this.getTotalHydrantFlow() / this.data.hydrants.length;
  }
  
  private getAverageCoverageRadius(): string {
    // Capacity-based coverage calculation similar to TankMapContainer
    const avgCapacity = this.getAverageTankCapacity();
    let radius = 1000; // Default
    
    if (avgCapacity >= 100000) radius = 1500;
    else if (avgCapacity >= 50000) radius = 1200;
    else if (avgCapacity >= 25000) radius = 1000;
    else radius = 800;
    
    return radius.toString();
  }
  
  private calculateTankCoverageArea(): string {
    const avgRadius = parseFloat(this.getAverageCoverageRadius());
    const areaPerTank = Math.PI * Math.pow(avgRadius / 5280, 2); // Convert feet to miles
    const totalArea = areaPerTank * this.data.tanks.length;
    return totalArea.toFixed(2);
  }
  
  private getHydrantDistribution(): string {
    if (this.data.hydrants.length === 0) return 'No hydrants recorded';
    if (this.data.hydrants.length < 5) return 'Limited distribution';
    if (this.data.hydrants.length < 15) return 'Moderate distribution';
    return 'Good distribution';
  }
  
  private getCoverageOverview(): string {
    const totalSources = this.data.tanks.length + this.data.hydrants.length;
    if (totalSources === 0) return '⚠ No water sources recorded';
    if (totalSources < 5) return '⚠ Limited water supply coverage - consider additional sources';
    if (totalSources < 15) return '✓ Adequate water supply coverage with room for improvement';
    return '✓ Excellent water supply coverage';
  }
  
  private getCombinedCoverageAnalysis(): string {
    return `Combined tank and hydrant coverage provides ${this.data.tanks.length + this.data.hydrants.length} water sources across the service area.`;
  }
  
  private getGapAnalysis(): string {
    if (this.data.analysis?.gaps) {
      const highPriorityGaps = this.data.analysis.gaps.filter(gap => gap.severity === 'high').length;
      if (highPriorityGaps > 0) {
        return `${highPriorityGaps} high-priority coverage gaps identified requiring immediate attention.`;
      }
      return `${this.data.analysis.gaps.length} coverage gaps identified with varying priority levels.`;
    }
    return 'Gap analysis requires coverage zone data to be available.';
  }
  
  private getGapRecommendations(): string[] {
    const recommendations = [];
    
    if (this.data.tanks.length === 0) {
      recommendations.push('• Consider installing mobile water tanks for rural coverage');
    }
    
    if (this.data.hydrants.length < 10) {
      recommendations.push('• Evaluate hydrant placement for optimal coverage');
    }
    
    if (this.getTotalTankCapacity() < 100000) {
      recommendations.push('• Consider increasing tank capacity for extended operations');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('• Maintain current water supply infrastructure');
      recommendations.push('• Conduct annual coverage assessments');
    }
    
    return recommendations;
  }
  
  private hasCapacityInfo(): boolean {
    return this.data.tanks.every(tank => tank.capacity > 0);
  }
  
  private hasAccessRatings(): boolean {
    return this.data.tanks.every(tank => tank.accessRating && tank.accessRating !== '');
  }
  
  private hasFlowRateData(): boolean {
    return this.data.hydrants.every(hydrant => hydrant.flowRate > 0);
  }
  
  private hasPressureData(): boolean {
    return this.data.hydrants.every(hydrant => hydrant.staticPressure > 0);
  }
  
  private getOverallComplianceStatus(): string {
    const checks = [
      this.data.tanks.length > 0,
      this.data.hydrants.length > 0,
      this.hasCapacityInfo(),
      this.hasFlowRateData()
    ];
    
    const passedChecks = checks.filter(Boolean).length;
    const compliance = (passedChecks / checks.length) * 100;
    
    if (compliance >= 90) return '✓ Excellent compliance with regulatory requirements';
    if (compliance >= 70) return '⚠ Good compliance with minor improvements needed';
    return '⚠ Compliance improvements required';
  }
  
  private generateRecommendations(): string[] {
    const recommendations = [
      'Water Supply Infrastructure Recommendations:',
      ''
    ];
    
    // Tank recommendations
    if (this.data.tanks.length === 0) {
      recommendations.push('• Install at least one mobile water tank for rural operations');
    } else if (this.data.tanks.length < 3) {
      recommendations.push('• Consider additional tank installations for redundancy');
    }
    
    // Hydrant recommendations
    if (this.data.hydrants.length === 0) {
      recommendations.push('• Work with water authority to install hydrants in service area');
    } else if (this.data.hydrants.length < 10) {
      recommendations.push('• Evaluate hydrant spacing for optimal coverage');
    }
    
    // Capacity recommendations
    const avgCapacity = this.getAverageTankCapacity();
    if (avgCapacity < 25000) {
      recommendations.push('• Consider larger capacity tanks for extended operations');
    }
    
    // Flow recommendations
    const avgFlow = this.getAverageHydrantFlow();
    if (avgFlow < 1000) {
      recommendations.push('• Test hydrant flow rates to ensure adequate pressure');
    }
    
    recommendations.push('');
    recommendations.push('General Recommendations:');
    recommendations.push('• Conduct annual water supply coverage assessments');
    recommendations.push('• Maintain detailed records of all water sources');
    recommendations.push('• Test hydrant flow rates annually');
    recommendations.push('• Review tank maintenance schedules quarterly');
    
    return recommendations;
  }
}

/**
 * Convenience function to generate a water supply coverage report
 */
export async function generateWaterSupplyReport(
  config: WaterSupplyReportConfig,
  data: WaterSupplyReportData
): Promise<Blob> {
  console.log('🚀 GENERATING WATER SUPPLY COVERAGE REPORT');
  
  const generator = new WaterSupplyPDFReportGenerator(config, data);
  return await generator.generateReport();
}