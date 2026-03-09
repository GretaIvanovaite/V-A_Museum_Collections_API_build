const API_BASE = "https://api.vam.ac.uk/v2";
const grid = document.getElementById("objects-grid");

async function loadHomepage() {
  // Fetch one object from the API
  const res = await fetch(`${API_BASE}/objects/search?has_image=1&page_size=1&page=1`);
  const data = await res.json();
  const item = data.records[0];

  // Fetch full details for that object
  const detailRes = await fetch(`${API_BASE}/object/${item.systemNumber}`);
  const detailData = await detailRes.json();

  // Build and show the card
  grid.innerHTML = '';
  grid.appendChild(createCard(detailData.record));
}

function createCard(object) {
  const article = document.createElement('article');
  article.className = 'object-card';

  const title = object._primaryTitle || object.objectType || 'Untitled';
  const imageId = object.images?.[0];
  const imageUrl = `https://framemark.vam.ac.uk/collections/${imageId}/full/!800,800/0/default.jpg`;
  const date = object._primaryDate || 'Date unknown';
  const maker = object._primaryMaker?.name || 'Maker unknown';

  article.innerHTML = `
    <picture>
      <img src="${imageUrl}" alt="${title}">
    </picture>
    <h3>${title}</h3>
    <p class="date">${date}</p>
    <p class="description">${maker}</p>
  `;

  return article;
}

loadHomepage();
