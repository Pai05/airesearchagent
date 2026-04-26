import { searchPapers } from './api.js';
import { PaperList } from './components/PaperList.js';
import { Sidebar } from './components/Sidebar.js';
import { GapGraph } from './components/GapGraph.js';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const cancelButton = document.getElementById('cancel-button');
const fetchingBar = document.getElementById('fetching-bar');
const statusMessage = document.getElementById('status-message');
const resultsView = document.getElementById('results-view');
const landingView = document.getElementById('landing-view');

// Initialize Components
let allPapers = [];
let currentTopic = '';

// Search Function
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        if (statusMessage) statusMessage.textContent = "Please enter a research topic.";
        return;
    }

    console.log("Discovery initiated for:", query);
    
    // UI State: Fetching (Match Screenshot 2)
    if (searchButton) searchButton.classList.add('hidden');
    if (cancelButton) cancelButton.classList.remove('hidden');
    if (fetchingBar) fetchingBar.classList.remove('hidden');
    if (statusMessage) statusMessage.textContent = "";

    // In this simulation, we wait then redirect to results.html
    // The redirect should happen after a short delay to show the fetching state
    setTimeout(() => {
        window.location.href = `results.html?topic=${encodeURIComponent(query)}`;
    }, 1500);
}

// Attach listeners
if (searchButton) {
    searchButton.onclick = handleSearch;
}

if (cancelButton) {
    cancelButton.onclick = () => {
        if (searchButton) searchButton.classList.remove('hidden');
        if (cancelButton) cancelButton.classList.add('hidden');
        if (fetchingBar) fetchingBar.classList.add('hidden');
        console.log("Discovery cancelled.");
    };
}

if (searchInput) {
    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };
}
