const API_BASE = "https://api.vam.ac.uk/v2";
const grid = document.querySelector(".objects-grid");
const loadBtn = document.querySelector(".btn-load");
const slider = document.getElementById("density-slider");

let pageSize = 100;
let numPagesToFetch = 5; // Reduced from 10

function getRandomPage() {
  return Math.floor(Math.random() * 20) + 1;
}

// Helper: delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadHomepage() {
  try {
    // Fetch pages ONE AT A TIME with delays
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
      
      // Wait 1 second between requests (rate limit compliance)
      if (i < numPagesToFetch - 1) {
        await delay(1000);
      }
    }
    
    console.log(`Fetched ${allRecords.length} total records`);
    
    // Filter items with images
    const itemsWithImages = allRecords.filter(item => item._primaryImageId);
    
    // Shuffle and take 40 (instead of 90 to reduce API calls)
    const shuffled = itemsWithImages.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 40);
    const selectedIds = selected.map(item => item.systemNumber);
    
    console.log(`Selected ${selectedIds.length} objects`);

    // Fetch details ONE AT A TIME with delays
    const detailedObjects = [];
    for (let i = 0; i < selectedIds.length; i++) {
      try {
        const res = await fetch(`${API_BASE}/object/${selectedIds[i]}`);
        const data = await res.json();
        detailedObjects.push(data.record);
      } catch (err) {
        console.warn(`Failed to load object ${selectedIds[i]}`);
      }
      
      // Wait 1 second between requests
      if (i < selectedIds.length - 1) {
        await delay(1000);
      }
    }

    // Display cards
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