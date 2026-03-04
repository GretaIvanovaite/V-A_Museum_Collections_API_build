const COLLECTIONS = {
  "PDP": "Prints, Drawings and Paintings",
  "FE": "Furniture and Woodwork",
  "MET": "Metalwork",
  "CER": "Ceramics",
  "SCUL": "Sculpture",
  "T": "Textiles and Fashion",
  "CIRC": "Circulation Department",
  "NAL": "National Art Library",
  "AAD": "Archive of Art and Design",
  "LDSAL": "London Day School of Art Library",
  "MoC": "Museum of Childhood",
  "TH": "Theatre and Performance",
  "PH": "Photographs",
  "ARC": "Architecture",
  "AS": "Asian",
  "ME": "Middle East",
  "FEA": "Far Eastern",
  "W": "Word and Image",
  "EAS": "East Asian"
};

const CATEGORIES = {
  "prints": "Prints",
  "print": "Prints",
  "painting": "Paintings",
  "paintings": "Paintings",
  "drawing": "Drawings",
  "drawings": "Drawings",
  "photograph": "Photographs",
  "photographs": "Photographs",
  "photography": "Photographs",
  "sculpture": "Sculpture",
  "sculptures": "Sculpture",
  "furniture": "Furniture",
  "textile": "Textiles",
  "textiles": "Textiles",
  "ceramics": "Ceramics",
  "ceramic": "Ceramics",
  "metalwork": "Metalwork",
  "jewelry": "Jewellery",
  "jewellery": "Jewellery",
  "wallpaper": "Wallpaper",
  "poster": "Posters",
  "posters": "Posters"
};

const PLACES = {
  "england": "England",
  "great britain": "Great Britain",
  "britain": "Great Britain",
  "uk": "United Kingdom",
  "united kingdom": "United Kingdom",
  "london": "London",
  "york": "York",
  
  "europe": "Europe",
  "france": "France",
  "paris": "Paris",
  "italy": "Italy",
  "rome": "Rome",
  "germany": "Germany",
  "nuremberg": "Nuremberg",
  "munich": "Munich",
  "netherlands": "Netherlands",
  "holland": "Netherlands",
  "spain": "Spain",
  "portugal": "Portugal",
  "hungary": "Hungary",
  
  "iran": "Iran",
  "sudan": "Sudan",
  
  "china": "China",
  "japan": "Japan",
  "india": "India",
  
  "lapland": "Lapland",
  "granada": "Granada",
  "alhambra": "Alhambra"
};

const ASSOCIATIONS = {
  "made": "Made",
  "printed and published": "Printed and published",
  "published": "Published",
  "drawn": "Drawn",
  "designed": "Designed",
  "manufactured": "Manufactured",
  "painted": "Painted",
  "printed": "Printed",
  "worn": "Worn",
  "issued": "Issued",
  "photographed": "Photographed",
  "designed and printed": "Designed and printed"
};

// Helper functions
function normalizeCollection(code) {
  return COLLECTIONS[code] || code;
}

function normalizeCategory(category) {
  const lower = category.toLowerCase().trim();
  return CATEGORIES[lower] || category;
}

function normalizePlace(place) {
  const lower = place.toLowerCase().trim();
  return PLACES[lower] || place;
}

function normalizeAssociation(association) {
  const lower = association.toLowerCase().trim();
  return ASSOCIATIONS[lower] || association;
}