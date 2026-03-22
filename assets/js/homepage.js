const apiBase = "https://api.vam.ac.uk/v2";
const imageUrl = "https://framemark.vam.ac.uk/collections";
const grid = document.getElementById("objects-grid");
const slider = document.getElementById("density-slider");

const tierMap = { 1: 20, 2: 30, 3: 40 };

// Prevent keyboard navigation behind the loading overlay while content loads
(function() {
  const children = document.body.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].id !== 'loading-overlay') {
      children[i].setAttribute('inert', '');
    }
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
          if (first) { first.focus(); }
        } else {
          var trigger = document.querySelector('[popovertarget="' + pop.id + '"]');
          if (trigger) { trigger.focus(); }
        }
      });
    }(popovers[i]));
  }
}
initPopoverFocus();

const groups = [
  {
    name: 'Photography and media',
    class: 'photography',
    subcategories: [
      {name: 'Photographs', id: 'THES48910', minTier: 20},
      {name: 'Posters', id: 'THES252963', minTier: 20},
      {name: 'Prints', id: 'THES48903', minTier: 20},
      {name: 'Books', id: 'THES48986', minTier: 20},
      {name: 'Advertising', id: 'THES49001', minTier: 20},
      {name: 'Manuscripts', id: 'THES48922', minTier: 30},
      {name: 'Ephemera', id: 'THES252985', minTier: 30},
      {name: 'Ornament prints', id: 'THES49038', minTier: 40},
      {name: 'The RPS Collection', id: 'THES281081', minTier: 40},
      {name: 'Albums', id: 'THES288636', minTier: 40},
    ]
  },
  {
    name: 'Art and design',
    class: 'art',
    subcategories: [
      {name: 'Paintings', id: 'THES48917', minTier: 20},
      {name: 'Portraits', id: 'THES48906', minTier: 20},
      {name: 'Drawings', id: 'THES48966', minTier: 20},
      {name: 'Sculpture', id: 'THES48896', minTier: 20},
      {name: 'Illustration', id: 'THES48938', minTier: 30},
      {name: 'Caricatures & Cartoons', id: 'THES48983', minTier: 30},
      {name: 'Topography', id: 'THES252988', minTier: 40},
      {name: 'Plaster Cast', id: 'THES270451', minTier: 40},
    ]
  },
  {
    name: 'Fashion and textiles',
    class: 'fashion',
    subcategories: [
      {name: 'Fashion', id: 'THES48957', minTier: 20},
      {name: 'Jewellery', id: 'THES48930', minTier: 20},
      {name: 'Textiles', id: 'THES48885', minTier: 20},
      {name: 'Accessories', id: 'THES48998', minTier: 30},
      {name: 'Embroidery', id: 'THES48960', minTier: 30},
      {name: 'Lace', id: 'THES48926', minTier: 40},
      {name: "Men's clothes", id: 'THES49043', minTier: 40},
    ]
  },
  {
    name: 'Applied art and crafts',
    class: 'appliedart',
    subcategories: [
      {name: 'Ceramics', id: 'THES48982', minTier: 20},
      {name: 'Metalwork', id: 'THES48920', minTier: 20},
      {name: 'Glass', id: 'THES48946', minTier: 20},
      {name: 'Arms & Armour', id: 'THES48992', minTier: 30},
      {name: 'V&A Wedgwood Collection', id: 'THES276060', minTier: 40},
    ]
  },
  {
    name: 'Performance and leisure',
    class: 'performance',
    subcategories: [
      {name: 'Theatre', id: 'THES250537', minTier: 20},
      {name: 'Music', id: 'THES253065', minTier: 20},
      {name: 'Entertainment & Leisure', id: 'THES48959', minTier: 20},
      {name: 'Games', id: 'THES48947', minTier: 30},
      {name: 'Children & Childhood', id: 'THES48980', minTier: 30},
      {name: 'Fashion plates', id: 'THES48956', minTier: 40},
    ]
  },
  {
    name: 'Architecture and spaces',
    class: 'architecture',
    subcategories: [
      {name: 'Furniture', id: 'THES48948', minTier: 20},
      {name: 'Architecture', id: 'THES48993', minTier: 20},
      {name: 'Interiors', id: 'THES48933', minTier: 30},
      {name: 'Tiles', id: 'THES48884', minTier: 40},
    ]
  },
];

