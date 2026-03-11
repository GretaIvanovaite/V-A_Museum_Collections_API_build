const API_BASE = "https://api.vam.ac.uk/v2";
const IMAGE_CDN = "https://framemark.vam.ac.uk/collections";

const params = new URLSearchParams(window.location.search);
const objectId = params.get('id');

if (!objectId) {
  document.getElementById('main-content').innerHTML = '<p>No object specified.</p>';
} else {
  loadObject(objectId);
}

async function loadObject(id) {
  try {
    const res = await fetch(`${API_BASE}/museumobject/${id}`);
    const data = await res.json();
    const record = data.record;

    renderDetails(record);
  } catch (err) {
    console.error('Failed to load object:', err);
    document.getElementById('main-content').innerHTML = '<p>Failed to load object details.</p>';
  }
}

function renderDetails(record) {
  const title = record._primaryTitle || record.objectType || 'Untitled';
  const date = record._primaryDate || '';
  const year = date.match(/\d{4}/)?.[0] || '';
  const place = record._primaryPlace || '';
  const maker = record._primaryMaker?.name || '';
  const association = record._primaryMaker?.association
    ? normalizeAssociation(record._primaryMaker.association)
    : '';
  const collection = normalizeCollection(record.collectionCode?.text);
  const categories = (record.categories || []).map(c => normalizeCategory(c.text || c.name || '')).filter(Boolean);
  const materials = (record.materials || []).map(m => m.text).filter(Boolean);
  const techniques = (record.techniques || []).map(t => t.text).filter(Boolean);
  const physicalDescription = record.physicalDescription || '';
  const briefDescription = record.briefDescription || '';
  const summaryDescription = record.summaryDescription || '';
  const imageId = record._primaryImageId;
  const allImages = record.images || [];

  // Page title
  document.title = `${title} | Collections & Archives`;

  // Breadcrumb
  const breadcrumb = document.querySelector('.breadcrumb-nav ol');
  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <li><a href="index.html">Home</a></li>
      ${collection ? `<li><a href="#">${collection}</a></li>` : ''}
      <li aria-current="page">${title}</li>
    `;
  }

  // Main image
  if (imageId) {
    const base = `${IMAGE_CDN}/${imageId}/full`;
    const mainFigure = document.querySelector('.main-display');
    if (mainFigure) {
      mainFigure.innerHTML = `
        <picture>
          <source media="(min-width: 1000px)" srcset="${base}/!1200,1200/0/default.jpg">
          <source media="(min-width: 600px)" srcset="${base}/!800,800/0/default.jpg">
          <img src="${base}/!600,600/0/default.jpg" alt="${title}" width="1200" height="1200">
        </picture>
      `;
    }

    // Thumbnail strip for additional images
    const strip = document.querySelector('.thumbnail-strip');
    if (strip) {
      const extras = allImages.slice(0, 6);
      strip.innerHTML = extras.map(img => `
        <button type="button" data-image-id="${img.imageAssetId}">
          <img src="${IMAGE_CDN}/${img.imageAssetId}/full/!100,100/0/default.jpg" alt="" loading="lazy">
        </button>
      `).join('');

      strip.addEventListener('click', e => {
        const btn = e.target.closest('button[data-image-id]');
        if (!btn) return;
        const newId = btn.dataset.imageId;
        const newBase = `${IMAGE_CDN}/${newId}/full`;
        mainFigure.innerHTML = `
          <picture>
            <source media="(min-width: 1000px)" srcset="${newBase}/!1200,1200/0/default.jpg">
            <source media="(min-width: 600px)" srcset="${newBase}/!800,800/0/default.jpg">
            <img src="${newBase}/!600,600/0/default.jpg" alt="${title}" width="1200" height="1200">
          </picture>
        `;
      });
    }
  }

  // Descriptions
  const briefEl = document.querySelector('.brief-desc');
  if (briefEl) briefEl.innerHTML = briefDescription;

  const summaryEl = document.querySelector('.summary-desc');
  if (summaryEl) summaryEl.innerHTML = summaryDescription;

  const physicalEl = document.querySelector('.physical-desc');
  if (physicalEl) physicalEl.innerHTML = physicalDescription;

  // Physical characteristics
  const physDl = document.querySelector('.physical-characteristics dl');
  if (physDl) {
    let html = '';
    if (materials.length) html += `<dt>Materials</dt>${materials.map(m => `<dd>${m}</dd>`).join('')}`;
    if (techniques.length) html += `<dt>Techniques</dt>${techniques.map(t => `<dd>${t}</dd>`).join('')}`;
    if (record.dimensions?.length) {
      html += `<dt>Dimensions</dt>`;
      html += record.dimensions.map(d => `<dd>${d.dimension}: ${d.value}${d.units}</dd>`).join('');
    }
    physDl.innerHTML = html || '<dd>Not recorded</dd>';
  }

  // Quick facts sidebar
  const quickFacts = document.querySelector('.quick-facts');
  if (quickFacts) {
    let creatorText = '';
    if (maker) {
      if (maker.toLowerCase() === 'unknown') {
        creatorText = 'Creator unknown';
      } else {
        creatorText = `${association ? `${association}: ` : 'Created by: '}${maker}`;
      }
    }

    quickFacts.innerHTML = `
      <h2>${title}</h2>
      <dl>
        ${record.objectType ? `<dt>Object type</dt><dd>${record.objectType}</dd>` : ''}
        ${creatorText ? `<dt>Maker</dt><dd>${creatorText}</dd>` : ''}
        ${date ? `<dt>Date</dt><dd><time datetime="${year}">${date}</time></dd>` : ''}
        ${place ? `<dt>Place</dt><dd>${normalizePlace(place)}</dd>` : ''}
        ${categories.length ? `<dt>Categories</dt>${categories.map(c => `<dd>${c}</dd>`).join('')}` : ''}
        ${collection ? `<dt>Collection</dt><dd>${collection}</dd>` : ''}
        ${record.accessionNumber ? `<dt>Accession number</dt><dd>${record.accessionNumber}</dd>` : ''}
      </dl>
    `;
  }
}
