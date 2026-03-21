const COLLECTIONS = {
  "PDP": "Prints, Drawings and Paintings",
  "FE": "Furniture and Woodwork",
  "FURN": "Furniture and Woodwork",
  "FWK": "Furniture and Woodwork",
  "MET": "Metalwork",
  "CER": "Ceramics",
  "SCUL": "Sculpture",
  "SCP": "Sculpture",
  "T": "Textiles and Fashion",
  "T&F": "Textiles and Fashion",
  "TEX": "Textiles and Fashion",
  "CIRC": "Circulation Department",
  "NAL": "National Art Library",
  "AAD": "Archive of Art and Design",
  "LDSAL": "London Day School of Art Library",
  "MoC": "Museum of Childhood",
  "T&P": "Theatre and Performance",
  "TH": "Theatre and Performance",
  "PH": "Photographs",
  "PHOTO": "Photographs",
  "DOP": "Photography",
  "ARC": "Architecture",
  "DAD": "Design, Architecture and Digital",
  "AS": "Asian",
  "SAS": "South and South East Asia",
  "SSEA": "South & South East Asia",
  "ME": "Middle East",
  "MES": "Middle East",
  "FEA": "Far Eastern",
  "EA": "East Asia",
  "EAS": "East Asian",
  "W": "Word and Image",
  "WED": "V&A Wedgwood Collection",
  "YVA": "Young V&A",
  "INDIA": "Indian Section",
  "GLASS": "Glass and Ceramics",
  "JEWEL": "Jewellery",
};