const cache = {};
const categoryCache = {};
let activeSubcategory = null;
let activeGroupClass = null;

// Pagination state
const shownIds = new Set();  // system numbers already on the page
const categoryPool = {};     // id -> array of unshown items from already-fetched pages
const categoryNextPage = {}; // id -> next page number to fetch from the API

// Using batches because of API rate limits
const batchSize = 8;
const batchDelay = 150;

async function fetchCategoryPageData(category, page) {
  const searchUrl = apiBase + "/objects/search?id_category=" + category.id +
    "&images_exist=1&page_size=10&page=" + page + "&data_restrict=descriptive_only";
  try {
    const response = await fetch(searchUrl);
    const jsonData = await response.json();
    if (jsonData.records == null) {
      return [];
    }
    return jsonData.records;
  } catch (e) {
    return [];
  }
}

async function fetchCategory(category) {
  categoryNextPage[category.id] = 1;
  const results = await fetchCategoryPageData(category, 1);
  categoryNextPage[category.id] = 2;

  // Build a list of items not already shown
  const fresh = [];
  for (let i = 0; i < results.length; i++) {
    if (!shownIds.has(results[i].systemNumber)) {
      fresh.push(results[i]);
    }
  }

  if (fresh.length > 0) {
    const randomIdx = Math.floor(Math.random() * fresh.length);
    const chosen = fresh[randomIdx];
    cache[category.id] = chosen;
    shownIds.add(chosen.systemNumber);
    // Store the remaining items in the pool for use by load more
    categoryPool[category.id] = [];
    for (let i = 0; i < fresh.length; i++) {
      if (i !== randomIdx) {
        categoryPool[category.id].push(fresh[i]);
      }
    }
  } else {
    cache[category.id] = null;
    categoryPool[category.id] = [];
  }
}

async function getNextItemForCategory(category) {
  // Draw from the pool first (leftover items from previously fetched pages)
  if (categoryPool[category.id] && categoryPool[category.id].length > 0) {
    const pool = categoryPool[category.id];
    const randomIdx = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIdx];
    const newPool = [];
    for (let i = 0; i < pool.length; i++) {
      if (i !== randomIdx) {
        newPool.push(pool[i]);
      }
    }
    categoryPool[category.id] = newPool;
    shownIds.add(chosen.systemNumber);
    return chosen;
  }

  // Pool empty — keep fetching pages until we find a fresh item or run out of pages
  while (true) {
    const page = categoryNextPage[category.id] || 2;
    const results = await fetchCategoryPageData(category, page);
    categoryNextPage[category.id] = page + 1;

    if (results.length === 0) {
      // No more pages left for this category
      return null;
    }

    const fresh = [];
    for (let i = 0; i < results.length; i++) {
      if (!shownIds.has(results[i].systemNumber)) {
        fresh.push(results[i]);
      }
    }

    if (fresh.length === 0) {
      // Every result on this page was already shown — try the next page
      continue;
    }

    const randomIdx = Math.floor(Math.random() * fresh.length);
    const chosen = fresh[randomIdx];
    shownIds.add(chosen.systemNumber);
    categoryPool[category.id] = [];
    for (let i = 0; i < fresh.length; i++) {
      if (i !== randomIdx) {
        categoryPool[category.id].push(fresh[i]);
      }
    }
    return chosen;
  }
}

async function loadCategories() {
  const allCategories = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    for (let j = 0; j < group.subcategories.length; j++) {
      allCategories.push(group.subcategories[j]);
    }
  }

  for (let i = 0; i < allCategories.length; i += batchSize) {
    const currentBatch = allCategories.slice(i, i + batchSize);
    const fetchPromises = [];
    for (let j = 0; j < currentBatch.length; j++) {
      fetchPromises.push(fetchCategory(currentBatch[j]));
    }
    await Promise.all(fetchPromises);
    if (i + batchSize < allCategories.length) {
      await new Promise(function(resolve) {
        setTimeout(resolve, batchDelay);
      });
    }
  }
}


function getYear(dateText) {
  if (dateText == null) {
    return '';
  }
  const yearMatch = dateText.match(/\d{4}/);
  if (yearMatch) {
    return yearMatch[0];
  }
  return '';
}

