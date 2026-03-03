const API_BASE = "https://api.vam.ac.uk/v2";

const grid = document.querySelector(".objects-grid");
const loadBtn = document.querySelector(".btn-load");
const slider = document.getElementById("density-slider");

let pageSize = 100;
let numPagesToFetch = 5;

function getRandomPage() {
  return Math.floor(Math.random() * 100) + 1;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
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
    
    const selectedItems = [];
    const chunkSize = 12;
    
    for (let i = 0; i < allRecords.length; i += chunkSize) {
      const chunk = allRecords.slice(i, i + chunkSize);
      
      let attempts = 0;
      while (attempts < chunk.length) {
        const randomIndex = getRandomNumber(0, chunk.length);
        const item = chunk[randomIndex];
        
        if (item._primaryImageId) {
          selectedItems.push(item);
          break;
        }
        attempts++;
      }
    }

    console.log("Total items fetched:", allRecords.length);
    console.log("Items selected:", selectedItems.length);
    
    grid.innerHTML = '';
    
    selectedItems.forEach(object => {
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
  const imageId = object._primaryImageId;
  const imageUrl = `https://framemark.vam.ac.uk/collections/${imageId}/full/!800,800/0/default.jpg`;
  const date = object._primaryDate || 'Date unknown';
  
  article.innerHTML = `
    <picture>
      <img src="${imageUrl}" alt="${title}">
    </picture>
    <h3>${title}</h3>
    <p class="date">${date}</p>
    <p class="description">${object._primaryMaker?.name || 'Maker unknown'}</p>
    <dl>
      <dt>Type</dt>
      <dd>${object.objectType || 'Unknown'}</dd>
    </dl>
  `;
  
  return article;
}

loadHomepage();