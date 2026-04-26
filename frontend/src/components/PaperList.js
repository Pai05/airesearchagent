import { createPaperCard } from './PaperCard.js?v=2';

function escapeHTML(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

export class PaperList {
    constructor(container, filterContainer, onOpenSidebar) {
        this.container = container;
        this.filterContainer = filterContainer;
        this.onOpenSidebar = onOpenSidebar;
        this.allPapers = [];
        this.filteredPapers = [];
        this.filters = {
            yearFrom: 1900,
            yearTo: new Date().getFullYear(),
            sources: {},
            availableSources: new Set(),
            sortBy: 'newest'
        };
    }

    setPapers(papers, totalCount) {
        console.log('PaperList.setPapers called with', papers.length, 'papers');
        this.allPapers = [...papers];
        this.totalCount = totalCount;
        
        // Dynamically collect sources
        this.allPapers.forEach(p => {
            if (p.source) {
                this.filters.availableSources.add(p.source);
            }
        });
        
        // Initialize sources filter if not already set
        this.filters.availableSources.forEach(src => {
            if (this.filters.sources[src] === undefined) {
                this.filters.sources[src] = true;
            }
        });

        this.applyFilters();
    }

    applyFilters() {
        this.filteredPapers = this.allPapers.filter(paper => {
            const y = paper.year || 0;
            const yearMatch = y === 0 || (y >= this.filters.yearFrom && y <= this.filters.yearTo);
            const src = paper.source || 'unknown';
            const sourceMatch = this.filters.sources[src] === true;
            return yearMatch && sourceMatch;
        });

        console.log('PaperList.applyFilters: papers after filter:', this.filteredPapers.length);
        this.sortPapers();
        this.render();
    }

    sortPapers() {
        this.filteredPapers.sort((a, b) => {
            if (this.filters.sortBy === 'newest') {
                return (b.published_date || "").localeCompare(a.published_date || "");
            } else if (this.filters.sortBy === 'oldest') {
                return (a.published_date || "").localeCompare(b.published_date || "");
            } else if (this.filters.sortBy === 'citations') {
                return (b.citation_count || 0) - (a.citation_count || 0);
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
                        ${Array.from(this.filters.availableSources).map(src => `
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                                <input type="checkbox" data-source="${escapeHTML(src)}" ${this.filters.sources[src] ? 'checked' : ''}> ${escapeHTML((src || 'unknown').replace('_', ' '))}
                            </label>
                        `).join('')}
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

        console.log('PaperList.render: cards added to grid');
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
