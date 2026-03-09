const API_BASE = "https://api.vam.ac.uk/v2";
const grid = document.getElementById("objects-grid");

async function loadHomepage() {
  const res = await fetch(`${API_BASE}/objects/search?images_exist=1&page_size=1&page=1`);
  const data = await res.json();
  const item = data.records[0];

  const detailRes = await fetch(`${API_BASE}/object/${item.systemNumber}`);
  const detailData = await detailRes.json();
  console.log(detailData);

  grid.innerHTML = '';
  grid.appendChild(createCard(detailData.record));
}

async function loadHomepage() {
  try {

    const res = await fetch(`${API_BASE}/objects/search?images_exist=1&page_size=6&page=1`);
    const data = await res.json();
    
    grid.innerHTML = '';


    for (const item of data.records) {
      const detailRes = await fetch(`${API_BASE}/object/${item.systemNumber}`);
      const detailData = await detailRes.json();
      

      grid.appendChild(createCard(detailData.record));
    }
  } catch (error) {
    console.error("Error loading museum data:", error);
    grid.innerHTML = `<p class="error">Sorry, we couldn't load the gallery right now.</p>`;
  }
}

function createCard(object) {
  const article = document.createElement('article');
  article.className = 'object-card';

  const title = object.titles?.[0] || object.objectType || 'Untitled';
  const imageId = object.images?.[0];
  const date = object.productionDates?.[0]?.date?.text || 'Date unknown';
  const maker = object.artistMakerPerson?.[0]?.name?.text || 'Maker unknown';


  const baseUrl = `https://framemark.vam.ac.uk/collections/${imageId}/full`;
  const imgMobile = `${baseUrl}/!400,400/0/default.jpg`;
  const imgDesktop = `${baseUrl}/!800,800/0/default.jpg`;
  const imgLarge = `${baseUrl}/!1200,1200/0/default.jpg`;


  article.innerHTML = `
    <picture>
      <source media="(min-width: 1000px)" srcset="${imgLarge}">
      <source media="(min-width: 600px)" srcset="${imgDesktop}">
      <img 
        src="${imgMobile}" 
        alt="${title}" 
        width="600" 
        height="600" 
        loading="lazy"
      >
    </picture>
    <h3>${title}</h3>
    <p class="date">${date}</p>
    <p class="description">${maker}</p>
  `;

  return article;
}


loadHomepage();
