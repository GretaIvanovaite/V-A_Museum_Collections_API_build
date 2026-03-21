var apiBase = "https://api.vam.ac.uk/v2";
var imageBase = "https://framemark.vam.ac.uk/collections";

// Same batching constants as homepage.js to avoid API rate limits
var batchSize = 8;
var batchDelay = 150;

// All items sourced from va-api-clusters-2026-03-04.json, ordered by count.
// Duplicate IDs removed using names.js as a guide.
// Counts are NOT hardcoded — they are fetched live from the API below.

var allItems = {
  collections: [
    { id: "THES48595",  name: "Prints, Drawings & Paintings" },
    { id: "THES48602",  name: "Theatre and Performance"      },
    { id: "THES48596",  name: "East Asia"                    },
    { id: "THES48601",  name: "Textiles and Fashion"         },
    { id: "THES48594",  name: "Ceramics"                     },
    { id: "THES48598",  name: "South & South East Asia"      },
    { id: "THES291628", name: "Department of Photography"    },
    { id: "THES48599",  name: "Metalwork"                    },
    { id: "THES48593",  name: "Young V&A"                    },
    { id: "THES270009", name: "V&A Wedgwood"                 },
    { id: "THES48600",  name: "Sculpture"                    },
    { id: "THES48607",  name: "Middle East Section"          },
    { id: "THES48597",  name: "Furniture and Woodwork"       },
    { id: "THES48605",  name: "National Art Library"         },
    { id: "THES260586", name: "Design, Architecture & Digital" },
    { id: "THES264787", name: "Exhibitions Department"       },
    { id: "THES359557", name: "V&A East"                     },
    { id: "THES48604",  name: "Archive of Art and Design"    },
    { id: "THES48606",  name: "Circulation Dept (1909\u20131977)" }
  ],
  categories: [
    { id: "THES48903",  name: "Prints"                       },
    { id: "THES48968",  name: "Designs"                      },
    { id: "THES48966",  name: "Drawings"                     },
    { id: "THES48910",  name: "Photographs"                  },
    { id: "THES48885",  name: "Textiles"                     },
    { id: "THES48982",  name: "Ceramics"                     },
    { id: "THES48959",  name: "Entertainment & Leisure"      },
    { id: "THES48957",  name: "Fashion"                      },
    { id: "THES48993",  name: "Architecture"                 },
    { id: "THES48906",  name: "Portraits"                    },
    { id: "THES48920",  name: "Metalwork"                    },
    { id: "THES48975",  name: "Clothing"                     },
    { id: "THES49044",  name: "Womenswear"                   },
    { id: "THES49038",  name: "Ornament Prints"              },
    { id: "THES281081", name: "The Royal Photographic Society" },
    { id: "THES252963", name: "Posters"                      },
    { id: "THES252988", name: "Topography"                   },
    { id: "THES48917",  name: "Paintings"                    },
    { id: "THES250537", name: "Theatre"                      },
    { id: "THES48938",  name: "Illustration"                 }
  ],
  materials: [
    // AAT14109 "paper (fiber product)" skipped — same substance as x30308
    // Duplicate x30308 and duplicate AAT14109 entries in the JSON also skipped
    { id: "x30308",    name: "Paper"                        },
    { id: "AAT15012",  name: "Ink"                          },
    { id: "AAT187371", name: "Printing ink"                 },
    { id: "x30347",    name: "Pencil"                       },
    { id: "AAT14190",  name: "Photographic paper"           },
    { id: "x33202",    name: "Watercolour"                  },
    { id: "x30618",    name: "Pen and ink"                  },
    { id: "AAT15045",  name: "Watercolour (paint)"          },
    { id: "x29356",    name: "Earthenware"                  },
    { id: "AAT243428", name: "Silk (textile)"               },
    { id: "x30344",    name: "Card"                         },
    { id: "x32505",    name: "Pen and ink and watercolour"  },
    { id: "AAT10797",  name: "Glass"                        },
    { id: "AAT10662",  name: "Porcelain"                    },
    { id: "AAT14067",  name: "Cotton (textile)"             },
    { id: "AAT11029",  name: "Silver"                       },
    { id: "AAT11051",  name: "Wash"                         }
  ],
  origins: [
    // x32019 "Britain" entry skipped — same ID as "Great Britain"
    { id: "x32019",    name: "Great Britain"   },
    { id: "x28980",    name: "London"          },
    { id: "x28826",    name: "England"         },
    { id: "x28849",    name: "France"          },
    { id: "x29068",    name: "Paris"           },
    { id: "x29399",    name: "Japan"           },
    { id: "x28927",    name: "Italy"           },
    { id: "x28873",    name: "Germany"         },
    { id: "x28842",    name: "Europe"          },
    { id: "x29398",    name: "China"           },
    { id: "THES253239",name: "North Europe"    },
    { id: "x29181",    name: "Staffordshire"   },
    { id: "x29336",    name: "United Kingdom"  },
    { id: "x29512",    name: "Egypt"           },
    { id: "x29333",    name: "United States"   },
    { id: "x29790",    name: "India"           },
    { id: "x29020",    name: "Netherlands"     },
    { id: "x29170",    name: "Spain"           },
    { id: "x33200",    name: "Etruria"         }
  ]
};

