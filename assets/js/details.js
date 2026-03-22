var API_BASE = "https://api.vam.ac.uk/v2";
var IMAGE_CDN = "https://framemark.vam.ac.uk/collections";

var params = new URLSearchParams(window.location.search);
var objectId = params.get('id');

if (!objectId) {
  var mainContent = document.getElementById('main-content');
  if (mainContent) { mainContent.innerHTML = '<p>No object specified.</p>'; }
} else {
  loadObject(objectId);
}

function removeOverlay() {
  var overlay = document.getElementById('loading-overlay');
  if (overlay) { overlay.classList.add('hidden'); }
}

async function loadObject(id) {
  try {
    var res = await fetch(API_BASE + '/museumobject/' + id);
    var data = await res.json();
    console.log(data.record);
    renderDetails(data.record);
  } catch (err) {
    console.error('Failed to load object:', err);
    var mainContent = document.getElementById('main-content');
    if (mainContent) { mainContent.innerHTML = '<p role="alert">Failed to load object details.</p>'; }
  } finally {
    removeOverlay();
  }
}

function toggleSection(selector, content) {
  var element = document.querySelector(selector);
  if (!element) { return; }
  var section = element.closest('section');
  if (content && content.toString().trim() !== '' && content !== '<dd>Not recorded</dd>') {
    element.innerHTML = content;
    if (section) { section.style.display = 'block'; }
  } else {
    if (section) { section.style.display = 'none'; }
  }
}

function renderGallery(record, title) {
  var allImages = record.images || [];
  var imageId = allImages.length > 0 ? allImages[0] : null;
  var mainFigure = document.querySelector('.main-display');

  if (imageId && mainFigure) {
    var base = IMAGE_CDN + '/' + imageId + '/full';
    mainFigure.innerHTML =
      '<picture>' +
        '<source media="(min-width: 1000px)" srcset="' + base + '/!1200,1200/0/default.jpg">' +
        '<img src="' + base + '/!600,600/0/default.jpg" alt="' + title + '">' +
      '</picture>';

    var strip = document.querySelector('.thumbnail-strip');
    if (strip) { strip.style.display = 'none'; }
    if (strip && allImages.length > 1) {
      strip.style.display = '';
      var thumbHtml = '';
      var limit = allImages.length < 6 ? allImages.length : 6;
      for (var i = 0; i < limit; i++) {
        thumbHtml +=
          '<button type="button" data-image-id="' + allImages[i] + '">' +
            '<img src="' + IMAGE_CDN + '/' + allImages[i] + '/full/!100,100/0/default.jpg" alt="Gallery image">' +
          '</button>';
      }
      strip.innerHTML = thumbHtml;

      strip.addEventListener('click', function(e) {
        var btn = e.target.closest('button');
        if (!btn) { return; }
        var newBase = IMAGE_CDN + '/' + btn.dataset.imageId + '/full';
        mainFigure.innerHTML =
          '<picture>' +
            '<img src="' + newBase + '/!1200,1200/0/default.jpg" alt="' + title + '">' +
          '</picture>';
      });
    }
  }
}

function createLink(text, id, type) {
  if (!text || text.toLowerCase() === 'unknown') { return text || 'Unknown'; }
  return '<a href="browse/' + type + '/property.html?id=' + id + '&name=' + encodeURIComponent(text) + '" class="meta-link">' + text + '</a>';
}

function renderExpandable(selector, content) {
  var container = document.querySelector(selector);
  if (!container) { return; }
  var wrapper = container.closest('details');
  if (content && content.trim() !== '') {
    container.innerHTML = content;
    wrapper.style.display = 'block';
  } else {
    wrapper.style.display = 'none';
  }
}

