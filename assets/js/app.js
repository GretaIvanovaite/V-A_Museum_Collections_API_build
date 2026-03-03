const API_BASE = "https://api.vam.ac.uk/v2";

const grid = document.querySelector(".objects-grid");
const loadBtn = document.querySelector(".btn-load");
const slider = document.getElementById("density-slider");

let pageSize = 100;
let numPagesToFetch = 3;

function getRandomPage() {
  return Math.floor(Math.random() * 500) + 1;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

async function fetchObjects() {
  try {
    const pagePromises = [];
    for (let i = 0; i < numPagesToFetch; i++) {
      const randomPage = getRandomPage();
      const url = `${API_BASE}/objects/search?has_image=1&page_size=${pageSize}&page=${randomPage}`;
      
      pagePromises.push(
        fetch(url)
          .then(res => res.json())
      );
    }

    const results = await Promise.all(pagePromises);
    const allRecords = results.flatMap(data => data.records);
    
    const selectedItems = [];
    const chunkSize = 7;
    
    for (let i = 0; i < allRecords.length; i += chunkSize) {
      const chunk = allRecords.slice(i, i + chunkSize);
      const randomIndex = getRandomNumber(0, chunk.length);
      selectedItems.push(chunk[randomIndex]);
    }

    console.log("Total items fetched:", allRecords.length);
    console.log("Items selected:", selectedItems.length);

    return selectedItems;
    
  } catch (error) {
    console.error("Error fetching objects:", error);
    return [];
  }
}

fetchObjects();