function makeCard(item, cssClass, subcategoryId) {
  const card = document.createElement('article');
  card.className = 'object-card ' + cssClass;
  card.dataset.group = cssClass;
  card.dataset.originalGroup = cssClass;
  card.dataset.subcategory = subcategoryId;
  card.dataset.systemNumber = item.systemNumber;

  let itemTitle;
  if (item._primaryTitle && item.objectType)  {
    itemTitle = item._primaryTitle + ' (' + item.objectType + ')';
  } else if (item.objectType) {
    itemTitle = item.objectType;
  } else {
    itemTitle = 'Untitled';
  }

  const imgId = item._primaryImageId;
  const itemDate = item._primaryDate || '';
  const itemYear = getYear(itemDate);
  const itemPlace = item._primaryPlace || '';

  const imgBase = imageUrl + "/" + imgId + "/full";
  const smallImg = imgBase + "/!400,400/0/default.jpg";
  const medImg = imgBase + "/!800,800/0/default.jpg";
  const largeImg = imgBase + "/!1200,1200/0/default.jpg";

  let dateMarkup;
  if (itemDate) {
    dateMarkup = '<time datetime="' + itemYear + '">' + itemDate + '</time>';
  } else {
    dateMarkup = 'Date unknown';
  }

  card.innerHTML =
    '<div class="card-thumb" aria-hidden="true">' +
      '<picture>' +
        '<source media="(min-width: 1000px)" srcset="' + largeImg + '">' +
        '<source media="(min-width: 600px)" srcset="' + medImg + '">' +
        '<img src="' + smallImg + '" alt="" width="600" height="600" loading="lazy">' +
      '</picture>' +
    '</div>' +
    '<div class="card-inner">' +
      '<button type="button" class="card-close" aria-label="Close">&#x00D7;</button>' +
      '<h3><a class="card-link" href="details.html?id=' + item.systemNumber + '">' + itemTitle + '</a></h3>' +
      '<figure>' +
        '<picture>' +
          '<source media="(min-width: 1000px)" srcset="' + largeImg + '">' +
          '<source media="(min-width: 600px)" srcset="' + medImg + '">' +
          '<img src="' + smallImg + '" alt="' + itemTitle + '" width="600" height="600" loading="lazy">' +
        '</picture>' +
      '</figure>' +
      '<dl class="metadata"></dl>' +
      '<section class="description">' +
        '<p class="date">' + dateMarkup + '</p>' +
        '<p class="creator"></p>' +
        '<p class="detail-text"></p>' +
      '</section>' +
    '</div>';

  var closeBtn = card.querySelector('.card-close');
  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    card.classList.remove('is-hovered');
    closeBtn.blur();
  });

  var cardThumb = card.querySelector('.card-thumb');
  cardThumb.addEventListener('click', function() {
    if (!card.classList.contains('is-hovered')) {
      activateCard();
    }
  });

  let hasLoaded = false;
  let extraImageIds = [];

  async function loadDetail() {
    if (!hasLoaded) {
      hasLoaded = true;

      try {
      const response = await fetch(apiBase + "/museumobject/" + item.systemNumber);
      const jsonData = await response.json();
      const itemInfo = jsonData.record;

      const metaList = card.querySelector('dl.metadata');
      let metaHtml = '';

      const collCode = itemInfo.collectionCode;
      let collText = null;
      if (collCode != null) {
        collText = collCode.text;
      }
      const collName = normalizeCollection(collText);

      if (collName) {
        let collectionId = null;
        if (collCode != null) {
          collectionId = collCode.id;
        }
        let collectionLink;
        if (collectionId) {
          collectionLink = '<a href="browse/collections/property.html?id=' + collectionId + '" class="meta-link">' + collName + '</a>';
        } else {
          collectionLink = collName;
        }
        metaHtml += '<dt>Collection</dt><dd>' + collectionLink + '</dd><hr aria-hidden="true">';
      }

      let categoryList = itemInfo.categories;
      if (categoryList == null) {
        categoryList = [];
      }
      if (categoryList.length > 0) {
        metaHtml += '<dt>Categories</dt>';
        for (let i = 0; i < categoryList.length; i++) {
          const cat = categoryList[i];
          const categoryText = cat.text || cat.name || '';
          const categoryLabel = normalizeCategory(categoryText, cat.id);
          if (cat.id) {
            metaHtml += '<dd><a href="browse/categories/property.html?id=' + cat.id + '" class="meta-link">' + categoryLabel + '</a></dd>';
          } else {
            metaHtml += '<dd>' + categoryLabel + '</dd>';
          }
        }
        if (itemPlace) {
          metaHtml += '<hr aria-hidden="true">';
        }
      }

      if (itemPlace) {
        let originId = null;
        if (itemInfo.placesOfOrigin != null && itemInfo.placesOfOrigin.length > 0) {
          const originEntry = itemInfo.placesOfOrigin[0];
          if (originEntry.place != null) {
            originId = originEntry.place.id;
          }
        }
        const originLabel = normalizePlace(itemPlace, originId);
        let originLink;
        if (originId) {
          originLink = '<a href="browse/origins/property.html?id=' + originId + '" class="meta-link">' + originLabel + '</a>';
        } else {
          originLink = originLabel;
        }
        metaHtml += '<dt>Origin</dt><dd>' + originLink + '</dd>';
      }

      metaList.innerHTML = metaHtml;

      const creatorPara = card.querySelector('p.creator');
      if (creatorPara) {
        let creatorName = '';
        if (itemInfo.artistMakerPerson != null && itemInfo.artistMakerPerson.length > 0 && itemInfo.artistMakerPerson[0].name != null) {
          creatorName = itemInfo.artistMakerPerson[0].name.text;
        } else if (itemInfo.artistMakerOrganisations != null && itemInfo.artistMakerOrganisations.length > 0 && itemInfo.artistMakerOrganisations[0].name != null) {
          creatorName = itemInfo.artistMakerOrganisations[0].name.text;
        } else if (item._primaryMaker != null) {
          creatorName = item._primaryMaker.name;
        }

        let creatorRole = '';
        if (itemInfo.artistMakerPerson != null && itemInfo.artistMakerPerson.length > 0 && itemInfo.artistMakerPerson[0].association != null) {
          creatorRole = itemInfo.artistMakerPerson[0].association.text;
        } else if (itemInfo.artistMakerOrganisations != null && itemInfo.artistMakerOrganisations.length > 0 && itemInfo.artistMakerOrganisations[0].association != null) {
          creatorRole = itemInfo.artistMakerOrganisations[0].association.text;
        } else if (item._primaryMaker != null) {
          creatorRole = item._primaryMaker.association;
        }

        let roleLabel = '';
        if (creatorRole) {
          roleLabel = normalizeAssociation(creatorRole);
        }

        let creatorId = null;
        if (itemInfo.artistMakerPerson != null && itemInfo.artistMakerPerson.length > 0 && itemInfo.artistMakerPerson[0].name != null) {
          creatorId = itemInfo.artistMakerPerson[0].name.id;
        } else if (itemInfo.artistMakerOrganisations != null && itemInfo.artistMakerOrganisations.length > 0 && itemInfo.artistMakerOrganisations[0].name != null) {
          creatorId = itemInfo.artistMakerOrganisations[0].name.id;
        }

        if (creatorName) {
          let creatorUrl;
          if (creatorId) {
            creatorUrl = 'browse/creators/property.html?id=' + creatorId;
          } else {
            creatorUrl = 'browse/creators/property.html?name=' + encodeURIComponent(creatorName);
          }

          if (creatorName.toLowerCase() === 'unknown') {
            creatorPara.innerHTML = 'Creator unknown';
          } else {
            let rolePrefix;
            if (roleLabel) {
              rolePrefix = roleLabel;
            } else {
              rolePrefix = 'Created by';
            }
            const nameLink = '<a href="' + creatorUrl + '" class="meta-link">' + creatorName + '</a>';
            creatorPara.innerHTML = rolePrefix + ': ' + nameLink;
          }
        }
      }

      const descPara = card.querySelector('p.detail-text');
      if (descPara) {
        if (itemInfo.briefDescription) {
          descPara.innerHTML = itemInfo.briefDescription;
        } else {
          descPara.innerHTML = '';
        }
      }

      if (itemInfo.images != null) {
        for (let k = 1; k < itemInfo.images.length && k <= 3; k++) {
          extraImageIds.push(itemInfo.images[k]);
        }
      }

    } catch (error) {
      console.error('Detail fetch failed for ' + item.systemNumber + ':', error);
    }
  }

  requestAnimationFrame(function() {
    if (extraImageIds.length === 0) {
      return;
    }

    const figureEl = card.querySelector('figure');
    const pictureEl = card.querySelector('picture');
    const metaList = card.querySelector('dl.metadata');
    const gap = metaList.offsetHeight - pictureEl.offsetHeight;

    console.log('[extra images] metaList height:', metaList.offsetHeight, '| picture height:', pictureEl.offsetHeight, '| gap:', gap);

    let imagesToAdd = 0;
    if (gap > 150) {
      imagesToAdd = 1;
    }
    if (gap > 350) {
      imagesToAdd = 2;
    }
    if (imagesToAdd > extraImageIds.length) {
      imagesToAdd = extraImageIds.length;
    }

    console.log('[extra images] adding', imagesToAdd, 'image(s)');

    if (imagesToAdd === 0) {
      return;
    }

    const eachImageHeight = Math.floor(gap / imagesToAdd);

    for (let k = 0; k < imagesToAdd; k++) {
      const newImg = document.createElement('img');
      newImg.src = imageUrl + "/" + extraImageIds[k] + "/full/!800,800/0/default.jpg";
      newImg.alt = itemTitle;
      newImg.className = 'extra-image';
      newImg.style.height = eachImageHeight + 'px';
      figureEl.appendChild(newImg);
    }
  });
  }

  let hoverTimer;

  function activateCard() {
    if (card.classList.contains('is-hovered')) { return; }
    const rect = card.getBoundingClientRect();
    if (rect.right + rect.width * 2 > window.innerWidth) {
      card.classList.add('expand-left');
    } else {
      card.classList.remove('expand-left');
    }
    const cardGrid = card.closest('.objects-grid');
    const allGridCards = cardGrid.querySelectorAll('.object-card');
    const visibleCards = [];
    for (let i = 0; i < allGridCards.length; i++) {
      if (allGridCards[i].offsetParent !== null) {
        visibleCards.push(allGridCards[i]);
      }
    }
    const cardIndex = visibleCards.indexOf(card);
    const columnCount = getComputedStyle(cardGrid).gridTemplateColumns.trim().split(/\s+/).length;
    if (cardIndex >= visibleCards.length - columnCount) {
      card.classList.add('expand-up');
      const mainRect = document.querySelector('main').getBoundingClientRect();
      card.style.setProperty('--expand-bottom', (rect.bottom - mainRect.bottom) + 'px');
    } else {
      card.classList.remove('expand-up');
    }
    card.classList.add('is-hovered');
    loadDetail();
  }

  card.addEventListener('mouseenter', function() {
    hoverTimer = setTimeout(activateCard, 200);
  });
  card.addEventListener('focus', loadDetail);
  card.addEventListener('mouseleave', function() {
    clearTimeout(hoverTimer);
    card.classList.remove('is-hovered');
    const extras = card.querySelectorAll('.extra-image');
    for (let i = 0; i < extras.length; i++) {
      extras[i].remove();
    }
  });

  return card;
}

