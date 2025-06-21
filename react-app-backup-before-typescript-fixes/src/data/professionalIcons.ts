/**
 * Professional Fire & EMS Icons
 * 
 * High-quality SVG icons that match the legacy system's FontAwesome icons
 * but optimized for mapping and better visual clarity.
 */

import { MapIcon, IconCategory } from '@/types/fireMapPro';

// Create professional SVG icons with FontAwesome-style designs
const createIcon = (
  id: string,
  name: string,
  category: IconCategory,
  svgContent: string,
  size: 'small' | 'medium' | 'large' = 'medium',
  color: string = '#333333'
): MapIcon => {
  // Use URL encoding instead of btoa to avoid Unicode issues
  const encodedSvg = encodeURIComponent(svgContent);
  
  return {
    id,
    name,
    category,
    url: `data:image/svg+xml,${encodedSvg}`,
    size,
    color,
    anchor: size === 'small' ? [12, 12] : size === 'large' ? [20, 40] : [16, 32],
    popupAnchor: [0, size === 'small' ? -12 : size === 'large' ? -40 : -32]
  };
};

// Fire Apparatus Icons
const fireApparatusIcons: MapIcon[] = [
  createIcon(
    'fire-engine',
    'Fire Engine',
    'fire-apparatus',
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#DC2626"/>
      <path d="M6 20h20v4H6v-4zM8 12h16v6H8v-6zM10 14h12v2H10v-2z" fill="white"/>
      <circle cx="10" cy="26" r="2" fill="white"/>
      <circle cx="22" cy="26" r="2" fill="white"/>
      <text x="16" y="18" text-anchor="middle" fill="white" font-family="Arial" font-size="8" font-weight="bold">E</text>
    </svg>`,
    'large',
    '#DC2626'
  ),
  
  createIcon(
    'ladder-truck',
    'Ladder Truck',
    'fire-apparatus',
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#DC2626"/>
      <path d="M4 20h24v4H4v-4zM6 12h20v6H6v-6zM8 14h16v2H8v-2z" fill="white"/>
      <path d="M8 8h16v2H8v-2z" fill="white"/>
      <circle cx="9" cy="26" r="2" fill="white"/>
      <circle cx="15" cy="26" r="2" fill="white"/>
      <circle cx="23" cy="26" r="2" fill="white"/>
      <text x="16" y="18" text-anchor="middle" fill="white" font-family="Arial" font-size="8" font-weight="bold">L</text>
    </svg>`,
    'large',
    '#DC2626'
  ),
  
  createIcon(
    'tanker-truck',
    'Water Tanker',
    'fire-apparatus',
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#1E40AF"/>
      <ellipse cx="16" cy="16" rx="12" ry="6" fill="white"/>
      <circle cx="10" cy="26" r="2" fill="white"/>
      <circle cx="22" cy="26" r="2" fill="white"/>
      <path d="M6 20h20v4H6v-4z" fill="#1E40AF"/>
      <text x="16" y="18" text-anchor="middle" fill="#1E40AF" font-family="Arial" font-size="8" font-weight="bold">T</text>
    </svg>`,
    'large',
    '#1E40AF'
  ),
  
  createIcon(
    'rescue-unit',
    'Rescue Unit',
    'fire-apparatus',
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#DC2626"/>
      <path d="M6 20h20v4H6v-4zM8 12h16v6H8v-6z" fill="white"/>
      <circle cx="10" cy="26" r="2" fill="white"/>
      <circle cx="22" cy="26" r="2" fill="white"/>
      <path d="M12 14h8v1h-8v-1zM12 16h8v1h-8v-1zM12 18h8v1h-8v-1z" fill="#DC2626"/>
      <text x="16" y="10" text-anchor="middle" fill="white" font-family="Arial" font-size="7" font-weight="bold">RESCUE</text>
    </svg>`,
    'large',
    '#DC2626'
  ),
  
  createIcon(
    'brush-unit',
    'Brush Unit',
    'fire-apparatus',
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#059669"/>
      <path d="M8 20h16v4H8v-4zM10 14h12v4H10v-4z" fill="white"/>
      <circle cx="12" cy="26" r="2" fill="white"/>
      <circle cx="20" cy="26" r="2" fill="white"/>
      <path d="M4 12h6v2H4v-2zM22 12h6v2h-6v-2z" fill="#059669"/>
      <text x="16" y="17" text-anchor="middle" fill="#059669" font-family="Arial" font-size="8" font-weight="bold">B</text>
    </svg>`,
    'large',
    '#059669'
  )
];

// EMS Units Icons
const emsUnitsIcons: MapIcon[] = [
  createIcon(
    'ambulance',
    'Ambulance',
    'ems-units',
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="white" stroke="#DC2626" stroke-width="2"/>
      <path d="M6 20h20v4H6v-4zM8 12h16v6H8v-6z" fill="white"/>
      <circle cx="10" cy="26" r="2" fill="#DC2626"/>
      <circle cx="22" cy="26" r="2" fill="#DC2626"/>
      <path d="M15 14h2v4h-2v-4zM13 16h6v2h-6v-2z" fill="#DC2626"/>
      <text x="16" y="10" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="7" font-weight="bold">AMBULANCE</text>
    </svg>`,
    'large',
    '#DC2626'
  ),
  
  createIcon(
    'medic-unit',
    'Medic Unit',
    'ems-units',
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#1E40AF"/>
      <path d="M8 20h16v4H8v-4zM10 14h12v4H10v-4z" fill="white"/>
      <circle cx="12" cy="26" r="2" fill="white"/>
      <circle cx="20" cy="26" r="2" fill="white"/>
      <path d="M15 15h2v2h-2v-2zM14 16h4v1h-4v-1z" fill="#1E40AF"/>
      <text x="16" y="11" text-anchor="middle" fill="white" font-family="Arial" font-size="7" font-weight="bold">MEDIC</text>
    </svg>`,
    'large',
    '#1E40AF'
  ),
  
  createIcon(
    'helicopter-ems',
    'Air Ambulance',
    'ems-units',
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#DC2626"/>
      <path d="M8 18h16v6H8v-6z" fill="white"/>
      <ellipse cx="16" cy="12" rx="10" ry="2" fill="white"/>
      <path d="M14 16h4v2h-4v-2z" fill="#DC2626"/>
      <circle cx="16" cy="22" r="1" fill="#DC2626"/>
      <text x="16" y="21" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="6" font-weight="bold">AIR</text>
    </svg>`,
    'large',
    '#DC2626'
  )
];

