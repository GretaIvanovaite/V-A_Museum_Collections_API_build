const apiBase  = 'https://api.vam.ac.uk/v2';
const imageUrl  = 'https://framemark.vam.ac.uk/collections';
const grid      = document.getElementById('objects-grid');
const slider    = document.getElementById('density-slider');

/* Page type */
let pageType = null;
const pathname = window.location.pathname;
if      (pathname.indexOf('/collections/') !== -1) { pageType = 'collections'; }
else if (pathname.indexOf('/categories/')  !== -1) { pageType = 'categories';  }
else if (pathname.indexOf('/materials/')   !== -1) { pageType = 'materials';   }
else if (pathname.indexOf('/origins/')     !== -1) { pageType = 'origins';     }
else if (pathname.indexOf('/creators/')    !== -1) { pageType = 'creators';    }

const urlParams         = new URLSearchParams(window.location.search);
const propertyId        = urlParams.get('id');
let propertyIds = [];
if (propertyId) { propertyIds = propertyId.split(','); }
const propertyNameParam = urlParams.get('name');

/* API params */
const API_PARAMS = {
  collections: 'id_collection',
  categories:  'id_category',
  materials:   'id_material',
  origins:     'id_place',
  creators:    'id_maker'
};
const apiParam = API_PARAMS[pageType];

/* Tier map */
const tierMap = { 1: 20, 2: 30, 3: 40 };

/* Name map */
const NAME_MAP = {
  /* Collections */
  'THES48595':  'Prints, Drawings & Paintings',
  'THES48602':  'Theatre and Performance',
  'THES48596':  'East Asia',
  'THES48601':  'Textiles and Fashion',
  'THES48594':  'Ceramics',
  'THES48598':  'South & South East Asia',
  'THES291628': 'Department of Photography',
  'THES48599':  'Metalwork',
  'THES48593':  'Young V&A',
  'THES270009': 'V&A Wedgwood',
  'THES48600':  'Sculpture',
  'THES48607':  'Middle East Section',
  'THES48597':  'Furniture and Woodwork',
  'THES48605':  'National Art Library',
  'THES260586': 'Design, Architecture & Digital',
  'THES264787': 'Exhibitions Department',
  'THES359557': 'V&A East',
  'THES48604':  'Archive of Art and Design',
  'THES48606':  'Circulation Dept (1909\u20131977)',
  /* Categories */
  'THES48903':  'Prints',
  'THES48968':  'Designs',
  'THES48966':  'Drawings',
  'THES48910':  'Photographs',
  'THES48885':  'Textiles',
  'THES48982':  'Ceramics',
  'THES48959':  'Entertainment & Leisure',
  'THES48957':  'Fashion',
  'THES48993':  'Architecture',
  'THES48906':  'Portraits',
  'THES48920':  'Metalwork',
  'THES48975':  'Clothing',
  'THES49044':  'Womenswear',
  'THES49038':  'Ornament Prints',
  'THES281081': 'The Royal Photographic Society',
  'THES252963': 'Posters',
  'THES252988': 'Topography',
  'THES48917':  'Paintings',
  'THES250537': 'Theatre',
  'THES48938':  'Illustration',
  'THES48986':  'Books',
  'THES49001':  'Advertising',
  'THES48922':  'Manuscripts',
  'THES252985': 'Ephemera',
  'THES288636': 'Albums',
  'THES48930':  'Jewellery',
  'THES48998':  'Accessories',
  'THES48960':  'Embroidery',
  'THES48926':  'Lace',
  'THES49043':  "Men's Clothes",
  'THES48946':  'Glass',
  'THES48992':  'Arms & Armour',
  'THES276060': 'V&A Wedgwood Collection',
  'THES253065': 'Music',
  'THES48947':  'Games',
  'THES48980':  'Children & Childhood',
  'THES48956':  'Fashion Plates',
  'THES48948':  'Furniture',
  'THES48933':  'Interiors',
  'THES48884':  'Tiles',
  'THES270451': 'Plaster Casts',
  /* Materials */
  'x30308':    'Paper',
  'AAT15012':  'Ink',
  'AAT187371': 'Printing ink',
  'x30347':    'Pencil',
  'AAT14190':  'Photographic paper',
  'x33202':    'Watercolour',
  'x30618':    'Pen and ink',
  'AAT15045':  'Watercolour (paint)',
  'x29356':    'Earthenware',
  'AAT243428': 'Silk (textile)',
  'x30344':    'Card',
  'x32505':    'Pen and ink and watercolour',
  'AAT10797':  'Glass',
  'AAT10662':  'Porcelain',
  'AAT14067':  'Cotton (textile)',
  'AAT11029':  'Silver',
  'AAT11051':  'Wash',
  /* Origins */
  'x32019':    'Great Britain',
  'x28980':    'London',
  'x28826':    'England',
  'x28849':    'France',
  'x29068':    'Paris',
  'x29399':    'Japan',
  'x28927':    'Italy',
  'x28873':    'Germany',
  'x28842':    'Europe',
  'x29398':    'China',
  'THES253239':'North Europe',
  'x29181':    'Staffordshire',
  'x29336':    'United Kingdom',
  'x29512':    'Egypt',
  'x29333':    'United States',
  'x29790':    'India',
  'x29020':    'Netherlands',
  'x29170':    'Spain',
  'x33200':    'Etruria'
};