function buildFilterGroups(tier) {
  const filterList = document.getElementById('filter-groups');
  filterList.innerHTML = '';

  const labelLi = document.createElement('li');
  labelLi.id = 'filter-label-item';
  const labelBtn = document.createElement('button');
  labelBtn.id = 'clear-filter-btn';
  labelBtn.type = 'button';
  labelBtn.disabled = true;
  labelBtn.setAttribute('aria-label', 'Clear active filter');
  labelBtn.addEventListener('click', clearFilter);
  const labelSpan = document.createElement('span');
  labelSpan.className = 'filter-label-text';
  labelSpan.textContent = 'Filter by:';
  const clearSpan = document.createElement('span');
  clearSpan.className = 'filter-clear-text';
  clearSpan.textContent = '× Clear filter';
  clearSpan.setAttribute('aria-hidden', 'true');
  labelBtn.appendChild(labelSpan);
  labelBtn.appendChild(clearSpan);
  labelLi.appendChild(labelBtn);
  filterList.appendChild(labelLi);

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const visibleSubs = [];
    for (let j = 0; j < group.subcategories.length; j++) {
      if (group.subcategories[j].minTier <= tier) {
        visibleSubs.push(group.subcategories[j]);
      }
    }

    if (visibleSubs.length === 0) continue;

    const popoverId = group.class + '-subgroups';

    const li = document.createElement('li');
    li.className = group.class;
    li.addEventListener('click', function() { filterByGroup(group.class); });

    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('popovertarget', popoverId);
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = group.name;
    li.appendChild(btn);

    filterList.appendChild(li);

    const subUl = document.createElement('ul');
    subUl.id = popoverId;
    subUl.setAttribute('popover', '');
    subUl.className = 'subgroups';

    for (let j = 0; j < visibleSubs.length; j++) {
      const sub = visibleSubs[j];
      const subLi = document.createElement('li');
      subLi.textContent = sub.name;
      subLi.addEventListener('click', function(e) {
        e.stopPropagation();
        subUl.hidePopover();
        filterBySubgroup(group.class, sub.id);
      });
      subUl.appendChild(subLi);
    }

    filterList.appendChild(subUl);
  }
}