function renderDetails(record) {
  var title = record._primaryTitle || toSentenceCase(record.objectType) || 'Untitled';
  if (!title && record.titles && record.titles.length > 0) {
    title = record.titles[0].title;
  }
  document.querySelector('h1').textContent = title;
  document.title = title + ' | Collections & Archives';
  var breadcrumbCurrent = document.querySelector('nav ol li[aria-current="page"]');
  if (breadcrumbCurrent) { breadcrumbCurrent.textContent = title; }

  renderGallery(record, title);

  var quickFactsDl = document.querySelector('.quick-facts dl');
  if (quickFactsDl) {
    var html = '';

    function hr() {
      if (html !== '') { html += '<hr aria-hidden="true">'; }
    }

    function addGroup(label, value) {
      if (!value || value === 'Unknown') { return; }
      hr();
      html += '<dt>' + label + '</dt><dd>' + value + '</dd>';
    }

    var collCode = record.collectionCode;
    var collText = collCode ? collCode.text : null;
    var collId = collCode ? collCode.id : null;
    addGroup('Collection', createLink(normalizeCollection(collText), collId, 'collections'));
    addGroup('Object Type', toSentenceCase(record.objectType));

    var makers = record.artistMakerPerson || [];
    if (makers.length > 0) {
      hr();
      html += '<dt>Artist/Maker</dt>';
      for (var i = 0; i < makers.length; i++) {
        var m = makers[i];
        var nameLink = createLink(m.name.text, m.name.id, 'creators');
        var assoc = (m.association && m.association.text) ? ' (' + m.association.text + ')' : '';
        html += '<dd>' + nameLink + assoc + '</dd>';
      }
    }

    var dateObj = (record.productionDates && record.productionDates.length > 0) ? record.productionDates[0] : null;
    if (dateObj) {
      var dateAssoc = (dateObj.association && dateObj.association.text) ? ' (' + dateObj.association.text + ')' : '';
      addGroup('Date', dateObj.date.text + dateAssoc);
    }

    var placeObj = (record.placesOfOrigin && record.placesOfOrigin.length > 0) ? record.placesOfOrigin[0] : null;
    if (placeObj) {
      var placeId = placeObj.place.id;
      var placeAssoc = (placeObj.association && placeObj.association.text) ? ' (' + placeObj.association.text + ')' : '';
      addGroup('Place of Origin', createLink(normalizePlace(placeObj.place.text, placeId), placeId, 'origins') + placeAssoc);
    }

    if (record.categories && record.categories.length > 0) {
      hr();
      html += '<dt>Categories</dt>';
      for (var j = 0; j < record.categories.length; j++) {
        var c = record.categories[j];
        html += '<dd>' + createLink(normalizeCategory(c.text, c.id), c.id, 'categories') + '</dd>';
      }
    }

    quickFactsDl.innerHTML = html;
  }

  var hasDesc = record.briefDescription || record.summaryDescription || record.historicalContext || record.objectHistory;
  if (!hasDesc && record.galleryLabels && record.galleryLabels.length > 0) {
    hasDesc = true;
  }
  var descSection = document.querySelector('section[aria-labelledby="desc-heading"]');
  if (hasDesc) {
    descSection.style.display = 'block';
    var briefEl = document.querySelector('.brief-desc');
    if (record.briefDescription && record.briefDescription.trim()) {
      briefEl.innerHTML = record.briefDescription;
    } else {
      briefEl.style.display = 'none';
    }
    var summaryEl = document.querySelector('.summary-desc');
    if (record.summaryDescription && record.summaryDescription.trim()) {
      summaryEl.innerHTML = record.summaryDescription;
    } else {
      summaryEl.style.display = 'none';
    }
    renderExpandable('.historical-content', record.historicalContext);
    renderExpandable('.object-history', record.objectHistory);
    if (record.galleryLabels && record.galleryLabels.length > 0) {
      renderExpandable('.museum-label', record.galleryLabels[0].text);
    }
  } else {
    descSection.style.display = 'none';
  }

  var physHtml = '';
  if (record.materials && record.materials.length > 0) {
    physHtml += '<li><span class="data-label">Materials</span>';
    for (var k = 0; k < record.materials.length; k++) {
      var mat = record.materials[k];
      var group = (typeof getMaterialGroup === 'function') ? getMaterialGroup(mat.id) : null;
      var href = null;
      var label = (group && group.name) ? group.name : mat.text;
      if (group) {
        href = '../browse/materials/property.html?id=' + group.ids.join(',') + '&name=' + encodeURIComponent(label);
      } else if (mat.id) {
        href = '../browse/materials/property.html?id=' + mat.id + '&name=' + encodeURIComponent(label);
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
    var techValues = [];
    for (var t = 0; t < record.techniques.length; t++) {
      var tech = record.techniques[t];
      techValues.push(normalizeTechnique(tech.text, tech.id));
    }
    physHtml += '<li><span class="data-label">Techniques</span><span>' + techValues.join(', ') + '</span></li>';
  }
  if (record.dimensions && record.dimensions.length > 0) {
    physHtml += '<li><span class="data-label">Dimensions</span>';
    for (var d = 0; d < record.dimensions.length; d++) {
      var dim = record.dimensions[d];
      physHtml += '<span>' + dim.dimension + ': ' + dim.value + ' ' + (dim.unit || '') + '</span>';
    }
    if (record.dimensionsNote) { physHtml += '<span><em>' + record.dimensionsNote + '</em></span>'; }
    physHtml += '</li>';
  }
  if (record.physicalDescription) {
    physHtml += '<li><span class="data-label">Physical Description</span><span>' + record.physicalDescription + '</span></li>';
  }
  toggleSection('section[aria-labelledby="phys-heading"] ul', physHtml);

  var museumHtml = '';
  if (record.galleryLocations && record.galleryLocations.length > 0 && record.galleryLocations[0].current) {
    museumHtml += '<li><span class="data-label">Gallery Location</span><span>' + record.galleryLocations[0].current.text + '</span></li>';
  }
  museumHtml += '<li><span class="data-label">Museum Number</span><span>' + record.accessionNumber + '</span></li>';
  if (record.creditLine) { museumHtml += '<li><span class="data-label">Credit Line</span><span>' + record.creditLine + '</span></li>'; }
  museumHtml += '<li><span class="data-label">Copyright</span><span>\u00a9 Victoria and Albert Museum, London</span></li>';
  toggleSection('section[aria-labelledby="museum-heading"] ul', museumHtml);

  var relatedData = record.associatedObjects || [];
  var relatedGrid = document.querySelector('.objects-grid');
  var relatedSection = document.querySelector('section[aria-labelledby="related-heading"]');
  if (relatedData.length > 0 && relatedGrid) {
    relatedSection.style.display = 'block';
    var relHtml = '';
    for (var r = 0; r < relatedData.length; r++) {
      var obj = relatedData[r];
      relHtml += '<div class="related-card"><p>' + (obj.title || toSentenceCase(obj.objectType)) + '</p></div>';
    }
    relatedGrid.innerHTML = relHtml;
  } else if (relatedSection) {
    relatedSection.style.display = 'none';
  }
}
