const apiBase = "https://api.vam.ac.uk/v2";
const imageBase = "https://framemark.vam.ac.uk/collections";

/* Batch settings */
const batchSize = 8;
const batchDelay = 150;

/* Used images */
const usedImageIds = {};

/* Init overlay */
(function() {
  const children = document.body.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].id !== 'loading-overlay') {
      children[i].setAttribute('inert', '');
    }
  }
  const main = document.getElementById('main-content');
  if (main !== null) {
    main.setAttribute('aria-busy', 'true');
  }
}());

/* Popover focus */
function initPopoverFocus() {
  const popovers = document.querySelectorAll('nav [popover]');
  for (let i = 0; i < popovers.length; i++) {
    (function(pop) {
      pop.addEventListener('toggle', function(evt) {
        if (evt.newState === 'open') {
          const first = pop.querySelector('a');
          if (first !== null) { first.focus(); }
        } else {
          const trigger = document.querySelector('[popovertarget="' + pop.id + '"]');
          if (trigger !== null) { trigger.focus(); }
        }
      });
    }(popovers[i]));
  }
}
initPopoverFocus();

/* Sections data */
const sections = [
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
      { id: "x28849" },
      { id: "x29068" },
      { id: "x29399" },
      { id: "x28927" },
      { id: "x28873" },
      { id: "x28842" }
    ]
  }
];

/* Fetch candidates */
async function fetchCandidateImages(paramName, id) {
  const url = apiBase + "/objects/search?" + paramName + "=" + id + "&images_exist=1&page_size=5";
  try {
    const response = await fetch(url);
    const data = await response.json();
    const ids = [];
    if (data.records) {
      for (let i = 0; i < data.records.length; i++) {
        const imgId = data.records[i]._primaryImageId;
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

/* Pick unused */
function pickUnused(candidates) {
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (!usedImageIds[candidate]) {
      usedImageIds[candidate] = true;
      return candidate;
    }
  }
  return null;
}

/* Image URL */
function makeImageUrl(imageId, size) {
  return imageBase + "/" + imageId + "/full/!" + size + "/0/default.jpg";
}

/* Build card */
function buildCard(item, sectionType, label, imageId) {
  const card = document.createElement("a");
  card.className = "browse-collection-card";
  card.href = "browse/" + sectionType + "/property.html?id=" + item.id + "&name=" + encodeURIComponent(item.name);

  const header = document.createElement("div");
  header.className = "card-header";

  const typeSpan = document.createElement("span");
  typeSpan.className = "card-type";
  typeSpan.textContent = label;

  const nameHeading = document.createElement("h3");
  nameHeading.className = "card-name";
  nameHeading.textContent = item.name;

  header.appendChild(typeSpan);
  header.appendChild(nameHeading);
  card.appendChild(header);

  const imageDiv = document.createElement("div");
  imageDiv.className = "card-image";

  if (imageId) {
    const img = document.createElement("img");
    img.src = makeImageUrl(imageId, "800,600");
    img.alt = item.name + " preview";
    img.loading = "lazy";
    imageDiv.appendChild(img);
  }

  card.appendChild(imageDiv);

  return card;
}

/* View all card */
function buildViewAllCard(section, chosenCollageIds) {
  const link = document.createElement("a");
  link.href = section.viewAllHref;
  link.className = "browse-view-all";

  const imagesDiv = document.createElement("div");
  imagesDiv.className = "view-all-images";

  for (let i = 0; i < 6; i++) {
    const imgId = chosenCollageIds[i % chosenCollageIds.length];
    const img = document.createElement("img");
    img.src = makeImageUrl(imgId, "300,300");
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.loading = "lazy";
    imagesDiv.appendChild(img);
  }

  const labelSpan = document.createElement("span");
  labelSpan.className = "view-all-label";
  labelSpan.textContent = section.viewAllText;

  link.appendChild(imagesDiv);
  link.appendChild(labelSpan);

  return link;
}

/* Build section DOM */
function buildSectionDOM(section, candidateSets) {
  const grid = document.getElementById(section.gridId);
  if (grid === null) {
    return;
  }

  const cardCount   = section.cards.length;
  const collageCount = section.collage.length;

  for (let i = 0; i < cardCount; i++) {
    const imageId = pickUnused(candidateSets[i]);
    const card = buildCard(section.cards[i], section.type, section.label, imageId);
    grid.appendChild(card);
  }

  const chosenCollageIds = [];
  for (let i = 0; i < collageCount; i++) {
    const imageId = pickUnused(candidateSets[cardCount + i]);
    if (imageId !== null) {
      chosenCollageIds.push(imageId);
    }
  }

  if (chosenCollageIds.length > 0) {
    const viewAllCard = buildViewAllCard(section, chosenCollageIds);
    grid.appendChild(viewAllCard);
  }
}

/* Load all sections */
async function loadAllSections() {
  const allTasks = [];

  for (let s = 0; s < sections.length; s++) {
    const section = sections[s];

    for (let c = 0; c < section.cards.length; c++) {
      allTasks.push({ paramName: section.paramName, id: section.cards[c].id, sectionIndex: s });
    }

    for (let col = 0; col < section.collage.length; col++) {
      allTasks.push({ paramName: section.paramName, id: section.collage[col].id, sectionIndex: s });
    }
  }

  const allCandidateSets = [];

  for (let i = 0; i < allTasks.length; i += batchSize) {
    const batchEnd = Math.min(i + batchSize, allTasks.length);
    const batch = allTasks.slice(i, batchEnd);

    const batchPromises = [];
    for (let j = 0; j < batch.length; j++) {
      batchPromises.push(fetchCandidateImages(batch[j].paramName, batch[j].id));
    }

    const batchResults = await Promise.all(batchPromises);
    for (let j = 0; j < batchResults.length; j++) {
      allCandidateSets.push(batchResults[j]);
    }

    if (batchEnd < allTasks.length) {
      await new Promise(function(resolve) {
        setTimeout(resolve, batchDelay);
      });
    }
  }

  let resultIndex = 0;

  for (let s = 0; s < sections.length; s++) {
    const section = sections[s];
    const count = section.cards.length + section.collage.length;
    const candidateSets = allCandidateSets.slice(resultIndex, resultIndex + count);
    resultIndex += count;

    buildSectionDOM(section, candidateSets);
  }

  const overlay = document.getElementById("loading-overlay");
  if (overlay !== null) {
    overlay.classList.add("hidden");
  }
  const bodyChildren = document.body.children;
  for (let i = 0; i < bodyChildren.length; i++) {
    bodyChildren[i].removeAttribute('inert');
  }
  const main = document.getElementById('main-content');
  if (main !== null) {
    main.removeAttribute('aria-busy');
  }
}

loadAllSections();