function showCards(tier) {
  grid.innerHTML = '';
  buildFilterGroups(tier);

  // Group lists
  const groupItems = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const items = [];
    for (let j = 0; j < group.subcategories.length; j++) {
      const category = group.subcategories[j];
      if (category.minTier <= tier) {
        const item = cache[category.id];
        if (item) {
          items.push({ item: item, cssClass: group.class, subcategoryId: category.id });
        }
      }
    }
    if (items.length > 0) {
      groupItems.push(items);
    }
  }

  // Shuffle the groups
  for (let i = groupItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = groupItems[i];
    groupItems[i] = groupItems[j];
    groupItems[j] = tmp;
  }
  // Shuffle within each group
  for (let g = 0; g < groupItems.length; g++) {
    const items = groupItems[g];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
  }

  // Interleave groups so categories alternate, then do a final shuffle
  const ordered = [];
  let round = 0;
  while (true) {
    let added = false;
    for (let g = 0; g < groupItems.length; g++) {
      if (round < groupItems[g].length) {
        ordered.push(groupItems[g][round]);
        added = true;
      }
    }
    if (!added) break;
    round++;
  }

  for (let i = ordered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = ordered[i];
    ordered[i] = ordered[j];
    ordered[j] = tmp;
  }

  for (let i = 0; i < ordered.length; i++) {
    const card = makeCard(ordered[i].item, ordered[i].cssClass, ordered[i].subcategoryId);
    grid.appendChild(card);
  }
}

