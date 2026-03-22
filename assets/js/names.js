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
  {name: "Prints, Drawings & Paintings", ids: ["THES48595", "PDP"]},
  {name: "Theatre and Performance", ids: ["THES48602", "T&P", "TH"]},
  {name: "East Asia", ids: ["THES48596", "EA", "EAS", "FEA"]},
  {name: "Textiles and Fashion", ids: ["THES48601", "T", "T&F", "TEX"]},
  {name: "Ceramics", ids: ["THES48594", "CER", "GLASS"]},
  {name: "South & South East Asia", ids: ["THES48598", "SAS", "SSEA"]},
  {name: "Department of Photography", ids: ["THES291628", "PH", "PHOTO", "DOP"]},
  {name: "Metalwork", ids: ["THES48599", "MET"]},
  {name: "Young V&A", ids: ["THES48593", "YVA"]},
  {name: "V&A Wedgwood Collection", ids: ["THES270009", "WED"]},
  {name: "Sculpture", ids: ["THES48600", "SCUL", "SCP"]},
  {name: "Middle East", ids: ["THES48607", "ME", "MES"]},
  {name: "Furniture and Woodwork", ids: ["THES48597", "FE", "FURN", "FWK"]},
  {name: "National Art Library", ids: ["THES48605", "NAL"]},
  {name: "Design, Architecture & Digital", ids: ["THES260586", "DAD", "ARC"]},
  {name: "Exhibitions Department", ids: ["THES264787"]},
  {name: "V&A East", ids: ["THES359557"]},
  {name: "Archive of Art and Design", ids: ["THES48604", "AAD"]},
  {name: "Circulation Department", ids: ["THES48606", "CIRC"]},
  {name: "Asian", ids: ["AS"]},
  {name: "Word and Image", ids: ["W"]},
  {name: "Indian Section", ids: ["INDIA"]},
  {name: "London Day School of Art Library", ids: ["LDSAL"]},
  {name: "Museum of Childhood", ids: ["MoC"]},
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

const TECHNIQUE_GROUPS = [
  {name: "Photography", ids: ["AAT54225"]},
  {name: "Drawing", ids: ["x32498", "AAT54196", "x30545"]},
  {name: "Engraving", ids: ["AAT53225", "AAT53829", "AAT178612"]},
  {name: "Printmaking", ids: ["AAT53319", "AAT131119", "x46159"]},
  {name: "Watercolour drawing", ids: ["x37878"]},
  {name: "Etching", ids: ["AAT53241", "AAT53228"]},
  {name: "Lithography", ids: ["AAT53271", "x39981"]},
  {name: "Wood engraving", ids: ["AAT53303"]},
  {name: "Woodblock printing", ids: ["x38448", "x37101"]},
  {name: "Albumen process", ids: ["AAT133274"]},
  {name: "Painting", ids: ["x30138", "x30598", "AAT54216"]},
  {name: "Watercolour painting", ids: ["THES250889"]},
  {name: "Weaving", ids: ["AAT53642", "AAT53643"]},
  {name: "Woodcut", ids: ["AAT53296"]},
  {name: "Hand colouring", ids: ["AAT133555"]},
  {name: "Carving", ids: ["AAT53149"]},
  {name: "Casting", ids: ["AAT53104"]},
  {name: "Glazing", ids: ["AAT53914"]},
  {name: "Gilding", ids: ["AAT53789"]},
  {name: "Block printing", ids: ["AAT53289"]},
  {name: "Gelatin silver", ids: ["AAT139114"]},
  {name: "Colour lithography", ids: ["AAT190525"]},
  {name: "Colour printing", ids: ["AAT53329"]},
  {name: "Architectural drawing", ids: ["AAT54197"]},
  {name: "Moulding", ids: ["x30076", "AAT53134"]},
  {name: "Aquatint", ids: ["AAT53242"]},
  {name: "Wash technique", ids: ["AAT182748"]},
  {name: "Lace making", ids: ["AAT53651"]},
  {name: "Line engraving", ids: ["AAT53231"]},
  {name: "Lacquering", ids: ["AAT53796"]},
  {name: "Letterpress printing", ids: ["AAT178926"]},
  {name: "Electrotyping", ids: ["AAT234668"]},
  {name: "Rubbing", ids: ["AAT178924"]},
  {name: "Embossing", ids: ["AAT53826"]},
  {name: "Illumination", ids: ["AAT220539"]},
  {name: "Oil painting", ids: ["AAT178684"]},
  {name: "Sewing", ids: ["AAT53658"]},
  {name: "Machine sewing", ids: ["AAT257463"]},
  {name: "Embroidery", ids: ["AAT53653", "x40351"]},
  {name: "Enamelling", ids: ["AAT53773", "x37485", "x46766"]},
  {name: "Platinum process", ids: ["AAT53492"]},
  {name: "Autochrome", ids: ["AAT53470"]},
  {name: "Chasing", ids: ["AAT54016"]},
  {name: "Paper making", ids: ["AAT54060"]},
  {name: "Forging", ids: ["AAT54033"]},
  {name: "Bookbinding", ids: ["AAT53592", "x43679", "x38290"]},
  {name: "Firing", ids: ["AAT53887"]},
  {name: "Offset lithography", ids: ["AAT192900"]},
  {name: "Glass working", ids: ["AAT53929"]},
  {name: "Stipple engraving", ids: ["AAT53239"]},
  {name: "Chromolithography", ids: ["AAT53272"]},
  {name: "Staining", ids: ["AAT53058"]},
  {name: "Tracing", ids: ["AAT53439"]},
  {name: "Screen printing", ids: ["AAT53281", "x36290"]},
  {name: "Relief", ids: ["AAT53622"]},
  {name: "Transfer printing", ids: ["AAT53922"]},
  {name: "Writing", ids: ["AAT54698"]},
  {name: "Piercing", ids: ["AAT231153"]},
  {name: "Sketching", ids: ["AAT53576"]},
  {name: "Freehand drawing", ids: ["AAT53181"]},
  {name: "Shoe making", ids: ["x40339"]},
  {name: "Hand painted", ids: ["x39976"]},
  {name: "Tin glazing", ids: ["x36216"]},
  {name: "Illustration", ids: ["AAT54200"]},
  {name: "Colouring", ids: ["AAT53043"]},
  {name: "Collage", ids: ["AAT138699"]},
  {name: "Linocut", ids: ["AAT60720"]},
  {name: "Digital", ids: ["THES271371"]},
];

