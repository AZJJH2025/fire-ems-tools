/**
 * ISO Credit Calculator PDF Report Generator
 * 
 * Follows the EXACT same pattern that worked for Water Supply Coverage and Response Time Analyzer
 * Based on proven architecture from CLAUDE.md debugging lessons
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';  // ✅ Named import required (proven pattern)

export interface ISOReportConfig {
  template: string;
  departmentName: string;
  chiefName: string;
  reportDate: string;
  logoDataUrl?: string;
}

export interface ISOReportData {
  currentScore: number;
  classification: number;
  assessment: {
    fireDepartment: {
      staffing: number;
      equipment: number;
      training: number;
      distribution: number;
    };
    waterSupply: {
      capacity: number;
      distribution: number;
      alternative: number;
    };
    communications: {
      dispatch: number;
      alerting: number;
    };
    communityRiskReduction: {
      prevention: number;
      education: number;
      investigation: number;
    };
  };
  recommendations?: any[];
  communityProfile?: {
    population: number;
    avgHomePremium: number;
    commercialPremiums: number;
  };
}

export class ISOReportGenerator {
  private pdf: jsPDF;
  private config: ISOReportConfig;
  private data: ISOReportData;
  private yPosition: number = 20;

  constructor(config: ISOReportConfig, data: ISOReportData) {
    this.pdf = new jsPDF('portrait', 'mm', 'a4');
    this.config = config;
    this.data = data;
    
    // MANDATORY: Manual attachment with debugging (proven pattern from CLAUDE.md)
    console.log('📋 PDF DEBUG: autoTable import:', typeof autoTable);
    if (typeof autoTable === 'function') {
      // Attach autoTable as a method on the PDF instance
      (this.pdf as any).autoTable = autoTable.bind(null, this.pdf);
      console.log('📋 PDF DEBUG: ✅ autoTable attached successfully');
    } else {
      console.error('📋 PDF DEBUG: ❌ autoTable is not a function:', autoTable);
    }
  }

  /**
   * Generate the complete PDF report
   */
  public generateReport(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🚀 GENERATING ISO CREDIT CALCULATOR REPORT');
        
        // Generate report content
        this.addHeader();
        this.addExecutiveSummary();
        this.addISOScoreBreakdown();
        this.addComplianceAnalysis();
        this.addRecommendations();
        
        // Convert to blob and return
        const pdfBlob = new Blob([this.pdf.output('blob')], { type: 'application/pdf' });
        console.log('✅ ISO PDF REPORT GENERATED SUCCESSFULLY');
        resolve(pdfBlob);
        
      } catch (error) {
        console.error('❌ ISO PDF GENERATION ERROR:', error);
        reject(error);
      }
    });
  }

  /**
   * Add professional header with department branding
   */
  private addHeader(): void {
    try {
      // Department logo (if provided)
      if (this.config.logoDataUrl) {
        try {
          this.pdf.addImage(this.config.logoDataUrl, 'PNG', 15, 15, 25, 25);
        } catch (logoError) {
          console.warn('Could not add department logo:', logoError);
        }
      }

      // Title and department info
      this.pdf.setFontSize(20);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('ISO Fire Suppression Rating Report', 50, 25);
      
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(this.config.departmentName, 50, 32);
      this.pdf.text(`Fire Chief: ${this.config.chiefName}`, 50, 38);
      this.pdf.text(`Report Date: ${this.config.reportDate}`, 50, 44);

      // Add separator line
      this.pdf.setLineWidth(0.5);
      this.pdf.line(15, 50, 195, 50);
      
      this.yPosition = 60;
      
    } catch (error) {
      console.error('Error adding header:', error);
      this.yPosition = 60; // Fallback position
    }
  }

  /**
   * Add executive summary section
   */
  private addExecutiveSummary(): void {
    try {
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Executive Summary', 15, this.yPosition);
      this.yPosition += 10;

      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'normal');
      
      const summaryText = [
        `Current ISO Classification: Class ${this.data.classification}`,
        `Total Score: ${this.data.currentScore.toFixed(1)} out of 105.5 points`,
        `Overall Performance: ${this.getPerformanceLevel()}`,
        '',
        'This report provides a comprehensive analysis of your fire department\'s',
        'ISO Fire Suppression Rating Schedule (FSRS) compliance and identifies',
        'specific opportunities for classification improvement.'
      ];

      summaryText.forEach(line => {
        this.pdf.text(line, 15, this.yPosition);
        this.yPosition += 6;
      });

      this.yPosition += 10;
      
    } catch (error) {
      console.error('Error adding executive summary:', error);
      this.yPosition += 50; // Fallback
    }
  }

  /**
   * Add ISO score breakdown with professional table
   */
  private addISOScoreBreakdown(): void {
    try {
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('ISO Score Breakdown', 15, this.yPosition);
      this.yPosition += 10;

      // Prepare table data
      const tableData = [
        ['Fire Department Operations', '50.0', this.getTotalFireDeptScore().toFixed(1), this.getComplianceStatus(this.getTotalFireDeptScore(), 50)],
        ['Water Supply', '40.0', this.getTotalWaterSupplyScore().toFixed(1), this.getComplianceStatus(this.getTotalWaterSupplyScore(), 40)],
        ['Emergency Communications', '10.0', this.getTotalCommunicationsScore().toFixed(1), this.getComplianceStatus(this.getTotalCommunicationsScore(), 10)],
        ['Community Risk Reduction', '5.5', this.getTotalCRRScore().toFixed(1), this.getComplianceStatus(this.getTotalCRRScore(), 5.5)],
        ['', '', '', ''], // Separator row
        ['TOTAL SCORE', '105.5', this.data.currentScore.toFixed(1), `Class ${this.data.classification}`]
      ];

      // Generate professional table using autoTable (proven pattern)
      if ((this.pdf as any).autoTable) {
        (this.pdf as any).autoTable({
          startY: this.yPosition,
          head: [['Category', 'Max Points', 'Current Score', 'Status']],
          body: tableData,
          styles: {
            fontSize: 10,
            cellPadding: 3
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 40, halign: 'center' }
          },
          didParseCell: (data: any) => {
            // Color code the last row (total)
            if (data.row.index === tableData.length - 1) {
              data.cell.styles.fillColor = [241, 196, 15];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        });

        this.yPosition = (this.pdf as any).lastAutoTable.finalY + 15;
      } else {
        // Fallback: Add text-based table
        console.warn('AutoTable not available, using text fallback');
        this.addTextFallbackTable('ISO Score Breakdown', tableData);
      }
      
    } catch (error) {
      console.error('Could not create ISO score breakdown table:', error);
      this.addTextFallbackTable('ISO Score Breakdown', []);
    }
  }

  /**
   * Add compliance analysis section
   */
  private addComplianceAnalysis(): void {
    try {
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Compliance Analysis', 15, this.yPosition);
      this.yPosition += 10;

      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'normal');

      const analysis = this.generateComplianceAnalysis();
      analysis.forEach(line => {
        this.pdf.text(line, 15, this.yPosition);
        this.yPosition += 6;
      });

      this.yPosition += 10;
      
    } catch (error) {
      console.error('Error adding compliance analysis:', error);
      this.yPosition += 30;
    }
  }

  /**
   * Add recommendations section
   */
  private addRecommendations(): void {
    try {
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Improvement Recommendations', 15, this.yPosition);
      this.yPosition += 10;

      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'normal');

      const recommendations = this.generateRecommendations();
      recommendations.forEach(rec => {
        this.pdf.text(`• ${rec}`, 20, this.yPosition);
        this.yPosition += 6;
      });
      
    } catch (error) {
      console.error('Error adding recommendations:', error);
      this.yPosition += 30;
    }
  }

  /**
   * Fallback text table when autoTable fails
   */
  private addTextFallbackTable(title: string, data: string[][]): void {
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, 15, this.yPosition);
    this.yPosition += 10;

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('(Professional table format not available - data summary)', 15, this.yPosition);
    this.yPosition += 10;

    // Add basic text representation
    data.forEach(row => {
      if (row.length > 0) {
        this.pdf.text(row.join(' | '), 20, this.yPosition);
        this.yPosition += 5;
      }
    });

    this.yPosition += 10;
  }

  // Helper methods for calculations
  private getTotalFireDeptScore(): number {
    return this.data.assessment.fireDepartment.staffing + 
           this.data.assessment.fireDepartment.equipment + 
           this.data.assessment.fireDepartment.training + 
           this.data.assessment.fireDepartment.distribution;
  }

  private getTotalWaterSupplyScore(): number {
    return this.data.assessment.waterSupply.capacity + 
           this.data.assessment.waterSupply.distribution + 
           this.data.assessment.waterSupply.alternative;
  }

  private getTotalCommunicationsScore(): number {
    return this.data.assessment.communications.dispatch + 
           this.data.assessment.communications.alerting;
  }

  private getTotalCRRScore(): number {
    return this.data.assessment.communityRiskReduction.prevention + 
           this.data.assessment.communityRiskReduction.education + 
           this.data.assessment.communityRiskReduction.investigation;
  }

  private getPerformanceLevel(): string {
    const percentage = (this.data.currentScore / 105.5) * 100;
    if (percentage >= 90) return 'Excellent (Class 1-2)';
    if (percentage >= 70) return 'Good (Class 3-4)';
    if (percentage >= 50) return 'Fair (Class 5-6)';
    return 'Needs Improvement (Class 7-10)';
  }

  private getComplianceStatus(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 50) return 'Fair';
    return 'Poor';
  }

  private generateComplianceAnalysis(): string[] {
    const analysis = [];
    
    analysis.push(`Your department achieved ${this.data.currentScore.toFixed(1)} out of 105.5 possible points,`);
    analysis.push(`resulting in a Class ${this.data.classification} ISO rating.`);
    analysis.push('');
    
    // Analyze each category
    const fdScore = this.getTotalFireDeptScore();
    analysis.push(`Fire Department Operations: ${fdScore.toFixed(1)}/50.0 points (${((fdScore/50)*100).toFixed(1)}%)`);
    
    const wsScore = this.getTotalWaterSupplyScore();
    analysis.push(`Water Supply: ${wsScore.toFixed(1)}/40.0 points (${((wsScore/40)*100).toFixed(1)}%)`);
    
    const commScore = this.getTotalCommunicationsScore();
    analysis.push(`Communications: ${commScore.toFixed(1)}/10.0 points (${((commScore/10)*100).toFixed(1)}%)`);
    
    return analysis;
  }

  private generateRecommendations(): string[] {
    const recommendations = [];
    const fdScore = this.getTotalFireDeptScore();
    const wsScore = this.getTotalWaterSupplyScore();
    
    if (fdScore < 40) {
      recommendations.push('Focus on fire department operations - consider staffing and equipment upgrades');
    }
    
    if (wsScore < 30) {
      recommendations.push('Water supply improvements could significantly impact your ISO rating');
    }
    
    if (this.data.classification >= 6) {
      recommendations.push('Consider comprehensive assessment with ISO improvement consultant');
    }
    
    recommendations.push('Regular training and equipment maintenance support continued compliance');
    
    return recommendations;
  }
}