async function fetchDetailCategories(systemNumber) {
  if (categoryCache[systemNumber] !== undefined) return;
  try {
    const response = await fetch(apiBase + "/museumobject/" + systemNumber);
    const jsonData = await response.json();
    let cats = jsonData.record.categories;
    if (cats == null) {
      cats = [];
    }
    const ids = [];
    for (let i = 0; i < cats.length; i++) {
      if (cats[i].id) {
        ids.push(cats[i].id);
      }
    }
    categoryCache[systemNumber] = ids;
  } catch (e) {
    categoryCache[systemNumber] = [];
  }
}

async function loadAllDetailCategories() {
  const cards = document.querySelectorAll('.object-card');
  const sysNums = [];
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].dataset.systemNumber) {
      sysNums.push(cards[i].dataset.systemNumber);
    }
  }

  for (let i = 0; i < sysNums.length; i += batchSize) {
    const batch = sysNums.slice(i, i + batchSize);
    const fetchPromises = [];
    for (let j = 0; j < batch.length; j++) {
      fetchPromises.push(fetchDetailCategories(batch[j]));
    }
    await Promise.all(fetchPromises);
    if (i + batchSize < sysNums.length) {
      await new Promise(function(resolve) { setTimeout(resolve, batchDelay); });
    }
  }
}

function setCardGroupClass(card, groupClass) {
  for (let i = 0; i < groups.length; i++) {
    card.classList.remove(groups[i].class);
  }
  card.classList.add(groupClass);
}


function showClearButton() {
  const btn = document.getElementById('clear-filter-btn');
  if (!btn) { return; }
  btn.disabled = false;
  btn.classList.add('active');
  const filterGroups = document.getElementById('filter-groups');
  if (filterGroups) { filterGroups.classList.add('filter-active'); }
}

function hideClearButton() {
  const btn = document.getElementById('clear-filter-btn');
  if (!btn) { return; }
  btn.disabled = true;
  btn.classList.remove('active');
  const filterGroups = document.getElementById('filter-groups');
  if (filterGroups) { filterGroups.classList.remove('filter-active'); }
}