function getTechniqueGroup(id) {
  for (var i = 0; i < TECHNIQUE_GROUPS.length; i++) {
    if (TECHNIQUE_GROUPS[i].ids.indexOf(id) !== -1) {
      return TECHNIQUE_GROUPS[i];
    }
  }
  return null;
}

const TECHNIQUES = {
  "photography": "Photography",
  "drawing": "Drawing",
  "drawing (image-making)": "Drawing",
  "drawn": "Drawing",
  "engraving (printing process)": "Engraving",
  "engraving (incising)": "Engraving",
  "engraving": "Engraving",
  "printing": "Printmaking",
  "print-making": "Printmaking",
  "printed": "Printmaking",
  "watercolour drawing": "Watercolour drawing",
  "watercolour": "Watercolour drawing",
  "watercolour painting (technique)": "Watercolour painting",
  "etching (printing process)": "Etching",
  "etching": "Etching",
  "lithography": "Lithography",
  "lithograph": "Lithography",
  "colour lithography": "Colour lithography",
  "offset lithography": "Offset lithography",
  "chromolithography": "Chromolithography",
  "wood engraving": "Wood engraving",
  "wood-engraving": "Wood engraving",
  "wood-engraving (process)": "Wood engraving",
  "woodblock print": "Woodblock printing",
  "Woodblock print": "Woodblock printing",
  "block printing": "Block printing",
  "albumen process": "Albumen process",
  "painted": "Painting",
  "painting": "Painting",
  "painting (image-making)": "Painting",
  "hand painted": "Hand painted",
  "oil painting": "Oil painting",
  "weaving": "Weaving",
  "woven": "Weaving",
  "woodcut": "Woodcut",
  "linocut": "Linocut",
  "lino cut": "Linocut",
  "hand-colouring": "Hand colouring",
  "hand-coloring": "Hand colouring",
  "hand colouring": "Hand colouring",
  "carving": "Carving",
  "casting": "Casting",
  "glazed": "Glazing",
  "glazing": "Glazing",
  "glazing (coating)": "Glazing",
  "tin glazed": "Tin glazing",
  "gilding": "Gilding",
  "gilded": "Gilding",
  "gilt": "Gilding",
  "aquatint": "Aquatint",
  "mezzotint": "Mezzotint",
  "stipple engraving": "Stipple engraving",
  "line engraving": "Line engraving",
  "screen printing": "Screen printing",
  "screenprinting": "Screen printing",
  "silkscreen": "Screen printing",
  "transfer printing": "Transfer printing",
  "letterpress printing": "Letterpress printing",
  "colour printing": "Colour printing",
  "process engraving": "Process engraving",
  "gelatin silver process": "Gelatin silver",
  "gelatin silver": "Gelatin silver",
  "platinum process": "Platinum process",
  "bromide process": "Bromide process",
  "autochrome": "Autochrome",
  "embroidering": "Embroidery",
  "embroidered": "Embroidery",
  "embroidery": "Embroidery",
  "enamelling": "Enamelling",
  "sewing": "Sewing",
  "machine sewing": "Machine sewing",
  "lace making": "Lace making",
  "moulded": "Moulding",
  "moulding": "Moulding",
  "forging": "Forging",
  "forging (metal forming)": "Forging",
  "firing": "Firing",
  "firing (heating)": "Firing",
  "lacquering": "Lacquering",
  "embossing": "Embossing",
  "chasing": "Chasing",
  "piercing": "Piercing",
  "electrotyping": "Electrotyping",
  "rubbing": "Rubbing",
  "staining": "Staining",
  "relief": "Relief",
  "tracing": "Tracing",
  "sketching": "Sketching",
  "free-hand drawing": "Freehand drawing",
  "architectural drawing": "Architectural drawing",
  "wash technique": "Wash technique",
  "illumination": "Illumination",
  "bookbinding": "Bookbinding",
  "binding": "Bookbinding",
  "paper-making": "Paper making",
  "glass-working": "Glass working",
  "shoe-making": "Shoe making",
  "writing (processes)": "Writing",
  "photogravure": "Photogravure",
  "collotype": "Collotype",
  "dyeing": "Dyeing",
  "throwing": "Throwing",
  "knitting": "Knitting",
};

