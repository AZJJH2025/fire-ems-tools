/**
 * Chart Generation Service for PDF Reports
 * 
 * Generates professional charts for fire department compliance reports
 * Converts charts to images for PDF inclusion
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { IncidentRecord, ResponseTimeStatistics } from '@/types/analyzer';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'pie';
  title: string;
  width: number;
  height: number;
  backgroundColor?: string;
}

export interface ChartImage {
  dataUrl: string;
  width: number;
  height: number;
  title: string;
}

export class ChartGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    // Create an off-screen canvas for chart rendering
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Generate Response Time Trend Chart
   */
  public async generateResponseTimeTrendChart(
    incidents: IncidentRecord[],
    config: ChartConfig = { type: 'line', title: 'Response Time Trends', width: 800, height: 400 }
  ): Promise<ChartImage> {
    console.log('📊 Generating Response Time Trend Chart');

    // Prepare data - group incidents by date and calculate averages
    const dateGroups = this.groupIncidentsByDate(incidents);
    const labels = Object.keys(dateGroups).sort();
    const responseTimes = labels.map(date => {
      const dayIncidents = dateGroups[date];
      const avgResponseTime = dayIncidents.reduce((sum, incident) => {
        const responseTime = this.calculateResponseTime(incident);
        return sum + (responseTime || 0);
      }, 0) / dayIncidents.length;
      return avgResponseTime / 60; // Convert to minutes
    });

    const chartData: ChartData<'line'> = {
      labels,
      datasets: [
        {
          label: 'Average Response Time (minutes)',
          data: responseTimes,
          borderColor: '#d32f2f',
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          tension: 0.1,
          fill: true
        },
        {
          label: 'NFPA 1710 Standard (5 min)',
          data: new Array(labels.length).fill(5),
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          borderDash: [5, 5],
          fill: false
        }
      ]
    };

    const options: ChartOptions<'line'> = {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: config.title,
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Response Time (minutes)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      }
    };

    return this.renderChart('line', chartData, options, config);
  }

  /**
   * Generate NFPA Compliance Chart
   */
  public async generateNFPAComplianceChart(
    statistics: ResponseTimeStatistics,
    config: ChartConfig = { type: 'bar', title: 'NFPA 1710 Compliance Analysis', width: 800, height: 400 }
  ): Promise<ChartImage> {
    console.log('📊 Generating NFPA Compliance Chart');

    const complianceData = this.calculateNFPACompliance(statistics);
    
    const chartData: ChartData<'bar'> = {
      labels: ['Dispatch Time', 'Turnout Time', 'Total Response Time'],
      datasets: [
        {
          label: 'Department Average (seconds)',
          data: [
            statistics.mean.dispatchTime || 0,
            statistics.mean.turnoutTime || 0,
            (statistics.mean.totalResponseTime || 0)
          ],
          backgroundColor: [
            complianceData.dispatchCompliance ? '#2e7d32' : '#d32f2f',
            complianceData.turnoutCompliance ? '#2e7d32' : '#d32f2f',
            complianceData.responseCompliance ? '#2e7d32' : '#d32f2f'
          ],
          borderColor: [
            complianceData.dispatchCompliance ? '#1b5e20' : '#b71c1c',
            complianceData.turnoutCompliance ? '#1b5e20' : '#b71c1c',
            complianceData.responseCompliance ? '#1b5e20' : '#b71c1c'
          ],
          borderWidth: 2
        },
        {
          label: 'NFPA 1710 Standard',
          data: [60, 60, 300], // NFPA standards in seconds
          backgroundColor: 'rgba(46, 125, 50, 0.3)',
          borderColor: '#2e7d32',
          borderWidth: 2
        }
      ]
    };

    const options: ChartOptions<'bar'> = {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: config.title,
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Time (seconds)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'NFPA 1710 Metrics'
          }
        }
      }
    };

    return this.renderChart('bar', chartData, options, config);
  }

  /**
   * Generate Performance Distribution Chart
   */
  public async generatePerformanceDistributionChart(
    incidents: IncidentRecord[],
    config: ChartConfig = { type: 'bar', title: 'Response Time Distribution', width: 800, height: 400 }
  ): Promise<ChartImage> {
    console.log('📊 Generating Performance Distribution Chart');

    // Create response time buckets
    const buckets = {
      '0-3 min': 0,
      '3-5 min': 0,
      '5-8 min': 0,
      '8-12 min': 0,
      '12+ min': 0
    };

    incidents.forEach(incident => {
      const responseTime = this.calculateResponseTime(incident);
      if (!responseTime) return;

      const minutes = responseTime / 60;
      if (minutes <= 3) buckets['0-3 min']++;
      else if (minutes <= 5) buckets['3-5 min']++;
      else if (minutes <= 8) buckets['5-8 min']++;
      else if (minutes <= 12) buckets['8-12 min']++;
      else buckets['12+ min']++;
    });

    const chartData: ChartData<'bar'> = {
      labels: Object.keys(buckets),
      datasets: [
        {
          label: 'Number of Incidents',
          data: Object.values(buckets),
          backgroundColor: [
            '#2e7d32', // 0-3 min - Excellent
            '#66bb6a', // 3-5 min - Good
            '#ffeb3b', // 5-8 min - Acceptable
            '#ff9800', // 8-12 min - Needs Improvement
            '#d32f2f'  // 12+ min - Critical
          ],
          borderColor: [
            '#1b5e20',
            '#388e3c',
            '#f57f17',
            '#ef6c00',
            '#b71c1c'
          ],
          borderWidth: 2
        }
      ]
    };

    const options: ChartOptions<'bar'> = {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: config.title,
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Incidents'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Response Time Range'
          }
        }
      }
    };

    return this.renderChart('bar', chartData, options, config);
  }

  /**
   * Render chart and convert to image
   */
  private async renderChart(
    type: 'line' | 'bar',
    data: ChartData<'line'> | ChartData<'bar'>,
    options: ChartOptions<'line'> | ChartOptions<'bar'>,
    config: ChartConfig
  ): Promise<ChartImage> {
    return new Promise((resolve, reject) => {
      try {
        // Set canvas dimensions
        this.canvas.width = config.width;
        this.canvas.height = config.height;

        // Set background color
        if (config.backgroundColor) {
          this.ctx.fillStyle = config.backgroundColor;
          this.ctx.fillRect(0, 0, config.width, config.height);
        }

        // Create and render chart
        const chart = new ChartJS(this.ctx, {
          type: type as any,
          data: data as any,
          options: options as any
        });

        // Wait for chart to render, then convert to image
        setTimeout(() => {
          try {
            const dataUrl = this.canvas.toDataURL('image/png');
            chart.destroy(); // Clean up chart instance
            
            resolve({
              dataUrl,
              width: config.width,
              height: config.height,
              title: config.title
            });
          } catch (error) {
            chart.destroy();
            reject(error);
          }
        }, 100); // Small delay to ensure rendering is complete

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Helper: Group incidents by date
   */
  private groupIncidentsByDate(incidents: IncidentRecord[]): Record<string, IncidentRecord[]> {
    const groups: Record<string, IncidentRecord[]> = {};
    
    incidents.forEach(incident => {
      const date = incident.incidentDate || incident.incident_date;
      if (!date) return;

      const dateKey = new Date(date).toLocaleDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(incident);
    });

    return groups;
  }

  /**
   * Helper: Calculate response time for incident
   */
  private calculateResponseTime(incident: IncidentRecord): number | null {
    const incidentTime = incident.incidentTime || incident.incident_time;
    const arrivalTime = incident.arrivalTime || incident.arrival_time;

    if (!incidentTime || !arrivalTime) return null;

    try {
      const startTime = new Date(incidentTime).getTime();
      const endTime = new Date(arrivalTime).getTime();
      return (endTime - startTime) / 1000; // Return seconds
    } catch {
      return null;
    }
  }

  /**
   * Helper: Calculate NFPA compliance
   */
  private calculateNFPACompliance(statistics: ResponseTimeStatistics) {
    return {
      dispatchCompliance: (statistics.mean.dispatchTime || 0) <= 60,
      turnoutCompliance: (statistics.mean.turnoutTime || 0) <= 60,
      responseCompliance: (statistics.mean.totalResponseTime || 0) <= 300
    };
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

/**
 * Convenience function to generate all standard charts for PDF reports
 */
export async function generateStandardCharts(
  incidents: IncidentRecord[],
  statistics: ResponseTimeStatistics
): Promise<ChartImage[]> {
  console.log('📊 Generating all standard charts for PDF report');
  
  const generator = new ChartGenerator();
  const charts: ChartImage[] = [];

  try {
    // Generate response time trend chart
    const trendChart = await generator.generateResponseTimeTrendChart(incidents, {
      type: 'line',
      title: 'Response Time Trends Over Time',
      width: 600,
      height: 300,
      backgroundColor: '#ffffff'
    });
    charts.push(trendChart);

    // Generate NFPA compliance chart
    const complianceChart = await generator.generateNFPAComplianceChart(statistics, {
      type: 'bar',
      title: 'NFPA 1710 Compliance Analysis',
      width: 600,
      height: 300,
      backgroundColor: '#ffffff'
    });
    charts.push(complianceChart);

    // Generate performance distribution chart
    const distributionChart = await generator.generatePerformanceDistributionChart(incidents, {
      type: 'bar',
      title: 'Response Time Distribution',
      width: 600,
      height: 300,
      backgroundColor: '#ffffff'
    });
    charts.push(distributionChart);

    console.log(`📊 Successfully generated ${charts.length} charts for PDF`);
    return charts;

  } catch (error) {
    console.error('📊 Error generating charts:', error);
    throw error;
  } finally {
    generator.destroy();
  }
}