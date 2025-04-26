/**
 * NFIRS Codes - Converted from module to regular script
 */

// Create namespace if it doesn't exist
window.IncidentLogger = window.IncidentLogger || {};
window.IncidentLogger.NFIRS = window.IncidentLogger.NFIRS || {};

// Define the NFIRS codes
window.NFIRS_CODES = {
    // Incident types (100-series for fires)
    incidentTypes: {
        // Structure fires (100-199)
        "111": "Building fire",
        "112": "Fires in structure other than in a building",
        "113": "Cooking fire, confined to container",
        "114": "Chimney or flue fire, confined to chimney or flue",
        "115": "Incinerator overload or malfunction, fire confined",
        "116": "Fuel burner/boiler malfunction, fire confined",
        "117": "Commercial Compactor fire, confined to rubbish",
        "118": "Trash or rubbish fire, contained",
        "120": "Fire in mobile property used as a fixed structure, other",
        "121": "Fire in mobile home used as fixed residence",
        "122": "Fire in motor home, camper, recreational vehicle",
        "123": "Fire in portable building, fixed location",
        "130": "Mobile property (vehicle) fire, other",
        "131": "Passenger vehicle fire",
        "132": "Road freight or transport vehicle fire",
        "133": "Rail vehicle fire",
        "134": "Water vehicle fire",
        "135": "Aircraft fire",
        "136": "Self-propelled motor home or recreational vehicle",
        "137": "Camper or recreational vehicle (RV) fire",
        "138": "Off-road vehicle or heavy equipment fire",
        "140": "Natural vegetation fire, other",
        "141": "Forest, woods or wildland fire",
        "142": "Brush or brush-and-grass mixture fire",
        "143": "Grass fire",
        "150": "Outside rubbish fire, other",
        "151": "Outside rubbish, trash or waste fire",
        "152": "Garbage dump or sanitary landfill fire",
        "153": "Construction or demolition landfill fire",
        "154": "Dumpster or other outside trash receptacle fire",
        "155": "Outside stationary compactor/compacted trash fire",
        "160": "Special outside fire, other",
        "161": "Outside storage fire",
        "162": "Outside equipment fire",
        "163": "Outside gas or vapor combustion explosion",
        "164": "Outside mailbox fire",
        "170": "Cultivated vegetation, crop fire, other",
        "171": "Cultivated grain or crop fire",
        "172": "Cultivated orchard or vineyard fire",
        "173": "Cultivated trees or nursery stock fire",
        "180": "Fire, other",
        // Many more codes would be here...
    },
    
    // Property use codes
    propertyUse: {
        "000": "Property Use, other",
        "100": "Assembly, other",
        "110": "Fixed-use recreation places, other",
        "111": "Bowling alley",
        "112": "Billiard center, pool hall",
        "113": "Electronic amusement center",
        "114": "Ice rink: indoor, outdoor",
        "115": "Roller rink: indoor or outdoor",
        "116": "Swimming facility: indoor or outdoor",
        "120": "Variable-use amusement, recreation places, other",
        "121": "Ballroom, gymnasium",
        "122": "Convention center, exhibition hall",
        "123": "Stadium, arena",
        "124": "Playground",
        "129": "Amusement center: indoor/outdoor",
        "130": "Places of worship, funeral parlors, other",
        "131": "Church, mosque, synagogue, temple, chapel",
        "134": "Funeral parlor",
        "140": "Clubs, other",
        "141": "Athletic/health club",
        "142": "Clubhouse",
        "143": "Yacht club",
        "144": "Casino, gambling clubs",
        // Many more codes would be here...
    },
    
    // Action taken codes
    actionTaken: {
        "00": "Action taken, other",
        "10": "Fire, other",
        "11": "Extinguish",
        "12": "Salvage & overhaul",
        "13": "Establish fire lines (wildfire)",
        "14": "Contain fire (wildland)",
        "15": "Confine fire (wildland)",
        "16": "Control fire (wildland)",
        "17": "Manage prescribed fire (wildland)",
        "20": "Search & rescue, other",
        "21": "Search",
        "22": "Rescue, remove from harm",
        "23": "Extricate, disentangle",
        "24": "Recover body",
        "30": "Emergency medical services, other",
        "31": "Provide first aid & check for injuries",
        "32": "Provide basic life support (BLS)",
        "33": "Provide advanced life support (ALS)",
        "34": "Transport person",
        "40": "Hazardous condition, other",
        "41": "Identify, analyze hazardous materials",
        "42": "Hazardous materials detection, monitoring",
        "43": "Hazardous materials spill control and confinement",
        "44": "Hazardous materials leak control and containment",
        "45": "Remove hazard",
        "46": "Decontaminate persons or equipment",
        "47": "Decontamination (chemical, biological, or radiological)",
        "50": "Fires, rescues & hazardous conditions, other",
        "51": "Ventilate",
        "52": "Forcible entry",
        "53": "Evacuate area",
        "54": "Determine if materials are non-hazardous",
        "55": "Establish safe area",
        "56": "Provide air supply",
        "57": "Provide light or electricity",
        "58": "Operate apparatus or vehicle",
        "60": "Systems and services, other",
        "61": "Restore municipal services",
        "62": "Restore sprinkler or fire protection system",
        "63": "Restore fire alarm system",
        "64": "Shut down system",
        "65": "Secure property",
        "66": "Remove water",
        "70": "Assistance, other",
        "71": "Assist physically disabled",
        "72": "Assist animal",
        "73": "Provide manpower",
        "74": "Provide apparatus",
        "75": "Provide equipment",
        "76": "Provide water",
        "77": "Control traffic",
        "78": "Control crowd",
        "79": "Transport, non-emergency",
        "80": "Information, investigation & enforcement, other",
        "81": "Incident command",
        "82": "Notify other agencies",
        "83": "Provide information to public or media",
        "84": "Refer to proper authority",
        "85": "Enforce codes",
        "86": "Investigate",
        "87": "Investigate fire out on arrival",
        "90": "Fill-in, standby, other",
        "91": "Fill-in or moveup",
        "92": "Standby",
        "93": "Canceled en route",
        "99": "No action taken"
    },
    
    // Weather codes
    weather: {
        "0": "Clear (no significant weather)",
        "1": "Cloudy",
        "2": "Rain",
        "3": "Snow",
        "4": "Fog, smog, smoke",
        "5": "Freezing rain or sleet",
        "6": "High winds",
        "7": "Blowing snow",
        "8": "Below-freezing temperatures"
    },
    
    // More NFIRS code tables would be here...
};

// Add to the namespace
window.IncidentLogger.NFIRS.CODES = window.NFIRS_CODES;

// Global function to get NFIRS codes
window.getNFIRSCode = function(type, code) {
    if (window.NFIRS_CODES && window.NFIRS_CODES[type] && window.NFIRS_CODES[type][code]) {
        return window.NFIRS_CODES[type][code];
    }
    return code;
};

console.log("NFIRS Codes loaded successfully (fixed version)");