const CATEGORIES = {
  "photograph": "Photographs",
  "photographs": "Photographs",
  "photography": "Photographs",
  "print": "Prints",
  "prints": "Prints",
  "poster": "Posters",
  "posters": "Posters",
  "book": "Books",
  "books": "Books",
  "advertising": "Advertising",
  "manuscript": "Manuscripts",
  "manuscripts": "Manuscripts",
  "ephemera": "Ephemera",
  "ornament print": "Ornament Prints",
  "ornament prints": "Ornament Prints",
  "album": "Albums",
  "albums": "Albums",
  "painting": "Paintings",
  "paintings": "Paintings",
  "portrait": "Portraits",
  "portraits": "Portraits",
  "drawing": "Drawings",
  "drawings": "Drawings",
  "sculpture": "Sculpture",
  "sculptures": "Sculpture",
  "illustration": "Illustration",
  "illustrations": "Illustration",
  "caricature": "Caricatures & Cartoons",
  "caricatures": "Caricatures & Cartoons",
  "caricatures and cartoons": "Caricatures & Cartoons",
  "cartoon": "Caricatures & Cartoons",
  "cartoons": "Caricatures & Cartoons",
  "topography": "Topography",
  "plaster cast": "Plaster Casts",
  "plaster casts": "Plaster Casts",
  "wallpaper": "Wallpaper",
  "fashion": "Fashion",
  "jewellery": "Jewellery",
  "jewelry": "Jewellery",
  "textile": "Textiles",
  "textiles": "Textiles",
  "accessories": "Accessories",
  "accessory": "Accessories",
  "embroidery": "Embroidery",
  "lace": "Lace",
  "men's clothes": "Men's Clothes",
  "fashion plate": "Fashion Plates",
  "fashion plates": "Fashion Plates",
  "tapestry": "Tapestry",
  "tapestries": "Tapestry",
  "carpet": "Carpets",
  "carpets": "Carpets",
  "rug": "Rugs",
  "rugs": "Rugs",
  "lacemaking": "Lace",
  "ceramic": "Ceramics",
  "ceramics": "Ceramics",
  "metalwork": "Metalwork",
  "glass": "Glass",
  "glassware": "Glass",
  "arms and armour": "Arms & Armour",
  "arms & armour": "Arms & Armour",
  "wedgwood": "V&A Wedgwood Collection",
  "furniture": "Furniture",
  "woodwork": "Woodwork",
  "silverwork": "Silverwork",
  "goldwork": "Goldwork",
  "enamel": "Enamelwork",
  "enamels": "Enamelwork",
  "theatre": "Theatre",
  "theater": "Theatre",
  "music": "Music",
  "entertainment and leisure": "Entertainment & Leisure",
  "entertainment & leisure": "Entertainment & Leisure",
  "game": "Games",
  "games": "Games",
  "children and childhood": "Children & Childhood",
  "children & childhood": "Children & Childhood",
  "toy": "Toys",
  "toys": "Toys",
  "architecture": "Architecture",
  "interior": "Interiors",
  "interiors": "Interiors",
  "tile": "Tiles",
  "tiles": "Tiles"
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
  "maker": "Made by",
  "designer": "Designed by",
  "photographer": "Photographed by",
  "artist": "Artist",
  "publisher": "Published by",
  "manufacturer": "Manufactured by",
  "retailer": "Retailer",
  "engraver": "Engraved by",
  "illustrator": "Illustrated by",
  "sculptor": "Sculptor",
  "author": "Author",
  "weaver": "Woven by",
  "embroiderer": "Embroidered by",
  "decorator": "Decorated by",
  "modeller": "Modelled by",
  "carver": "Carved by",
  "lithographer": "Lithographed by",
  "etcher": "Etched by",
  "gilder": "Gilded by",
  "printseller": "Printseller",
  "bookseller": "Bookseller",
  "draughtsman": "Drawn by",
  "agent": "Agent",
  "painter": "Painter",
  "made": "Made by",
  "designed": "Designed by",
  "drawn": "Drawn by",
  "painted": "Painted by",
  "printed": "Printed by",
  "published": "Published by",
  "manufactured": "Manufactured by",
  "photographed": "Photographed by",
  "worn": "Worn by",
  "issued": "Issued by",
  "carved": "Carved by",
  "modelled": "Modelled by",
  "engraved": "Engraved by",
  "etched": "Etched by",
  "gilded": "Gilded by",
  "embroidered": "Embroidered by",
  "woven": "Woven by",
  "decorated": "Decorated by",
  "enamelled": "Enamelled by",
  "cast": "Cast by",
  "forged": "Forged by",
  "lacquered": "Lacquered by",
  "chased": "Chased by",
  "inlaid": "Inlaid by",
  "lithographed": "Lithographed by",
  "illustrated": "Illustrated by",
  "sculpted": "Sculpted by",
  "patented": "Patented by",
  "issued by": "Issued by",
  "designed and made": "Designed and made",
  "designed and printed": "Designed and printed",
  "designed and manufactured": "Designed and manufactured",
  "designed and woven": "Designed and woven",
  "designed and embroidered": "Designed and embroidered",
  "printed and published": "Printed and published",
  "printed and sold": "Printed and sold",
  "published and sold": "Published and sold",
  "made and published": "Made and published",
  "publisher and printseller": "Published and sold by",
  "attributed to": "Attributed to",
  "after": "After",
  "possibly": "Possibly",
  "possibly by": "Possibly by",
  "style of": "Style of",
  "school of": "School of",
  "workshop of": "Workshop of",
  "circle of": "Circle of",
  "follower of": "Follower of",
  "formerly attributed to": "Formerly attributed to",
  "designers": "Designed by",
  "photographers": "Photographed by",
  "artists": "Artist",
  "designer and maker": "Designed and made",
  "designed and made by": "Designed and made",
  "designed by": "Designed by",
  "published by": "Published by",
  "commissioned by": "Commissioned by",
  "printmaker": "Printmaker",
  "print-maker": "Printmaker",
  "print-makers": "Printmaker",
  "copyist": "Copyist",
  "architect": "Architect",
  "art director": "Art director",
  "design studio": "Design studio",
  "advertising agency": "Advertising agency",
  "artist (stained glass)": "Artist",
  "painter (artist)": "Painter",
  "distributer": "Distributed by",
  "distributor": "Distributed by",
  "creator": "Created by"
};