// Incident Type Icons
const incidentTypeIcons: MapIcon[] = [
  createIcon(
    'structure-fire',
    'Structure Fire',
    'incident-types',
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#DC2626"/>
      <path d="M8 12c0-2 1-3 2-3s2 1 2 3-1 3-2 3-2-1-2-3zM12 10c0-2 1-3 2-3s2 1 2 3-1 3-2 3-2-1-2-3z" fill="#FF6B35"/>
      <path d="M10 14c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" fill="#FFAA00"/>
      <text x="12" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="6" font-weight="bold">FIRE</text>
    </svg>`,
    'medium',
    '#DC2626'
  ),
  
  createIcon(
    'medical-emergency',
    'Medical Emergency',
    'incident-types',
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#059669"/>
      <path d="M11 8h2v8h-2v-8zM8 11h8v2H8v-2z" fill="white"/>
      <circle cx="12" cy="12" r="3" fill="none" stroke="white" stroke-width="1"/>
    </svg>`,
    'medium',
    '#059669'
  ),
  
  createIcon(
    'vehicle-accident',
    'Vehicle Accident',
    'incident-types',
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#F59E0B"/>
      <path d="M6 12h5l2-3h5l-2 3-2 3H9l2-3z" fill="white"/>
      <circle cx="9" cy="15" r="1" fill="#F59E0B"/>
      <circle cx="15" cy="15" r="1" fill="#F59E0B"/>
    </svg>`,
    'medium',
    '#F59E0B'
  ),
  
  createIcon(
    'hazmat-incident',
    'Hazmat Incident',
    'incident-types',
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#7C2D12"/>
      <path d="M12 6l5 4-5 4-5-4 5-4z" fill="#FFAA00"/>
      <text x="12" y="14" text-anchor="middle" fill="#7C2D12" font-family="Arial" font-size="8" font-weight="bold">!</text>
    </svg>`,
    'medium',
    '#7C2D12'
  )
];