var paramNames = {
  collections: "id_collection",
  categories:  "id_category",
  materials:   "id_material",
  origins:     "id_place"
};

// Determine which section we are from the URL path
var pageType = null;
var pathname = window.location.pathname;

if (pathname.indexOf("/collections/") !== -1) {
  pageType = "collections";
} else if (pathname.indexOf("/categories/") !== -1) {
  pageType = "categories";
} else if (pathname.indexOf("/materials/") !== -1) {
  pageType = "materials";
} else if (pathname.indexOf("/origins/") !== -1) {
  pageType = "origins";
}

// Fetch image candidates AND the live item count in one request.
// page_size=3 gives fallback image candidates; record_count is the total matching.
async function fetchItemData(paramName, id) {
  var url = apiBase + "/objects/search?" + paramName + "=" + id + "&images_exist=1&page_size=3";
  try {
    var response = await fetch(url);
    var data = await response.json();

    var count = 0;
    if (data.info && data.info.record_count) {
      count = data.info.record_count;
    }

    var imageIds = [];
    if (data.records) {
      for (var i = 0; i < data.records.length; i++) {
        var imgId = data.records[i]._primaryImageId;
        if (imgId) {
          imageIds.push(imgId);
        }
      }
    }

    return { count: count, imageIds: imageIds };
  } catch (e) {
    return { count: 0, imageIds: [] };
  }
}

// Format a number with locale-appropriate thousand separators
function formatCount(count) {
  return count.toLocaleString();
}

// Build an image URL from a framemark image ID
function makeImageUrl(imageId, size) {
  return imageBase + "/" + imageId + "/full/!" + size + "/0/default.jpg";
}

// Build a single card using the same structure as browse.js / browse.html
function buildCard(item, count, imageId) {
  var card = document.createElement("a");
  card.className = "browse-collection-card";
  card.href = "property.html?id=" + item.id;

  var header = document.createElement("div");
  header.className = "card-header";

  var countSpan = document.createElement("span");
  countSpan.className = "card-type";
  if (count > 0) {
    countSpan.textContent = "Number of Items: " + formatCount(count);
  }

  var nameHeading = document.createElement("h3");
  nameHeading.className = "card-name";
  nameHeading.textContent = item.name;

  header.appendChild(countSpan);
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

// Fetch all items in batches, then render the grid
async function loadAllItems() {
  if (pageType === null) {
    return;
  }

  var grid = document.getElementById("all-grid");
  if (grid === null) {
    return;
  }

  var items = allItems[pageType];
  var paramName = paramNames[pageType];

  // Track used image IDs so no image appears twice on this page
  var usedImageIds = {};

  // Run fetches in batches of 8 with 150ms pause between batches
  var allResults = [];

  for (var i = 0; i < items.length; i += batchSize) {
    var batchEnd = Math.min(i + batchSize, items.length);
    var batch = items.slice(i, batchEnd);

    var batchPromises = [];
    for (var j = 0; j < batch.length; j++) {
      batchPromises.push(fetchItemData(paramName, batch[j].id));
    }

    var batchResults = await Promise.all(batchPromises);
    for (var j = 0; j < batchResults.length; j++) {
      allResults.push(batchResults[j]);
    }

    if (batchEnd < items.length) {
      await new Promise(function(resolve) {
        setTimeout(resolve, batchDelay);
      });
    }
  }

  // Build and inject cards
  for (var i = 0; i < items.length; i++) {
    var result = allResults[i];

    // Pick the first image candidate not already used on this page
    var chosenImageId = null;
    for (var j = 0; j < result.imageIds.length; j++) {
      var candidate = result.imageIds[j];
      if (!usedImageIds[candidate]) {
        usedImageIds[candidate] = true;
        chosenImageId = candidate;
        break;
      }
    }

    var card = buildCard(items[i], result.count, chosenImageId);
    grid.appendChild(card);
  }
}

loadAllItems();
