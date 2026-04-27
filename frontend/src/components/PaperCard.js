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

export function createPaperCard(paper, onOpenSidebar) {
    const card = document.createElement('div');
    card.className = 'paper-card';
    card.dataset.id = escapeHTML(paper.id);

    const sourceText = (paper.source || 'unknown').replace('_', ' ').toUpperCase();
    
    // RULE 9: Authors — first two names then "et al." if more than two
    let authorsText = "Authors unavailable";
    if (paper.authors && paper.authors.length > 0) {
        if (paper.authors.length > 2) {
            authorsText = `${escapeHTML(paper.authors[0])}, ${escapeHTML(paper.authors[1])} et al.`;
        } else {
            authorsText = escapeHTML(paper.authors.join(', '));
        }
    }

    // Citation count text — show "0 citations" not blank
    const citationText = `${paper.citation_count} citation${paper.citation_count !== 1 ? 's' : ''}`;

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <h3 class="card-title" style="margin: 0; font-size: 1.1rem; flex: 1;">${escapeHTML(paper.title)}</h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted); cursor: pointer;"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </div>
        
        <div style="display: flex; gap: 1rem; align-items: center; margin: 1rem 0; font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
            <span style="color: var(--accent-cyan);">${authorsText.toUpperCase()}</span>
            <span>•</span>
            <span>${escapeHTML(paper.year || 'N/A')}</span>
            <span>•</span>
            <span class="badge" style="background: rgba(255,255,255,0.1); border: 1px solid var(--border);">${escapeHTML(sourceText)}</span>
            <span>•</span>
            <span>${escapeHTML(citationText)}</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
            <div>
                <h4 style="font-size: 0.75rem; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 0.75rem; letter-spacing: 1px;">• Key Findings</h4>
                <div style="font-size: 0.875rem; color: var(--text-main); display: flex; flex-direction: column; gap: 0.5rem;">
                    ${(paper.findings || []).length > 0 ? (paper.findings || []).map(f => `<div>${escapeHTML(f)}</div>`).join('') : '<div style="color: var(--text-muted); font-style: italic;">No findings extracted</div>'}
                </div>
            </div>
            <div>
                <h4 style="font-size: 0.75rem; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 0.75rem; letter-spacing: 1px;">• Research Gaps</h4>
                <div style="font-size: 0.875rem; color: var(--text-main); display: flex; flex-direction: column; gap: 0.5rem;">
                    ${(paper.gaps || []).length > 0 ? (paper.gaps || []).map(g => `<div data-paper-id="${escapeHTML(paper.id || '')}">${escapeHTML(g)}</div>`).join('') : '<div style="color: var(--text-muted); font-style: italic;">No gaps identified</div>'}
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button class="view-btn" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; background: transparent; border: 1px solid var(--border); color: var(--text-main); cursor: pointer;">View paper</button>
            <button class="save-btn" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; background: rgba(0, 245, 255, 0.1); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); cursor: pointer; transition: all 0.2s;">Save to Library</button>
        </div>
    `;

    // Setup 'Save to Library' logic
    const saveBtn = card.querySelector('.save-btn');
    
    // Check if already saved
    let initialSaved = JSON.parse(localStorage.getItem('saved_papers') || '[]');
    if (initialSaved.some(p => p.id === paper.id)) {
        saveBtn.textContent = 'Saved ✓';
        saveBtn.style.background = 'transparent';
    }

    saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        let savedPapers = JSON.parse(localStorage.getItem('saved_papers') || '[]');
        const isSaved = savedPapers.some(p => p.id === paper.id);

        if (isSaved) {
            // Unsave
            savedPapers = savedPapers.filter(p => p.id !== paper.id);
            saveBtn.textContent = 'Save to Library';
            saveBtn.style.background = 'rgba(0, 245, 255, 0.1)';
        } else {
            // Save
            savedPapers.unshift({
                id: paper.id,
                title: paper.title,
                authors: paper.authors,
                source: paper.source,
                year: paper.year,
                url: paper.landing_url || paper.pdf_url || paper.url || '#'
            });
            savedPapers = savedPapers.slice(0, 50); // keep last 50
            saveBtn.textContent = 'Saved ✓';
            saveBtn.style.background = 'transparent';
        }
        
        localStorage.setItem('saved_papers', JSON.stringify(savedPapers));
    });

    card.querySelector('.view-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        onOpenSidebar(paper);
    });

    return card;
}
