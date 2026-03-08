const API_BASE = "https://api.vam.ac.uk/v2";
const grid = document.getElementById("objects-grid");
const loadBtn = document.getElementById("load_more");
const slider = document.getElementById("density-slider");

let pageSize = 100;
let numPagesToFetch = 10;

async function loadHomepage() {
  try {
    const allRecords = [];
    for (let i = 0; i < numPagesToFetch; i++) {
      const randomPage = getRandomPage();
      const url = `${API_BASE}/objects/search?has_image=1&page_size=${pageSize}&page=${randomPage}`;
      
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          allRecords.push(...data.records);
        }
      } catch (err) {
        console.warn(`Skipping page ${randomPage}`);
      }
    }
    
    console.log(`Fetched ${allRecords.length} total records`);
    
    const itemsWithImages = allRecords.filter(item => item._primaryImageId);
    
    const shuffled = itemsWithImages.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 40);
    const selectedIds = selected.map(item => item.systemNumber);
    
    console.log(`Selected ${selectedIds.length} objects`);

    const detailedObjects = [];
    for (let i = 0; i < selectedIds.length; i++) {
      try {
        const res = await fetch(`${API_BASE}/object/${selectedIds[i]}`);
        const data = await res.json();
        detailedObjects.push(data.record);
      } catch (err) {
        console.warn(`Failed to load object ${selectedIds[i]}`);
      }
    }

    grid.innerHTML = '';
    detailedObjects.forEach(object => {
      const card = createCard(object);
      grid.appendChild(card);
    });
    
    console.log(`Loaded ${detailedObjects.length} cards`);
    
  } catch (error) {
    console.error("Error loading homepage:", error);
    grid.innerHTML = '<p>Error loading objects. Please refresh the page.</p>';
  }
}

function createCard(object) {
  console.log(object);
  const article = document.createElement('article');
  article.className = 'object-card';
  
  const title = object._primaryTitle || object.objectType || 'Untitled';
  const imageId = object.images?.[0];
  const imageUrl = `https://framemark.vam.ac.uk/collections/${imageId}/full/!800,800/0/default.jpg`;
  const date = object._primaryDate || 'Date unknown';
  const maker = object._primaryMaker?.name || 'Maker unknown';
  
  const metadataItems = [];
  
  if (object.collectionCode?.text) {
    const collectionName = normalizeCollection(object.collectionCode.text);
    metadataItems.push(`<dt>Collection</dt><dd>${collectionName}</dd>`);
  }
  
  if (object.categories?.[0]) {
    const categoryName = normalizeCategory(object.categories[0].text);
    metadataItems.push(`<dt>Category</dt><dd>${categoryName}</dd>`);
  }
  
  if (object.placesOfOrigin?.[0]) {
    const placeName = normalizePlace(object.placesOfOrigin[0].place.text);
    metadataItems.push(`<dt>Origin</dt><dd>${placeName}</dd>`);
  }
  
  const metadata = metadataItems.join('<hr aria-hidden="true">');
  
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