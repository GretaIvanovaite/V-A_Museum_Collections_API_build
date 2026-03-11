const API_BASE = "https://api.vam.ac.uk/v2";
const IMAGE_CDN = "https://framemark.vam.ac.uk/collections";
const grid = document.getElementById("objects-grid");
const slider = document.getElementById("density-slider");

// Maps slider value (1/2/3) to content tier (20/30/40)
const TIER_MAP = { 1: 20, 2: 30, 3: 40 };

const GROUPS = [
  {
    name: 'Photography and media',
    class: 'photography',
    subcategories: [
      {name: 'Photographs',        id: 'THES48910',  minTier: 20 },
      {name: 'Posters',            id: 'THES252963', minTier: 20 },
      {name: 'Prints',             id: 'THES48903',  minTier: 20 },
      {name: 'Books',              id: 'THES48986',  minTier: 20 },
      {name: 'Advertising',        id: 'THES49001',  minTier: 20 },
      {name: 'Manuscripts',        id: 'THES48922',  minTier: 30 },
      {name: 'Ephemera',           id: 'THES252985', minTier: 30 },
      {name: 'Ornament prints',    id: 'THES49038',  minTier: 40 },
      {name: 'The RPS Collection', id: 'THES281081', minTier: 40 },
      {name: 'Albums',             id: 'THES288636', minTier: 40 },
    ]
  },
  {
    name: 'Art and design',
    class: 'art',
    subcategories: [
      {name: 'Paintings',              id: 'THES48917',  minTier: 20 },
      {name: 'Portraits',              id: 'THES48906',  minTier: 20 },
      {name: 'Drawings',               id: 'THES48966',  minTier: 20 },
      {name: 'Sculpture',              id: 'THES48896',  minTier: 20 },
      {name: 'Illustration',           id: 'THES48938',  minTier: 30 },
      {name: 'Caricatures & Cartoons', id: 'THES48983',  minTier: 30 },
      {name: 'Topography',             id: 'THES252988', minTier: 40 },
      {name: 'Plaster Cast',           id: 'THES270451', minTier: 40 },
    ]
  },
  {
    name: 'Fashion and textiles',
    class: 'fashion',
    subcategories: [
      {name: 'Fashion',       id: 'THES48957', minTier: 20 },
      {name: 'Jewellery',     id: 'THES48930', minTier: 20 },
      {name: 'Textiles',      id: 'THES48885', minTier: 20 },
      {name: 'Accessories',   id: 'THES48998', minTier: 30 },
      {name: 'Embroidery',    id: 'THES48960', minTier: 30 },
      {name: 'Lace',          id: 'THES48926', minTier: 40 },
      {name: "Men's clothes", id: 'THES49043', minTier: 40 },
    ]
  },
  {
    name: 'Applied art and crafts',
    class: 'applied-art',
    subcategories: [
      {name: 'Ceramics',                id: 'THES48982',  minTier: 20 },
      {name: 'Metalwork',               id: 'THES48920',  minTier: 20 },
      {name: 'Glass',                   id: 'THES48946',  minTier: 20 },
      {name: 'Arms & Armour',           id: 'THES48992',  minTier: 30 },
      {name: 'V&A Wedgwood Collection', id: 'THES276060', minTier: 40 },
    ]
  },
  {
    name: 'Performance and leisure',
    class: 'performance',
    subcategories: [
      {name: 'Theatre',                 id: 'THES250537', minTier: 20 },
      {name: 'Music',                   id: 'THES253065', minTier: 20 },
      {name: 'Entertainment & Leisure', id: 'THES48959',  minTier: 20 },
      {name: 'Games',                   id: 'THES48947',  minTier: 30 },
      {name: 'Children & Childhood',    id: 'THES48980',  minTier: 30 },
      {name: 'Fashion plates',          id: 'THES48956',  minTier: 40 },
    ]
  },
  {
    name: 'Architecture and spaces',
    class: 'architecture',
    subcategories: [
      {name: 'Furniture',    id: 'THES48948', minTier: 20 },
      {name: 'Architecture', id: 'THES48993', minTier: 20 },
      {name: 'Interiors',    id: 'THES48933', minTier: 30 },
      {name: 'Tiles',        id: 'THES48884', minTier: 40 },
    ]
  },
];

// Cache: { 'THES48910': record, ... }
const cache = {};

// Fetch subcategories in batches to avoid triggering API rate limiting.
// Fires BATCH_SIZE requests at once, waits BATCH_DELAY ms, then fires the next batch.
const BATCH_SIZE = 8;
const BATCH_DELAY = 150; // ms between batches

async function fetchSubcategory(sub) {
  const res = await fetch(
    `${API_BASE}/objects/search?id_category=${sub.id}&images_exist=1&page_size=10&data_restrict=descriptive_only`
  );
  const data = await res.json();
  const records = data.records || [];
  cache[sub.id] = records.length
    ? records[Math.floor(Math.random() * records.length)]
    : null;
}

async function loadAllSubcategories() {
  const allSubs = GROUPS.flatMap(group =>
    group.subcategories.map(sub => ({ ...sub }))
  );

  for (let i = 0; i < allSubs.length; i += BATCH_SIZE) {
    const batch = allSubs.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(sub => fetchSubcategory(sub)));
    if (i + BATCH_SIZE < allSubs.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
    }
  }
}

// Extracts the first 4-digit year from a date string for <time datetime>
function extractYear(dateStr) {
  const match = dateStr?.match(/\d{4}/);
  return match ? match[0] : '';
}