// Facilities Icons
const facilitiesIcons: MapIcon[] = [
  createIcon(
    'fire-station',
    'Fire Station',
    'facilities',
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="#DC2626"/>
      <path d="M6 28h20v-8H6v8zM8 12h16v6H8v-6zM12 20h8v6h-8v-6z" fill="white"/>
      <circle cx="16" cy="8" r="3" fill="white"/>
      <path d="M16 5v6M13 8h6" stroke="#DC2626" stroke-width="1"/>
      <text x="16" y="26" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="6" font-weight="bold">STATION</text>
    </svg>`,
    'large',
    '#DC2626'
  ),
  
  createIcon(
    'hospital',
    'Hospital',
    'facilities',
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="4" fill="white" stroke="#DC2626" stroke-width="2"/>
      <rect x="6" y="10" width="20" height="18" fill="white"/>
      <path d="M15 6h2v20h-2V6zM10 15h12v2H10v-2z" fill="#DC2626"/>
      <circle cx="8" cy="12" r="1" fill="#DC2626"/>
      <circle cx="24" cy="12" r="1" fill="#DC2626"/>
      <circle cx="8" cy="20" r="1" fill="#DC2626"/>
      <circle cx="24" cy="20" r="1" fill="#DC2626"/>
      <text x="16" y="30" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="5" font-weight="bold">HOSPITAL</text>
    </svg>`,
    'large',
    '#DC2626'
  ),
  
  createIcon(
    'hydrant',
    'Fire Hydrant',
    'facilities',
    `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" fill="#FF6600"/>
      <rect x="8" y="6" width="4" height="8" rx="1" fill="white"/>
      <circle cx="6" cy="9" r="1" fill="white"/>
      <circle cx="14" cy="9" r="1" fill="white"/>
      <circle cx="6" cy="11" r="1" fill="white"/>
      <circle cx="14" cy="11" r="1" fill="white"/>
      <rect x="9" y="14" width="2" height="3" fill="white"/>
    </svg>`,
    'small',
    '#FF6600'
  ),
  
  createIcon(
    'helipad',
    'Helipad',
    'facilities',
    `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#1E40AF"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="white" stroke-width="2"/>
      <path d="M8 16h6v-4h4v4h6v4h-6v4h-4v-4H8v-4z" fill="white"/>
      <text x="16" y="19" text-anchor="middle" fill="#1E40AF" font-family="Arial" font-size="10" font-weight="bold">H</text>
    </svg>`,
    'large',
    '#1E40AF'
  )
];

// Prevention & Safety Icons
const preventionIcons: MapIcon[] = [
  createIcon(
    'fire-extinguisher',
    'Fire Extinguisher',
    'prevention',
    `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" fill="#DC2626"/>
      <rect x="8" y="6" width="4" height="8" rx="1" fill="white"/>
      <circle cx="10" cy="5" r="1" fill="white"/>
      <rect x="9" y="14" width="2" height="2" fill="white"/>
      <path d="M7 8h6v1H7v-1z" fill="#DC2626"/>
    </svg>`,
    'small',
    '#DC2626'
  ),
  
  createIcon(
    'smoke-detector',
    'Smoke Detector',
    'prevention',
    `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" fill="#4B5563"/>
      <circle cx="10" cy="10" r="6" fill="white"/>
      <circle cx="10" cy="10" r="3" fill="#DC2626"/>
      <circle cx="10" cy="10" r="1" fill="white"/>
    </svg>`,
    'small',
    '#4B5563'
  )
];

// Energy Systems Icons
const energySystemsIcons: MapIcon[] = [
  createIcon(
    'power-lines',
    'Power Lines',
    'energy-systems',
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#F59E0B"/>
      <path d="M8 8l8 8M16 8l-8 8" stroke="white" stroke-width="2"/>
      <circle cx="8" cy="8" r="2" fill="white"/>
      <circle cx="16" cy="8" r="2" fill="white"/>
      <circle cx="8" cy="16" r="2" fill="white"/>
      <circle cx="16" cy="16" r="2" fill="white"/>
      <text x="12" y="14" text-anchor="middle" fill="#F59E0B" font-family="Arial" font-size="8" font-weight="bold">P</text>
    </svg>`,
    'medium',
    '#F59E0B'
  ),
  
  createIcon(
    'gas-line',
    'Gas Line',
    'energy-systems',
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11" fill="#DC2626"/>
      <rect x="6" y="11" width="12" height="2" fill="white"/>
      <circle cx="8" cy="12" r="1" fill="#DC2626"/>
      <circle cx="12" cy="12" r="1" fill="#DC2626"/>
      <circle cx="16" cy="12" r="1" fill="#DC2626"/>
      <text x="12" y="19" text-anchor="middle" fill="white" font-family="Arial" font-size="6" font-weight="bold">GAS</text>
    </svg>`,
    'medium',
    '#DC2626'
  )
];

// Export organized icon library
export const professionalIconLibrary: Record<IconCategory, MapIcon[]> = {
  'fire-apparatus': fireApparatusIcons,
  'ems-units': emsUnitsIcons,
  'incident-types': incidentTypeIcons,
  'facilities': facilitiesIcons,
  'prevention': preventionIcons,
  'energy-systems': energySystemsIcons,
  'custom': []
};

// Flat array of all icons for search functionality
export const allProfessionalIcons = Object.values(professionalIconLibrary).flat();