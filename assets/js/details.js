const API_BASE = "https://api.vam.ac.uk/v2";
const IMAGE_CDN = "https://framemark.vam.ac.uk/collections";

const usedImageIds = {};

function pickUnused(candidates) {
  for (let i = 0; i < candidates.length; i++) {
    if (!usedImageIds[candidates[i]]) {
      usedImageIds[candidates[i]] = true;
      return candidates[i];
    }
  }
  return null;
}

async function fetchCandidateImages(filterParam) {
  try {
    const url = API_BASE + '/objects/search?' + filterParam + '&page_size=5&images_exist=1&fields=_primaryImageId';
    const res = await fetch(url);
    const data = await res.json();
    const records = data.records || [];
    const ids = [];
    for (let i = 0; i < records.length; i++) {
      if (records[i]._primaryImageId) { ids.push(records[i]._primaryImageId); }
    }
    return ids;
  } catch (e) {
    return [];
  }
}

const params = new URLSearchParams(window.location.search);
const objectId = params.get('id');

if (!objectId) {
  const mainContent = document.getElementById('main-content');
  if (mainContent) { mainContent.innerHTML = '<p>No object specified.</p>'; }
} else {
  loadObject(objectId);
}

function removeOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) { overlay.classList.add('hidden'); }
}

async function loadObject(id) {
  try {
    const res = await fetch(API_BASE + '/museumobject/' + id);
    const data = await res.json();
    renderDetails(data.record);
  } catch (err) {
    console.error('Failed to load object:', err);
    const mainContent = document.getElementById('main-content');
    if (mainContent) { mainContent.innerHTML = '<p role="alert">Failed to load object details.</p>'; }
  } finally {
    removeOverlay();
  }
}

function toggleSection(selector, content) {
  const element = document.querySelector(selector);
  if (!element) { return; }
  const section = element.closest('section');
  if (content && content.toString().trim() !== '' && content !== '<dd>Not recorded</dd>') {
    element.innerHTML = content;
    if (section) { section.style.display = 'block'; }
  } else {
    if (section) { section.style.display = 'none'; }
  }
}