/* Init overlay */
(function() {
  const children = document.body.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].id !== 'loading-overlay') {
      children[i].setAttribute('inert', '');
    }
  }
  const mainEl = document.getElementById('main-content');
  if (mainEl) { mainEl.setAttribute('aria-busy', 'true'); }
}());

/* Popover focus */
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

/* Utilities */

function getYear(dateText) {
  if (dateText == null) { return ''; }
  const m = dateText.match(/\d{4}/);
  if (m) { return m[0]; }
  return '';
}


/* Card building */

function makeCard(item) {
  const card = document.createElement('article');
  card.className = 'object-card';
  card.dataset.systemNumber = item.systemNumber;

  let itemTitle;
  if (item._primaryTitle && item.objectType) {
    itemTitle = item._primaryTitle + ' (' + toSentenceCase(item.objectType) + ')';
  } else if (item.objectType) {
    itemTitle = toSentenceCase(item.objectType);
  } else {
    itemTitle = 'Untitled';
  }

  const imgId    = item._primaryImageId;
  let itemDate = '';
  if (item._primaryDate) { itemDate = item._primaryDate; }
  const itemYear = getYear(itemDate);
  let itemPlace = '';
  if (item._primaryPlace) { itemPlace = item._primaryPlace; }

  const imgBase  = imageUrl + '/' + imgId + '/full';
  const smallImg = imgBase + '/!400,400/0/default.jpg';
  const medImg   = imgBase + '/!800,800/0/default.jpg';
  const largeImg = imgBase + '/!1200,1200/0/default.jpg';

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
      '<h3><a class="card-link" href="../../details.html?id=' + item.systemNumber + '">' + itemTitle + '</a></h3>' +
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

  async function loadDetail() {
    if (hasLoaded) { return; }
    hasLoaded = true;
    try {
      const response = await fetch(apiBase + '/museumobject/' + item.systemNumber);
      const jsonData  = await response.json();
      const itemInfo  = jsonData.record;

      const metaList = card.querySelector('dl.metadata');
      let metaHtml = '';

      /* Collection */
      const collCode = itemInfo.collectionCode;
      let collText = null;
      if (collCode) { collText = collCode.text; }
      let collName = null;
      if (collText) { collName = normalizeCollection(collText); }
      if (collName) {
        let collectionId = null;
        if (collCode) { collectionId = collCode.id; }
        let collectionLink;
        if (collectionId) {
          collectionLink = '<a href="../collections/property.html?id=' + collectionId + '&name=' + encodeURIComponent(collName) + '" class="meta-link">' + collName + '</a>';
        } else {
          collectionLink = collName;
        }
        metaHtml += '<dt>Collection</dt><dd>' + collectionLink + '</dd><hr aria-hidden="true">';
      }

      /* Categories */
      const categoryList = itemInfo.categories || [];
      if (categoryList.length > 0) {
        metaHtml += '<dt>Categories</dt>';
        for (let i = 0; i < categoryList.length; i++) {
          const cat           = categoryList[i];
          let categoryText = '';
          if (cat.text) { categoryText = cat.text; } else if (cat.name) { categoryText = cat.name; }
          const categoryLabel = normalizeCategory(categoryText, cat.id);
          if (cat.id) {
            metaHtml += '<dd><a href="../categories/property.html?id=' + cat.id + '&name=' + encodeURIComponent(categoryLabel) + '" class="meta-link">' + categoryLabel + '</a></dd>';
          } else {
            metaHtml += '<dd>' + categoryLabel + '</dd>';
          }
        }
        if (itemPlace) { metaHtml += '<hr aria-hidden="true">'; }
      }

      /* Origin */
      if (itemPlace) {
        let originId = null;
        if (itemInfo.placesOfOrigin && itemInfo.placesOfOrigin.length > 0) {
          const originEntry = itemInfo.placesOfOrigin[0];
          if (originEntry.place) { originId = originEntry.place.id; }
        }
        const originLabel = normalizePlace(itemPlace, originId);
        let originLink;
        if (originId) {
          originLink = '<a href="../origins/property.html?id=' + originId + '&name=' + encodeURIComponent(originLabel) + '" class="meta-link">' + originLabel + '</a>';
        } else {
          originLink = originLabel;
        }
        metaHtml += '<dt>Origin</dt><dd>' + originLink + '</dd>';
      }

      metaList.innerHTML = metaHtml;

      /* Creator */
      const creatorPara = card.querySelector('p.creator');
      if (creatorPara) {
        let creatorName = '';
        if (itemInfo.artistMakerPerson && itemInfo.artistMakerPerson.length > 0 && itemInfo.artistMakerPerson[0].name) {
          creatorName = itemInfo.artistMakerPerson[0].name.text;
        } else if (itemInfo.artistMakerOrganisations && itemInfo.artistMakerOrganisations.length > 0 && itemInfo.artistMakerOrganisations[0].name) {
          creatorName = itemInfo.artistMakerOrganisations[0].name.text;
        } else if (item._primaryMaker) {
          creatorName = item._primaryMaker.name;
        }

        let creatorRole = '';
        if (itemInfo.artistMakerPerson && itemInfo.artistMakerPerson.length > 0 && itemInfo.artistMakerPerson[0].association) {
          creatorRole = itemInfo.artistMakerPerson[0].association.text;
        } else if (itemInfo.artistMakerOrganisations && itemInfo.artistMakerOrganisations.length > 0 && itemInfo.artistMakerOrganisations[0].association) {
          creatorRole = itemInfo.artistMakerOrganisations[0].association.text;
        } else if (item._primaryMaker) {
          creatorRole = item._primaryMaker.association;
        }

        let roleLabel = '';
        if (creatorRole) { roleLabel = normalizeAssociation(creatorRole); }

        let creatorId = null;
        if (itemInfo.artistMakerPerson && itemInfo.artistMakerPerson.length > 0 && itemInfo.artistMakerPerson[0].name) {
          creatorId = itemInfo.artistMakerPerson[0].name.id;
        } else if (itemInfo.artistMakerOrganisations && itemInfo.artistMakerOrganisations.length > 0 && itemInfo.artistMakerOrganisations[0].name) {
          creatorId = itemInfo.artistMakerOrganisations[0].name.id;
        }

        if (creatorName) {
          let creatorUrl;
          if (creatorId) {
            creatorUrl = '../creators/property.html?id=' + creatorId + '&name=' + encodeURIComponent(creatorName);
          } else {
            creatorUrl = '../creators/property.html?name=' + encodeURIComponent(creatorName);
          }
          if (creatorName.toLowerCase() === 'unknown') {
            creatorPara.innerHTML = 'Creator unknown';
          } else {
            let rolePrefix;
            if (roleLabel) { rolePrefix = roleLabel; } else { rolePrefix = 'Created by'; }
            const nameLink   = '<a href="' + creatorUrl + '" class="meta-link">' + creatorName + '</a>';
            creatorPara.innerHTML = rolePrefix + ': ' + nameLink;
          }
        }
      }

      /* Description */
      const descPara = card.querySelector('p.detail-text');
      if (descPara) {
        if (itemInfo.briefDescription) {
          descPara.innerHTML = itemInfo.briefDescription;
        } else {
          descPara.innerHTML = '';
        }
      }

    } catch (error) {
      console.error('Detail fetch failed for ' + item.systemNumber + ':', error);
    }
  }

  function activateCard() {
    if (card.classList.contains('is-hovered')) { return; }
    const rect = card.getBoundingClientRect();
    if (rect.right + rect.width * 2 > window.innerWidth) {
      card.classList.add('expand-left');
    } else {
      card.classList.remove('expand-left');
    }
    card.classList.remove('expand-up');
    card.classList.add('is-hovered');
    loadDetail();
    requestAnimationFrame(function() {
      var footer = document.querySelector('footer');
      var inner = card.querySelector('.card-inner');
      if (inner && footer && inner.getBoundingClientRect().bottom > footer.getBoundingClientRect().top) {
        var mainRect = document.querySelector('main').getBoundingClientRect();
        card.classList.add('expand-up');
        card.style.setProperty('--expand-bottom', (rect.bottom - mainRect.bottom) + 'px');
      }
    });
  }

  let hoverTimer;
  card.addEventListener('mouseenter', function() {
    hoverTimer = setTimeout(activateCard, 200);
  });
  card.addEventListener('focus', loadDetail);
  card.addEventListener('mouseleave', function() {
    clearTimeout(hoverTimer);
    card.classList.remove('is-hovered');
    var extras = card.querySelectorAll('.extra-image');
    for (var ei = 0; ei < extras.length; ei++) { extras[ei].remove(); }
  });

  return card;
}

