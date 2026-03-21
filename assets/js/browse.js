var apiBase = "https://api.vam.ac.uk/v2";
var imageBase = "https://framemark.vam.ac.uk/collections";

// Data sourced from va-api-clusters-2026-03-04.json, ordered by count descending.
// Duplicates (same ID or effectively the same grouping) are removed using names.js as a guide.
// The first 3 items in each section become preview cards.
// Items 4–9 are used only for the "Browse All" collage background.

var sections = [
  {
    gridId:      "collections-grid",
    paramName:   "id_collection",
    type:        "collections",
    label:       "Collection",
    viewAllHref: "browse/collections/all.html",
    viewAllText: "Browse All Collections",
    cards: [
      { name: "Prints, Drawings & Paintings", id: "THES48595" },
      { name: "Theatre and Performance",      id: "THES48602" },
      { name: "East Asia",                    id: "THES48596" }
    ],
    collage: [
      { id: "THES48601"  },
      { id: "THES48594"  },
      { id: "THES48598"  },
      { id: "THES291628" },
      { id: "THES48599"  },
      { id: "THES48593"  }
    ]
  },
  {
    gridId:      "categories-grid",
    paramName:   "id_category",
    type:        "categories",
    label:       "Category",
    viewAllHref: "browse/categories/all.html",
    viewAllText: "Browse All Categories",
    cards: [
      { name: "Prints",   id: "THES48903" },
      { name: "Designs",  id: "THES48968" },
      { name: "Drawings", id: "THES48966" }
    ],
    collage: [
      { id: "THES48910" },
      { id: "THES48885" },
      { id: "THES48982" },
      { id: "THES48959" },
      { id: "THES48957" },
      { id: "THES48993" }
    ]
  },
  {
    gridId:      "materials-grid",
    paramName:   "id_material",
    type:        "materials",
    label:       "Material",
    viewAllHref: "browse/materials/all.html",
    viewAllText: "Browse All Materials",
    cards: [
      // AAT14109 "paper (fiber product)" is skipped — same substance as x30308 "paper"
      { name: "Paper",         id: "x30308"    },
      { name: "Ink",           id: "AAT15012"  },
      { name: "Printing ink",  id: "AAT187371" }
    ],
    collage: [
      { id: "x30347"    },
      { id: "AAT14190"  },
      { id: "x33202"    },
      { id: "x30618"    },
      { id: "AAT15045"  },
      { id: "x29356"    }
    ]
  },
  {
    gridId:      "origins-grid",
    paramName:   "id_place",
    type:        "origins",
    label:       "Origin",
    viewAllHref: "browse/origins/all.html",
    viewAllText: "Browse All Origins",
    cards: [
      { name: "Great Britain", id: "x32019" },
      { name: "London",        id: "x28980" },
      { name: "England",       id: "x28826" }
    ],
    collage: [
      // x32019 "Britain" is skipped — same ID as "Great Britain"
      { id: "x28849" },
      { id: "x29068" },
      { id: "x29399" },
      { id: "x28927" },
      { id: "x28873" },
      { id: "x28842" }
    ]
  }
];

// Fetch one image ID for a given filter
function fetchOneImage(paramName, id) {
  var url = apiBase + "/objects/search?" + paramName + "=" + id + "&images_exist=1&page_size=1";

  return fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.records && data.records.length > 0 && data.records[0]._primaryImageId) {
        return data.records[0]._primaryImageId;
      }
      return null;
    })
    .catch(function() {
      return null;
    });
}

// Build an image URL from a framemark image ID
function makeImageUrl(imageId, size) {
  return imageBase + "/" + imageId + "/full/!" + size + "/0/default.jpg";
}

// Build a single preview card — the whole card is a clickable <a>
function buildCard(item, sectionType, label, imageId) {
  var card = document.createElement("a");
  card.className = "browse-collection-card";
  card.href = "browse/" + sectionType + "/property.html?id=" + item.id;

  var header = document.createElement("div");
  header.className = "card-header";

  var typeSpan = document.createElement("span");
  typeSpan.className = "card-type";
  typeSpan.textContent = label;

  var nameHeading = document.createElement("h3");
  nameHeading.className = "card-name";
  nameHeading.textContent = item.name;

  header.appendChild(typeSpan);
  header.appendChild(nameHeading);
  card.appendChild(header);

  var imageDiv = document.createElement("div");
  imageDiv.className = "card-image";

  if (imageId) {
    var img = document.createElement("img");
    img.src = makeImageUrl(imageId, "800,600");
    img.alt = item.name + " preview";
    img.loading = "lazy";
    imageDiv.appendChild(img);
  }

  card.appendChild(imageDiv);

  return card;
}

// Build the "Browse All" card with a 3x2 collage of images from items 4–9
function buildViewAllCard(section, collageImageIds) {
  var link = document.createElement("a");
  link.href = section.viewAllHref;
  link.className = "browse-view-all";

  var imagesDiv = document.createElement("div");
  imagesDiv.className = "view-all-images";

  for (var i = 0; i < 6; i++) {
    var imgId = collageImageIds[i % collageImageIds.length];
    var img = document.createElement("img");
    img.src = makeImageUrl(imgId, "300,300");
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.loading = "lazy";
    imagesDiv.appendChild(img);
  }

  var labelSpan = document.createElement("span");
  labelSpan.className = "view-all-label";
  labelSpan.textContent = section.viewAllText;

  link.appendChild(imagesDiv);
  link.appendChild(labelSpan);

  return link;
}

// Populate one section: fetch all images in parallel, then build the cards
function populateSection(section) {
  var grid = document.getElementById(section.gridId);
  if (grid === null) {
    return;
  }

  // Build one fetch per card item and one per collage item
  var cardFetches = [];
  for (var i = 0; i < section.cards.length; i++) {
    cardFetches.push(fetchOneImage(section.paramName, section.cards[i].id));
  }

  var collageFetches = [];
  for (var i = 0; i < section.collage.length; i++) {
    collageFetches.push(fetchOneImage(section.paramName, section.collage[i].id));
  }

  var allFetches = cardFetches.concat(collageFetches);

  Promise.all(allFetches).then(function(results) {
    var cardImageIds = results.slice(0, section.cards.length);
    var collageImageIds = results.slice(section.cards.length);

    // Remove nulls from collage results
    var validCollageIds = [];
    for (var i = 0; i < collageImageIds.length; i++) {
      if (collageImageIds[i] !== null) {
        validCollageIds.push(collageImageIds[i]);
      }
    }

    // Add the 3 preview cards
    for (var i = 0; i < section.cards.length; i++) {
      var card = buildCard(section.cards[i], section.type, section.label, cardImageIds[i]);
      grid.appendChild(card);
    }

    // Add the "Browse All" card if we have any collage images
    if (validCollageIds.length > 0) {
      var viewAllCard = buildViewAllCard(section, validCollageIds);
      grid.appendChild(viewAllCard);
    }
  });
}

// Initialise all sections
for (var i = 0; i < sections.length; i++) {
  populateSection(sections[i]);
}