function renderGallery(record, title) {
  const allImages = record.images || [];
  let imageId = null;
  if (allImages.length > 0) { imageId = allImages[0]; }
  const mainFigure = document.querySelector('.main-display');

  if (imageId && mainFigure) {
    const base = IMAGE_CDN + '/' + imageId + '/full';
    mainFigure.innerHTML =
      '<picture>' +
        '<source media="(min-width: 1000px)" srcset="' + base + '/!1200,1200/0/default.jpg">' +
        '<img src="' + base + '/!600,600/0/default.jpg" alt="' + title + '">' +
      '</picture>';

    const strip = document.querySelector('.thumbnail-strip');
    if (strip) { strip.style.display = 'none'; }
    if (strip && allImages.length > 1) {
      strip.style.display = '';
      let thumbHtml = '';
      for (let i = 0; i < allImages.length; i++) {
        thumbHtml +=
          '<button type="button" data-image-id="' + allImages[i] + '">' +
            '<img src="' + IMAGE_CDN + '/' + allImages[i] + '/full/!100,100/0/default.jpg" alt="Gallery image ' + (i + 1) + '">' +
          '</button>';
      }
      strip.innerHTML = thumbHtml;

      strip.addEventListener('click', function(e) {
        const btn = e.target.closest('button[data-image-id]');
        if (!btn) { return; }
        const newBase = IMAGE_CDN + '/' + btn.dataset.imageId + '/full';
        mainFigure.innerHTML =
          '<picture>' +
            '<img src="' + newBase + '/!1200,1200/0/default.jpg" alt="' + title + '">' +
          '</picture>';
      });

      if (allImages.length > 1) {
        const wrapper = document.createElement('div');
        wrapper.className = 'thumb-nav';
        strip.parentNode.insertBefore(wrapper, strip);
        wrapper.appendChild(strip);

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'thumb-nav-btn';
        prevBtn.setAttribute('aria-label', 'Scroll thumbnails left');
        prevBtn.innerHTML = '&#8249;';

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'thumb-nav-btn';
        nextBtn.setAttribute('aria-label', 'Scroll thumbnails right');
        nextBtn.innerHTML = '&#8250;';

        wrapper.insertBefore(prevBtn, strip);
        wrapper.appendChild(nextBtn);

        prevBtn.addEventListener('click', function() {
          strip.scrollBy({ left: -(strip.clientWidth - 50), behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', function() {
          strip.scrollBy({ left: strip.clientWidth - 50, behavior: 'smooth' });
        });

        function updateThumbNav() {
          const overflows = strip.scrollWidth > strip.clientWidth;
          prevBtn.style.display = overflows ? '' : 'none';
          nextBtn.style.display = overflows ? '' : 'none';
        }
        updateThumbNav();
        window.addEventListener('resize', updateThumbNav);
      }
    }
  }
}

function createLink(text, id, type) {
  if (!text || text.toLowerCase() === 'unknown') { return text || 'Unknown'; }
  return '<a href="browse/' + type + '/property.html?id=' + id + '&name=' + encodeURIComponent(text) + '" class="meta-link">' + text + '</a>';
}

function renderExpandable(selector, content) {
  const container = document.querySelector(selector);
  if (!container) { return; }
  const wrapper = container.closest('details');
  if (content && content.trim() !== '') {
    container.innerHTML = content;
    wrapper.style.display = 'block';
  } else {
    wrapper.style.display = 'none';
  }
}

function renderDetails(record) {
  let title = record._primaryTitle || toSentenceCase(record.objectType) || 'Untitled';
  if (!title && record.titles && record.titles.length > 0) {
    title = record.titles[0].title;
  }
  document.querySelector('h1').textContent = title;
  document.title = title + ' | Collections & Archives';
  const breadcrumbCurrent = document.querySelector('nav ol li[aria-current="page"]');
  if (breadcrumbCurrent) { breadcrumbCurrent.textContent = title; }

  renderGallery(record, title);

  const ctxMakers = record.artistMakerPerson || [];
  let ctxMakerName = '';
  if (ctxMakers.length > 0 && ctxMakers[0].name) { ctxMakerName = ctxMakers[0].name.text; }
  const ctxCollCode = record.collectionCode;
  let ctxCollName = '';
  if (ctxCollCode) { ctxCollName = normalizeCollection(ctxCollCode.text); }
  let ctxDate = '';
  if (record.productionDates && record.productionDates.length > 0) {
    ctxDate = record.productionDates[0].date.text;
  } else if (record._primaryDate) {
    ctxDate = record._primaryDate;
  }
  window.chatContext = {
    page: 'details',
    title: title,
    objectType: toSentenceCase(record.objectType) || '',
    date: ctxDate,
    maker: ctxMakerName,
    collection: ctxCollName,
    summary: record.summaryDescription || record.briefDescription || ''
  };

  const quickFactsDl = document.querySelector('.quick-facts dl');
  if (quickFactsDl) {
    let html = '';

    function hr() {
      if (html !== '') { html += '<hr aria-hidden="true">'; }
    }

    function addGroup(label, value) {
      if (!value || value === 'Unknown') { return; }
      hr();
      html += '<dt>' + label + '</dt><dd>' + value + '</dd>';
    }

    const collCode = record.collectionCode;
    let collText = null;
    if (collCode) { collText = collCode.text; }
    let collId = null;
    if (collCode) { collId = collCode.id; }
    addGroup('Collection', createLink(normalizeCollection(collText), collId, 'collections'));
    addGroup('Object Type', toSentenceCase(record.objectType));

    const makers = record.artistMakerPerson || [];
    const makerOrgs = record.artistMakerOrganisations || [];
    if (makers.length > 0 || makerOrgs.length > 0) {
      hr();
      html += '<dt>Artist/Maker</dt>';
      for (let i = 0; i < makers.length; i++) {
        const m = makers[i];
        const nameLink = createLink(m.name.text, m.name.id, 'creators');
        let assoc = '';
        if (m.association && m.association.text) { assoc = ' (' + m.association.text + ')'; }
        html += '<dd>' + nameLink + assoc + '</dd>';
      }
      for (let k = 0; k < makerOrgs.length; k++) {
        const org = makerOrgs[k];
        const orgLink = createLink(org.name.text, org.name.id, 'creators');
        let orgAssoc = '';
        if (org.association && org.association.text) { orgAssoc = ' (' + org.association.text + ')'; }
        html += '<dd>' + orgLink + orgAssoc + '</dd>';
      }
    }

    let dateObj = null;
    if (record.productionDates && record.productionDates.length > 0) { dateObj = record.productionDates[0]; }
    if (dateObj) {
      let dateAssoc = '';
      if (dateObj.association && dateObj.association.text) { dateAssoc = ' (' + dateObj.association.text + ')'; }
      addGroup('Date', dateObj.date.text + dateAssoc);
    }

    let placeObj = null;
    if (record.placesOfOrigin && record.placesOfOrigin.length > 0) { placeObj = record.placesOfOrigin[0]; }
    if (placeObj) {
      const placeId = placeObj.place.id;
      let placeAssoc = '';
      if (placeObj.association && placeObj.association.text) { placeAssoc = ' (' + placeObj.association.text + ')'; }
      addGroup('Place of Origin', createLink(normalizePlace(placeObj.place.text, placeId), placeId, 'origins') + placeAssoc);
    }

    if (record.categories && record.categories.length > 0) {
      hr();
      html += '<dt>Categories</dt>';
      for (let j = 0; j < record.categories.length; j++) {
        const c = record.categories[j];
        html += '<dd>' + createLink(normalizeCategory(c.text, c.id), c.id, 'categories') + '</dd>';
      }
    }

    quickFactsDl.innerHTML = html;
  }

  let hasBriefDesc = record.briefDescription || record.historicalContext || record.objectHistory;
  if (!hasBriefDesc && record.galleryLabels && record.galleryLabels.length > 0) {
    hasBriefDesc = true;
  }
  const descSection = document.querySelector('section[aria-labelledby="desc-heading"]');
  if (hasBriefDesc) {
    descSection.style.display = 'block';
    const briefEl = document.querySelector('.brief-desc');
    if (record.briefDescription && record.briefDescription.trim()) {
      briefEl.innerHTML = record.briefDescription;
    } else {
      briefEl.style.display = 'none';
    }
    renderExpandable('.historical-content', record.historicalContext);
    renderExpandable('.object-history', record.objectHistory);
    if (record.galleryLabels && record.galleryLabels.length > 0) {
      renderExpandable('.museum-label', record.galleryLabels[0].text);
    }
  } else {
    descSection.style.display = 'none';
  }

  const summarySection = document.querySelector('section[aria-label="Object summary"]');
  if (summarySection) {
    const summaryEl = document.querySelector('.summary-desc');
    if (record.summaryDescription && record.summaryDescription.trim()) {
      summaryEl.innerHTML = record.summaryDescription;
      summarySection.style.display = 'block';
    } else {
      summarySection.style.display = 'none';
    }
  }

  let physHtml = '';
  if (record.materials && record.materials.length > 0) {
    physHtml += '<li><span class="data-label">Materials</span>';
    for (let k = 0; k < record.materials.length; k++) {
      const mat = record.materials[k];
      let group = null;
      if (typeof getMaterialGroup === 'function') { group = getMaterialGroup(mat.id); }
      let href = null;
      let label;
      if (group && group.name) { label = group.name; } else { label = toSentenceCase(mat.text); }
      if (group) {
        href = 'browse/materials/property.html?id=' + group.ids.join(',') + '&name=' + encodeURIComponent(label);
      } else if (mat.id) {
        href = 'browse/materials/property.html?id=' + mat.id + '&name=' + encodeURIComponent(label);
      }
      if (href) {
        physHtml += '<a href="' + href + '" class="meta-link">' + label + '</a>';
      } else {
        physHtml += '<span>' + label + '</span>';
      }
    }
    physHtml += '</li>';
  }
  if (record.techniques && record.techniques.length > 0) {
    const techValues = [];
    for (let t = 0; t < record.techniques.length; t++) {
      const tech = record.techniques[t];
      techValues.push(normalizeTechnique(tech.text, tech.id));
    }
    physHtml += '<li><span class="data-label">Techniques</span><span>' + techValues.join(', ') + '</span></li>';
  }
  if (record.dimensions && record.dimensions.length > 0) {
    physHtml += '<li><span class="data-label">Dimensions</span>';
    for (let d = 0; d < record.dimensions.length; d++) {
      const dim = record.dimensions[d];
      physHtml += '<span>' + dim.dimension + ': ' + dim.value + ' ' + (dim.unit || '') + '</span>';
    }
    if (record.dimensionsNote) { physHtml += '<span><em>' + record.dimensionsNote + '</em></span>'; }
    physHtml += '</li>';
  }
  if (record.physicalDescription) {
    physHtml += '<li><span class="data-label">Physical Description</span><span>' + record.physicalDescription + '</span></li>';
  }
  toggleSection('section[aria-labelledby="phys-heading"] ul', physHtml);

  let museumHtml = '';
  if (record.galleryLocations && record.galleryLocations.length > 0 && record.galleryLocations[0].current) {
    museumHtml += '<li><span class="data-label">Gallery Location</span><span>' + record.galleryLocations[0].current.text + '</span></li>';
  }
  museumHtml += '<li><span class="data-label">Museum Number</span><span>' + record.accessionNumber + '</span></li>';
  if (record.creditLine) { museumHtml += '<li><span class="data-label">Credit Line</span><span>' + record.creditLine + '</span></li>'; }
  museumHtml += '<li><span class="data-label">Copyright</span><span>\u00a9 Victoria and Albert Museum, London</span></li>';
  toggleSection('section[aria-labelledby="museum-heading"] ul', museumHtml);

  const exploreSection = document.querySelector('section[aria-labelledby="explore-heading"]');
  if (exploreSection) { exploreSection.style.display = 'none'; }
  loadExploreMore(record);

  const relatedSection = document.querySelector('section[aria-labelledby="related-heading"]');
  relatedSection.style.display = 'none';
  loadRelated(record);
}

async function loadExploreMore(record) {
  const tiles = [];

  const collCode = record.collectionCode;
  if (collCode && collCode.id) {
    const collName = normalizeCollection(collCode.text);
    tiles.push({
      type: 'Collection',
      name: collName,
      href: 'browse/collections/property.html?id=' + collCode.id + '&name=' + encodeURIComponent(collName),
      filterParam: 'id_collection=' + encodeURIComponent(collCode.id)
    });
  }

  const makers = record.artistMakerPerson || [];
  if (makers.length > 0 && makers[0].name && makers[0].name.id && makers[0].name.text && makers[0].name.text.toLowerCase() !== 'unknown') {
    const makerName = makers[0].name.text;
    const makerId = makers[0].name.id;
    try {
      const countRes = await fetch(API_BASE + '/objects/search?id_person=' + encodeURIComponent(makerId) + '&page_size=1');
      const countData = await countRes.json();
      if (countData.info && countData.info.record_count > 1) {
        tiles.push({
          type: 'Artist',
          name: makerName,
          href: 'browse/creators/property.html?id=' + makerId + '&name=' + encodeURIComponent(makerName),
          filterParam: 'id_person=' + encodeURIComponent(makerId)
        });
      }
    } catch (e) { /* skip artist tile on error */ }
  }

  const cats = record.categories || [];
  const catCount = Math.min(cats.length, 3);
  for (let i = 0; i < catCount; i++) {
    const cat = cats[i];
    const catName = normalizeCategory(cat.text, cat.id);
    tiles.push({
      type: 'Category',
      name: catName,
      href: 'browse/categories/property.html?id=' + cat.id + '&name=' + encodeURIComponent(catName),
      filterParam: 'id_category=' + encodeURIComponent(cat.id)
    });
  }

  if (tiles.length === 0) { return; }

  const candidatePromises = [];
  for (let j = 0; j < tiles.length; j++) {
    candidatePromises.push(fetchCandidateImages(tiles[j].filterParam));
  }
  const candidateSets = await Promise.all(candidatePromises);
  const imageIds = [];
  for (let j = 0; j < candidateSets.length; j++) {
    imageIds.push(pickUnused(candidateSets[j]));
  }

  const container = document.querySelector('.explore-tiles');
  const exploreSection = document.querySelector('section[aria-labelledby="explore-heading"]');
  if (!container || !exploreSection) { return; }

  let html = '';
  for (let k = 0; k < tiles.length; k++) {
    const imgId = imageIds[k];
    let imgHtml = '';
    if (imgId) {
      imgHtml = '<img src="' + IMAGE_CDN + '/' + imgId + '/full/!800,600/0/default.jpg" alt="' + tiles[k].name + ' preview" loading="lazy">';
    }
    html += '<a href="' + tiles[k].href + '" class="browse-collection-card">' +
      '<div class="card-header">' +
        '<span class="card-type">' + tiles[k].type + '</span>' +
        '<h3 class="card-name">' + tiles[k].name + '</h3>' +
      '</div>' +
      '<div class="card-image">' + imgHtml + '</div>' +
      '</a>';
  }

  container.innerHTML = html;
  exploreSection.style.display = 'block';
  const lowerSections = document.querySelector('.lower-sections');
  if (lowerSections) { lowerSections.classList.add('has-explore'); }
}

async function fetchRelatedSearch(params) {
  const url = API_BASE + '/objects/search?' + params + '&page_size=15&images_exist=1&fields=systemNumber,objectType,_primaryTitle,_primaryMaker,_primaryDate,_primaryImageId';
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.records || [];
  } catch (e) {
    return [];
  }
}

async function loadRelated(record) {
  const currentId = record.systemNumber;
  const seenIds = new Set([currentId]);
  const collected = [];

  function addUnique(results, max, reason) {
    let added = 0;
    for (let i = 0; i < results.length && added < max; i++) {
      const r = results[i];
      if (!seenIds.has(r.systemNumber) && r._primaryImageId && !usedImageIds[r._primaryImageId]) {
        seenIds.add(r.systemNumber);
        usedImageIds[r._primaryImageId] = true;
        r._relatedReason = reason;
        collected.push(r);
        added++;
      }
    }
  }

  const assocObjects = record.associatedObjects || [];
  if (assocObjects.length > 0) {
    const assocPromises = [];
    const assocReasons = [];
    for (let i = 0; i < assocObjects.length; i++) {
      const assocId = assocObjects[i].object && assocObjects[i].object.id;
      if (assocId) {
        assocPromises.push(fetchRelatedSearch('kw_system_number=' + encodeURIComponent(assocId) + '&page_size=1'));
        if (assocObjects[i].association) {
          assocReasons.push('Association: ' + assocObjects[i].association);
        } else {
          assocReasons.push('Associated object');
        }
      }
    }
    const assocResults = await Promise.all(assocPromises);
    for (let j = 0; j < assocResults.length; j++) {
      if (assocResults[j].length > 0) { addUnique(assocResults[j], 1, assocReasons[j]); }
    }
  }

  const makers = record.artistMakerPerson || [];
  const makerOrgs = record.artistMakerOrganisations || [];
  const allMakers = makers.concat(makerOrgs);
  if (allMakers.length > 0) {
    const makerId = allMakers[0].name && allMakers[0].name.id;
    const makerNameText = allMakers[0].name && allMakers[0].name.text;
    if (makerId && makerNameText && makerNameText.toLowerCase() !== 'unknown') {
      addUnique(await fetchRelatedSearch('id_person=' + encodeURIComponent(makerId)), 2, 'Creator: ' + makerNameText);
    }
  }

  if (record.collectionCode && record.collectionCode.id) {
    let collName;
    if (record.collectionCode.text) { collName = normalizeCollection(record.collectionCode.text); } else { collName = 'Same collection'; }
    addUnique(await fetchRelatedSearch('id_collection=' + encodeURIComponent(record.collectionCode.id)), 2, 'Collection: ' + collName);
  }

  if (record.categories && record.categories.length > 0) {
    let catName;
    if (record.categories[0].text) { catName = normalizeCategory(record.categories[0].text, record.categories[0].id); } else { catName = 'Same category'; }
    addUnique(await fetchRelatedSearch('id_category=' + encodeURIComponent(record.categories[0].id)), 2, 'Category: ' + catName);
  }

  if (collected.length === 0) { return; }

  const relatedGrid = document.querySelector('.objects-grid');
  const relatedSection = document.querySelector('section[aria-labelledby="related-heading"]');
  if (!relatedGrid) { return; }

  relatedGrid.innerHTML = '';
  for (let i = 0; i < collected.length; i++) {
    relatedGrid.appendChild(makeRelatedCard(collected[i]));
  }
  relatedSection.style.display = 'block';
}

function makeRelatedCard(item) {
  const title = item._primaryTitle || toSentenceCase(item.objectType) || 'Untitled';
  const imgBase = IMAGE_CDN + '/' + item._primaryImageId + '/full';
  const smallImg = imgBase + '/!400,400/0/default.jpg';
  const largeImg = imgBase + '/!1200,1200/0/default.jpg';
  const date = item._primaryDate || '';
  let maker = '';
  if (item._primaryMaker && typeof item._primaryMaker === 'object') {
    maker = item._primaryMaker.text || '';
  } else if (item._primaryMaker) {
    maker = item._primaryMaker;
  }

  const card = document.createElement('a');
  card.href = 'details.html?id=' + item.systemNumber;
  card.className = 'related-card';

  let relatedInfoHtml = '';
  if (item._relatedReason) { relatedInfoHtml += '<p class="related-reason">' + item._relatedReason + '</p>'; }
  relatedInfoHtml += '<p class="related-title">' + title + '</p>';
  if (maker && maker.toLowerCase() !== 'unknown') { relatedInfoHtml += '<p class="related-maker">' + maker + '</p>'; }
  if (date) { relatedInfoHtml += '<p class="related-date">' + date + '</p>'; }

  card.innerHTML =
    '<figure>' +
      '<picture>' +
        '<source media="(min-width: 1000px)" srcset="' + largeImg + '">' +
        '<img src="' + smallImg + '" alt="' + title + '" loading="lazy">' +
      '</picture>' +
    '</figure>' +
    '<div class="related-info">' + relatedInfoHtml + '</div>';

  return card;
}
