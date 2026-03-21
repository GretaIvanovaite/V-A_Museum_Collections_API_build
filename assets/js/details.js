const API_BASE = "https://api.vam.ac.uk/v2";
const IMAGE_CDN = "https://framemark.vam.ac.uk/collections";

const params = new URLSearchParams(window.location.search);
const objectId = params.get('id');

if (!objectId) {
  const mainContent = document.getElementById('main-content');
  if (mainContent) mainContent.innerHTML = '<p>No object specified.</p>';
} else {
  loadObject(objectId);
}

// --- DATA FETCHING ---
async function loadObject(id) {
  try {
    const res = await fetch(`${API_BASE}/museumobject/${id}`);
    const data = await res.json();
    console.log(data.record);
    renderDetails(data.record);
  } catch (err) {
    console.error('Failed to load object:', err);
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.innerHTML = '<p>Failed to load object details.</p>';
  }
}

// --- HELPERS ---
const toggleSection = (selector, content) => {
  const element = document.querySelector(selector);
  if (!element) return;
  const section = element.closest('section');
  
  if (content && content.toString().trim() !== "" && content !== '<dd>Not recorded</dd>') {
    element.innerHTML = content;
    if (section) section.style.display = 'block';
  } else {
    if (section) section.style.display = 'none';
  }
};

function renderGallery(record, title) {
  const imageId = record.images?.[0];
  const allImages = record.images || [];
  const mainFigure = document.querySelector('.main-display');

  if (imageId && mainFigure) {
    const base = `${IMAGE_CDN}/${imageId}/full`;
    mainFigure.innerHTML = `
      <picture>
        <source media="(min-width: 1000px)" srcset="${base}/!1200,1200/0/default.jpg">
        <img src="${base}/!600,600/0/default.jpg" alt="${title}">
      </picture>`;

    const strip = document.querySelector('.thumbnail-strip');
    if (strip && allImages.length > 1) {
      strip.innerHTML = allImages.slice(0, 6).map(imgId => `
        <button type="button" data-image-id="${imgId}">
          <img src="${IMAGE_CDN}/${imgId}/full/!100,100/0/default.jpg" alt="Gallery image">
        </button>`).join('');

      strip.onclick = (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const newBase = `${IMAGE_CDN}/${btn.dataset.imageId}/full`;
        mainFigure.innerHTML = `<picture><img src="${newBase}/!1200,1200/0/default.jpg" alt="${title}"></picture>`;
      };
    }
  }
}

const createLink = (text, id, type) => {
  if (!text || text.toLowerCase() === 'unknown') return text || 'Unknown';
  return `<a href="browse/${type}/property.html?id=${id}" class="meta-link">${text}</a>`;
};

function renderExpandable(selector, content) {
  const container = document.querySelector(selector);
  if (!container) return;
  const wrapper = container.closest('details');
  if (content && content.trim() !== "") {
    container.innerHTML = content;
    wrapper.style.display = 'block';
  } else {
    wrapper.style.display = 'none';
  }
}

