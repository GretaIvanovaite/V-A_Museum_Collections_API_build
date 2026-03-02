const API_BASE = "https://api.vam.ac.uk/v2";

async function fetchObjects(params) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/objects/search?${query}`);
  const data = await response.json();
  renderGrid(data.records);
}

function renderGrid(records) {
  const container = document.querySelector('.objects-grid');
  container.innerHTML = records.map(record => `
    <article class="object-card">
      <h3>${record._primaryTitle || 'Untitled'}</h3>
      <div class="image-wrapper">
        <picture>
          <source srcset="https://framemark.vam.ac.uk/collections/${record._primaryImageId}/full/!400,400/0/default.avif" type="image/avif">
          <img src="https://framemark.vam.ac.uk/collections/${record._primaryImageId}/full/!400,400/0/default.jpg" 
               alt="${record._primaryTitle}" 
               loading="lazy" 
               decoding="async">
        </picture>
      </div>
      <div class="hover-overlay">
        <p><time>${record._primaryDate || 'Date Unknown'}</time></p>
        <p>${record._primaryPlace || 'Origin Unknown'}</p>
        <a href="details.html?id=${record.systemNumber}" class="btn-detail">View Details</a>
      </div>
    </article>
  `).join('');
}