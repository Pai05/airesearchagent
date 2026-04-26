import { searchPapers } from './api.js';
import { PaperList } from './components/PaperList.js';
import { Sidebar } from './components/Sidebar.js';
import { GapGraph } from './components/GapGraph.js';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const fetchingBar = document.getElementById('fetching-bar');
const fetchingStatus = document.getElementById('fetching-status');
const resultsCount = document.getElementById('results-count');
const topicLabel = document.getElementById('topic-label');
const filtersContainer = document.getElementById('filters-container');
const paperListContainer = document.getElementById('paper-list-container');
const sidebarContainer = document.getElementById('sidebar-container');
const gapGraphContainer = document.getElementById('gap-graph-container');

// Initialize Components
const sidebar = new Sidebar(sidebarContainer);
let allPapers = [];
let currentTopic = '';

const gapGraph = new GapGraph(gapGraphContainer, (paperId) => {
    if (paperId) paperList.highlightPaper(paperId);
    else paperList.highlightPaper(null);
});

const paperList = new PaperList(
    paperListContainer,
    filtersContainer,
    (paper) => { sidebar.open(paper); }
);

// Search Function
async function handleSearch(query) {
    const q = query || (searchInput && searchInput.value.trim());
    if (!q) return;

    currentTopic = q;

    // Update URL without reload so back button works
    const url = new URL(window.location);
    url.searchParams.set('topic', q);
    window.history.replaceState({}, '', url);

    if (topicLabel) topicLabel.textContent = q.toUpperCase();
    if (searchInput) searchInput.value = q;

    // Show loading
    if (fetchingBar) fetchingBar.classList.remove('hidden');
    if (fetchingStatus) fetchingStatus.textContent = 'Fetching papers...';
    if (searchButton) searchButton.disabled = true;

    try {
        const result = await searchPapers(q);
        const papers = result.papers;
        allPapers = papers;

        if (resultsCount) resultsCount.textContent = result.total.toLocaleString();

        // Render all 3 panels
        paperList.setPapers(papers, result.total);
        gapGraph.setPapers(papers);
        sidebar.renderGlobalAnalysis(papers, q);

    } catch (error) {
        console.error('Search failed:', error);
        if (fetchingStatus) fetchingStatus.textContent = 'Error: could not reach backend. Make sure the server is running at localhost:8000';
    } finally {
        if (fetchingBar) fetchingBar.classList.add('hidden');
        if (searchButton) searchButton.disabled = false;
    }
}

// On page load, read topic from URL
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const topic = urlParams.get('topic') || 'machine learning';
    handleSearch(topic);
});

// Listeners
if (searchButton) {
    searchButton.onclick = () => handleSearch();
}
if (searchInput) {
    searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };
}

window.addEventListener('show-global-analysis', () => {
    sidebar.renderGlobalAnalysis(allPapers, currentTopic);
});