/* Pool & pagination */

const pool     = [];
const shownIds = new Set();
let hasMore    = true;
let batchCount = 0;
const fetchPageSize = 40;
let pageQueue  = [];

function buildApiUrl(page) {
  let url = apiBase + '/objects/search?images_exist=1&page_size=' + fetchPageSize + '&page=' + page;
  if (propertyIds.length > 0 && apiParam) {
    for (let i = 0; i < propertyIds.length; i++) {
      url += '&' + apiParam + '=' + encodeURIComponent(propertyIds[i]);
    }
  } else if (pageType === 'creators' && propertyNameParam) {
    url += '&q_actor=' + encodeURIComponent(propertyNameParam);
  }
  return url;
}

async function fetchPage(page) {
  const response = await fetch(buildApiUrl(page));
  return response.json();
}

/* Page queue */
function buildPageQueue(totalPages) {
  const pages = [];
  for (let i = 2; i <= totalPages; i++) { pages.push(i); }
  for (let i = pages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pages[i]; pages[i] = pages[j]; pages[j] = tmp;
  }
  return pages;
}

function poolRecords(records) {
  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    if (!item._primaryImageId) { continue; }
    if (shownIds.has(item.systemNumber)) { continue; }
    shownIds.add(item.systemNumber);
    pool.push(item);
  }
}