function createCard(record, groupClass) {
  const article = document.createElement('article');
  article.className = `object-card group-${groupClass}`;
  article.dataset.group = groupClass;

  const title = record._primaryTitle || record.objectType || 'Untitled';
  const imageId = record._primaryImageId;
  const date = record._primaryDate || '';
  const year = extractYear(date);
  const place = record._primaryPlace || '';
  const base = `${IMAGE_CDN}/${imageId}/full`;
  const imgMobile  = `${base}/!400,400/0/default.jpg`;
  const imgDesktop = `${base}/!800,800/0/default.jpg`;
  const imgLarge   = `${base}/!1200,1200/0/default.jpg`;

  article.innerHTML = `
    <h3><a class="card-link" href="details.html?id=${record.systemNumber}">${title}</a></h3>
    <picture>
      <source media="(min-width: 1000px)" srcset="${imgLarge}">
      <source media="(min-width: 600px)" srcset="${imgDesktop}">
      <img
        src="${imgMobile}"
        alt="${title}"
        width="600"
        height="600"
        loading="lazy"
      >
    </picture>
    <dl class="metadata">
    </dl>
    <section class="description">
      <p class="date">${date ? `<time datetime="${year}">${date}</time>` : 'Date unknown'}</p>
      <p class="creator"></p>
      <p class="detail-text"></p>
    </section>
  `;

  // Lazy-load detail data (collection, categories, description) on first hover/focus.
  // These fields require a detail call and are only fetched once, then cached on the element.
  let detailLoaded = false;

  async function loadDetail() {
    if (detailLoaded) return;
    detailLoaded = true;

    try {
      const res = await fetch(`${API_BASE}/museumobject/${record.systemNumber}`);
      const data = await res.json();
      const detail = data.record;

      // Build dl content with linked collection, categories, and origin
      const dl = article.querySelector('dl.metadata');
      let dlContent = '';

      const collectionCode = detail.collectionCode;
      const collection = normalizeCollection(collectionCode?.text);
      if (collection) {
        const collId = collectionCode?.id;
        const collLink = collId
          ? `<a href="browse/collections/property.html?id=${collId}" class="meta-link">${collection}</a>`
          : collection;
        dlContent += `<dt>Collection</dt><dd>${collLink}</dd><hr aria-hidden="true">`;
      }

      const categories = detail.categories || [];
      if (categories.length) {
        dlContent += `<dt>Categories</dt>`;
        dlContent += categories.map(c => {
          const label = normalizeCategory(c.text || c.name || '');
          return c.id
            ? `<dd><a href="browse/categories/property.html?id=${c.id}" class="meta-link">${label}</a></dd>`
            : `<dd>${label}</dd>`;
        }).join('');
        if (place) dlContent += `<hr aria-hidden="true">`;
      }

      if (place) {
        const placeId = detail.placesOfOrigin?.[0]?.place?.id;
        const placeLabel = normalizePlace(place);
        const placeLink = placeId
          ? `<a href="browse/origins/property.html?id=${placeId}" class="meta-link">${placeLabel}</a>`
          : placeLabel;
        dlContent += `<dt>Origin</dt><dd>${placeLink}</dd>`;
      }

      dl.innerHTML = dlContent;

      // Populate creator with link
      const creatorP = article.querySelector('p.creator');
      if (creatorP) {
        const makerName = detail._primaryMaker?.name || record._primaryMaker?.name || '';
        const makerAssoc = detail._primaryMaker?.association || record._primaryMaker?.association || '';
        const assocLabel = makerAssoc ? normalizeAssociation(makerAssoc) : '';
        const personId = detail.artistMakerPerson?.[0]?.person?.id
          || detail.artistMakerOrganisations?.[0]?.organisation?.id;

        if (makerName) {
          const prefix = makerName.toLowerCase() === 'unknown'
            ? null
            : (assocLabel || 'Created by');
          const nameDisplay = personId
            ? `<a href="browse/creators/property.html?id=${personId}" class="meta-link">${makerName}</a>`
            : makerName;
          creatorP.innerHTML = makerName.toLowerCase() === 'unknown'
            ? 'Creator unknown'
            : `${prefix}: ${nameDisplay}`;
        }
      }

      // Populate short description
      const descP = article.querySelector('p.detail-text');
      if (descP) {
        descP.innerHTML = detail.briefDescription || '';
      }
    } catch (err) {
      console.error(`Detail fetch failed for ${record.systemNumber}:`, err);
    }
  }

  article.addEventListener('mouseenter', loadDetail);
  article.addEventListener('focus', loadDetail);

  return article;
}

function renderTier(tier) {
  grid.innerHTML = '';
  for (const group of GROUPS) {
    const visibleSubs = group.subcategories.filter(sub => sub.minTier <= tier);
    for (const sub of visibleSubs) {
      const record = cache[sub.id];
      if (record) grid.appendChild(createCard(record, group.class));
    }
  }
}

async function loadHomepage() {
  try {
    await loadAllSubcategories();
    renderTier(TIER_MAP[Number(slider.value)]);
  } catch (error) {
    console.error('Error loading museum data:', error);
    grid.innerHTML = `<p class="error">Sorry, we couldn't load the gallery right now.</p>`;
  }
}

slider.addEventListener('input', () => {
  renderTier(TIER_MAP[Number(slider.value)]);
});

loadHomepage();
