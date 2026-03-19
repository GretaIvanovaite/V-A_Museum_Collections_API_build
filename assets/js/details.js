const API_BASE = "https://api.vam.ac.uk/v2";
const IMAGE_CDN = "https://framemark.vam.ac.uk/collections";

const params = new URLSearchParams(window.location.search);
const objectId = params.get('id');

// --- INITIALIZATION ---
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

const createLink = (text, id, type) => {
  if (!text || text.toLowerCase() === 'unknown') return text || 'Unknown';
  return `<a href="browse/${type}/property.html?id=${id}" class="meta-link">${text}</a>`;
};

// --- CORE RENDERING ---
function renderDetails(record) {
  const title = record._primaryTitle || record.objectType || 'Untitled';
  const h1 = document.querySelector('h1');
  if (h1) h1.textContent = title;
  document.title = `${title} | Collections & Archives`;

  // 1. Breadcrumb
  const breadcrumb = document.querySelector('.breadcrumb-nav ol');
  if (breadcrumb) {
    const cleanColl = normalizeCollection(record.collectionCode?.text);
    breadcrumb.innerHTML = `
      <li><a href="index.html">Home</a></li>
      ${record.collectionCode ? `<li><a href="#">${cleanColl}</a></li>` : ''}
      <li aria-current="page">${title}</li>
    `;
  }

  // 2. Image Gallery Logic
  renderGallery(record, title);

  // 3. Quick Facts (The 6 Required Fields with Helper)
  const quickFactsDl = document.querySelector('.quick-facts dl');
  if (quickFactsDl) {
    let html = '';

    // The Helper Function
    const addGroup = (label, values) => {
      const valArray = Array.isArray(values) ? values : [values];
      const validValues = valArray.filter(v => v && v !== 'Unknown' && v !== 'Not specified');
      
      if (validValues.length === 0) return;

      html += `<dt>${label}</dt>`;
      validValues.forEach(val => {
        html += `<dd>${val}</dd>`;
      });
    };

    // Field 1: Object Type
    addGroup('Object type', record.objectType);

    // Field 2: Artist/Maker
    const makers = (record.artistMakerPerson || []).map(m => 
      createLink(m.name.text, m.name.id, 'artists')
    );
    addGroup('Artist/Maker', makers);

    // Field 3: Date
    addGroup('Date', record.productionDates?.[0]?.date?.text);

    // Field 4: Place of Origin
    const rawPlace = record.placesOfOrigin?.[0]?.place?.text;
    addGroup('Place of origin', createLink(normalizePlace(rawPlace), '', 'origins'));

    // Field 5: Categories
    const categories = (record.categories || []).map(c => 
      createLink(normalizeCategory(c.text), c.id, 'categories')
    );
    addGroup('Categories', categories);

    // Field 6: Collection
    addGroup('Collection', createLink(normalizeCollection(record.collectionCode?.text), record.collectionCode?.id, 'collections'));

    quickFactsDl.innerHTML = html;
  }

  // 4. Content Sections (Using toggleSection for auto-hide)
  toggleSection('.brief-desc', record.briefDescription);
  toggleSection('.summary-desc', record.summaryDescription);
  toggleSection('.historical-content', record.historicalContext || record.objectHistory);

  // 5. Physical Characteristics
  let physHtml = '';
  if (record.materials?.length) {
    physHtml += `<dt>Materials</dt>${record.materials.map(m => `<dd>${m.text}</dd>`).join('')}`;
  }
  if (record.techniques?.length) {
    physHtml += `<dt>Techniques</dt>${record.techniques.map(t => `<dd>${t.text}</dd>`).join('')}`;
  }
  toggleSection('.physical-characteristics dl', physHtml);

  // 6. Museum Info
  const museumHtml = `
    <dt>System Number</dt><dd>${record.systemNumber}</dd>
    <dt>Accession Number</dt><dd>${record.accessionNumber}</dd>
  `;
  toggleSection('.museum-info dl', museumHtml);
}

// --- SUPPORTING FUNCTIONS ---

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