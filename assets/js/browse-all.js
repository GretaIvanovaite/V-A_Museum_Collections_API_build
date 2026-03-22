var apiBase = "https://api.vam.ac.uk/v2";
var imageBase = "https://framemark.vam.ac.uk/collections";

// Maps pageType to the cluster field name used by the V&A clusters API
var clusterFieldMap = {
  collections: "collection",
  categories:  "category",
  materials:   "material",
  origins:     "place"
};

// Maps pageType to the search filter param used when fetching object counts/images
var paramNames = {
  collections: "id_collection",
  categories:  "id_category",
  materials:   "id_material",
  origins:     "id_place"
};

// Fetch the full list of items for the current page type from the clusters API.
// The dedicated clusters endpoint returns up to cluster_size results ordered by count.
async function fetchClusters() {
  var clusterField = clusterFieldMap[pageType];
  var url = apiBase + "/objects/clusters/" + clusterField + "/search?cluster_size=50";
  try {
    var response = await fetch(url);
    var data = await response.json();
    var records = Array.isArray(data) ? data : [];
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

// Prevent keyboard navigation behind the loading overlay while content loads
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

// Move keyboard focus into a nav popover when it opens, and return it to the trigger on close
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
// ids may be a single string or an array (array = OR query, used for grouped materials).
// page_size=3 gives fallback image candidates; record_count is the total matching.
async function fetchItemData(paramName, ids) {
  var idArray = Array.isArray(ids) ? ids : [ids];
  var queryParts = [];
  for (var i = 0; i < idArray.length; i++) {
    queryParts.push(paramName + "=" + idArray[i]);
  }
  var query = queryParts.join("&");
  var url = apiBase + "/objects/search?" + query + "&images_exist=1&page_size=3";
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


// Build a placeholder card with just the name — image and count populated lazily
function buildPlaceholderCard(item) {
  var card = document.createElement("a");
  card.className = "browse-collection-card";
  card.href = "property.html?id=" + item.ids.join(",") + "&name=" + encodeURIComponent(item.name);
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

// Fetch and populate a single card's count and image when it enters the viewport
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

// Render placeholder cards immediately, then populate each lazily via IntersectionObserver
async function loadAllItems() {
  if (pageType === null) { return; }

  var grid = document.getElementById("all-grid");
  if (grid === null) { return; }

  var items = await fetchClusters();
  if (pageType === "collections") { items = mergeGroups(items, getCollectionGroup); }
  if (pageType === "materials") { items = mergeGroups(items, getMaterialGroup); }
  if (pageType === "categories") { items = mergeGroups(items, getCategoryGroup); }
  if (pageType === "origins") { items = mergeGroups(items, getOriginGroup); }
  var paramName = paramNames[pageType];

  if (items.length === 0) {
    grid.innerHTML = "<p class=\"error\" role=\"alert\">Sorry, we couldn\u2019t load the data right now.</p>";
    removeOverlay();
    return;
  }

  // Shared set so no two cards end up with the same image
  var usedImageIds = {};

  // rootMargin: start fetching card data 400px before it scrolls into view
  var observer = new IntersectionObserver(function(entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) { continue; }
      var card = entries[i].target;
      observer.unobserve(card);
      populateCard(card, paramName, usedImageIds);
    }
  }, { rootMargin: "400px" });

  for (var i = 0; i < items.length; i++) {
    var card = buildPlaceholderCard(items[i]);
    grid.appendChild(card);
    observer.observe(card);
  }

  // Show the page as soon as placeholders are in the DOM
  removeOverlay();
}

loadAllItems();