function clearFilter() {
  activeSubcategory = null;
  activeGroupClass = null;
  const allCards = document.querySelectorAll('.object-card');
  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i];
    setCardGroupClass(card, card.dataset.originalGroup);
    card.classList.remove('disabled');
    card.classList.remove('selected');
  }
  const filterItems = document.querySelectorAll('#filter-groups li');
  for (let i = 0; i < filterItems.length; i++) {
    const li = filterItems[i];
    li.classList.remove('selected');
    const btn = li.querySelector('button');
    if (btn) {
      btn.setAttribute('aria-pressed', 'false');
    }
  }
  hideClearButton();
}

function filterByGroup(groupName) {
  const activeBtn = document.querySelector('#filter-groups li.selected button');
  if (activeBtn) {
    const liClass = activeBtn.closest('li').className.replace(' selected', '');
    if (liClass === groupName) {
      clearFilter();
      return;
    }
  }
  activeSubcategory = null;
  activeGroupClass = groupName;
  const allCards = document.querySelectorAll('.object-card');
  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i];
    setCardGroupClass(card, card.dataset.originalGroup);
    if (card.dataset.group !== groupName) {
      card.classList.add('disabled');
      card.classList.remove('selected');
    } else {
      card.classList.remove('disabled');
      card.classList.add('selected');
    }
  }
  const filterItems = document.querySelectorAll('#filter-groups li');
  for (let i = 0; i < filterItems.length; i++) {
    const li = filterItems[i];
    const liClass = li.className.replace(' selected', '');
    const pressed = liClass === groupName;
    if (pressed) {
      li.classList.add('selected');
    } else {
      li.classList.remove('selected');
    }
    const btn = li.querySelector('button');
    if (btn) {
      if (pressed) {
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.setAttribute('aria-pressed', 'false');
      }
    }
  }
  showClearButton();
}

function filterBySubgroup(groupClass, subcategoryId) {
  if (activeSubcategory === subcategoryId) {
    clearFilter();
    return;
  }
  activeSubcategory = subcategoryId;
  activeGroupClass = groupClass;
  const allCards = document.querySelectorAll('.object-card');
  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i];
    const sysNum = card.dataset.systemNumber;
    const apiCats = categoryCache[sysNum];
    let matches = false;
    if (apiCats) {
      for (let j = 0; j < apiCats.length; j++) {
        if (apiCats[j] === subcategoryId) {
          matches = true;
          break;
        }
      }
    } else {
      matches = card.dataset.subcategory === subcategoryId;
    }
    if (!matches) {
      setCardGroupClass(card, card.dataset.originalGroup);
      card.classList.add('disabled');
      card.classList.remove('selected');
    } else {
      setCardGroupClass(card, groupClass);
      card.classList.remove('disabled');
      card.classList.add('selected');
    }
  }
  const filterItems = document.querySelectorAll('#filter-groups li');
  for (let i = 0; i < filterItems.length; i++) {
    const li = filterItems[i];
    const liClass = li.className.replace(' selected', '');
    const pressed = liClass === groupClass;
    if (pressed) {
      li.classList.add('selected');
    } else {
      li.classList.remove('selected');
    }
    const btn = li.querySelector('button');
    if (btn) {
      if (pressed) {
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.setAttribute('aria-pressed', 'false');
      }
    }
  }
  showClearButton();
}

async function startPage() {
  try {
    await loadCategories();
    const currentTier = tierMap[Number(slider.value)];
    applyDensity(Number(slider.value));
    showCards(currentTier);

    var overlay = document.getElementById("loading-overlay");
    if (overlay !== null) {
      overlay.classList.add("hidden");
    }
    const bodyChildren = document.body.children;
    for (let i = 0; i < bodyChildren.length; i++) {
      bodyChildren[i].removeAttribute('inert');
    }

    loadAllDetailCategories();
  } catch (error) {
    console.error('Error loading museum data:', error);
    grid.innerHTML = '<p class="error" role="alert">Sorry, we couldn\'t load the gallery right now.</p>';
  }
}

function applyDensity(value) {
  if (value === 1) {
    grid.classList.add('compact');
  } else {
    grid.classList.remove('compact');
  }
  if (value === 3) {
    grid.classList.add('dense');
  } else {
    grid.classList.remove('dense');
  }
}

