const apiBase = "https://api.vam.ac.uk/v2";
const imageUrl = "https://framemark.vam.ac.uk/collections";
const grid = document.getElementById("objects-grid");
const slider = document.getElementById("density-slider");

const tierMap = { 1: 20, 2: 30, 3: 40 };

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

// Using batches because of API rate limits
const batchSize = 8;
const batchDelay = 150;

async function fetchCategory(category) {
  const searchUrl = apiBase + "/objects/search?id_category=" + category.id + "&images_exist=1&page_size=10&data_restrict=descriptive_only";
  const response = await fetch(searchUrl);
  const jsonData = await response.json();
  let results = jsonData.records;

  if (results == null) {
    results = [];
  }

  if (results.length > 0) {
    const randomNum = Math.floor(Math.random() * results.length);
    cache[category.id] = results[randomNum];
  } else {
    cache[category.id] = null;
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

function splitLabel(text) {
  if (text.length <= 18) {
    return text;
  }
  const midPoint = Math.floor(text.length / 2);
  const spaceBefore = text.lastIndexOf(' ', midPoint);
  const spaceAfter = text.indexOf(' ', midPoint);
  let splitPoint;
  if (spaceBefore === -1) {
    splitPoint = spaceAfter;
  } else if (spaceAfter === -1) {
    splitPoint = spaceBefore;
  } else if (midPoint - spaceBefore <= spaceAfter - midPoint) {
    splitPoint = spaceBefore;
  } else {
    splitPoint = spaceAfter;
  }
  if (splitPoint === -1) {
    return text;
  }
  return text.slice(0, splitPoint) + '<br>' + text.slice(splitPoint + 1);
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

function makeCard(item, cssClass) {
  const card = document.createElement('article');
  card.className = 'object-card ' + cssClass;
  card.dataset.group = cssClass;

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
    '</section>';

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
          collectionLink = '<a href="browse/collections/property.html?id=' + collectionId + '" class="meta-link">' + splitLabel(collName) + '</a>';
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
          const categoryLabel = normalizeCategory(categoryText);
          if (cat.id) {
            metaHtml += '<dd><a href="browse/categories/property.html?id=' + cat.id + '" class="meta-link">' + splitLabel(categoryLabel) + '</a></dd>';
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
        const originLabel = normalizePlace(itemPlace);
        let originLink;
        if (originId) {
          originLink = '<a href="browse/origins/property.html?id=' + originId + '" class="meta-link">' + splitLabel(originLabel) + '</a>';
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
    imagesToAdd = Math.min(imagesToAdd, extraImageIds.length);

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

  card.addEventListener('mouseenter', loadDetail);
  card.addEventListener('focus', loadDetail);
  card.addEventListener('mouseleave', function() {
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
    btn.textContent = group.name;
    li.appendChild(btn);

    filterList.appendChild(li);

    const subUl = document.createElement('ul');
    subUl.id = popoverId;
    subUl.setAttribute('popover', '');
    subUl.className = 'subgroups';

    for (let j = 0; j < visibleSubs.length; j++) {
      const subLi = document.createElement('li');
      subLi.textContent = visibleSubs[j].name;
      subUl.appendChild(subLi);
    }

    filterList.appendChild(subUl);
  }
}

function showCards(tier) {
  grid.innerHTML = '';
  buildFilterGroups(tier);

  // Build per-group item lists
  const groupItems = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const items = [];
    for (let j = 0; j < group.subcategories.length; j++) {
      const category = group.subcategories[j];
      if (category.minTier <= tier) {
        const item = cache[category.id];
        if (item) {
          items.push({ item: item, cssClass: group.class });
        }
      }
    }
    if (items.length > 0) {
      groupItems.push(items);
    }
  }

  // Shuffle group order and items within each group
  for (let i = groupItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [groupItems[i], groupItems[j]] = [groupItems[j], groupItems[i]];
  }
  for (let g = 0; g < groupItems.length; g++) {
    const items = groupItems[g];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  }

  // Round-robin interleave to ensure group variety, then shuffle the result
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
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  }

  for (let i = 0; i < ordered.length; i++) {
    grid.appendChild(makeCard(ordered[i].item, ordered[i].cssClass));
  }
}

function filterByGroup(groupName) {
  document.querySelectorAll('.object-card').forEach(card => {
    if (card.dataset.group !== groupName) {
      card.classList.add('disabled');
      card.classList.remove('selected');
    } else {
      card.classList.remove('disabled');
      card.classList.add('selected');
    }
  });
  document.querySelectorAll('#filter-groups li').forEach(li => {
    if (li.className.replace(' selected', '') !== groupName) {
      li.classList.remove('selected');
    } else {
      li.classList.add('selected');
    }
  });
}

async function startPage() {
  try {
    await loadCategories();
    const currentTier = tierMap[Number(slider.value)];
    showCards(currentTier);
  } catch (error) {
    console.error('Error loading museum data:', error);
    grid.innerHTML = '<p class="error">Sorry, we couldn\'t load the gallery right now.</p>';
  }
}

slider.addEventListener('input', function() {
  const currentTier = tierMap[Number(slider.value)];
  showCards(currentTier);
});

startPage();
