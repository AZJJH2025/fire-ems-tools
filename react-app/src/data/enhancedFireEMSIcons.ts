/**
 * Enhanced Fire & EMS Icons - Professional and Accurate
 * 
 * Icons designed to be immediately recognizable by fire and EMS personnel.
 * Each icon accurately represents the actual vehicle/equipment/facility.
 */

import { MapIcon, IconCategory } from '@/types/fireMapPro';

// Create professional SVG icons that actually look like what they represent
const createIcon = (
  id: string,
  name: string,
  category: IconCategory,
  svgContent: string,
  size: 'small' | 'medium' | 'large' = 'medium',
  color: string = '#333333'
): MapIcon => {
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

// ============================================================================
// FIRE APPARATUS - Realistic vehicle representations
// ============================================================================

const fireApparatusIcons: MapIcon[] = [
  // Fire Engine - Pumper truck with realistic proportions
  createIcon(
    'fire-engine',
    'Fire Engine',
    'fire-apparatus',
    `<svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Truck Body -->
      <rect x="2" y="12" width="36" height="12" rx="1" fill="#DC2626"/>
      
      <!-- Cab -->
      <rect x="2" y="8" width="12" height="16" rx="1" fill="#B91C1C"/>
      
      <!-- Equipment Compartments -->
      <rect x="16" y="14" width="6" height="3" rx="0.5" fill="#991B1B"/>
      <rect x="24" y="14" width="6" height="3" fill="#991B1B"/>
      <rect x="32" y="14" width="4" height="3" fill="#991B1B"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="26" r="3" fill="#374151"/>
      <circle cx="8" cy="26" r="2" fill="#6B7280"/>
      <circle cx="32" cy="26" r="3" fill="#374151"/>
      <circle cx="32" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Pump Panel -->
      <rect x="16" y="18" width="20" height="2" fill="#F59E0B"/>
      <circle cx="18" cy="19" r="0.5" fill="#DC2626"/>
      <circle cx="22" cy="19" r="0.5" fill="#DC2626"/>
      <circle cx="26" cy="19" r="0.5" fill="#DC2626"/>
      <circle cx="30" cy="19" r="0.5" fill="#DC2626"/>
      <circle cx="34" cy="19" r="0.5" fill="#DC2626"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="6" width="8" height="1" rx="0.5" fill="#EF4444"/>
      
      <!-- Windshield -->
      <rect x="3" y="9" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Ladder on top -->
      <rect x="16" y="11" width="20" height="1" fill="#9CA3AF"/>
      <rect x="17" y="10.5" width="1" height="2" fill="#9CA3AF"/>
      <rect x="21" y="10.5" width="1" height="2" fill="#9CA3AF"/>
      <rect x="25" y="10.5" width="1" height="2" fill="#9CA3AF"/>
      <rect x="29" y="10.5" width="1" height="2" fill="#9CA3AF"/>
      <rect x="33" y="10.5" width="1" height="2" fill="#9CA3AF"/>
      
      <!-- Unit Number -->
      <text x="8" y="17" text-anchor="middle" fill="white" font-family="Arial" font-size="4" font-weight="bold">E1</text>
    </svg>`,
    'large',
    '#DC2626'
  ),

  // Ladder Truck - Aerial truck with extended ladder
  createIcon(
    'ladder-truck',
    'Ladder Truck',
    'fire-apparatus',
    `<svg width="50" height="32" viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Truck Body -->
      <rect x="2" y="12" width="46" height="12" rx="1" fill="#DC2626"/>
      
      <!-- Cab -->
      <rect x="2" y="8" width="12" height="16" rx="1" fill="#B91C1C"/>
      
      <!-- Turntable -->
      <circle cx="25" cy="18" r="4" fill="#991B1B"/>
      <circle cx="25" cy="18" r="2" fill="#374151"/>
      
      <!-- Extended Ladder -->
      <rect x="15" y="6" width="30" height="2" rx="1" fill="#9CA3AF"/>
      <rect x="16" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      <rect x="20" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      <rect x="24" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      <rect x="28" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      <rect x="32" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      <rect x="36" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      <rect x="40" y="6.2" width="2" height="1.6" fill="#6B7280"/>
      
      <!-- Outriggers -->
      <rect x="0" y="20" width="6" height="1" fill="#374151"/>
      <rect x="44" y="20" width="6" height="1" fill="#374151"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="26" r="3" fill="#374151"/>
      <circle cx="8" cy="26" r="2" fill="#6B7280"/>
      <circle cx="20" cy="26" r="3" fill="#374151"/>
      <circle cx="20" cy="26" r="2" fill="#6B7280"/>
      <circle cx="30" cy="26" r="3" fill="#374151"/>
      <circle cx="30" cy="26" r="2" fill="#6B7280"/>
      <circle cx="42" cy="26" r="3" fill="#374151"/>
      <circle cx="42" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Equipment Compartments -->
      <rect x="16" y="14" width="4" height="3" fill="#991B1B"/>
      <rect x="35" y="14" width="4" height="3" fill="#991B1B"/>
      <rect x="41" y="14" width="4" height="3" fill="#991B1B"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="6" width="8" height="1" rx="0.5" fill="#EF4444"/>
      
      <!-- Windshield -->
      <rect x="3" y="9" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Unit Number -->
      <text x="8" y="17" text-anchor="middle" fill="white" font-family="Arial" font-size="4" font-weight="bold">L1</text>
    </svg>`,
    'large',
    '#DC2626'
  ),

  // Water Tanker - Tank truck with realistic water tank
  createIcon(
    'water-tanker',
    'Water Tanker',
    'fire-apparatus',
    `<svg width="44" height="32" viewBox="0 0 44 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Truck Cab -->
      <rect x="2" y="8" width="12" height="16" rx="1" fill="#DC2626"/>
      
      <!-- Water Tank (cylindrical) -->
      <ellipse cx="28" cy="18" rx="14" ry="8" fill="#1E40AF"/>
      <ellipse cx="28" cy="16" rx="14" ry="2" fill="#3B82F6"/>
      
      <!-- Tank Support Structure -->
      <rect x="14" y="22" width="28" height="2" fill="#374151"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="26" r="3" fill="#374151"/>
      <circle cx="8" cy="26" r="2" fill="#6B7280"/>
      <circle cx="24" cy="26" r="3" fill="#374151"/>
      <circle cx="24" cy="26" r="2" fill="#6B7280"/>
      <circle cx="36" cy="26" r="3" fill="#374151"/>
      <circle cx="36" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Tank Connections -->
      <rect x="40" y="17" width="2" height="3" fill="#F59E0B"/>
      <circle cx="40.5" cy="17.5" r="0.5" fill="#DC2626"/>
      <circle cx="40.5" cy="19.5" r="0.5" fill="#DC2626"/>
      
      <!-- Water Level Indicator -->
      <rect x="16" y="15" width="24" height="1" fill="#60A5FA" fill-opacity="0.7"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="6" width="8" height="1" rx="0.5" fill="#EF4444"/>
      
      <!-- Windshield -->
      <rect x="3" y="9" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Unit Number -->
      <text x="8" y="17" text-anchor="middle" fill="white" font-family="Arial" font-size="4" font-weight="bold">T1</text>
      
      <!-- Water Capacity -->
      <text x="28" y="19" text-anchor="middle" fill="white" font-family="Arial" font-size="3" font-weight="bold">3000 GAL</text>
    </svg>`,
    'large',
    '#1E40AF'
  ),

  // Brush/Wildland Fire Unit - 4x4 pickup with brush equipment
  createIcon(
    'brush-unit',
    'Brush Unit',
    'fire-apparatus',
    `<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Truck Body -->
      <rect x="2" y="12" width="32" height="8" rx="1" fill="#059669"/>
      
      <!-- Cab -->
      <rect x="2" y="8" width="12" height="12" rx="1" fill="#047857"/>
      
      <!-- Pickup Bed with Equipment -->
      <rect x="16" y="10" width="18" height="10" rx="1" fill="#065F46"/>
      
      <!-- Water Tank in Bed -->
      <ellipse cx="25" cy="15" rx="7" ry="3" fill="#1E40AF"/>
      
      <!-- Hose Reel -->
      <circle cx="30" cy="13" r="2" fill="#374151"/>
      <circle cx="30" cy="13" r="1.5" fill="#6B7280"/>
      
      <!-- High-clearance wheels -->
      <circle cx="8" cy="24" r="4" fill="#374151"/>
      <circle cx="8" cy="24" r="3" fill="#6B7280"/>
      <circle cx="28" cy="24" r="4" fill="#374151"/>
      <circle cx="28" cy="24" r="3" fill="#6B7280"/>
      
      <!-- Brush Guards -->
      <rect x="0" y="14" width="4" height="4" rx="2" fill="#9CA3AF"/>
      
      <!-- Emergency Light Bar -->
      <rect x="4" y="6" width="8" height="1" rx="0.5" fill="#F59E0B"/>
      
      <!-- Windshield -->
      <rect x="3" y="9" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Tools on Side -->
      <rect x="17" y="11" width="1" height="6" fill="#8B5CF6"/>
      <rect x="19" y="11" width="1" height="6" fill="#8B5CF6"/>
      
      <!-- Unit Number -->
      <text x="8" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="3" font-weight="bold">BR1</text>
    </svg>`,
    'large',
    '#059669'
  ),

  // Rescue Unit - Heavy rescue with equipment compartments
  createIcon(
    'rescue-unit',
    'Rescue Unit',
    'fire-apparatus',
    `<svg width="46" height="32" viewBox="0 0 46 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Truck Body -->
      <rect x="2" y="10" width="42" height="14" rx="1" fill="#DC2626"/>
      
      <!-- Cab -->
      <rect x="2" y="6" width="12" height="18" rx="1" fill="#B91C1C"/>
      
      <!-- Multiple Equipment Compartments -->
      <rect x="16" y="12" width="6" height="8" fill="#991B1B" stroke="white" stroke-width="0.5"/>
      <rect x="24" y="12" width="6" height="8" fill="#991B1B" stroke="white" stroke-width="0.5"/>
      <rect x="32" y="12" width="6" height="8" fill="#991B1B" stroke="white" stroke-width="0.5"/>
      <rect x="40" y="12" width="4" height="8" fill="#991B1B" stroke="white" stroke-width="0.5"/>
      
      <!-- Equipment Doors -->
      <rect x="17" y="13" width="4" height="6" fill="#7F1D1D"/>
      <rect x="25" y="13" width="4" height="6" fill="#7F1D1D"/>
      <rect x="33" y="13" width="4" height="6" fill="#7F1D1D"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="26" r="3" fill="#374151"/>
      <circle cx="8" cy="26" r="2" fill="#6B7280"/>
      <circle cx="22" cy="26" r="3" fill="#374151"/>
      <circle cx="22" cy="26" r="2" fill="#6B7280"/>
      <circle cx="38" cy="26" r="3" fill="#374151"/>
      <circle cx="38" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Roof Equipment -->
      <rect x="16" y="9" width="26" height="1" fill="#F59E0B"/>
      <rect x="18" y="8" width="2" height="2" fill="#374151"/>
      <rect x="22" y="8" width="2" height="2" fill="#374151"/>
      <rect x="26" y="8" width="2" height="2" fill="#374151"/>
      <rect x="30" y="8" width="2" height="2" fill="#374151"/>
      <rect x="34" y="8" width="2" height="2" fill="#374151"/>
      <rect x="38" y="8" width="2" height="2" fill="#374151"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="4" width="8" height="1" rx="0.5" fill="#EF4444"/>
      
      <!-- Windshield -->
      <rect x="3" y="7" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- RESCUE Text -->
      <text x="8" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="2.5" font-weight="bold">RESCUE</text>
    </svg>`,
    'large',
    '#DC2626'
  ),

  // Hazmat Unit - Specialized hazmat vehicle
  createIcon(
    'hazmat-unit',
    'HazMat Unit',
    'fire-apparatus',
    `<svg width="42" height="32" viewBox="0 0 42 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Truck Body -->
      <rect x="2" y="10" width="38" height="14" rx="1" fill="#F59E0B"/>
      
      <!-- Cab -->
      <rect x="2" y="6" width="12" height="18" rx="1" fill="#D97706"/>
      
      <!-- Hazmat Equipment Compartments -->
      <rect x="16" y="12" width="8" height="8" fill="#B45309" stroke="black" stroke-width="0.5"/>
      <rect x="26" y="12" width="8" height="8" fill="#B45309" stroke="black" stroke-width="0.5"/>
      <rect x="36" y="12" width="4" height="8" fill="#B45309" stroke="black" stroke-width="0.5"/>
      
      <!-- Hazmat Symbols -->
      <polygon points="20,14 22,18 18,18" fill="#DC2626"/>
      <text x="20" y="17" text-anchor="middle" fill="white" font-family="Arial" font-size="2" font-weight="bold">!</text>
      
      <polygon points="30,14 32,18 28,18" fill="#DC2626"/>
      <circle cx="30" cy="16" r="1.5" fill="none" stroke="white" stroke-width="0.5"/>
      <path d="M29 15h2M30 14v2" stroke="white" stroke-width="0.5"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="26" r="3" fill="#374151"/>
      <circle cx="8" cy="26" r="2" fill="#6B7280"/>
      <circle cx="24" cy="26" r="3" fill="#374151"/>
      <circle cx="24" cy="26" r="2" fill="#6B7280"/>
      <circle cx="36" cy="26" r="3" fill="#374151"/>
      <circle cx="36" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Air Filtration System -->
      <rect x="16" y="8" width="22" height="2" fill="#6B7280"/>
      <circle cx="18" cy="9" r="0.5" fill="#374151"/>
      <circle cx="22" cy="9" r="0.5" fill="#374151"/>
      <circle cx="26" cy="9" r="0.5" fill="#374151"/>
      <circle cx="30" cy="9" r="0.5" fill="#374151"/>
      <circle cx="34" cy="9" r="0.5" fill="#374151"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="4" width="8" height="1" rx="0.5" fill="#EF4444"/>
      
      <!-- Windshield -->
      <rect x="3" y="7" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- HAZMAT Text -->
      <text x="8" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="2.5" font-weight="bold">HAZMAT</text>
    </svg>`,
    'large',
    '#F59E0B'
  ),

  // Command Vehicle - Chief's command car/SUV
  createIcon(
    'command-vehicle',
    'Command Vehicle',
    'fire-apparatus',
    `<svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Vehicle Body (SUV Style) -->
      <rect x="2" y="10" width="28" height="10" rx="2" fill="#1F2937"/>
      
      <!-- Hood -->
      <rect x="2" y="8" width="8" height="4" rx="1" fill="#374151"/>
      
      <!-- Windshield -->
      <rect x="3" y="9" width="6" height="5" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Side Windows -->
      <rect x="11" y="11" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      <rect x="17" y="11" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      <rect x="23" y="11" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="22" r="3" fill="#374151"/>
      <circle cx="8" cy="22" r="2" fill="#6B7280"/>
      <circle cx="24" cy="22" r="3" fill="#374151"/>
      <circle cx="24" cy="22" r="2" fill="#6B7280"/>
      
      <!-- Emergency Light Bar -->
      <rect x="4" y="6" width="24" height="1.5" rx="0.5" fill="#EF4444"/>
      <rect x="6" y="6.2" width="2" height="1.1" fill="#FBBF24"/>
      <rect x="10" y="6.2" width="2" height="1.1" fill="#3B82F6"/>
      <rect x="14" y="6.2" width="2" height="1.1" fill="#EF4444"/>
      <rect x="18" y="6.2" width="2" height="1.1" fill="#3B82F6"/>
      <rect x="22" y="6.2" width="2" height="1.1" fill="#FBBF24"/>
      <rect x="26" y="6.2" width="2" height="1.1" fill="#EF4444"/>
      
      <!-- Antenna -->
      <rect x="28" y="4" width="0.5" height="6" fill="#6B7280"/>
      <circle cx="28.25" cy="4" r="0.5" fill="#374151"/>
      
      <!-- Command Insignia -->
      <polygon points="16,13 18,15 16,17 14,15" fill="#FBBF24"/>
      <text x="16" y="16" text-anchor="middle" fill="black" font-family="Arial" font-size="2" font-weight="bold">C</text>
      
      <!-- Side Equipment -->
      <rect x="28" y="12" width="2" height="6" fill="#6B7280"/>
    </svg>`,
    'medium',
    '#1F2937'
  ),

  // Fire Boat - Marine firefighting vessel
  createIcon(
    'fire-boat',
    'Fire Boat',
    'fire-apparatus',
    `<svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Water -->
      <rect x="0" y="24" width="40" height="8" fill="#3B82F6" fill-opacity="0.6"/>
      <path d="M0 24 Q5 22 10 24 Q15 26 20 24 Q25 22 30 24 Q35 26 40 24 V32 H0 Z" fill="#1E40AF" fill-opacity="0.4"/>
      
      <!-- Boat Hull -->
      <path d="M4 20 Q2 22 2 24 H38 Q38 22 36 20 H4 Z" fill="#DC2626"/>
      
      <!-- Deck -->
      <rect x="4" y="16" width="32" height="4" rx="1" fill="#B91C1C"/>
      
      <!-- Pilot House -->
      <rect x="12" y="10" width="16" height="6" rx="1" fill="#991B1B"/>
      
      <!-- Windows -->
      <rect x="14" y="11" width="12" height="3" rx="0.5" fill="#93C5FD" fill-opacity="0.7"/>
      
      <!-- Water Cannons -->
      <circle cx="8" cy="18" r="2" fill="#374151"/>
      <rect x="6" y="16" width="4" height="1" fill="#6B7280"/>
      
      <circle cx="32" cy="18" r="2" fill="#374151"/>
      <rect x="30" y="16" width="4" height="1" fill="#6B7280"/>
      
      <!-- Water Streams -->
      <path d="M8 16 Q12 8 16 4" stroke="#3B82F6" stroke-width="1" fill="none"/>
      <path d="M32 16 Q28 8 24 4" stroke="#3B82F6" stroke-width="1" fill="none"/>
      
      <!-- Navigation Lights -->
      <circle cx="36" cy="14" r="1" fill="#22C55E"/>
      <circle cx="4" cy="14" r="1" fill="#EF4444"/>
      
      <!-- Radar/Antenna -->
      <rect x="19.5" y="8" width="1" height="4" fill="#6B7280"/>
      <circle cx="20" cy="8" r="1" fill="#374151"/>
      
      <!-- Life Rings -->
      <circle cx="10" cy="12" r="1.5" fill="#F97316"/>
      <circle cx="10" cy="12" r="1" fill="none" stroke="white" stroke-width="0.3"/>
      
      <circle cx="30" cy="12" r="1.5" fill="#F97316"/>
      <circle cx="30" cy="12" r="1" fill="none" stroke="white" stroke-width="0.3"/>
      
      <!-- Unit Number -->
      <text x="20" y="14" text-anchor="middle" fill="white" font-family="Arial" font-size="3" font-weight="bold">FB1</text>
    </svg>`,
    'large',
    '#DC2626'
  )
];

// ============================================================================
// EMS UNITS - Realistic medical vehicle representations
// ============================================================================

const emsUnitsIcons: MapIcon[] = [
  // ALS Ambulance - Advanced Life Support
  createIcon(
    'als-ambulance',
    'ALS Ambulance',
    'ems-units',
    `<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Ambulance Body -->
      <rect x="2" y="8" width="32" height="16" rx="2" fill="white" stroke="#DC2626" stroke-width="1"/>
      
      <!-- Cab -->
      <rect x="2" y="10" width="12" height="10" rx="1" fill="#F3F4F6"/>
      
      <!-- Patient Compartment -->
      <rect x="16" y="10" width="18" height="10" rx="1" fill="white"/>
      
      <!-- Windshield -->
      <rect x="3" y="11" width="10" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Side Window -->
      <rect x="26" y="12" width="6" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="26" r="3" fill="#374151"/>
      <circle cx="8" cy="26" r="2" fill="#6B7280"/>
      <circle cx="28" cy="26" r="3" fill="#374151"/>
      <circle cx="28" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Medical Cross (Large) -->
      <rect x="18" y="12" width="6" height="2" fill="#DC2626"/>
      <rect x="20" y="10" width="2" height="6" fill="#DC2626"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="6" width="8" height="1" rx="0.5" fill="#EF4444"/>
      <rect x="24" y="6" width="8" height="1" rx="0.5" fill="#3B82F6"/>
      
      <!-- Star of Life -->
      <circle cx="30" cy="14" r="2" fill="#1E40AF"/>
      <polygon points="30,12 30.5,13.5 29.5,13.5" fill="white"/>
      <polygon points="30,16 30.5,14.5 29.5,14.5" fill="white"/>
      <polygon points="28,14 29.5,14.5 29.5,13.5" fill="white"/>
      <polygon points="32,14 30.5,13.5 30.5,14.5" fill="white"/>
      <polygon points="28.5,12.5 29.8,13.8 29,14.6" fill="white"/>
      <polygon points="31.5,15.5 30.2,14.2 31,13.4" fill="white"/>
      
      <!-- Equipment -->
      <rect x="17" y="17" width="2" height="2" fill="#6B7280"/>
      <rect x="20" y="17" width="2" height="2" fill="#6B7280"/>
      
      <!-- AMBULANCE Text -->
      <text x="18" y="8" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="2" font-weight="bold">AMBULANCE</text>
    </svg>`,
    'large',
    '#DC2626'
  ),

  // BLS Ambulance - Basic Life Support
  createIcon(
    'bls-ambulance',
    'BLS Ambulance',
    'ems-units',
    `<svg width="34" height="32" viewBox="0 0 34 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Ambulance Body -->
      <rect x="2" y="8" width="30" height="16" rx="2" fill="white" stroke="#1E40AF" stroke-width="1"/>
      
      <!-- Cab -->
      <rect x="2" y="10" width="10" height="10" rx="1" fill="#F3F4F6"/>
      
      <!-- Patient Compartment -->
      <rect x="14" y="10" width="18" height="10" rx="1" fill="white"/>
      
      <!-- Windshield -->
      <rect x="3" y="11" width="8" height="6" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Side Window -->
      <rect x="24" y="12" width="6" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Wheels -->
      <circle cx="7" cy="26" r="3" fill="#374151"/>
      <circle cx="7" cy="26" r="2" fill="#6B7280"/>
      <circle cx="27" cy="26" r="3" fill="#374151"/>
      <circle cx="27" cy="26" r="2" fill="#6B7280"/>
      
      <!-- Medical Cross -->
      <rect x="16" y="12" width="4" height="1.5" fill="#1E40AF"/>
      <rect x="17" y="10.5" width="1.5" height="4.5" fill="#1E40AF"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="6" width="6" height="1" rx="0.5" fill="#3B82F6"/>
      <rect x="22" y="6" width="6" height="1" rx="0.5" fill="#3B82F6"/>
      
      <!-- First Aid Symbol -->
      <rect x="22" y="12" width="6" height="4" rx="0.5" fill="#1E40AF"/>
      <rect x="24" y="13" width="2" height="1" fill="white"/>
      <rect x="24.5" y="12.5" width="1" height="2" fill="white"/>
      
      <!-- Equipment -->
      <rect x="15" y="17" width="1.5" height="2" fill="#6B7280"/>
      <rect x="17" y="17" width="1.5" height="2" fill="#6B7280"/>
      
      <!-- BLS Text -->
      <text x="17" y="8" text-anchor="middle" fill="#1E40AF" font-family="Arial" font-size="2" font-weight="bold">BLS AMBULANCE</text>
    </svg>`,
    'large',
    '#1E40AF'
  ),

  // Air Ambulance/Medical Helicopter
  createIcon(
    'air-ambulance',
    'Air Ambulance',
    'ems-units',
    `<svg width="40" height="36" viewBox="0 0 40 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Main Rotor Disc -->
      <ellipse cx="20" cy="18" rx="18" ry="2" fill="#6B7280" fill-opacity="0.3"/>
      
      <!-- Fuselage -->
      <ellipse cx="20" cy="22" rx="12" ry="6" fill="#DC2626"/>
      
      <!-- Cockpit -->
      <ellipse cx="28" cy="22" rx="4" ry="4" fill="#B91C1C"/>
      
      <!-- Cockpit Windows -->
      <path d="M26 20 Q30 18 32 22 Q30 26 26 24 Q28 22 26 20" fill="#93C5FD" fill-opacity="0.7"/>
      
      <!-- Side Windows -->
      <rect x="12" y="20" width="4" height="3" rx="1" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="18" y="20" width="4" height="3" rx="1" fill="#93C5FD" fill-opacity="0.7"/>
      
      <!-- Landing Skids -->
      <rect x="10" y="28" width="20" height="1" rx="0.5" fill="#374151"/>
      <rect x="12" y="27" width="2" height="3" fill="#6B7280"/>
      <rect x="26" y="27" width="2" height="3" fill="#6B7280"/>
      
      <!-- Tail Boom -->
      <rect x="8" y="21" width="12" height="2" rx="1" fill="#991B1B"/>
      
      <!-- Tail Rotor -->
      <circle cx="8" cy="18" r="3" fill="#6B7280" fill-opacity="0.3"/>
      <rect x="7" y="15" width="2" height="6" fill="#374151"/>
      
      <!-- Medical Cross -->
      <rect x="18" y="20" width="4" height="1.5" fill="white"/>
      <rect x="19.25" y="19" width="1.5" height="4" fill="white"/>
      
      <!-- Star of Life -->
      <circle cx="14" cy="22" r="2" fill="white"/>
      <polygon points="14,20 14.3,21.2 13.7,21.2" fill="#1E40AF"/>
      <polygon points="14,24 14.3,22.8 13.7,22.8" fill="#1E40AF"/>
      <polygon points="12,22 13.2,22.3 13.2,21.7" fill="#1E40AF"/>
      <polygon points="16,22 14.8,21.7 14.8,22.3" fill="#1E40AF"/>
      <polygon points="12.5,20.5 13.6,21.6 13,22.2" fill="#1E40AF"/>
      <polygon points="15.5,23.5 14.4,22.4 15,21.8" fill="#1E40AF"/>
      
      <!-- Navigation Lights -->
      <circle cx="32" cy="20" r="0.5" fill="#22C55E"/>
      <circle cx="8" cy="20" r="0.5" fill="#EF4444"/>
      
      <!-- Antenna -->
      <rect x="19.5" y="16" width="0.5" height="3" fill="#6B7280"/>
      
      <!-- MEDIC Text -->
      <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="2" font-weight="bold">MEDIC 1</text>
    </svg>`,
    'large',
    '#DC2626'
  ),

  // Paramedic Response Unit (SUV/Car)
  createIcon(
    'paramedic-unit',
    'Paramedic Unit',
    'ems-units',
    `<svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Vehicle Body -->
      <rect x="2" y="10" width="28" height="10" rx="2" fill="white" stroke="#1E40AF" stroke-width="1"/>
      
      <!-- Hood/Front -->
      <rect x="2" y="8" width="8" height="4" rx="1" fill="#F3F4F6"/>
      
      <!-- Windshield -->
      <rect x="3" y="9" width="6" height="5" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Side Windows -->
      <rect x="11" y="11" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      <rect x="17" y="11" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      <rect x="23" y="11" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.6"/>
      
      <!-- Wheels -->
      <circle cx="8" cy="22" r="3" fill="#374151"/>
      <circle cx="8" cy="22" r="2" fill="#6B7280"/>
      <circle cx="24" cy="22" r="3" fill="#374151"/>
      <circle cx="24" cy="22" r="2" fill="#6B7280"/>
      
      <!-- Emergency Light Bar -->
      <rect x="4" y="6" width="24" height="1.5" rx="0.5" fill="#1E40AF"/>
      <rect x="6" y="6.2" width="2" height="1.1" fill="#EF4444"/>
      <rect x="10" y="6.2" width="2" height="1.1" fill="#3B82F6"/>
      <rect x="14" y="6.2" width="2" height="1.1" fill="white"/>
      <rect x="18" y="6.2" width="2" height="1.1" fill="#3B82F6"/>
      <rect x="22" y="6.2" width="2" height="1.1" fill="#EF4444"/>
      <rect x="26" y="6.2" width="2" height="1.1" fill="#3B82F6"/>
      
      <!-- Paramedic Cross -->
      <rect x="14" y="12" width="4" height="1.5" fill="#1E40AF"/>
      <rect x="15.25" y="11" width="1.5" height="4" fill="#1E40AF"/>
      
      <!-- Star of Life -->
      <circle cx="25" cy="13" r="1.5" fill="#1E40AF"/>
      <polygon points="25,11.5 25.2,12.4 24.8,12.4" fill="white"/>
      <polygon points="25,14.5 25.2,13.6 24.8,13.6" fill="white"/>
      <polygon points="23.5,13 24.4,13.2 24.4,12.8" fill="white"/>
      <polygon points="26.5,13 25.6,12.8 25.6,13.2" fill="white"/>
      <polygon points="24,11.8 24.8,12.6 24.4,13" fill="white"/>
      <polygon points="26,14.2 25.2,13.4 25.6,13" fill="white"/>
      
      <!-- Medical Equipment -->
      <rect x="12" y="16" width="8" height="2" fill="#6B7280"/>
      <rect x="13" y="16.2" width="1" height="1.6" fill="#EF4444"/>
      <rect x="15" y="16.2" width="1" height="1.6" fill="#22C55E"/>
      <rect x="17" y="16.2" width="1" height="1.6" fill="#3B82F6"/>
      <rect x="19" y="16.2" width="1" height="1.6" fill="#FBBF24"/>
      
      <!-- PARAMEDIC Text -->
      <text x="16" y="8" text-anchor="middle" fill="#1E40AF" font-family="Arial" font-size="1.8" font-weight="bold">PARAMEDIC</text>
    </svg>`,
    'medium',
    '#1E40AF'
  )
];

// ============================================================================
// INCIDENT TYPES - Clear visual representations of different emergencies
// ============================================================================

const incidentTypeIcons: MapIcon[] = [
  // Structure Fire - Building with flames
  createIcon(
    'structure-fire',
    'Structure Fire',
    'incident-types',
    `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Building -->
      <rect x="6" y="16" width="16" height="10" fill="#6B7280"/>
      
      <!-- Roof -->
      <polygon points="4,16 14,8 24,16" fill="#4B5563"/>
      
      <!-- Windows -->
      <rect x="8" y="18" width="3" height="3" fill="#FCD34D"/>
      <rect x="12" y="18" width="3" height="3" fill="#F97316"/>
      <rect x="16" y="18" width="3" height="3" fill="#DC2626"/>
      <rect x="8" y="22" width="3" height="3" fill="#EF4444"/>
      <rect x="16" y="22" width="3" height="3" fill="#F59E0B"/>
      
      <!-- Door -->
      <rect x="12" y="21" width="3" height="5" fill="#7C2D12"/>
      
      <!-- Flames -->
      <path d="M8 16 Q10 12 12 16 Q14 10 16 16 Q18 12 20 16" fill="#EF4444"/>
      <path d="M9 15 Q11 11 13 15 Q15 9 17 15 Q19 11 21 15" fill="#F97316"/>
      <path d="M10 14 Q12 10 14 14 Q16 8 18 14" fill="#FBBF24"/>
      
      <!-- Smoke -->
      <ellipse cx="10" cy="6" rx="3" ry="2" fill="#6B7280" fill-opacity="0.7"/>
      <ellipse cx="14" cy="4" rx="4" ry="2" fill="#6B7280" fill-opacity="0.6"/>
      <ellipse cx="18" cy="6" rx="3" ry="2" fill="#6B7280" fill-opacity="0.5"/>
    </svg>`,
    'medium',
    '#DC2626'
  ),

  // Vehicle Fire - Car with flames
  createIcon(
    'vehicle-fire',
    'Vehicle Fire',
    'incident-types',
    `<svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Car Body -->
      <rect x="4" y="12" width="24" height="6" rx="2" fill="#374151"/>
      
      <!-- Car Roof -->
      <rect x="8" y="8" width="16" height="6" rx="2" fill="#4B5563"/>
      
      <!-- Wheels -->
      <circle cx="10" cy="20" r="2" fill="#1F2937"/>
      <circle cx="22" cy="20" r="2" fill="#1F2937"/>
      
      <!-- Windows -->
      <rect x="10" y="9" width="4" height="4" rx="0.5" fill="#93C5FD" fill-opacity="0.3"/>
      <rect x="18" y="9" width="4" height="4" rx="0.5" fill="#F97316" fill-opacity="0.8"/>
      
      <!-- Flames from Hood -->
      <path d="M4 12 Q6 8 8 12 Q10 6 12 12" fill="#EF4444"/>
      <path d="M5 11 Q7 7 9 11 Q11 5 13 11" fill="#F97316"/>
      <path d="M6 10 Q8 6 10 10 Q12 4 14 10" fill="#FBBF24"/>
      
      <!-- Flames from Windows -->
      <path d="M18 9 Q20 5 22 9 Q24 3 26 9" fill="#EF4444"/>
      <path d="M19 8 Q21 4 23 8 Q25 2 27 8" fill="#F97316"/>
      
      <!-- Smoke -->
      <ellipse cx="8" cy="4" rx="3" ry="1.5" fill="#6B7280" fill-opacity="0.7"/>
      <ellipse cx="16" cy="2" rx="4" ry="1.5" fill="#6B7280" fill-opacity="0.6"/>
      <ellipse cx="24" cy="4" rx="3" ry="1.5" fill="#6B7280" fill-opacity="0.5"/>
    </svg>`,
    'medium',
    '#F59E0B'
  ),

  // Medical Emergency - Person with medical cross
  createIcon(
    'medical-emergency',
    'Medical Emergency',
    'incident-types',
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Background Circle -->
      <circle cx="12" cy="12" r="11" fill="#059669"/>
      
      <!-- Person -->
      <circle cx="12" cy="8" r="3" fill="white"/>
      <rect x="9" y="12" width="6" height="8" rx="1" fill="white"/>
      
      <!-- Medical Cross -->
      <rect x="10" y="6" width="4" height="1.5" fill="#DC2626"/>
      <rect x="11.25" y="4.5" width="1.5" height="4.5" fill="#DC2626"/>
      
      <!-- Star of Life -->
      <circle cx="18" cy="6" r="3" fill="#1E40AF"/>
      <polygon points="18,4 18.5,5.5 17.5,5.5" fill="white"/>
      <polygon points="18,8 18.5,6.5 17.5,6.5" fill="white"/>
      <polygon points="16,6 17.5,6.5 17.5,5.5" fill="white"/>
      <polygon points="20,6 18.5,5.5 18.5,6.5" fill="white"/>
      <polygon points="16.5,4.5 17.8,5.8 17.2,6.4" fill="white"/>
      <polygon points="19.5,7.5 18.2,6.2 18.8,5.6" fill="white"/>
    </svg>`,
    'medium',
    '#059669'
  ),

  // Hazmat Incident - Chemical spill/hazmat symbol
  createIcon(
    'hazmat-incident',
    'Hazmat Incident',
    'incident-types',
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Warning Diamond -->
      <polygon points="12,2 22,12 12,22 2,12" fill="#FBBF24"/>
      <polygon points="12,4 20,12 12,20 4,12" fill="#F59E0B"/>
      
      <!-- Hazmat Symbol -->
      <circle cx="12" cy="8" r="2" fill="#DC2626"/>
      <circle cx="8" cy="14" r="2" fill="#DC2626"/>
      <circle cx="16" cy="14" r="2" fill="#DC2626"/>
      
      <!-- Connecting Lines -->
      <path d="M12 10 L10 12" stroke="#DC2626" stroke-width="1"/>
      <path d="M12 10 L14 12" stroke="#DC2626" stroke-width="1"/>
      <path d="M10 14 L14 14" stroke="#DC2626" stroke-width="1"/>
      
      <!-- Warning Text -->
      <text x="12" y="18" text-anchor="middle" fill="black" font-family="Arial" font-size="6" font-weight="bold">!</text>
    </svg>`,
    'medium',
    '#F59E0B'
  ),

  // Water Rescue - Water with person
  createIcon(
    'water-rescue',
    'Water Rescue',
    'incident-types',
    `<svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Water -->
      <path d="M0 16 Q7 14 14 16 Q21 18 28 16 V24 H0 Z" fill="#3B82F6"/>
      <path d="M0 18 Q7 16 14 18 Q21 20 28 18 V24 H0 Z" fill="#1E40AF"/>
      
      <!-- Person in Water -->
      <circle cx="14" cy="14" r="2" fill="#FEF3C7"/>
      <rect x="12" y="16" width="4" height="2" rx="1" fill="#F59E0B"/>
      
      <!-- Arms Waving -->
      <rect x="10" y="12" width="1" height="3" fill="#FEF3C7" transform="rotate(-30 10.5 13.5)"/>
      <rect x="17" y="12" width="1" height="3" fill="#FEF3C7" transform="rotate(30 17.5 13.5)"/>
      
      <!-- Life Ring -->
      <circle cx="8" cy="8" r="3" fill="#F97316"/>
      <circle cx="8" cy="8" r="2" fill="none" stroke="white" stroke-width="0.5"/>
      <circle cx="8" cy="8" r="1" fill="none" stroke="#F97316" stroke-width="0.5"/>
      
      <!-- Rescue Boat -->
      <path d="M18 10 Q20 8 24 10 Q26 12 24 14 Q20 14 18 12 Z" fill="#DC2626"/>
      <rect x="20" y="8" width="2" height="2" fill="white"/>
    </svg>`,
    'medium',
    '#3B82F6'
  ),

  // Wildland Fire - Trees with flames
  createIcon(
    'wildland-fire',
    'Wildland Fire',
    'incident-types',
    `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Ground -->
      <rect x="0" y="22" width="28" height="6" fill="#8B5CF6"/>
      
      <!-- Trees -->
      <circle cx="8" cy="18" r="4" fill="#22C55E"/>
      <rect x="7" y="18" width="2" height="6" fill="#7C2D12"/>
      
      <circle cx="14" cy="16" r="5" fill="#16A34A"/>
      <rect x="13" y="16" width="2" height="8" fill="#7C2D12"/>
      
      <circle cx="20" cy="18" r="4" fill="#22C55E"/>
      <rect x="19" y="18" width="2" height="6" fill="#7C2D12"/>
      
      <!-- Flames -->
      <path d="M6 18 Q8 12 10 18 Q12 8 14 18 Q16 10 18 18 Q20 12 22 18" fill="#EF4444"/>
      <path d="M7 17 Q9 11 11 17 Q13 7 15 17 Q17 9 19 17 Q21 11 23 17" fill="#F97316"/>
      <path d="M8 16 Q10 10 12 16 Q14 6 16 16 Q18 8 20 16" fill="#FBBF24"/>
      
      <!-- Smoke -->
      <ellipse cx="8" cy="8" rx="4" ry="2" fill="#6B7280" fill-opacity="0.7"/>
      <ellipse cx="14" cy="4" rx="6" ry="2" fill="#6B7280" fill-opacity="0.6"/>
      <ellipse cx="20" cy="6" rx="4" ry="2" fill="#6B7280" fill-opacity="0.5"/>
    </svg>`,
    'medium',
    '#22C55E'
  )
];

// ============================================================================
// FACILITIES - Buildings and infrastructure
// ============================================================================

const facilitiesIcons: MapIcon[] = [
  // Fire Station - Professional fire house
  createIcon(
    'fire-station',
    'Fire Station',
    'facilities',
    `<svg width="36" height="32" viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Building Base -->
      <rect x="2" y="12" width="32" height="16" fill="#DC2626"/>
      
      <!-- Roof -->
      <polygon points="0,12 18,4 36,12" fill="#7C2D12"/>
      
      <!-- Main Bay Door -->
      <rect x="6" y="16" width="12" height="12" fill="#991B1B"/>
      <rect x="7" y="17" width="10" height="10" fill="white"/>
      <path d="M8 18 H16 M8 20 H16 M8 22 H16 M8 24 H16 M8 26 H16" stroke="#DC2626" stroke-width="0.5"/>
      
      <!-- Side Door -->
      <rect x="20" y="20" width="4" height="8" fill="#7C2D12"/>
      <circle cx="23" cy="24" r="0.3" fill="#FBBF24"/>
      
      <!-- Windows -->
      <rect x="26" y="18" width="4" height="3" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="26" y="22" width="4" height="3" fill="#93C5FD" fill-opacity="0.7"/>
      
      <!-- Station Number -->
      <circle cx="12" cy="10" r="3" fill="white"/>
      <text x="12" y="12" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="4" font-weight="bold">1</text>
      
      <!-- Fire Department Shield -->
      <path d="M28 8 Q30 6 32 8 Q32 10 30 12 Q28 10 28 8" fill="#FBBF24"/>
      <rect x="29" y="8" width="2" height="1" fill="#DC2626"/>
      <rect x="29.5" y="7.5" width="1" height="2" fill="#DC2626"/>
      
      <!-- Emergency Lights -->
      <rect x="4" y="14" width="2" height="1" rx="0.5" fill="#EF4444"/>
      <rect x="30" y="14" width="2" height="1" rx="0.5" fill="#EF4444"/>
      
      <!-- Fire Bell -->
      <circle cx="18" cy="8" r="1.5" fill="#7C2D12"/>
      <circle cx="18" cy="8" r="1" fill="#FBBF24"/>
    </svg>`,
    'large',
    '#DC2626'
  ),

  // Hospital - Medical facility with helipad
  createIcon(
    'hospital',
    'Hospital',
    'facilities',
    `<svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Main Building -->
      <rect x="4" y="12" width="24" height="20" fill="white" stroke="#1E40AF" stroke-width="1"/>
      
      <!-- Hospital Wings -->
      <rect x="2" y="16" width="6" height="12" fill="#F3F4F6" stroke="#1E40AF" stroke-width="0.5"/>
      <rect x="24" y="16" width="6" height="12" fill="#F3F4F6" stroke="#1E40AF" stroke-width="0.5"/>
      
      <!-- Windows -->
      <rect x="6" y="14" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="10" y="14" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="14" y="14" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="18" y="14" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="22" y="14" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="26" y="14" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      
      <rect x="6" y="18" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="22" y="18" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      <rect x="26" y="18" width="2" height="2" fill="#93C5FD" fill-opacity="0.7"/>
      
      <!-- Main Medical Cross -->
      <rect x="14" y="16" width="4" height="2" fill="#DC2626"/>
      <rect x="15" y="14" width="2" height="6" fill="#DC2626"/>
      
      <!-- Emergency Entrance -->
      <rect x="12" y="24" width="8" height="8" fill="#EF4444"/>
      <text x="16" y="28" text-anchor="middle" fill="white" font-family="Arial" font-size="2" font-weight="bold">EMERGENCY</text>
      
      <!-- Helipad on Roof -->
      <circle cx="16" cy="6" r="6" fill="#1E40AF"/>
      <circle cx="16" cy="6" r="4" fill="none" stroke="white" stroke-width="1"/>
      <text x="16" y="8" text-anchor="middle" fill="white" font-family="Arial" font-size="6" font-weight="bold">H</text>
      
      <!-- Ambulance Bay -->
      <rect x="4" y="28" width="6" height="4" fill="#FBBF24"/>
      <rect x="22" y="28" width="6" height="4" fill="#FBBF24"/>
    </svg>`,
    'large',
    '#1E40AF'
  ),

  // Fire Hydrant - Realistic hydrant design
  createIcon(
    'fire-hydrant',
    'Fire Hydrant',
    'facilities',
    `<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Hydrant Body -->
      <rect x="6" y="10" width="4" height="8" rx="1" fill="#F59E0B"/>
      
      <!-- Top Cap -->
      <circle cx="8" cy="10" r="2.5" fill="#DC2626"/>
      <circle cx="8" cy="10" r="1.5" fill="#FBBF24"/>
      
      <!-- Side Outlets -->
      <rect x="2" y="12" width="4" height="2" rx="1" fill="#6B7280"/>
      <rect x="10" y="12" width="4" height="2" rx="1" fill="#6B7280"/>
      
      <!-- Outlet Caps -->
      <circle cx="4" cy="13" r="1" fill="#374151"/>
      <circle cx="12" cy="13" r="1" fill="#374151"/>
      
      <!-- Chain -->
      <rect x="3.5" y="11" width="0.5" height="1" fill="#9CA3AF"/>
      <rect x="3.5" y="12.5" width="0.5" height="1" fill="#9CA3AF"/>
      <rect x="11.5" y="11" width="0.5" height="1" fill="#9CA3AF"/>
      <rect x="11.5" y="12.5" width="0.5" height="1" fill="#9CA3AF"/>
      
      <!-- Base -->
      <rect x="5" y="18" width="6" height="2" rx="1" fill="#6B7280"/>
      
      <!-- Operating Nut -->
      <polygon points="8,8 9,9 8,10 7,9" fill="#374151"/>
      
      <!-- Reflective Markers -->
      <rect x="6.5" y="11" width="3" height="0.5" fill="white"/>
      <rect x="6.5" y="15" width="3" height="0.5" fill="white"/>
      
      <!-- Flow Rating -->
      <text x="8" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="1.5" font-weight="bold">1500</text>
    </svg>`,
    'small',
    '#F59E0B'
  ),

  // Helipad - Landing platform with H
  createIcon(
    'helipad',
    'Helipad',
    'facilities',
    `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Landing Circle -->
      <circle cx="14" cy="14" r="13" fill="#1E40AF"/>
      <circle cx="14" cy="14" r="11" fill="none" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="9" fill="none" stroke="white" stroke-width="1"/>
      
      <!-- Landing H -->
      <rect x="9" y="9" width="2" height="10" fill="white"/>
      <rect x="17" y="9" width="2" height="10" fill="white"/>
      <rect x="11" y="13" width="6" height="2" fill="white"/>
      
      <!-- Corner Markers -->
      <rect x="2" y="2" width="3" height="1" fill="white"/>
      <rect x="2" y="2" width="1" height="3" fill="white"/>
      
      <rect x="23" y="2" width="3" height="1" fill="white"/>
      <rect x="25" y="2" width="1" height="3" fill="white"/>
      
      <rect x="2" y="25" width="3" height="1" fill="white"/>
      <rect x="2" y="23" width="1" height="3" fill="white"/>
      
      <rect x="23" y="25" width="3" height="1" fill="white"/>
      <rect x="25" y="23" width="1" height="3" fill="white"/>
      
      <!-- Wind Direction -->
      <polygon points="14,4 15,6 14,7 13,6" fill="white"/>
      <text x="14" y="3" text-anchor="middle" fill="white" font-family="Arial" font-size="2" font-weight="bold">N</text>
    </svg>`,
    'large',
    '#1E40AF'
  )
];

// Export the enhanced icons
export const enhancedFireEMSIcons: Record<IconCategory, MapIcon[]> = {
  'fire-apparatus': fireApparatusIcons,
  'ems-units': emsUnitsIcons,
  'incident-types': incidentTypeIcons,
  'facilities': facilitiesIcons,
  'prevention': [
    // Fire Extinguisher - Professional fire suppression device
    createIcon(
      'fire-extinguisher',
      'Fire Extinguisher',
      'prevention',
      `<svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Cylinder Body -->
        <rect x="5" y="8" width="6" height="14" rx="1" fill="#DC2626"/>
        
        <!-- Pressure Gauge -->
        <circle cx="8" cy="6" r="2" fill="#374151"/>
        <circle cx="8" cy="6" r="1.5" fill="#22C55E"/>
        
        <!-- Handle/Lever -->
        <rect x="3" y="7" width="4" height="1.5" rx="0.5" fill="#6B7280"/>
        
        <!-- Hose -->
        <path d="M3 8 Q1 10 2 12" stroke="#1F2937" stroke-width="1" fill="none"/>
        
        <!-- Nozzle -->
        <rect x="1" y="11" width="2" height="1" fill="#374151"/>
        
        <!-- Label -->
        <rect x="6" y="10" width="4" height="3" fill="white"/>
        <text x="8" y="12" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="2" font-weight="bold">ABC</text>
        
        <!-- Pin -->
        <rect x="3.5" y="6.5" width="1" height="1" fill="#FBBF24"/>
        <circle cx="4" cy="6" r="0.5" fill="#F59E0B"/>
        
        <!-- Base -->
        <rect x="4" y="22" width="8" height="2" rx="1" fill="#6B7280"/>
      </svg>`,
      'small',
      '#DC2626'
    ),

    // Smoke Detector - Ceiling-mounted detection device
    createIcon(
      'smoke-detector',
      'Smoke Detector',
      'prevention',
      `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Detector Base -->
        <circle cx="10" cy="10" r="9" fill="white" stroke="#6B7280" stroke-width="1"/>
        
        <!-- Test Button -->
        <circle cx="10" cy="10" r="3" fill="#DC2626"/>
        <circle cx="10" cy="10" r="2" fill="#EF4444"/>
        
        <!-- LED Indicator -->
        <circle cx="6" cy="6" r="1" fill="#22C55E"/>
        
        <!-- Vents -->
        <path d="M 4 8 Q 6 6 8 8" stroke="#9CA3AF" stroke-width="0.5" fill="none"/>
        <path d="M 12 8 Q 14 6 16 8" stroke="#9CA3AF" stroke-width="0.5" fill="none"/>
        <path d="M 4 12 Q 6 14 8 12" stroke="#9CA3AF" stroke-width="0.5" fill="none"/>
        <path d="M 12 12 Q 14 14 16 12" stroke="#9CA3AF" stroke-width="0.5" fill="none"/>
        
        <!-- Brand Label -->
        <text x="10" y="16" text-anchor="middle" fill="#6B7280" font-family="Arial" font-size="2">SMOKE</text>
        
        <!-- Mounting Bracket -->
        <rect x="9" y="1" width="2" height="2" fill="#9CA3AF"/>
      </svg>`,
      'small',
      '#6B7280'
    ),

    // Sprinkler System - Fire suppression sprinkler heads
    createIcon(
      'sprinkler-system',
      'Sprinkler System',
      'prevention',
      `<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Main Pipe -->
        <rect x="0" y="7" width="24" height="2" fill="#6B7280"/>
        
        <!-- Sprinkler Heads -->
        <circle cx="4" cy="8" r="2" fill="#DC2626"/>
        <circle cx="12" cy="8" r="2" fill="#DC2626"/>
        <circle cx="20" cy="8" r="2" fill="#DC2626"/>
        
        <!-- Deflectors -->
        <rect x="2" y="6" width="4" height="0.5" fill="#9CA3AF"/>
        <rect x="10" y="6" width="4" height="0.5" fill="#9CA3AF"/>
        <rect x="18" y="6" width="4" height="0.5" fill="#9CA3AF"/>
        
        <!-- Water Spray Pattern -->
        <path d="M 4 10 Q 2 12 1 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        <path d="M 4 10 Q 4 12 4 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        <path d="M 4 10 Q 6 12 7 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        
        <path d="M 12 10 Q 10 12 9 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        <path d="M 12 10 Q 12 12 12 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        <path d="M 12 10 Q 14 12 15 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        
        <path d="M 20 10 Q 18 12 17 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        <path d="M 20 10 Q 20 12 20 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        <path d="M 20 10 Q 22 12 23 14" stroke="#3B82F6" stroke-width="0.5" fill="none"/>
        
        <!-- Control Valve -->
        <rect x="22" y="6" width="2" height="4" fill="#F59E0B"/>
        <circle cx="23" cy="8" r="0.5" fill="#DC2626"/>
      </svg>`,
      'medium',
      '#DC2626'
    ),

    // Exit Sign - Emergency egress signage
    createIcon(
      'exit-sign',
      'Exit Sign',
      'prevention',
      `<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Sign Background -->
        <rect x="2" y="4" width="20" height="8" rx="1" fill="#22C55E"/>
        
        <!-- Inner Frame -->
        <rect x="3" y="5" width="18" height="6" rx="0.5" fill="#DCFCE7"/>
        
        <!-- EXIT Text -->
        <text x="12" y="9" text-anchor="middle" fill="#15803D" font-family="Arial" font-size="4" font-weight="bold">EXIT</text>
        
        <!-- Arrow -->
        <polygon points="18,8 20,8.5 18,9" fill="#15803D"/>
        
        <!-- Emergency Lighting -->
        <circle cx="4" cy="2" r="1" fill="#FBBF24"/>
        <circle cx="20" cy="2" r="1" fill="#FBBF24"/>
        
        <!-- Mounting Bracket -->
        <rect x="11" y="12" width="2" height="2" fill="#6B7280"/>
        
        <!-- Power Indicator -->
        <circle cx="21" cy="5" r="0.5" fill="#22C55E"/>
      </svg>`,
      'medium',
      '#22C55E'
    ),

    // Emergency Phone - Direct communication device
    createIcon(
      'emergency-phone',
      'Emergency Phone',
      'prevention',
      `<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Phone Box -->
        <rect x="2" y="2" width="12" height="16" rx="1" fill="#DC2626"/>
        
        <!-- Display Window -->
        <rect x="3" y="4" width="10" height="3" fill="white"/>
        <text x="8" y="6" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="2" font-weight="bold">EMERGENCY</text>
        
        <!-- Handset Cradle -->
        <rect x="4" y="8" width="8" height="2" fill="#374151"/>
        
        <!-- Handset -->
        <rect x="5" y="8.5" width="6" height="1" rx="0.5" fill="#1F2937"/>
        
        <!-- Keypad -->
        <circle cx="6" cy="12" r="0.8" fill="#F3F4F6"/>
        <circle cx="8" cy="12" r="0.8" fill="#F3F4F6"/>
        <circle cx="10" cy="12" r="0.8" fill="#F3F4F6"/>
        <circle cx="6" cy="14" r="0.8" fill="#F3F4F6"/>
        <circle cx="8" cy="14" r="0.8" fill="#F3F4F6"/>
        <circle cx="10" cy="14" r="0.8" fill="#F3F4F6"/>
        <circle cx="8" cy="16" r="0.8" fill="#F3F4F6"/>
        
        <!-- Direct Connect Label -->
        <rect x="3" y="17" width="10" height="1" fill="#FBBF24"/>
        
        <!-- Mounting -->
        <rect x="0" y="8" width="2" height="4" fill="#6B7280"/>
        <rect x="14" y="8" width="2" height="4" fill="#6B7280"/>
      </svg>`,
      'small',
      '#DC2626'
    ),

    // Fire Alarm Panel - Building fire detection control
    createIcon(
      'fire-alarm-panel',
      'Fire Alarm Panel',
      'prevention',
      `<svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Panel Cabinet -->
        <rect x="2" y="2" width="16" height="20" rx="1" fill="#F3F4F6" stroke="#6B7280" stroke-width="1"/>
        
        <!-- Display Header -->
        <rect x="3" y="3" width="14" height="3" fill="#DC2626"/>
        <text x="10" y="5" text-anchor="middle" fill="white" font-family="Arial" font-size="2" font-weight="bold">FIRE ALARM</text>
        
        <!-- Status LEDs -->
        <circle cx="5" cy="8" r="0.8" fill="#22C55E"/>
        <circle cx="8" cy="8" r="0.8" fill="#FBBF24"/>
        <circle cx="11" cy="8" r="0.8" fill="#DC2626"/>
        <circle cx="14" cy="8" r="0.8" fill="#6B7280"/>
        
        <!-- Zone Indicators -->
        <rect x="4" y="10" width="3" height="1" fill="#22C55E"/>
        <rect x="8" y="10" width="3" height="1" fill="#22C55E"/>
        <rect x="12" y="10" width="3" height="1" fill="#22C55E"/>
        
        <rect x="4" y="12" width="3" height="1" fill="#22C55E"/>
        <rect x="8" y="12" width="3" height="1" fill="#FBBF24"/>
        <rect x="12" y="12" width="3" height="1" fill="#22C55E"/>
        
        <!-- Control Buttons -->
        <rect x="4" y="15" width="2" height="1" fill="#DC2626"/>
        <rect x="7" y="15" width="2" height="1" fill="#FBBF24"/>
        <rect x="10" y="15" width="2" height="1" fill="#6B7280"/>
        <rect x="13" y="15" width="2" height="1" fill="#22C55E"/>
        
        <!-- Digital Display -->
        <rect x="4" y="17" width="11" height="2" fill="#000000"/>
        <text x="9.5" y="18.5" text-anchor="middle" fill="#22C55E" font-family="Arial" font-size="1.5">NORMAL</text>
        
        <!-- Key Switch -->
        <circle cx="16" cy="18" r="1" fill="#FBBF24"/>
        
        <!-- Backup Battery Indicator -->
        <rect x="4" y="20" width="4" height="1" fill="#22C55E"/>
        <text x="6" y="20.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1">BATT OK</text>
      </svg>`,
      'medium',
      '#DC2626'
    )
  ],
  'energy-systems': [
    // Power Lines - Electrical transmission
    createIcon(
      'power-lines',
      'Power Lines',
      'energy-systems',
      `<svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Transmission Towers -->
        <rect x="2" y="4" width="1" height="16" fill="#6B7280"/>
        <rect x="13" y="2" width="1" height="18" fill="#6B7280"/>
        <rect x="25" y="4" width="1" height="16" fill="#6B7280"/>
        
        <!-- Tower Cross Arms -->
        <rect x="0" y="6" width="5" height="0.5" fill="#374151"/>
        <rect x="0" y="8" width="5" height="0.5" fill="#374151"/>
        <rect x="0" y="10" width="5" height="0.5" fill="#374151"/>
        
        <rect x="11" y="4" width="5" height="0.5" fill="#374151"/>
        <rect x="11" y="6" width="5" height="0.5" fill="#374151"/>
        <rect x="11" y="8" width="5" height="0.5" fill="#374151"/>
        
        <rect x="23" y="6" width="5" height="0.5" fill="#374151"/>
        <rect x="23" y="8" width="5" height="0.5" fill="#374151"/>
        <rect x="23" y="10" width="5" height="0.5" fill="#374151"/>
        
        <!-- Power Lines (sagging cables) -->
        <path d="M 3 7 Q 8 9 13 7" stroke="#1F2937" stroke-width="0.5" fill="none"/>
        <path d="M 3 9 Q 8 11 13 9" stroke="#1F2937" stroke-width="0.5" fill="none"/>
        <path d="M 3 11 Q 8 13 13 11" stroke="#1F2937" stroke-width="0.5" fill="none"/>
        
        <path d="M 14 5 Q 19 7 25 5" stroke="#1F2937" stroke-width="0.5" fill="none"/>
        <path d="M 14 7 Q 19 9 25 7" stroke="#1F2937" stroke-width="0.5" fill="none"/>
        <path d="M 14 9 Q 19 11 25 9" stroke="#1F2937" stroke-width="0.5" fill="none"/>
        
        <!-- Insulators -->
        <rect x="2.5" y="6.5" width="0.5" height="1" fill="#93C5FD"/>
        <rect x="13.5" y="4.5" width="0.5" height="1" fill="#93C5FD"/>
        <rect x="25.5" y="6.5" width="0.5" height="1" fill="#93C5FD"/>
        
        <!-- Danger Signs -->
        <polygon points="2,4 3,3 3,4" fill="#DC2626"/>
        <polygon points="13,2 14,1 14,2" fill="#DC2626"/>
        <polygon points="25,4 26,3 26,4" fill="#DC2626"/>
        
        <!-- High Voltage Warning -->
        <rect x="6" y="22" width="8" height="2" fill="#FBBF24"/>
        <text x="10" y="23.5" text-anchor="middle" fill="black" font-family="Arial" font-size="1.5" font-weight="bold">⚡ HIGH VOLTAGE</text>
      </svg>`,
      'large',
      '#1F2937'
    ),

    // Natural Gas Lines - Underground gas distribution
    createIcon(
      'gas-lines',
      'Gas Lines',
      'energy-systems',
      `<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Underground Pipeline -->
        <rect x="0" y="12" width="28" height="3" fill="#FBBF24"/>
        
        <!-- Pipeline Markers -->
        <rect x="4" y="8" width="1" height="8" fill="#6B7280"/>
        <rect x="12" y="6" width="1" height="10" fill="#6B7280"/>
        <rect x="20" y="8" width="1" height="8" fill="#6B7280"/>
        
        <!-- Meter Stations -->
        <rect x="3" y="6" width="3" height="3" fill="#F59E0B"/>
        <rect x="11" y="4" width="3" height="3" fill="#F59E0B"/>
        <rect x="19" y="6" width="3" height="3" fill="#F59E0B"/>
        
        <!-- Shut-off Valves -->
        <circle cx="4.5" cy="7.5" r="0.8" fill="#DC2626"/>
        <circle cx="12.5" cy="5.5" r="0.8" fill="#DC2626"/>
        <circle cx="20.5" cy="7.5" r="0.8" fill="#DC2626"/>
        
        <!-- Flow Direction -->
        <polygon points="26,13 28,13.5 26,14" fill="#F59E0B"/>
        
        <!-- Gas Leak Detection -->
        <circle cx="8" cy="10" r="1" fill="#FBBF24" fill-opacity="0.5"/>
        <circle cx="16" cy="8" r="1" fill="#FBBF24" fill-opacity="0.5"/>
        
        <!-- Pressure Monitoring -->
        <rect x="24" y="10" width="2" height="2" fill="#22C55E"/>
        <circle cx="25" cy="11" r="0.5" fill="white"/>
        
        <!-- Warning Labels -->
        <rect x="2" y="16" width="6" height="2" fill="#DC2626"/>
        <text x="5" y="17.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1.5" font-weight="bold">GAS</text>
        
        <rect x="18" y="16" width="8" height="2" fill="#DC2626"/>
        <text x="22" y="17.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1.2" font-weight="bold">DANGER</text>
        
        <!-- Call Before You Dig -->
        <rect x="10" y="18" width="8" height="1" fill="#FBBF24"/>
        <text x="14" y="18.7" text-anchor="middle" fill="black" font-family="Arial" font-size="1">CALL 811</text>
      </svg>`,
      'large',
      '#FBBF24'
    ),

    // Solar Panel Installation - Renewable energy system
    createIcon(
      'solar-panels',
      'Solar Panels',
      'energy-systems',
      `<svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Solar Panel Array -->
        <rect x="2" y="8" width="24" height="10" rx="1" fill="#1E40AF"/>
        
        <!-- Individual Panel Cells -->
        <rect x="3" y="9" width="5" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        <rect x="9" y="9" width="5" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        <rect x="15" y="9" width="5" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        <rect x="21" y="9" width="4" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        
        <rect x="3" y="13" width="5" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        <rect x="9" y="13" width="5" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        <rect x="15" y="13" width="5" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        <rect x="21" y="13" width="4" height="3" fill="#3B82F6" stroke="#1D4ED8" stroke-width="0.3"/>
        
        <!-- Sun -->
        <circle cx="6" cy="4" r="2" fill="#FBBF24"/>
        
        <!-- Sun Rays -->
        <rect x="5.7" y="1" width="0.6" height="2" fill="#F59E0B"/>
        <rect x="8" y="2" width="1.4" height="0.6" fill="#F59E0B" transform="rotate(45 8.7 2.3)"/>
        <rect x="8" y="5.4" width="1.4" height="0.6" fill="#F59E0B" transform="rotate(-45 8.7 5.7)"/>
        <rect x="3.6" y="5.4" width="1.4" height="0.6" fill="#F59E0B" transform="rotate(45 4.3 5.7)"/>
        <rect x="3.6" y="2" width="1.4" height="0.6" fill="#F59E0B" transform="rotate(-45 4.3 2.3)"/>
        
        <!-- Power Inverter -->
        <rect x="23" y="4" width="4" height="3" fill="#6B7280"/>
        <rect x="24" y="5" width="2" height="1" fill="#22C55E"/>
        
        <!-- Power Output Meter -->
        <circle cx="25" cy="2" r="1" fill="#22C55E"/>
        <text x="25" y="2.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1" font-weight="bold">kW</text>
        
        <!-- Electrical Connections -->
        <rect x="26" y="7" width="1" height="3" fill="#F59E0B"/>
        <rect x="25" y="10" width="3" height="1" fill="#F59E0B"/>
        
        <!-- Tilt Frame -->
        <polygon points="2,18 26,18 28,16 4,16" fill="#9CA3AF"/>
        
        <!-- Ground Mounting -->
        <rect x="6" y="18" width="2" height="2" fill="#6B7280"/>
        <rect x="20" y="18" width="2" height="2" fill="#6B7280"/>
      </svg>`,
      'large',
      '#1E40AF'
    ),

    // Electrical Transformer - Power distribution equipment
    createIcon(
      'transformer',
      'Transformer',
      'energy-systems',
      `<svg width="24" height="28" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Transformer Tank -->
        <rect x="4" y="8" width="16" height="12" rx="1" fill="#6B7280"/>
        
        <!-- Cooling Fins -->
        <rect x="2" y="10" width="1" height="8" fill="#9CA3AF"/>
        <rect x="21" y="10" width="1" height="8" fill="#9CA3AF"/>
        <rect x="2" y="12" width="1" height="4" fill="#9CA3AF"/>
        <rect x="21" y="12" width="1" height="4" fill="#9CA3AF"/>
        
        <!-- High Voltage Bushings -->
        <circle cx="8" cy="6" r="1.5" fill="#F59E0B"/>
        <circle cx="12" cy="4" r="1.5" fill="#F59E0B"/>
        <circle cx="16" cy="6" r="1.5" fill="#F59E0B"/>
        
        <!-- Low Voltage Bushings -->
        <rect x="6" y="20" width="2" height="4" fill="#374151"/>
        <rect x="11" y="20" width="2" height="4" fill="#374151"/>
        <rect x="16" y="20" width="2" height="4" fill="#374151"/>
        
        <!-- Power Rating Nameplate -->
        <rect x="6" y="10" width="12" height="6" fill="white"/>
        <text x="12" y="12" text-anchor="middle" fill="black" font-family="Arial" font-size="2" font-weight="bold">500 kVA</text>
        <text x="12" y="14" text-anchor="middle" fill="black" font-family="Arial" font-size="1.5">25kV/480V</text>
        <text x="12" y="15.5" text-anchor="middle" fill="black" font-family="Arial" font-size="1.5">3-Phase</text>
        
        <!-- Danger Signs -->
        <polygon points="5,7 6,6 6,7" fill="#DC2626"/>
        <polygon points="18,7 19,6 19,7" fill="#DC2626"/>
        
        <!-- High Voltage Warning -->
        <rect x="2" y="24" width="8" height="2" fill="#DC2626"/>
        <text x="6" y="25.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1.5" font-weight="bold">DANGER</text>
        
        <rect x="14" y="24" width="8" height="2" fill="#DC2626"/>
        <text x="18" y="25.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1.2" font-weight="bold">HIGH VOLTAGE</text>
        
        <!-- Oil Level Gauge -->
        <circle cx="20" cy="12" r="1" fill="#FBBF24"/>
        <rect x="19.5" y="11" width="1" height="2" fill="#22C55E"/>
        
        <!-- Grounding -->
        <rect x="11" y="20" width="2" height="6" fill="#22C55E"/>
        <polygon points="11,26 13,26 12,28" fill="#22C55E"/>
        
        <!-- Protective Fence Indicator -->
        <rect x="0" y="26" width="24" height="1" fill="#F59E0B"/>
        <rect x="2" y="25" width="1" height="3" fill="#F59E0B"/>
        <rect x="6" y="25" width="1" height="3" fill="#F59E0B"/>
        <rect x="10" y="25" width="1" height="3" fill="#F59E0B"/>
        <rect x="14" y="25" width="1" height="3" fill="#F59E0B"/>
        <rect x="18" y="25" width="1" height="3" fill="#F59E0B"/>
        <rect x="22" y="25" width="1" height="3" fill="#F59E0B"/>
      </svg>`,
      'large',
      '#6B7280'
    ),

    // Electrical Panel - Building electrical distribution
    createIcon(
      'electrical-panel',
      'Electrical Panel',
      'energy-systems',
      `<svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Panel Cabinet -->
        <rect x="2" y="2" width="12" height="16" rx="1" fill="#F3F4F6" stroke="#6B7280" stroke-width="1"/>
        
        <!-- Main Breaker -->
        <rect x="3" y="3" width="10" height="2" fill="#1F2937"/>
        <text x="8" y="4.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1.5" font-weight="bold">MAIN 200A</text>
        
        <!-- Circuit Breakers (ON position) -->
        <rect x="4" y="6" width="2" height="1" fill="#22C55E"/>
        <rect x="7" y="6" width="2" height="1" fill="#22C55E"/>
        <rect x="10" y="6" width="2" height="1" fill="#22C55E"/>
        
        <rect x="4" y="8" width="2" height="1" fill="#22C55E"/>
        <rect x="7" y="8" width="2" height="1" fill="#DC2626"/> <!-- One tripped breaker -->
        <rect x="10" y="8" width="2" height="1" fill="#22C55E"/>
        
        <rect x="4" y="10" width="2" height="1" fill="#22C55E"/>
        <rect x="7" y="10" width="2" height="1" fill="#22C55E"/>
        <rect x="10" y="10" width="2" height="1" fill="#FBBF24"/> <!-- One testing -->
        
        <rect x="4" y="12" width="2" height="1" fill="#22C55E"/>
        <rect x="7" y="12" width="2" height="1" fill="#22C55E"/>
        <rect x="10" y="12" width="2" height="1" fill="#22C55E"/>
        
        <!-- Circuit Labels -->
        <text x="5" y="14.5" text-anchor="middle" fill="black" font-family="Arial" font-size="0.8">LIGHTS</text>
        <text x="8" y="14.5" text-anchor="middle" fill="black" font-family="Arial" font-size="0.8">OUTLETS</text>
        <text x="11" y="14.5" text-anchor="middle" fill="black" font-family="Arial" font-size="0.8">HVAC</text>
        
        <!-- Panel Schedule -->
        <rect x="3" y="15" width="10" height="2" fill="white"/>
        <text x="8" y="16.5" text-anchor="middle" fill="black" font-family="Arial" font-size="1">PANEL A</text>
        
        <!-- Emergency Disconnect -->
        <circle cx="1" cy="4" r="0.8" fill="#DC2626"/>
        <text x="1" y="4.3" text-anchor="middle" fill="white" font-family="Arial" font-size="0.8" font-weight="bold">OFF</text>
        
        <!-- Electrical Hazard Symbol -->
        <polygon points="14,6 15,5 15,6" fill="#FBBF24"/>
        <text x="14.5" y="8" text-anchor="middle" fill="#DC2626" font-family="Arial" font-size="2" font-weight="bold">⚡</text>
      </svg>`,
      'medium',
      '#6B7280'
    ),

    // Emergency Generator - Backup power system
    createIcon(
      'generator',
      'Generator',
      'energy-systems',
      `<svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Generator Housing -->
        <rect x="2" y="8" width="28" height="12" rx="2" fill="#6B7280"/>
        
        <!-- Engine Cover -->
        <rect x="4" y="10" width="12" height="8" rx="1" fill="#9CA3AF"/>
        
        <!-- Control Panel -->
        <rect x="18" y="10" width="10" height="8" rx="1" fill="#374151"/>
        
        <!-- Engine Cooling Vents -->
        <rect x="5" y="11" width="1" height="6" fill="#6B7280"/>
        <rect x="7" y="11" width="1" height="6" fill="#6B7280"/>
        <rect x="9" y="11" width="1" height="6" fill="#6B7280"/>
        <rect x="11" y="11" width="1" height="6" fill="#6B7280"/>
        <rect x="13" y="11" width="1" height="6" fill="#6B7280"/>
        
        <!-- Control Panel Display -->
        <rect x="20" y="12" width="6" height="2" fill="#000000"/>
        <text x="23" y="13.5" text-anchor="middle" fill="#22C55E" font-family="Arial" font-size="1.5" font-weight="bold">AUTO</text>
        
        <!-- Start/Stop Button -->
        <circle cx="21" cy="16" r="1" fill="#22C55E"/>
        <text x="21" y="16.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1" font-weight="bold">ON</text>
        
        <!-- Emergency Stop -->
        <rect x="24" y="15" width="2" height="2" fill="#DC2626"/>
        <text x="25" y="16.5" text-anchor="middle" fill="white" font-family="Arial" font-size="1" font-weight="bold">STOP</text>
        
        <!-- Power Output Connections -->
        <rect x="28" y="12" width="2" height="4" fill="#F59E0B"/>
        <circle cx="29" cy="13" r="0.5" fill="#DC2626"/>
        <circle cx="29" cy="15" r="0.5" fill="#DC2626"/>
        
        <!-- Fuel Tank -->
        <rect x="6" y="6" width="8" height="2" rx="1" fill="#1E40AF"/>
        <rect x="7" y="6.2" width="6" height="1.6" fill="#3B82F6"/>
        
        <!-- Exhaust Stack -->
        <rect x="14" y="4" width="2" height="6" fill="#6B7280"/>
        <circle cx="15" cy="4" r="1" fill="#374151"/>
        
        <!-- Exhaust Smoke -->
        <ellipse cx="13" cy="2" rx="2" ry="1" fill="#9CA3AF" fill-opacity="0.5"/>
        <ellipse cx="17" cy="1" rx="3" ry="1" fill="#9CA3AF" fill-opacity="0.4"/>
        
        <!-- Transfer Switch Indicator -->
        <rect x="2" y="4" width="4" height="2" fill="#FBBF24"/>
        <text x="4" y="5.5" text-anchor="middle" fill="black" font-family="Arial" font-size="1.2" font-weight="bold">ATS</text>
        
        <!-- Power Rating -->
        <text x="16" y="22" text-anchor="middle" fill="white" font-family="Arial" font-size="2" font-weight="bold">100kW</text>
        
        <!-- Ground Connection -->
        <rect x="15" y="20" width="2" height="4" fill="#22C55E"/>
        <polygon points="15,24 17,24 16,26" fill="#22C55E"/>
      </svg>`,
      'large',
      '#6B7280'
    )
  ],
  'custom': []
};

// Flat array of all enhanced icons
export const allEnhancedIcons = Object.values(enhancedFireEMSIcons).flat();