function renderDetails(record) {
  // --- TITLE & HEADERS ---
  const title = record._primaryTitle || record.titles?.[0]?.title || record.objectType || 'Untitled';
  document.querySelector('h1').textContent = title;
  document.title = `${title} | Collections & Archives`;

  // --- SECTION 1: IMAGES ---
  renderGallery(record, title);

  // --- SECTION 1: QUICK FACTS ---
  const quickFactsDl = document.querySelector('.quick-facts dl');
  if (quickFactsDl) {
    let html = '';
    const addGroup = (label, value) => {
      if (!value || value === 'Unknown') return;
      html += `<dt>${label}</dt><dd>${value}</dd>`;
    };

    addGroup('Collection', createLink(normalizeCollection(record.collectionCode?.text), record.collectionCode?.id, 'collections'));
    addGroup('Object Type', record.objectType);

    // Artist/Maker
    const makers = (record.artistMakerPerson || []);
    if (makers.length > 0) {
      html += `<dt>Artist/Maker</dt>`;
      makers.forEach(m => {
        const nameLink = createLink(m.name.text, m.name.id, 'artists');
        const assoc = m.association?.text ? ` (${m.association.text})` : '';
        html += `<dd>${nameLink}${assoc}</dd>`;
      });
    }

    const dateObj = record.productionDates?.[0];
    if (dateObj) addGroup('Date', `${dateObj.date.text}${dateObj.association?.text ? ` (${dateObj.association.text})` : ''}`);

    const placeObj = record.placesOfOrigin?.[0];
    if (placeObj) addGroup('Place of Origin', `${createLink(normalizePlace(placeObj.place.text, placeObj.place.id), placeObj.place.id, 'origins')}${placeObj.association?.text ? ` (${placeObj.association.text})` : ''}`);

    if (record.categories?.length) {
      html += `<dt>Categories</dt>`;
      record.categories.forEach(c => html += `<dd>${createLink(normalizeCategory(c.text, c.id), c.id, 'categories')}</dd>`);
    }

    quickFactsDl.innerHTML = html;
  }

  // --- SECTION 1: DESCRIPTION (The "All or Nothing" check) ---
  const hasDesc = record.briefDescription || record.summaryDescription || record.historicalContext || record.galleryLabels?.length || record.objectHistory;
  const descSection = document.querySelector('section[aria-labelledby="desc-heading"]');
  
  if (hasDesc) {
    descSection.style.display = 'block';
    document.querySelector('.brief-desc').innerHTML = record.briefDescription || '';
    document.querySelector('.summary-desc').innerHTML = record.summaryDescription || '';
    renderExpandable('.historical-content', record.historicalContext);
    renderExpandable('.object-history', record.objectHistory); 
    if (record.galleryLabels?.length) renderExpandable('.museum-label', record.galleryLabels[0].text);
  } else {
    descSection.style.display = 'none';
  }

  // --- SECTION 2: PHYSICAL CHARACTERISTICS ---
  let physHtml = '';
  if (record.materials?.length) {
    physHtml += `<dt>Materials</dt>${record.materials.map(m => {
      const group = (typeof getMaterialGroup === 'function') ? getMaterialGroup(m.id) : null;
      const href  = group
        ? `../browse/materials/property.html?id=${group.ids.join(',')}`
        : (m.id ? `../browse/materials/property.html?id=${m.id}` : null);
      const label = (group && group.name) || m.text;
      return href ? `<dd><a href="${href}">${label}</a></dd>` : `<dd>${label}</dd>`;
    }).join('')}`;
  }
  if (record.techniques?.length) physHtml += `<dt>Techniques</dt>${record.techniques.map(t => `<dd>${t.text}</dd>`).join('')}`;
  
  if (record.dimensions?.length) {
    physHtml += `<dt>Dimensions</dt>`;
    record.dimensions.forEach(d => physHtml += `<dd>${d.dimension}: ${d.value} ${d.unit || ''}</dd>`);
    if (record.dimensionsNote) physHtml += `<dd class="note"><em>${record.dimensionsNote}</em></dd>`;
  }
  
  if (record.physicalDescription) physHtml += `<dt>Physical Description</dt><dd>${record.physicalDescription}</dd>`;
  
  // Only show if physHtml actually contains tags
  toggleSection('.physical-characteristics dl', physHtml);

  // --- SECTION 3: MUSEUM INFORMATION ---
  let museumHtml = '';
  if (record.galleryLocations?.[0]?.current) museumHtml += `<dt>Gallery Location</dt><dd>${record.galleryLocations[0].current.text}</dd>`;
  museumHtml += `<dt>Museum Number</dt><dd>${record.accessionNumber}</dd>`;
  if (record.creditLine) museumHtml += `<dt>Credit Line</dt><dd>${record.creditLine}</dd>`;
  museumHtml += `<dt>Copyright</dt><dd>© Victoria and Albert Museum, London</dd>`;
  
  toggleSection('.museum-info dl', museumHtml);

  // --- SECTION 4: RELATED OBJECTS ---
  const relatedData = record.associatedObjects || [];
  const relatedGrid = document.querySelector('.objects-grid');
  const relatedSection = document.querySelector('section[aria-labelledby="related-heading"]');

  if (relatedData.length > 0 && relatedGrid) {
    relatedSection.style.display = 'block';
    relatedGrid.innerHTML = relatedData.map(obj => `
      <div class="related-card">
        <p>${obj.title || obj.objectType}</p>
      </div>
    `).join('');
  } else if (relatedSection) {
    relatedSection.style.display = 'none';
  }
}

async function loadRelatedArtefacts(record) {
  const grid = document.querySelector('.objects-grid');
  const section = document.querySelector('section[aria-labelledby="related-heading"]');
  if (!grid) return;

  // Build a query based on your priority order
  let query = '';
  if (record.artistMakerPerson?.[0]?.name?.text) {
    query = `q_actor="${record.artistMakerPerson[0].name.text}"`;
  } else {
    query = `q_collection="${record.collectionCode.text}"`;
  }

  try {
    // We request 10 to ensure we find 5 with images after filtering
    const res = await fetch(`${API_BASE}/search?${query}&page_size=10&images_exist=1`);
    const data = await res.json();
    
    // Filter out the current object so it doesn't recommend itself
    const filtered = data.records
      .filter(r => r.systemNumber !== record.systemNumber)
      .slice(0, 5);

    if (filtered.length > 0) {
      section.style.display = 'block';
      grid.innerHTML = filtered.map(item => {
        const artist = item._primaryMaker?.name || 'Maker unknown';
        const date = item._primaryDate || 'Date unknown';
        const imgId = item._images?._primary_thumbnail || item.images?.[0];
        
        return `
          <div class="related-item-card">
            <a href="details.html?id=${item.systemNumber}">
              <img src="${IMAGE_CDN}/${imgId}/full/!300,300/0/default.jpg" alt="${item.objectType}">
              <div class="related-meta">
                <strong>${item.objectType}</strong>
                <p>${date}</p>
                <span>${artist}</span>
              </div>
            </a>
          </div>
        `;
      }).join('');
    } else {
      section.style.display = 'none';
    }
  } catch (err) {
    console.error("Related fetch failed", err);
    section.style.display = 'none';
  }
}