const MATERIAL_GROUPS = [
  {name: "Paper", ids: ["x30308", "AAT14109"]},
  {name: "Photographic Paper", ids: ["AAT14190"]},
  {name: "Tracing Paper", ids: ["AAT14161"]},
  {name: "Card", ids: ["x30344"]},
  {name: "Ink", ids: ["AAT15012", "AAT187371", "AAT187750"]},
  {name: "Pencil", ids: ["x30347", "THES398741"]},
  {name: "Chalk", ids: ["AAT11727"]},
  {name: "Pen and Ink", ids: ["x47746", "x30618", "x32505"]},
  {name: "Watercolour", ids: ["x33202", "AAT15045", "x35013", "x32505"]},
  {name: "Gouache", ids: ["AAT70114", "x34671"]},
  {name: "Wash", ids: ["AAT11051"]},
  {name: "Paint", ids: ["AAT15029"]},
  {name: "Earthenware", ids: ["x29356"]},
  {name: "Porcelain", ids: ["AAT10662", "AAT10665"]},
  {name: "Stoneware", ids: ["x30197"]},
  {name: "Glaze", ids: ["AAT15091", "AAT233436"]},
  {name: "Enamel", ids: ["AAT14910"]},
  {name: "Plaster", ids: ["AAT14922"]},
  {name: "Silk", ids: ["AAT243428"]},
  {name: "Cotton", ids: ["AAT14067"]},
  {name: "Linen", ids: ["AAT14069"]},
  {name: "Lace", ids: ["AAT132861"]},
  {name: "Silver", ids: ["AAT11029"]},
  {name: "Gold", ids: ["AAT11021"]},
  {name: "Copper", ids: ["AAT11020"]},
  {name: "Bronze", ids: ["AAT10957"]},
  {name: "Steel", ids: ["AAT133751"]},
  {name: "Metal", ids: ["AAT10900"]},
  {name: "Glass", ids: ["AAT10797"]},
  {name: "Wood", ids: ["AAT11914"]},
  {name: "Leather", ids: ["AAT11845"]},
  {name: "Ivory", ids: ["AAT11857"]},
  {name: "Plastic", ids: ["AAT14570"]},
];

// Returns the MATERIAL_GROUPS entry for a given material ID, or null if ungrouped.
function getMaterialGroup(id) {
  for (var i = 0; i < MATERIAL_GROUPS.length; i++) {
    if (MATERIAL_GROUPS[i].ids.indexOf(id) !== -1) {
      return MATERIAL_GROUPS[i];
    }
  }
  return null;
}

const CATEGORY_GROUPS = [
  {name: "Photographs", ids: ["THES48910"]},
  {name: "Prints", ids: ["THES48903"]},
  {name: "Drawings", ids: ["THES48966"]},
  {name: "Textiles", ids: ["THES48885"]},
  {name: "Ceramics", ids: ["THES48982"]},
  {name: "Entertainment & Leisure", ids: ["THES48959"]},
  {name: "Fashion", ids: ["THES48957"]},
  {name: "Architecture", ids: ["THES48993"]},
  {name: "Portraits", ids: ["THES48906"]},
  {name: "Metalwork", ids: ["THES48920"]},
  {name: "Ornament Prints", ids: ["THES49038"]},
  {name: "Posters", ids: ["THES252963"]},
  {name: "Topography", ids: ["THES252988"]},
  {name: "Paintings", ids: ["THES48917"]},
  {name: "Theatre", ids: ["THES250537"]},
  {name: "Illustration", ids: ["THES48938"]},
  {name: "V&A Wedgwood Collection", ids: ["THES276060"]},
  {name: "Advertising", ids: ["THES49001"]},
  {name: "Accessories", ids: ["THES48998"]},
  {name: "Jewellery", ids: ["THES48930"]},
  {name: "Interiors", ids: ["THES48933"]},
  {name: "Children & Childhood", ids: ["THES48980"]},
  {name: "Books", ids: ["THES48986"]},
  {name: "Sculpture", ids: ["THES48896"]},
  {name: "Embroidery", ids: ["THES48960"]},
  {name: "Furniture", ids: ["THES48948"]},
  {name: "Arms & Armour", ids: ["THES48992"]},
  {name: "Tiles", ids: ["THES48884"]},
  {name: "Ephemera", ids: ["THES252985"]},
  {name: "Glass", ids: ["THES48946"]},
];