/* Render pool */
function renderPool() {
  const currentRendered = grid.querySelectorAll('.object-card').length;
  for (let i = currentRendered; i < pool.length; i++) {
    grid.appendChild(makeCard(pool[i]));
  }
}

/* Tier & density */

function hasCachedItems() {
  return pool.length > batchCount * tierMap[Number(slider.value)];
}

function updateLoadMoreBtn() {
  const btn = document.getElementById('load-more');
  if (!btn) { return; }
  if (!hasMore && !hasCachedItems()) {
    btn.disabled    = true;
    btn.textContent = 'No more items';
  } else {
    btn.disabled    = false;
    btn.textContent = 'Load More';
  }
}

function applyTier(value) {
  if (value === 1) { grid.classList.add('compact'); }    else { grid.classList.remove('compact'); }
  if (value === 3) { grid.classList.add('dense'); }      else { grid.classList.remove('dense'); }

  const showCount = Math.min(pool.length, batchCount * tierMap[value]);
  const allCards  = grid.querySelectorAll('.object-card');
  for (let i = 0; i < allCards.length; i++) {
    if (i < showCount) { allCards[i].classList.remove('card-hidden'); }
    else               { allCards[i].classList.add('card-hidden'); }
  }

  updateLoadMoreBtn();
}

slider.addEventListener('input', function() {
  applyTier(Number(slider.value));
});

