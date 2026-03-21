var apiBase = "https://api.vam.ac.uk/v2";
var imageBase = "https://framemark.vam.ac.uk/collections";

// Same batching constants as homepage.js to avoid API rate limits
var batchSize = 8;
var batchDelay = 150;

// Global tracker — once an image ID is used anywhere on the page it will not appear again
var usedImageIds = {};

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
      { name: "Paper",        id: "x30308"    },
      { name: "Ink",          id: "AAT15012"  },
      { name: "Printing ink", id: "AAT187371" }
    ],
    collage: [
      { id: "x30347"   },
      { id: "AAT14190" },
      { id: "x33202"   },
      { id: "x30618"   },
      { id: "AAT15045" },
      { id: "x29356"   }
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

// Fetch up to 5 candidate image IDs for one grouping.
// Returning multiple candidates allows the picker to skip any already used globally.
async function fetchCandidateImages(paramName, id) {
  var url = apiBase + "/objects/search?" + paramName + "=" + id + "&images_exist=1&page_size=5";
  try {
    var response = await fetch(url);
    var data = await response.json();
    var ids = [];
    if (data.records) {
      for (var i = 0; i < data.records.length; i++) {
        var imgId = data.records[i]._primaryImageId;
        if (imgId) {
          ids.push(imgId);
        }
      }
    }
    return ids;
  } catch (e) {
    return [];
  }
}

// Pick the first candidate not yet used anywhere on the page, then mark it used.
// Returns null if all candidates are already taken.
function pickUnused(candidates) {
  for (var i = 0; i < candidates.length; i++) {
    var candidate = candidates[i];
    if (!usedImageIds[candidate]) {
      usedImageIds[candidate] = true;
      return candidate;
    }
  }
  return null;
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

// Build the "Browse All" card with a 3x2 collage using the pre-chosen image IDs
function buildViewAllCard(section, chosenCollageIds) {
  var link = document.createElement("a");
  link.href = section.viewAllHref;
  link.className = "browse-view-all";

  var imagesDiv = document.createElement("div");
  imagesDiv.className = "view-all-images";

  for (var i = 0; i < 6; i++) {
    var imgId = chosenCollageIds[i % chosenCollageIds.length];
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

// Inject a completed section into the DOM.
// candidateSets is a flat array: first section.cards.length entries are for cards,
// then section.collage.length entries are for the collage.
// pickUnused() draws from the global usedImageIds so no image repeats across sections.
function buildSectionDOM(section, candidateSets) {
  var grid = document.getElementById(section.gridId);
  if (grid === null) {
    return;
  }

  var cardCount   = section.cards.length;
  var collageCount = section.collage.length;

  // Pick one unique image per card
  for (var i = 0; i < cardCount; i++) {
    var imageId = pickUnused(candidateSets[i]);
    var card = buildCard(section.cards[i], section.type, section.label, imageId);
    grid.appendChild(card);
  }

  // Pick one unique image per collage slot
  var chosenCollageIds = [];
  for (var i = 0; i < collageCount; i++) {
    var imageId = pickUnused(candidateSets[cardCount + i]);
    if (imageId !== null) {
      chosenCollageIds.push(imageId);
    }
  }

  if (chosenCollageIds.length > 0) {
    var viewAllCard = buildViewAllCard(section, chosenCollageIds);
    grid.appendChild(viewAllCard);
  }
}

// Build a flat list of all fetch tasks across all sections, then run them
// in batches of 8 with a 150ms pause between batches (same as homepage.js).
// Sections are processed in order so the global duplicate check is deterministic.
async function loadAllSections() {
  var allTasks = [];

  for (var s = 0; s < sections.length; s++) {
    var section = sections[s];

    for (var c = 0; c < section.cards.length; c++) {
      allTasks.push({ paramName: section.paramName, id: section.cards[c].id, sectionIndex: s });
    }

    for (var col = 0; col < section.collage.length; col++) {
      allTasks.push({ paramName: section.paramName, id: section.collage[col].id, sectionIndex: s });
    }
  }

  // Run all tasks in batches, collecting candidate arrays
  var allCandidateSets = [];

  for (var i = 0; i < allTasks.length; i += batchSize) {
    var batchEnd = Math.min(i + batchSize, allTasks.length);
    var batch = allTasks.slice(i, batchEnd);

    var batchPromises = [];
    for (var j = 0; j < batch.length; j++) {
      batchPromises.push(fetchCandidateImages(batch[j].paramName, batch[j].id));
    }

    var batchResults = await Promise.all(batchPromises);
    for (var j = 0; j < batchResults.length; j++) {
      allCandidateSets.push(batchResults[j]);
    }

    if (batchEnd < allTasks.length) {
      await new Promise(function(resolve) {
        setTimeout(resolve, batchDelay);
      });
    }
  }

  // Distribute results back to each section and build the DOM in order.
  // Because sections are built in order and pickUnused() marks each chosen ID globally,
  // the same image cannot appear in two different sections.
  var resultIndex = 0;

  for (var s = 0; s < sections.length; s++) {
    var section = sections[s];
    var count = section.cards.length + section.collage.length;
    var candidateSets = allCandidateSets.slice(resultIndex, resultIndex + count);
    resultIndex += count;

    buildSectionDOM(section, candidateSets);
  }
}

loadAllSections();