slider.addEventListener('input', function() {
  const value = Number(slider.value);
  applyDensity(value);
  const currentTier = tierMap[value];
  showCards(currentTier);
  loadAllDetailCategories();
});

document.querySelector('span.less').addEventListener('click', function() {
  slider.value = Math.max(Number(slider.min), Number(slider.value) - 1);
  slider.dispatchEvent(new Event('input'));
});

document.querySelector('span.more').addEventListener('click', function() {
  slider.value = Math.min(Number(slider.max), Number(slider.value) + 1);
  slider.dispatchEvent(new Event('input'));
});

var filterToggle = document.getElementById('filter-toggle');
if (filterToggle) {
  filterToggle.addEventListener('click', function() {
    var filterList = document.getElementById('filter-groups');
    var isOpen = filterList.classList.toggle('open');
    filterToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

async function loadMore() {
  const loadMoreBtn = document.getElementById('load-more');
  loadMoreBtn.disabled = true;
  loadMoreBtn.textContent = 'Loading...';

  // Log all system numbers already on the page so we can confirm no repeats
  var alreadyShown = Array.from(shownIds);
  console.log('[load-more] System numbers already shown:', alreadyShown);

  const sliderValue = Number(slider.value);
  const tier = tierMap[sliderValue];

  // Collect only the categories that are active at the current tier.
  // This means tier 1 (value 20) loads fewer items than tier 3 (value 40),
  // matching the number of cards shown by the initial load at that tier.
  const activeCategories = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    for (let j = 0; j < group.subcategories.length; j++) {
      const category = group.subcategories[j];
      if (category.minTier <= tier) {
        activeCategories.push({ category: category, cssClass: group.class });
      }
    }
  }

  // Fetch one new item per active category, in batches to respect rate limits
  const newItems = [];
  for (let i = 0; i < activeCategories.length; i += batchSize) {
    const batch = activeCategories.slice(i, i + batchSize);

    // Kick off all fetches in this batch at once
    const fetchPromises = [];
    for (let k = 0; k < batch.length; k++) {
      fetchPromises.push(getNextItemForCategory(batch[k].category));
    }
    const results = await Promise.all(fetchPromises);

    // Pair each result back with its category info
    for (let k = 0; k < results.length; k++) {
      if (results[k] != null) {
        newItems.push({
          item: results[k],
          cssClass: batch[k].cssClass,
          subcategoryId: batch[k].category.id
        });
      }
    }

    if (i + batchSize < activeCategories.length) {
      await new Promise(function(resolve) { setTimeout(resolve, batchDelay); });
    }
  }

  // Log the newly added system numbers
  const newIds = [];
  for (let i = 0; i < newItems.length; i++) {
    newIds.push(newItems[i].item.systemNumber);
  }
  console.log('[load-more] New system numbers added:', newIds);

  // If every category came back empty there is nothing left to show
  if (newItems.length === 0) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'No more items to load';
    return;
  }

  // Shuffle the new items before appending
  for (let i = newItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = newItems[i];
    newItems[i] = newItems[j];
    newItems[j] = tmp;
  }

  const existingCardCount = grid.querySelectorAll('.object-card').length;

  for (let i = 0; i < newItems.length; i++) {
    const card = makeCard(newItems[i].item, newItems[i].cssClass, newItems[i].subcategoryId);
    grid.appendChild(card);
  }

  // If a filter is currently active, apply it to the new cards and reorder the grid
  if (activeGroupClass !== null || activeSubcategory !== null) {
    const allCards = grid.querySelectorAll('.object-card');
    for (let i = existingCardCount; i < allCards.length; i++) {
      const card = allCards[i];
      let isSelected = false;
      if (activeSubcategory !== null) {
        isSelected = card.dataset.subcategory === activeSubcategory;
        if (isSelected) {
          setCardGroupClass(card, activeGroupClass || card.dataset.originalGroup);
        }
      } else if (activeGroupClass !== null) {
        isSelected = card.dataset.group === activeGroupClass;
      }
      if (isSelected) {
        card.classList.remove('disabled');
        card.classList.add('selected');
      } else {
        card.classList.add('disabled');
        card.classList.remove('selected');
      }
    }
  }

  loadAllDetailCategories();

  loadMoreBtn.disabled = false;
  loadMoreBtn.textContent = 'Load More';
}

document.getElementById('load-more').addEventListener('click', loadMore);

startPage();