function normalizeTechnique(technique, id) {
  if (id) {
    var group = getTechniqueGroup(id);
    if (group) { return group.name; }
  }
  var lower = technique.toLowerCase().trim();
  if (TECHNIQUES[lower]) { return TECHNIQUES[lower]; }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
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

// Merge cluster items that share a group entry into one, using getGroupFn(id).
// Non-grouped items pass through unchanged. Used by browse-all.js and homepage.js.
function mergeGroups(items, getGroupFn) {
  var seenGroupNames = {};
  var result = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var group = (typeof getGroupFn === 'function') ? getGroupFn(item.id) : null;
    if (group) {
      if (seenGroupNames[group.name]) { continue; }
      seenGroupNames[group.name] = true;
      result.push({ id: group.ids[0], ids: group.ids, name: group.name });
    } else {
      result.push({ id: item.id, ids: [item.id], name: item.name });
    }
  }
  return result;
}

function normalizeAssociation(association) {
  const lower = association.toLowerCase().trim();
  const mapped = ASSOCIATIONS[lower];
  if (mapped) return mapped;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// ── Nav popover population ────────────────────────────────────────────────────

var NAV_POPOVER_CONFIG = [
  {id: 'coll-menu', field: 'collection', type: 'collections', getGroupFn: getCollectionGroup},
  {id: 'cat-menu',  field: 'category',   type: 'categories',  getGroupFn: getCategoryGroup},
  {id: 'mat-menu',  field: 'material',   type: 'materials',   getGroupFn: getMaterialGroup},
  {id: 'org-menu',  field: 'place',      type: 'origins',     getGroupFn: getOriginGroup}
];

// Returns the path prefix to reach browse/{type}/property.html from the current page.
function toSentenceCase(str) {
  if (!str) { return str; }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Root pages (index.html etc.) need "browse/", pages inside browse/type/ need "../".
function getBrowsePrefix() {
  var parts = window.location.pathname.split('/');
  if (parts.length <= 2) { return 'browse/'; }
  return '../';
}

async function fetchNavItems(field, getGroupFn) {
  try {
    var response = await fetch('https://api.vam.ac.uk/v2/objects/clusters/' + field + '/search?cluster_size=50');
    var data = await response.json();
    var records = Array.isArray(data) ? data : [];
    var items = [];
    for (var i = 0; i < records.length; i++) {
      items.push({id: records[i].id, ids: [records[i].id], name: records[i].value});
    }
    return mergeGroups(items, getGroupFn);
  } catch (e) {
    return [];
  }
}

function fillNavPopover(ul, items, type) {
  var lis = ul.querySelectorAll('li');
  var hrLi = lis[lis.length - 2];
  for (var i = lis.length - 3; i >= 1; i--) {
    lis[i].remove();
  }
  var prefix = getBrowsePrefix();
  var limit = items.length < 5 ? items.length : 5;
  for (var j = 0; j < limit; j++) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = prefix + type + '/property.html?id=' + items[j].ids.join(',') + '&name=' + encodeURIComponent(items[j].name);
    a.textContent = items[j].name;
    li.appendChild(a);
    ul.insertBefore(li, hrLi);
  }
}

async function populateNavPopovers() {
  for (var i = 0; i < NAV_POPOVER_CONFIG.length; i++) {
    var cfg = NAV_POPOVER_CONFIG[i];
    var ul = document.getElementById(cfg.id);
    if (!ul) { continue; }
    var items = await fetchNavItems(cfg.field, cfg.getGroupFn);
    if (items.length > 0) { fillNavPopover(ul, items, cfg.type); }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  populateNavPopovers();
});