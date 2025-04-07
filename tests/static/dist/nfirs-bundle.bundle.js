/**
 * NFIRS Bundle (Manual Build)
 * 
 * This is a manually built bundle for the NFIRS module
 */

// Wrap everything in an IIFE to avoid global scope pollution
(function() {
  /**
   * NFIRS Codes module
   * Contains standardized codes used for NFIRS reporting
   */
  const NFIRSCodes = {
    // Incident Type Codes
    incidentTypes: {
      '100': 'Fire, Other',
      '111': 'Building fire',
      '112': 'Fires in structures other than in a building',
      '113': 'Cooking fire, confined to container',
      '114': 'Chimney or flue fire, confined to chimney or flue',
      '115': 'Incinerator overload or malfunction, fire confined',
      '116': 'Fuel burner/boiler malfunction, fire confined',
      '117': 'Commercial Compactor fire, confined to rubbish',
      '118': 'Trash or rubbish fire, contained',
      '120': 'Fire in mobile property used as a fixed structure, other',
      '121': 'Fire in mobile home used as fixed residence',
      '122': 'Fire in motor home, camper, recreational vehicle',
      '123': 'Fire in portable building, fixed location',
      '130': 'Mobile property (vehicle) fire, other',
      '131': 'Passenger vehicle fire',
      '132': 'Road freight or transport vehicle fire',
      '133': 'Rail vehicle fire',
      '134': 'Water vehicle fire',
      '135': 'Aircraft fire',
      '136': 'Self-propelled motor home or recreational vehicle',
      '137': 'Camper or recreational vehicle (RV) fire',
      '138': 'Off-road vehicle or heavy equipment fire',
      '140': 'Natural vegetation fire, other',
      '141': 'Forest, woods or wildland fire',
      '142': 'Brush, or brush and grass mixture fire',
      '143': 'Grass fire',
      '150': 'Outside rubbish fire, other',
      '151': 'Outside rubbish, trash or waste fire',
      '152': 'Garbage dump or sanitary landfill fire',
      '153': 'Construction or demolition landfill fire',
      '154': 'Dumpster or other outside trash receptacle fire',
      '155': 'Outside stationary compactor/compacted trash fire',
      '160': 'Special outside fire, other',
      '161': 'Outside storage fire',
      '162': 'Outside equipment fire',
      '163': 'Outside gas or vapor combustion explosion',
      '164': 'Outside mailbox fire',
      '170': 'Cultivated vegetation, crop fire, other',
      '171': 'Cultivated grain or crop fire',
      '172': 'Cultivated orchard or vineyard fire',
      '173': 'Cultivated trees or nursery stock fire',
      '200': 'Overpressure rupture, explosion, overheat other',
      '210': 'Overpressure rupture from steam, other',
      '211': 'Overpressure rupture of steam pipe or pipeline',
      '212': 'Overpressure rupture of steam boiler',
      '213': 'Steam rupture of pressure or process vessel',
      '220': 'Overpressure rupture from air or gas, other',
      '221': 'Overpressure rupture of air or gas pipe/pipeline',
      '222': 'Overpressure rupture of boiler from air or gas',
      '223': 'Air or gas rupture of pressure or process vessel',
      '240': 'Explosion (no fire), other',
      '241': 'Munitions or bomb explosion (no fire)',
      '242': 'Blasting agent explosion (no fire)',
      '243': 'Fireworks explosion (no fire)',
      '251': 'Excessive heat, scorch burns with no ignition',
      '300': 'Rescue, emergency medical call (EMS) call, other',
      '311': 'Medical assist, assist EMS crew',
      '320': 'Emergency medical service (EMS) Incident, other',
      '321': 'EMS call, excluding vehicle accident with injury',
      '322': 'Vehicle accident with injuries',
      '323': 'Motor vehicle/pedestrian accident (MV Ped)',
      '324': 'Motor vehicle accident with no injuries',
      '331': 'Lock-in (if lock out, use 511)',
      '340': 'Search, other',
      '341': 'Search for person on land',
      '342': 'Search for person in water',
      '350': 'Extrication, rescue, other',
      '351': 'Extrication of victim(s) from building/structure',
      '352': 'Extrication of victim(s) from vehicle',
      '353': 'Removal of victim(s) from stalled elevator',
      '354': 'Trench/below grade rescue',
      '355': 'Confined space rescue',
      '356': 'High angle rescue',
      '357': 'Extrication of victim(s) from machinery',
      '360': 'Water & ice related rescue, other',
      '361': 'Swimming/recreational water areas rescue',
      '362': 'Ice rescue',
      '363': 'Swift water rescue',
      '364': 'Surf rescue',
      '365': 'Watercraft rescue',
      '370': 'Electrical rescue',
      '371': 'Electrocution or potential electrocution',
      '372': 'Trapped by power lines',
      '381': 'Rescue or EMS standby',
      '400': 'Hazardous condition, other',
      '410': 'Flammable gas or liquid condition, other',
      '411': 'Gasoline or other flammable liquid spill',
      '412': 'Gas leak (natural gas or LPG)',
      '413': 'Oil or other combustible liquid spill',
      '420': 'Toxic condition, other',
      '421': 'Chemical hazard (no spill or leak)',
      '422': 'Chemical spill or leak',
      '423': 'Refrigeration leak',
      '424': 'Carbon monoxide incident',
      '440': 'Electrical wiring/equipment problem, other',
      '441': 'Heat from short circuit (wiring), defective/worn',
      '442': 'Overheated motor',
      '443': 'Light ballast breakdown',
      '444': 'Power line down',
      '445': 'Arcing, shorted electrical equipment',
      '451': 'Biological hazard, confirmed or suspected',
      '460': 'Accident, potential accident, other',
      '461': 'Building or structure weakened or collapsed',
      '462': 'Aircraft standby',
      '463': 'Vehicle accident, general cleanup',
      '471': 'Explosive, bomb removal (for bomb scare, use 721)',
      '480': 'Attempted burning, illegal action, other',
      '481': 'Attempt to burn',
      '482': 'Threat to burn',
      '500': 'Service Call, other',
      '510': 'Person in distress, other',
      '511': 'Lock-out',
      '512': 'Ring or jewelry removal',
      '520': 'Water problem, other',
      '521': 'Water evacuation',
      '522': 'Water or steam leak',
      '531': 'Smoke or odor removal',
      '540': 'Animal problem, other',
      '541': 'Animal problem',
      '542': 'Animal rescue',
      '550': 'Public service assistance, other',
      '551': 'Assist police or other governmental agency',
      '552': 'Police matter',
      '553': 'Public service',
      '554': 'Assist invalid',
      '555': 'Defective elevator, no occupants',
      '561': 'Unauthorized burning',
      '571': 'Cover assignment, standby, moveup',
      '600': 'Good intent call, other',
      '611': 'Dispatched & canceled en route',
      '621': 'Wrong location',
      '622': 'No incident found on arrival at dispatch address',
      '631': 'Authorized controlled burning',
      '632': 'Prescribed fire',
      '641': 'Vicinity alarm (incident in other location)',
      '650': 'Steam, other gas mistaken for smoke, other',
      '651': 'Smoke scare, odor of smoke',
      '652': 'Steam, vapor, fog or dust thought to be smoke',
      '653': 'Barbecue, tar kettle',
      '661': 'EMS call, party transported by non-fire agency',
      '671': 'Hazmat release investigation w/ no hazmat',
      '672': 'Biological hazard investigation, none found',
      '700': 'False alarm or false call, other',
      '710': 'Malicious, mischievous false call, other',
      '711': 'Municipal alarm system, malicious false alarm',
      '712': 'Direct tie to FD, malicious false alarm',
      '713': 'Telephone, malicious false alarm',
      '714': 'Central station, malicious false alarm',
      '715': 'Local alarm system, malicious false alarm',
      '721': 'Bomb scare - no bomb',
      '730': 'System malfunction, other',
      '731': 'Sprinkler activation due to malfunction',
      '732': 'Extinguishing system activation due to malfunction',
      '733': 'Smoke detector activation due to malfunction',
      '734': 'Heat detector activation due to malfunction',
      '735': 'Alarm system sounded due to malfunction',
      '736': 'CO detector activation due to malfunction',
      '740': 'Unintentional transmission of alarm, other',
      '741': 'Sprinkler activation, no fire - unintentional',
      '742': 'Extinguishing system activation',
      '743': 'Smoke detector activation, no fire - unintentional',
      '744': 'Detector activation, no fire - unintentional',
      '745': 'Alarm system sounded, no fire - unintentional',
      '746': 'Carbon monoxide detector activation, no CO',
      '800': 'Severe weather or natural disaster, other',
      '811': 'Earthquake assessment',
      '812': 'Flood assessment',
      '813': 'Wind storm, tornado/hurricane assessment',
      '814': 'Lightning strike (no fire)',
      '815': 'Severe weather or natural disaster standby',
      '900': 'Special type of incident, other',
      '911': 'Citizen complaint'
    },

    // Property Use Codes
    propertyUse: {
      '000': 'Property Use, other',
      '100': 'Assembly, other',
      '110': 'Fixed-use recreation places, other',
      '111': 'Bowling alley',
      '112': 'Billiard center, pool hall',
      '113': 'Electronic amusement center',
      '114': 'Ice rink',
      '115': 'Roller rink',
      '116': 'Swimming facility',
      '120': 'Variable-use amusement, recreation places, other',
      '121': 'Ballroom, gymnasium',
      '122': 'Convention center, exhibition hall',
      '123': 'Stadium, arena',
      '124': 'Playground',
      '129': 'Amusement center: indoor/outdoor',
      '130': 'Places of worship, funeral parlors, other',
      '131': 'Church, mosque, synagogue, temple, chapel',
      '134': 'Funeral parlor',
      '140': 'Clubs, other',
      '141': 'Athletic/health club',
      '142': 'Clubhouse',
      '150': 'Public or government, other',
      '151': 'Library',
      '152': 'Museum',
      '154': 'Memorial structure, including monuments & statues',
      '155': 'Courthouse',
      '160': 'Eating, drinking places, other',
      '161': 'Restaurant or cafeteria',
      '162': 'Bar or nightclub',
      '170': 'Passenger terminal, other',
      '171': 'Airport passenger terminal',
      '173': 'Bus station',
      '174': 'Rapid transit station',
      '180': 'Studio/theater, other',
      '181': 'Performance or stage area',
      '182': 'Auditorium, concert hall',
      '183': 'Movie theater',
      '185': 'Radio, television studio',
      '200': 'Educational, other',
      '210': 'Schools, non-adult, other',
      '211': 'Preschool',
      '212': 'Day care (inc. kindergarten with day care)',
      '213': 'Elementary school, including kindergarten',
      '215': 'High school/junior high school/middle school',
      '241': 'Adult education center, college classroom',
      '250': 'College/university, other',
      '254': 'Fraternity, sorority house',
      '255': 'Religious education/facility',
      '300': 'Health care, detention, & correction, other',
      '311': 'Care of the elderly and other 24-hour care',
      '321': 'Mental retardation/development disability facility',
      '322': 'Alcohol or substance abuse recovery center',
      '323': 'Asylum, mental institution',
      '331': 'Hospital-medical or psychiatric',
      '332': 'Hospices',
      '340': 'Clinics, doctors offices, hemodialysis centers, other',
      '341': 'Clinic, clinic-type infirmary',
      '342': 'Doctor/dentist/surgeons office',
      '343': 'Hemodialysis unit',
      '361': 'Jail, prison, detention facility',
      '363': 'Reformatory, juvenile detention center',
      '365': 'Police station',
      '400': 'Residential, other',
      '419': 'One- or two-family dwelling, detached, manufactured home',
      '429': 'Multi-family dwelling',
      '439': 'Rooming/boarding house, residential hotels',
      '449': 'Hotel/motel, commercial',
      '459': 'Residential board and care',
      '460': 'Dormitory-type residence, other',
      '462': 'Fraternity, sorority house',
      '464': 'Military barracks/dormitory',
      '500': 'Mercantile, business, other',
      '511': 'Convenience store',
      '519': 'Food and beverage sales, grocery store',
      '529': 'Textile, wearing apparel sales',
      '539': 'Household goods, sales, repairs',
      '549': 'Specialty shop',
      '557': 'Personal service, including barber & beauty shops',
      '559': 'Recreational, hobby, home repair sales, pet store',
      '564': 'Laundry, dry cleaning',
      '569': 'Professional supplies, services',
      '571': 'Service station, gas station',
      '579': 'Motor vehicle or boat sales, services, repair',
      '580': 'General retail, other',
      '581': 'Department or discount store',
      '592': 'Bank',
      '593': 'Office: veterinary or research',
      '596': 'Post office or mailing firms',
      '599': 'Business office',
      '600': 'Industrial, utility, defense, agriculture, mining, other',
      '610': 'Energy production plant, other',
      '614': 'Steam or heat generating plant',
      '615': 'Electric generating plant',
      '629': 'Laboratory or science laboratory',
      '631': 'Defense, military installation',
      '635': 'Computer center',
      '639': 'Communications center',
      '640': 'Utility or distribution system, other',
      '642': 'Electrical distribution',
      '644': 'Gas distribution, pipeline, gas distribution',
      '645': 'Flammable liquid distribution, pipeline, flammable',
      '647': 'Water utility',
      '648': 'Sanitation utility',
      '655': 'Crops or orchard',
      '669': 'Forest, timberland, woodland',
      '700': 'Manufacturing, processing, other',
      '800': 'Storage, other',
      '807': 'Outside material storage area',
      '808': 'Outbuilding or shed',
      '816': 'Grain elevator, silo',
      '819': 'Livestock, poultry storage',
      '839': 'Refrigerated storage',
      '880': 'Vehicle storage, other',
      '881': 'Parking garage, detached residential garage',
      '882': 'Parking garage, general vehicle',
      '888': 'Fire station',
      '891': 'Warehouse',
      '898': 'Dock, marina, pier, wharf',
      '899': 'Residential or self service storage units',
      '900': 'Outside or special property, other',
      '919': 'Dump, sanitary landfill',
      '921': 'Bridge, trestle',
      '922': 'Tunnel',
      '926': 'Outbuilding, protective shelter',
      '931': 'Open land or field',
      '935': 'Campsite with utilities',
      '936': 'Vacant lot',
      '937': 'Beach',
      '938': 'Graded and cared-for plots of land',
      '940': 'Water area, other',
      '941': 'Open ocean, sea or tidal waters',
      '946': 'Lake, river, stream',
      '951': 'Railroad right of way',
      '952': 'Railroad yard',
      '960': 'Street, other',
      '961': 'Highway or divided highway',
      '962': 'Residential street, road or residential driveway',
      '963': 'Street or road in commercial area',
      '965': 'Vehicle parking area',
      '972': 'Aircraft runway',
      '973': 'Aircraft taxiway',
      '974': 'Aircraft loading area',
      '981': 'Construction site',
      '982': 'Oil or gas field',
      '983': 'Pipeline, power line or other utility right of way',
      '984': 'Industrial plant yard area',
      'NNN': 'None'
    },

    // Fire Spread Codes
    fireSpread: {
      '1': 'Confined to object of origin',
      '2': 'Confined to room of origin',
      '3': 'Confined to floor of origin',
      '4': 'Confined to building of origin',
      '5': 'Beyond building of origin'
    },

    // Lookup function to get description for a code
    getIncidentTypeDescription(code) {
      return this.incidentTypes[code] || 'Unknown incident type';
    },

    getPropertyUseDescription(code) {
      return this.propertyUse[code] || 'Unknown property use';
    },

    getFireSpreadDescription(code) {
      return this.fireSpread[code] || 'Unknown fire spread';
    }
  };

  /**
   * NFIRS Validator
   * Validates incident data against NFIRS requirements
   */
  const NFIRSValidator = {
    /**
     * Validate an incident against NFIRS requirements
     * @param {Object} incident - The incident data to validate
     * @returns {Object} - Validation results with valid flag and errors array
     */
    validate(incident) {
      if (!incident) {
        return { valid: false, errors: ['No incident data provided'] };
      }

      const errors = [];

      // Basic incident info validation
      if (!incident.id) {
        errors.push('Incident ID is required');
      }

      // Check incident type
      if (!incident.incident_type || !incident.incident_type.primary) {
        errors.push('Primary incident type is required');
      }

      // Check location
      if (!incident.location || !incident.location.address) {
        errors.push('Incident address is required');
      }

      // Check dates and times
      if (!incident.dispatch || !incident.dispatch.time_received) {
        errors.push('Incident received time is required');
      }

      // For fire incidents, check additional required fields
      if (incident.incident_type && incident.incident_type.primary === 'FIRE') {
        // Add fire-specific validations
        if (!incident.fire_info || !incident.fire_info.area_of_origin) {
          errors.push('Area of fire origin is required for fire incidents');
        }
        
        if (!incident.fire_info || !incident.fire_info.heat_source) {
          errors.push('Heat source is required for fire incidents');
        }
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    /**
     * Check if an incident is ready for NFIRS export
     * @param {Object} incident - The incident data to check
     * @returns {boolean} - Whether the incident is ready for export
     */
    isReadyForExport(incident) {
      const validation = this.validate(incident);
      return validation.valid;
    },

    /**
     * Get list of missing fields for NFIRS compliance
     * @param {Object} incident - The incident data to check
     * @returns {Array} - List of missing field descriptions
     */
    getMissingFields(incident) {
      const validation = this.validate(incident);
      return validation.errors;
    }
  };

  /**
   * NFIRS Export
   * Creates export files in different formats for NFIRS reporting
   */
  const NFIRSExport = {
    /**
     * Convert incident to XML format for NFIRS
     * @param {Object} incident - The incident data to convert
     * @returns {string} - XML string
     */
    toXML(incident) {
      // First validate the incident
      const validation = NFIRSValidator.validate(incident);
      if (!validation.valid) {
        throw new Error(`Cannot export invalid incident: ${validation.errors.join(', ')}`);
      }

      // Basic XML template
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<NFIRSIncident>
  <IncidentID>${this._escapeXML(incident.id)}</IncidentID>
  <IncidentDate>${incident.timestamp}</IncidentDate>
  <IncidentType>${this._getIncidentTypeCode(incident)}</IncidentType>
  <PropertyUse>${this._getPropertyUseCode(incident)}</PropertyUse>
  <Location>
    <Address>${this._escapeXML(incident.location.address || '')}</Address>
    <City>${this._escapeXML(incident.location.city || '')}</City>
    <State>${this._escapeXML(incident.location.state || '')}</State>
    <Zip>${this._escapeXML(incident.location.zip || '')}</Zip>
  </Location>
  <ResponderInfo>
    <Department>${this._escapeXML(incident.department || '')}</Department>
    <RespondingUnits>`;
      
      // Add units
      if (incident.units && incident.units.length) {
        incident.units.forEach(unit => {
          xml += `
      <Unit>
        <UnitID>${this._escapeXML(unit.id || '')}</UnitID>
        <UnitType>${this._escapeXML(unit.type || '')}</UnitType>
      </Unit>`;
        });
      }
      
      xml += `
    </RespondingUnits>
  </ResponderInfo>
`;
      
      // Add fire-specific info if it's a fire incident
      if (incident.incident_type && incident.incident_type.primary === 'FIRE' && incident.fire_info) {
        xml += `
  <FireInfo>
    <AreaOfOrigin>${this._escapeXML(incident.fire_info.area_of_origin || '')}</AreaOfOrigin>
    <HeatSource>${this._escapeXML(incident.fire_info.heat_source || '')}</HeatSource>
    <FireSpread>${this._getFireSpreadCode(incident)}</FireSpread>
    <DamageEstimate>${this._escapeXML(incident.fire_info.damage_estimate || '')}</DamageEstimate>
  </FireInfo>
`;
      }
      
      // Close the XML
      xml += `</NFIRSIncident>`;
      
      return xml;
    },

    /**
     * Convert incident to CSV format for NFIRS
     * @param {Object} incident - The incident data to convert
     * @returns {string} - CSV string
     */
    toCSV(incident) {
      // First validate the incident
      const validation = NFIRSValidator.validate(incident);
      if (!validation.valid) {
        throw new Error(`Cannot export invalid incident: ${validation.errors.join(', ')}`);
      }

      // Build CSV header and row
      const header = [
        'IncidentID', 'IncidentDate', 'IncidentType', 'PropertyUse',
        'Address', 'City', 'State', 'Zip',
        'Department', 'Units', 'Narrative'
      ];

      const values = [
        incident.id || '',
        incident.timestamp || '',
        this._getIncidentTypeCode(incident),
        this._getPropertyUseCode(incident),
        this._escapeCSV(incident.location?.address || ''),
        this._escapeCSV(incident.location?.city || ''),
        this._escapeCSV(incident.location?.state || ''),
        this._escapeCSV(incident.location?.zip || ''),
        this._escapeCSV(incident.department || ''),
        this._escapeCSV(incident.units?.map(u => u.id).join(', ') || ''),
        this._escapeCSV(incident.narrative || '')
      ];

      return header.join(',') + '\n' + values.join(',');
    },

    /**
     * Convert incident to JSON format for NFIRS
     * @param {Object} incident - The incident data to convert
     * @returns {string} - JSON string
     */
    toJSON(incident) {
      // First validate the incident
      const validation = NFIRSValidator.validate(incident);
      if (!validation.valid) {
        throw new Error(`Cannot export invalid incident: ${validation.errors.join(', ')}`);
      }

      // Create NFIRS-specific JSON structure
      const nfirsData = {
        incident_id: incident.id,
        incident_date: incident.timestamp,
        incident_type: {
          code: this._getIncidentTypeCode(incident),
          description: NFIRSCodes.getIncidentTypeDescription(this._getIncidentTypeCode(incident))
        },
        property_use: {
          code: this._getPropertyUseCode(incident),
          description: NFIRSCodes.getPropertyUseDescription(this._getPropertyUseCode(incident))
        },
        location: incident.location,
        department: incident.department,
        units: incident.units,
        narrative: incident.narrative
      };

      // Add fire-specific info if applicable
      if (incident.incident_type && incident.incident_type.primary === 'FIRE' && incident.fire_info) {
        nfirsData.fire_info = {
          area_of_origin: incident.fire_info.area_of_origin,
          heat_source: incident.fire_info.heat_source,
          fire_spread: {
            code: this._getFireSpreadCode(incident),
            description: NFIRSCodes.getFireSpreadDescription(this._getFireSpreadCode(incident))
          },
          damage_estimate: incident.fire_info.damage_estimate
        };
      }

      return JSON.stringify(nfirsData, null, 2);
    },

    /**
     * Get NFIRS incident type code based on incident data
     * @private
     */
    _getIncidentTypeCode(incident) {
      // This would normally map the app's incident types to NFIRS codes
      // For demo, we'll return a default code
      if (incident.incident_type) {
        if (incident.incident_type.primary === 'FIRE') {
          return '111'; // Building fire
        } else if (incident.incident_type.primary === 'EMS') {
          return '321'; // EMS call
        } else if (incident.incident_type.primary === 'HAZMAT') {
          return '411'; // Gasoline spill
        }
      }
      return '000'; // Other
    },

    /**
     * Get NFIRS property use code based on incident data
     * @private
     */
    _getPropertyUseCode(incident) {
      // This would normally map the app's property types to NFIRS codes
      // For demo, we'll return a default code
      if (incident.location && incident.location.location_type) {
        if (incident.location.location_type === 'Residential') {
          return '419'; // One- or two-family dwelling
        } else if (incident.location.location_type === 'Commercial') {
          return '599'; // Business office
        }
      }
      return '000'; // Other
    },

    /**
     * Get NFIRS fire spread code based on incident data
     * @private
     */
    _getFireSpreadCode(incident) {
      // This would normally extract the fire spread from the incident
      // For demo, we'll return a default code
      if (incident.fire_info && incident.fire_info.fire_spread) {
        return incident.fire_info.fire_spread;
      }
      return '1'; // Confined to object of origin (default)
    },

    /**
     * Escape XML special characters
     * @private
     */
    _escapeXML(text) {
      if (!text) return '';
      return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    },

    /**
     * Escape CSV special characters
     * @private
     */
    _escapeCSV(text) {
      if (!text) return '';
      // If the text contains commas, quotes, or newlines, wrap it in quotes
      if (/[",\n]/.test(text)) {
        // Double any quotes
        return '"' + text.replace(/"/g, '""') + '"';
      }
      return text;
    }
  };

  /**
   * NFIRS UI - User Interface helper for NFIRS reporting
   */
  const NFIRSUI = {
    /**
     * Initialize the NFIRS UI components
     */
    initialize() {
      console.log('NFIRS UI components initialized');
      this._attachEventHandlers();
    },

    /**
     * Attach event handlers for NFIRS UI elements
     * @private
     */
    _attachEventHandlers() {
      // Find export buttons
      const exportXMLBtn = document.getElementById('export-nfirs-xml');
      const exportCSVBtn = document.getElementById('export-nfirs-csv');
      const exportJSONBtn = document.getElementById('export-nfirs-json');

      // Attach handlers if buttons exist
      if (exportXMLBtn) {
        exportXMLBtn.addEventListener('click', () => this._handleExport('xml'));
      }
      
      if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', () => this._handleExport('csv'));
      }
      
      if (exportJSONBtn) {
        exportJSONBtn.addEventListener('click', () => this._handleExport('json'));
      }
    },

    /**
     * Handle export button clicks
     * @param {string} format - Export format (xml, csv, json)
     * @private
     */
    _handleExport(format) {
      console.log(`Handling NFIRS export in ${format} format`);
      
      // Get current incident data - this would be from a form or application state
      const incidentData = this._getCurrentIncidentData();
      
      if (!incidentData) {
        alert('No incident data available for export');
        return;
      }
      
      // Validate the incident
      const validation = NFIRSValidator.validate(incidentData);
      if (!validation.valid) {
        alert(`Incident cannot be exported: ${validation.errors.join('\n')}`);
        return;
      }
      
      // Export based on format
      try {
        let data, filename, type;
        
        if (format === 'xml') {
          data = NFIRSExport.toXML(incidentData);
          filename = `nfirs_${incidentData.id}.xml`;
          type = 'application/xml';
        } else if (format === 'csv') {
          data = NFIRSExport.toCSV(incidentData);
          filename = `nfirs_${incidentData.id}.csv`;
          type = 'text/csv';
        } else if (format === 'json') {
          data = NFIRSExport.toJSON(incidentData);
          filename = `nfirs_${incidentData.id}.json`;
          type = 'application/json';
        }
        
        this._downloadFile(data, filename, type);
      } catch (error) {
        alert(`Export error: ${error.message}`);
      }
    },

    /**
     * Get current incident data from the application
     * @returns {Object} - The current incident data
     * @private
     */
    _getCurrentIncidentData() {
      // This would normally get data from the application state
      // For demo, we'll check if there's a global incident object
      if (window.currentIncident) {
        return window.currentIncident;
      }
      
      // For demo, create a sample incident
      return {
        id: 'INC-' + new Date().getTime(),
        timestamp: new Date().toISOString(),
        incident_type: {
          primary: 'FIRE',
          secondary: 'Structure Fire',
          specific: 'Single Family Dwelling'
        },
        location: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '90210',
          location_type: 'Residential'
        },
        department: 'Anytown Fire Department',
        units: [
          { id: 'E1', type: 'Engine' },
          { id: 'E2', type: 'Engine' },
          { id: 'L1', type: 'Ladder' }
        ],
        narrative: 'This is a test incident for NFIRS export',
        fire_info: {
          area_of_origin: 'Kitchen',
          heat_source: 'Cooking equipment',
          fire_spread: '2', // Confined to room of origin
          damage_estimate: '5000'
        }
      };
    },

    /**
     * Create and download a file
     * @param {string} data - The file contents
     * @param {string} filename - The filename to download as
     * @param {string} type - The MIME type of the file
     * @private
     */
    _downloadFile(data, filename, type) {
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    }
  };

  // Export the NFIRS modules to window for global access
  window.NFIRS = {
    Codes: NFIRSCodes,
    Validator: NFIRSValidator,
    Export: NFIRSExport,
    UI: NFIRSUI
  };

  // For backward compatibility, also expose individual functions
  window.validateNFIRSCompliance = function(incident) {
    return NFIRSValidator.validate(incident);
  };

  window.isNFIRSReadyForExport = function(incident) {
    return NFIRSValidator.isReadyForExport(incident);
  };

  window.getMissingNFIRSFields = function(incident) {
    return NFIRSValidator.getMissingFields(incident);
  };

  window.convertToNFIRSXML = function(incident) {
    return NFIRSExport.toXML(incident);
  };

  window.convertToNFIRSCSV = function(incident) {
    return NFIRSExport.toCSV(incident);
  };

  window.convertToNFIRSJSON = function(incident) {
    return NFIRSExport.toJSON(incident);
  };

  // Auto-initialize UI components
  document.addEventListener('DOMContentLoaded', () => {
    NFIRSUI.initialize();
  });

  console.log('NFIRS bundle loaded successfully');
})();