function getCategoryGroup(id) {
  for (var i = 0; i < CATEGORY_GROUPS.length; i++) {
    if (CATEGORY_GROUPS[i].ids.indexOf(id) !== -1) {
      return CATEGORY_GROUPS[i];
    }
  }
  return null;
}

const COLLECTION_GROUPS = [
  {name: "Prints, Drawings and Paintings", ids: ["PDP"]},
  {name: "Furniture and Woodwork", ids: ["FE", "FURN", "FWK"]},
  {name: "Metalwork", ids: ["MET"]},
  {name: "Ceramics", ids: ["CER"]},
  {name: "Sculpture", ids: ["SCUL", "SCP"]},
  {name: "Textiles and Fashion", ids: ["T", "T&F", "TEX"]},
  {name: "Circulation Department", ids: ["CIRC"]},
  {name: "National Art Library", ids: ["NAL"]},
  {name: "Archive of Art and Design", ids: ["AAD"]},
  {name: "London Day School of Art Library", ids: ["LDSAL"]},
  {name: "Museum of Childhood", ids: ["MoC"]},
  {name: "Theatre and Performance", ids: ["T&P", "TH"]},
  {name: "Photographs", ids: ["PH", "PHOTO"]},
  {name: "Photography", ids: ["DOP"]},
  {name: "Architecture", ids: ["ARC"]},
  {name: "Design, Architecture and Digital", ids: ["DAD"]},
  {name: "Asian", ids: ["AS"]},
  {name: "South and South East Asia", ids: ["SAS"]},
  {name: "South & South East Asia", ids: ["SSEA"]},
  {name: "Middle East", ids: ["ME", "MES"]},
  {name: "Far Eastern", ids: ["FEA"]},
  {name: "East Asia", ids: ["EA"]},
  {name: "East Asian", ids: ["EAS"]},
  {name: "Word and Image", ids: ["W"]},
  {name: "V&A Wedgwood Collection", ids: ["WED"]},
  {name: "Young V&A", ids: ["YVA"]},
  {name: "Indian Section", ids: ["INDIA"]},
  {name: "Glass and Ceramics", ids: ["GLASS"]},
  {name: "Jewellery", ids: ["JEWEL"]},
];

function getCollectionGroup(code) {
  for (var i = 0; i < COLLECTION_GROUPS.length; i++) {
    if (COLLECTION_GROUPS[i].ids.indexOf(code) !== -1) {
      return COLLECTION_GROUPS[i];
    }
  }
  return null;
}

const ORIGIN_GROUPS = [
  {name: "Great Britain", ids: ["x32019"]},
  {name: "Rome", ids: ["x29106"]},
  {name: "Tokyo", ids: ["x32430"]},
  {name: "Venice", ids: ["x29237"]},
  {name: "United States", ids: ["x29333"]},
];

function getOriginGroup(id) {
  for (var i = 0; i < ORIGIN_GROUPS.length; i++) {
    if (ORIGIN_GROUPS[i].ids.indexOf(id) !== -1) {
      return ORIGIN_GROUPS[i];
    }
  }
  return null;
}

function normalizeCollection(code) {
  var group = getCollectionGroup(code);
  if (group) return group.name;
  return COLLECTIONS[code] || code;
}

function normalizeCategory(category, id) {
  if (id) {
    var group = getCategoryGroup(id);
    if (group) return group.name;
  }
  const lower = category.toLowerCase().trim();
  return CATEGORIES[lower] || category;
}

function normalizePlace(place, id) {
  if (id) {
    var group = getOriginGroup(id);
    if (group) return group.name;
  }
  const lower = place.toLowerCase().trim();
  return PLACES[lower] || place;
}

function normalizeAssociation(association) {
  const lower = association.toLowerCase().trim();
  const mapped = ASSOCIATIONS[lower];
  if (mapped) return mapped;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}