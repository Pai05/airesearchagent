import { createPaperCard } from './PaperCard.js';

export class PaperList {
    constructor(container, filterContainer, onOpenSidebar) {
        this.container = container;
        this.filterContainer = filterContainer;
        this.onOpenSidebar = onOpenSidebar;
        this.allPapers = [];
        this.filteredPapers = [];
        this.filters = {
            yearFrom: 2018,
            yearTo: new Date().getFullYear(),
            sources: {
                semantic_scholar: true,
                arxiv: true,
                pubmed: true
            },
            sortBy: 'newest'
        };
    }

    setPapers(papers, totalCount) {
        this.allPapers = [...papers];
        this.totalCount = totalCount;
        this.applyFilters();
    }

    applyFilters() {
        this.filteredPapers = this.allPapers.filter(paper => {
            const yearMatch = paper.year >= this.filters.yearFrom && paper.year <= this.filters.yearTo;
            const sourceMatch = this.filters.sources[paper.source] === true;
            return yearMatch && sourceMatch;
        });

        this.sortPapers();
        this.render();
    }

    sortPapers() {
        this.filteredPapers.sort((a, b) => {
            if (this.filters.sortBy === 'newest') {
                return b.published_date.localeCompare(a.published_date);
            } else if (this.filters.sortBy === 'oldest') {
                return a.published_date.localeCompare(b.published_date);
            } else if (this.filters.sortBy === 'citations') {
                return b.citation_count - a.citation_count;
            }
            return 0;
        });
    }

    // CRITICAL: This method is called by GapGraph to highlight matching paper cards
    highlightPaper(paperId) {
        const allCards = this.container.querySelectorAll('.paper-card');
        allCards.forEach(card => {
            if (paperId && card.dataset.id === paperId) {
                card.classList.add('highlighted');
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                card.classList.remove('highlighted');
            }
        });
    }

    render() {
        // Render Filters Sidebar
        this.filterContainer.innerHTML = `
            <div class="filters-panel">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Filters</h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="12" x2="14" y2="12"/><line x1="18" y1="16" x2="22" y2="16"/></svg>
                </div>

                <div class="filter-group" style="margin-bottom: 2rem;">
                    <label style="color: var(--text-muted); margin-bottom: 0.5rem;">Sort By</label>
                    <select id="sort-select" class="form-control" style="background: #1c2128;">
                        <option value="newest" ${this.filters.sortBy === 'newest' ? 'selected' : ''}>Newest first</option>
                        <option value="oldest" ${this.filters.sortBy === 'oldest' ? 'selected' : ''}>Oldest first</option>
                        <option value="citations" ${this.filters.sortBy === 'citations' ? 'selected' : ''}>Most cited</option>
                    </select>
                </div>

                <div class="filter-group" style="margin-bottom: 2rem;">
                    <label style="color: var(--text-muted); margin-bottom: 0.5rem;">Year Range</label>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <input type="number" id="year-from" class="form-control" value="${this.filters.yearFrom}" style="padding: 0.4rem;">
                        <span style="color: var(--border);">–</span>
                        <input type="number" id="year-to" class="form-control" value="${this.filters.yearTo}" style="padding: 0.4rem;">
                    </div>
                </div>

                <div class="filter-group">
                    <label style="color: var(--text-muted); margin-bottom: 1rem;">Sources</label>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                            <input type="checkbox" data-source="semantic_scholar" ${this.filters.sources.semantic_scholar ? 'checked' : ''}> Semantic Scholar
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                            <input type="checkbox" data-source="arxiv" ${this.filters.sources.arxiv ? 'checked' : ''}> arXiv
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                            <input type="checkbox" data-source="pubmed" ${this.filters.sources.pubmed ? 'checked' : ''}> PubMed
                        </label>
                    </div>
                </div>
            </div>
        `;

        // Render Results Header — "Showing X of Y papers"
        this.container.innerHTML = `
            <div style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.875rem;">
                SHOWING <span style="color: var(--accent-cyan); font-weight: 700;">${this.filteredPapers.length}</span> OF <span style="color: var(--accent-cyan); font-weight: 700;">${this.totalCount}</span> PAPERS
            </div>
            <div id="cards-grid"></div>
        `;

        const grid = this.container.querySelector('#cards-grid');
        this.filteredPapers.forEach(paper => {
            grid.appendChild(createPaperCard(paper, this.onOpenSidebar));
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.filterContainer.querySelector('#sort-select').addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.applyFilters();
        });

        this.filterContainer.querySelector('#year-from').addEventListener('change', (e) => {
            this.filters.yearFrom = parseInt(e.target.value);
            this.applyFilters();
        });

        this.filterContainer.querySelector('#year-to').addEventListener('change', (e) => {
            this.filters.yearTo = parseInt(e.target.value);
            this.applyFilters();
        });

        this.filterContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', (e) => {
                this.filters.sources[e.target.dataset.source] = e.target.checked;
                this.applyFilters();
            });
        });
    }
}