document.querySelector('span.less').addEventListener('click', function() {
  slider.value = Math.max(Number(slider.min), Number(slider.value) - 1);
  slider.dispatchEvent(new Event('input'));
});

document.querySelector('span.more').addEventListener('click', function() {
  slider.value = Math.min(Number(slider.max), Number(slider.value) + 1);
  slider.dispatchEvent(new Event('input'));
});

/* Load more */

async function loadMore() {
  const btn = document.getElementById('load-more');

  if (hasMore) {
    btn.disabled    = true;
    btn.textContent = 'Loading\u2026';
    try {
      const poolBefore = pool.length;
      while (pageQueue.length > 0 && pool.length === poolBefore) {
        const page = pageQueue.shift();
        try {
          const data    = await fetchPage(page);
          const records = data.records || [];
          poolRecords(records);
        } catch (e) {
          /* Skip page */
        }
      }
      if (pageQueue.length === 0) { hasMore = false; }
      if (pool.length > poolBefore) {
        batchCount++;
        renderPool();
      }
      applyTier(Number(slider.value));
    } catch (error) {
      console.error('Load more failed:', error);
      updateLoadMoreBtn();
    }
  } else if (hasCachedItems()) {
    batchCount++;
    applyTier(Number(slider.value));
  }
}

document.getElementById('load-more').addEventListener('click', loadMore);

/* Init */

async function startPage() {
  let group = null;
  if (pageType === 'materials' && propertyIds.length > 1 && typeof getMaterialGroup === 'function') {
    group = getMaterialGroup(propertyIds[0]);
  }

  let displayName;
  if (propertyNameParam) {
    displayName = (pageType === 'materials') ? toSentenceCase(propertyNameParam) : propertyNameParam;
  } else if (group && group.name) {
    displayName = group.name;
  } else if (NAME_MAP[propertyId]) {
    displayName = NAME_MAP[propertyId];
  } else {
    let mappedNames = [];
    for (let di = 0; di < propertyIds.length; di++) {
      if (NAME_MAP[propertyIds[di]]) {
        mappedNames.push(NAME_MAP[propertyIds[di]]);
      }
    }
    if (mappedNames.length > 0) {
      displayName = mappedNames.join(' & ');
    } else if (propertyId) {
      displayName = propertyId;
    } else {
      displayName = 'Results';
    }
  }

  const pageTitle         = document.getElementById('page-title');
  const breadcrumbCurrent = document.getElementById('breadcrumb-current');

  if (pageTitle) {
    pageTitle.textContent = displayName;
    document.title        = displayName + ' | Collections \u0026 Archives';
  }
  if (breadcrumbCurrent) {
    if (pageType === 'creators') {
      breadcrumbCurrent.textContent = 'Creator: ' + displayName;
    } else {
      breadcrumbCurrent.textContent = displayName;
    }
  }

  window.chatContext = { page: 'browse', type: pageType, name: displayName };

  try {
    const data       = await fetchPage(1);
    const records    = data.records || [];
    let recordCount;
    if (data.info && data.info.record_count) {
      recordCount = data.info.record_count;
    } else {
      recordCount = records.length;
    }
    const totalPages  = Math.max(1, Math.ceil(recordCount / fetchPageSize));
    pageQueue         = buildPageQueue(totalPages);
    if (pageQueue.length === 0) { hasMore = false; }
    if (recordCount < 20) {
      var densityControls = document.getElementById('density-controls');
      if (densityControls) { densityControls.hidden = true; }
    }
    poolRecords(records);
    batchCount++;
    renderPool();
    applyTier(Number(slider.value));
  } catch (error) {
    console.error('Error loading data:', error);
    grid.innerHTML = '<p class="error" role="alert">Sorry, we couldn\u2019t load the data right now.</p>';
  }

  const overlay = document.getElementById('loading-overlay');
  if (overlay) { overlay.classList.add('hidden'); }
  const bodyChildren = document.body.children;
  for (let i = 0; i < bodyChildren.length; i++) {
    bodyChildren[i].removeAttribute('inert');
  }
  const mainEl = document.getElementById('main-content');
  if (mainEl) { mainEl.removeAttribute('aria-busy'); }

  updateLoadMoreBtn();
}

startPage();
