var apiBase = "https://api.vam.ac.uk/v2";
var imageBase = "https://framemark.vam.ac.uk/collections";

/* Cluster fields */
var clusterFieldMap = {
  collections: "collection",
  categories:  "category",
  materials:   "material",
  origins:     "place"
};

/* Param names */
var paramNames = {
  collections: "id_collection",
  categories:  "id_category",
  materials:   "id_material",
  origins:     "id_place"
};

/* Fetch clusters */
async function fetchClusters() {
  var clusterField = clusterFieldMap[pageType];
  var url = apiBase + "/objects/clusters/" + clusterField + "/search?cluster_size=100";
  try {
    var response = await fetch(url);
    var data = await response.json();
    var records = [];
    if (Array.isArray(data)) {
      records = data;
    }
    var items = [];
    for (var i = 0; i < records.length; i++) {
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
  var children = document.body.children;
  for (var i = 0; i < children.length; i++) {
    if (children[i].id !== 'loading-overlay') {
      children[i].setAttribute('inert', '');
    }
  }
  var main = document.getElementById('main-content');
  if (main !== null) {
    main.setAttribute('aria-busy', 'true');
  }
}());

/* Popover focus */
function initPopoverFocus() {
  var popovers = document.querySelectorAll('nav [popover]');
  for (var i = 0; i < popovers.length; i++) {
    (function(pop) {
      pop.addEventListener('toggle', function(evt) {
        if (evt.newState === 'open') {
          var first = pop.querySelector('a');
          if (first !== null) { first.focus(); }
        } else {
          var trigger = document.querySelector('[popovertarget="' + pop.id + '"]');
          if (trigger !== null) { trigger.focus(); }
        }
      });
    }(popovers[i]));
  }
}
initPopoverFocus();

/* Page type */
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

/* Fetch item data */
async function fetchItemData(paramName, ids) {
  var idArray = [];
  if (Array.isArray(ids)) {
    idArray = ids;
  } else {
    idArray = [ids];
  }
  var queryParts = [];
  for (var i = 0; i < idArray.length; i++) {
    queryParts.push(paramName + "=" + encodeURIComponent(idArray[i]));
  }
  var query = queryParts.join("&");
  var url = apiBase + "/objects/search?" + query + "&images_exist=1&page_size=6";
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
  var card = document.createElement("a");
  card.className = "browse-collection-card";
  var encodedIds = [];
  for (var ei = 0; ei < item.ids.length; ei++) { encodedIds.push(encodeURIComponent(item.ids[ei])); }
  card.href = "property.html?id=" + encodedIds.join(",") + "&name=" + encodeURIComponent(item.name);
  card.dataset.ids = item.ids.join(",");
  card.dataset.name = item.name;

  var header = document.createElement("div");
  header.className = "card-header";

  var countSpan = document.createElement("span");
  countSpan.className = "card-type";

  var nameHeading = document.createElement("h3");
  nameHeading.className = "card-name";
  nameHeading.textContent = item.name;

  header.appendChild(countSpan);
  header.appendChild(nameHeading);
  card.appendChild(header);

  var imageDiv = document.createElement("div");
  imageDiv.className = "card-image";
  card.appendChild(imageDiv);

  return card;
}

/* Populate card */
function populateCard(card, paramName, usedImageIds) {
  var ids  = card.dataset.ids.split(",");
  var name = card.dataset.name;

  fetchItemData(paramName, ids).then(function(result) {
    if (result.count === 0) {
      card.remove();
      return;
    }

    var countEl = card.querySelector(".card-type");
    if (countEl) {
      countEl.textContent = "Number of Items: " + formatCount(result.count);
    }

    var chosenImageId = null;
    for (var j = 0; j < result.imageIds.length; j++) {
      if (!usedImageIds[result.imageIds[j]]) {
        usedImageIds[result.imageIds[j]] = true;
        chosenImageId = result.imageIds[j];
        break;
      }
    }

    if (chosenImageId) {
      var imageDiv = card.querySelector(".card-image");
      if (imageDiv) {
        var img = document.createElement("img");
        img.src = makeImageUrl(chosenImageId, "800,600");
        img.alt = name + " preview";
        img.loading = "lazy";
        imageDiv.appendChild(img);
      }
    }
  });
}

function removeOverlay() {
  var overlay = document.getElementById("loading-overlay");
  if (overlay !== null) { overlay.classList.add("hidden"); }
  var bodyChildren = document.body.children;
  for (var i = 0; i < bodyChildren.length; i++) {
    bodyChildren[i].removeAttribute("inert");
  }
  var main = document.getElementById("main-content");
  if (main !== null) { main.removeAttribute("aria-busy"); }
}

/* Load items */
async function loadAllItems() {
  if (pageType === null) { return; }

  var grid = document.getElementById("all-grid");
  if (grid === null) { return; }

  var items = await fetchClusters();
  if (pageType === "collections") { items = mergeGroups(items, getCollectionGroup); }
  if (pageType === "materials") {
    items = mergeGroups(items, getMaterialGroup);
    for (var m = 0; m < items.length; m++) {
      items[m].name = toSentenceCase(items[m].name);
    }
  }
  if (pageType === "categories") { items = mergeGroups(items, getCategoryGroup); }
  if (pageType === "origins") { items = mergeGroups(items, getOriginGroup); }
  var paramName = paramNames[pageType];

  if (items.length === 0) {
    grid.innerHTML = "<p class=\"error\" role=\"alert\">Sorry, we couldn\u2019t load the data right now.</p>";
    removeOverlay();
    return;
  }

  /* Used images */
  var usedImageIds = {};

  /* Fetch queue */
  var fetchQueue = [];
  var fetchTimerId = null;

  function processQueue() {
    if (fetchQueue.length === 0) {
      fetchTimerId = null;
      return;
    }
    var item = fetchQueue.shift();
    populateCard(item.card, item.paramName, item.usedImageIds);
    fetchTimerId = setTimeout(processQueue, 150);
  }

  function enqueue(card) {
    fetchQueue.push({ card: card, paramName: paramName, usedImageIds: usedImageIds });
    if (fetchTimerId === null) { processQueue(); }
  }

  /* Observer */
  var observer = new IntersectionObserver(function(entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) { continue; }
      var card = entries[i].target;
      observer.unobserve(card);
      enqueue(card);
    }
  }, { rootMargin: "200px" });

  for (var i = 0; i < items.length; i++) {
    var card = buildPlaceholderCard(items[i]);
    grid.appendChild(card);
    observer.observe(card);
  }

  removeOverlay();
}

loadAllItems();
