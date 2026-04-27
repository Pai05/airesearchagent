import { searchPapers } from './api.js?v=3';
import { PaperList } from './components/PaperList.js?v=2';
import { Sidebar } from './components/Sidebar.js?v=2';
import { GapGraph } from './components/GapGraph.js?v=2';

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
console.log('Components initialized');

// Search Function
async function handleSearch(query, sourcesOverride = null) {
    const q = query || (searchInput && searchInput.value.trim());
    if (!q) return;

    currentTopic = q;

    // Update URL without reload so back button works
    const url = new URL(window.location);
    url.searchParams.set('topic', q);
    window.history.replaceState({}, '', url);

    // Read sources from URL or override
    const urlParams = new URLSearchParams(window.location.search);
    const sourcesParam = sourcesOverride || urlParams.get('sources') || '';
    const selectedSources = sourcesParam ? sourcesParam.split(',').filter(Boolean) : [];

    // Save search topic to history
    let savedSearches = JSON.parse(localStorage.getItem('saved_searches') || '[]');
    // Remove if exists to move it to the front
    savedSearches = savedSearches.filter(s => s !== q);
    savedSearches.unshift(q);
    savedSearches = savedSearches.slice(0, 10); // keep last 10
    localStorage.setItem('saved_searches', JSON.stringify(savedSearches));

    if (topicLabel) topicLabel.textContent = q.toUpperCase();
    if (searchInput) searchInput.value = q;
    console.log('Search started for:', q);

    // Show loading
    if (fetchingBar) fetchingBar.classList.remove('hidden');
    if (fetchingStatus) fetchingStatus.textContent = 'Fetching papers...';
    if (searchButton) searchButton.disabled = true;

    try {
        const result = await searchPapers(q, 50, selectedSources);
        const papers = result.papers;
        allPapers = papers;

        if (resultsCount) resultsCount.textContent = result.total.toLocaleString();
        console.log('Search success, papers found:', result.total);

        // Render all 3 panels
        paperList.setPapers(papers, result.total);
        gapGraph.setPapers(papers);
        sidebar.renderGlobalAnalysis(papers, q);

    } catch (error) {
        console.error('Search failed:', error);
        const msg = (error && error.message) ? error.message : 'Search failed.';
        if (fetchingStatus) fetchingStatus.textContent = `Error: ${msg}`;
    } finally {
        if (fetchingBar) fetchingBar.classList.add('hidden');
        if (searchButton) searchButton.disabled = false;
    }
}

// On page load, read topic from URL
function init() {
    console.log('Init called');
    const urlParams = new URLSearchParams(window.location.search);
    const topic = urlParams.get('topic') || 'machine learning';
    const sources = urlParams.get('sources') || '';
    handleSearch(topic, sources);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

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
