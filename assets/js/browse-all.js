const apiBase = "https://api.vam.ac.uk/v2";
const imageBase = "https://framemark.vam.ac.uk/collections";

/* Cluster fields */
const clusterFieldMap = {
  collections: "collection",
  categories:  "category",
  materials:   "material",
  origins:     "place"
};

/* Param names */
const paramNames = {
  collections: "id_collection",
  categories:  "id_category",
  materials:   "id_material",
  origins:     "id_place"
};

/* Fetch clusters */
async function fetchClusters() {
  const clusterField = clusterFieldMap[pageType];
  const url = apiBase + "/objects/clusters/" + clusterField + "/search?cluster_size=100";
  try {
    const response = await fetch(url);
    const data = await response.json();
    let records = [];
    if (Array.isArray(data)) {
      records = data;
    }
    const items = [];
    for (let i = 0; i < records.length; i++) {
      items.push({ id: records[i].id, ids: [records[i].id], name: records[i].value });
    }
    return items;
  } catch (e) {
    console.error("[fetchClusters] error:", e);
    return [];
  }
}

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

/* Page type */
let pageType = null;
const pathname = window.location.pathname;

if (pathname.indexOf("/collections/") !== -1) {
  pageType = "collections";
} else if (pathname.indexOf("/categories/") !== -1) {
  pageType = "categories";
} else if (pathname.indexOf("/materials/") !== -1) {
  pageType = "materials";
} else if (pathname.indexOf("/origins/") !== -1) {
  pageType = "origins";
}

/* Fetch item data */
async function fetchItemData(paramName, ids) {
  let idArray = [];
  if (Array.isArray(ids)) {
    idArray = ids;
  } else {
    idArray = [ids];
  }
  const queryParts = [];
  for (let i = 0; i < idArray.length; i++) {
    queryParts.push(paramName + "=" + encodeURIComponent(idArray[i]));
  }
  const query = queryParts.join("&");
  const url = apiBase + "/objects/search?" + query + "&images_exist=1&page_size=6";
  try {
    const response = await fetch(url);
    const data = await response.json();

    let count = 0;
    if (data.info && data.info.record_count) {
      count = data.info.record_count;
    }

    const imageIds = [];
    if (data.records) {
      for (let i = 0; i < data.records.length; i++) {
        const imgId = data.records[i]._primaryImageId;
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

/* Format count */
function formatCount(count) {
  return count.toLocaleString();
}

/* Image URL */
function makeImageUrl(imageId, size) {
  return imageBase + "/" + imageId + "/full/!" + size + "/0/default.jpg";
}

/* Placeholder card */
function buildPlaceholderCard(item) {
  const card = document.createElement("a");
  card.className = "browse-collection-card";
  const encodedIds = [];
  for (let ei = 0; ei < item.ids.length; ei++) { encodedIds.push(encodeURIComponent(item.ids[ei])); }
  card.href = "property.html?id=" + encodedIds.join(",") + "&name=" + encodeURIComponent(item.name);
  card.dataset.ids = item.ids.join(",");
  card.dataset.name = item.name;

  const header = document.createElement("div");
  header.className = "card-header";

  const countSpan = document.createElement("span");
  countSpan.className = "card-type";

  const nameHeading = document.createElement("h3");
  nameHeading.className = "card-name";
  nameHeading.textContent = item.name;

  header.appendChild(countSpan);
  header.appendChild(nameHeading);
  card.appendChild(header);

  const imageDiv = document.createElement("div");
  imageDiv.className = "card-image";
  card.appendChild(imageDiv);

  return card;
}

/* Populate card */
function populateCard(card, paramName, usedImageIds) {
  const ids  = card.dataset.ids.split(",");
  const name = card.dataset.name;

  fetchItemData(paramName, ids).then(function(result) {
    if (result.count === 0) {
      card.remove();
      return;
    }

    const countEl = card.querySelector(".card-type");
    if (countEl) {
      countEl.textContent = "Number of Items: " + formatCount(result.count);
    }

    let chosenImageId = null;
    for (let j = 0; j < result.imageIds.length; j++) {
      if (!usedImageIds[result.imageIds[j]]) {
        usedImageIds[result.imageIds[j]] = true;
        chosenImageId = result.imageIds[j];
        break;
      }
    }

    if (chosenImageId) {
      const imageDiv = card.querySelector(".card-image");
      if (imageDiv) {
        const img = document.createElement("img");
        img.src = makeImageUrl(chosenImageId, "800,600");
        img.alt = name + " preview";
        img.loading = "lazy";
        imageDiv.appendChild(img);
      }
    }
  });
}

function removeOverlay() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay !== null) { overlay.classList.add("hidden"); }
  const bodyChildren = document.body.children;
  for (let i = 0; i < bodyChildren.length; i++) {
    bodyChildren[i].removeAttribute("inert");
  }
  const main = document.getElementById("main-content");
  if (main !== null) { main.removeAttribute("aria-busy"); }
}

/* Load items */
async function loadAllItems() {
  if (pageType === null) { return; }

  const grid = document.getElementById("all-grid");
  if (grid === null) { return; }

  let items = await fetchClusters();
  if (pageType === "collections") { items = mergeGroups(items, getCollectionGroup); }
  if (pageType === "materials") {
    items = mergeGroups(items, getMaterialGroup);
    for (let m = 0; m < items.length; m++) {
      items[m].name = toSentenceCase(items[m].name);
    }
  }
  if (pageType === "categories") { items = mergeGroups(items, getCategoryGroup); }
  if (pageType === "origins") { items = mergeGroups(items, getOriginGroup); }
  const paramName = paramNames[pageType];

  if (items.length === 0) {
    grid.innerHTML = "<p class=\"error\" role=\"alert\">Sorry, we couldn\u2019t load the data right now.</p>";
    removeOverlay();
    return;
  }

  /* Used images */
  const usedImageIds = {};

  /* Fetch queue */
  const fetchQueue = [];
  let fetchTimerId = null;

  function processQueue() {
    if (fetchQueue.length === 0) {
      fetchTimerId = null;
      return;
    }
    const item = fetchQueue.shift();
    populateCard(item.card, item.paramName, item.usedImageIds);
    fetchTimerId = setTimeout(processQueue, 150);
  }

  function enqueue(card) {
    fetchQueue.push({ card: card, paramName: paramName, usedImageIds: usedImageIds });
    if (fetchTimerId === null) { processQueue(); }
  }

  /* Observer */
  const observer = new IntersectionObserver(function(entries) {
    for (let i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) { continue; }
      const card = entries[i].target;
      observer.unobserve(card);
      enqueue(card);
    }
  }, { rootMargin: "200px" });

  for (let i = 0; i < items.length; i++) {
    const card = buildPlaceholderCard(items[i]);
    grid.appendChild(card);
    observer.observe(card);
  }

  removeOverlay();
}

loadAllItems();
