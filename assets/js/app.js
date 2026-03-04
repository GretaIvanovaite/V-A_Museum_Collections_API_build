const API_BASE = "https://api.vam.ac.uk/v2";

const grid = document.querySelector(".objects-grid");
const loadBtn = document.querySelector(".btn-load");
const slider = document.getElementById("density-slider");

let pageSize = 100;
let numPagesToFetch = 5;

function getRandomPage() {
  return Math.floor(Math.random() * 100) + 1;
}

async function loadHomepage() {
  try {
    const pagePromises = [];
    for (let i = 0; i < numPagesToFetch; i++) {
      const randomPage = getRandomPage();
      const url = `${API_BASE}/objects/search?has_image=1&page_size=${pageSize}&page=${randomPage}`;
      pagePromises.push(fetch(url).then(res => res.json()));
    }

    const results = await Promise.all(pagePromises);
    const allRecords = results.flatMap(data => data.records);
    
    const selectedIds = [];
    const chunkSize = 12;
    
    for (let i = 0; i < allRecords.length; i += chunkSize) {
      const chunk = allRecords.slice(i, i + chunkSize);
      
      for (let attempt = 0; attempt < 5; attempt++) {
        const randomItem = chunk[Math.floor(Math.random() * chunk.length)];
        if (randomItem?._primaryImageId) {
          selectedIds.push(randomItem.systemNumber);
          break;
        }
      }
    }

    const detailPromises = selectedIds.map(id => 
      fetch(`${API_BASE}/object/${id}`)
        .then(res => res.json())
        .then(data => data.record)
    );
    
    const detailedObjects = await Promise.all(detailPromises);

    grid.innerHTML = '';
    detailedObjects.forEach(object => {
      const card = createCard(object);
      grid.appendChild(card);
    });
    
  } catch (error) {
    console.error("Error loading homepage:", error);
  }
}

function createCard(object) {
  const article = document.createElement('article');
  article.className = 'object-card';
  
  const title = object._primaryTitle || object.objectType || 'Untitled';
  
  // FIX: Get image ID from full object structure
  const imageId = object._images?._primary_thumbnail || object._images?._iiif_image;
  const imageUrl = `https://framemark.vam.ac.uk/collections/${imageId}/full/!800,800/0/default.jpg`;
  
  const date = object._primaryDate || 'Date unknown';
  const maker = object._primaryMaker?.name || 'Maker unknown';
  
  // Build metadata - only add if available
  let metadata = '';
  
  if (object.objectType) {
    metadata += `<dt>Type</dt><dd>${object.objectType}</dd>`;
  }
  
  if (object.collectionCode) {
    metadata += `<dt>Collection</dt><dd>${object.collectionCode}</dd>`;
  }
  
  if (object.categories?.[0]) {
    metadata += `<dt>Category</dt><dd>${object.categories[0].text}</dd>`;
  }
  
  if (object.placesOfOrigin?.[0]) {
    metadata += `<dt>Origin</dt><dd>${object.placesOfOrigin[0].place.text}</dd>`;
  }
  
  article.innerHTML = `
    <picture>
      <img src="${imageUrl}" alt="${title}">
    </picture>
    <h3>${title}</h3>
    <p class="date">${date}</p>
    <p class="description">${maker}</p>
    <dl>${metadata}</dl>
  `;
  
  return article;
}

loadHomepage();