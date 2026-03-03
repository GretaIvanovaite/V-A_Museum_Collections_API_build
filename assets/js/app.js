const API_BASE = "https://api.vam.ac.uk/v2";

const grid = document.querySelector(".objects-grid");
const loadBtn = document.querySelector(".btn-load");
const slider = document.getElementById("density-slider");

let currentPage = getRandomPage();
let pageSize = 90;

function getRandomPage() {
  return Math.floor(Math.random() * 500) + 1;
}

async function fetchObjects(page) {
  const url = `${API_BASE}/objects/search?has_image=1&page_size=${pageSize}&page=${page}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.records;
}

