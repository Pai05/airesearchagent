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

export class GapGraph {
    constructor(container, onGapClick) {
        this.container = container;
        this.onGapClick = onGapClick;
        this.activeGap = null;
    }

    setPapers(papers) {
        this.gapItems = [];
        papers.forEach(paper => {
            (paper.gaps || []).forEach(gapText => {
                this.gapItems.push({ text: gapText, paper_id: paper.id });
            });
        });
        this.render();
    }

    render() {
        if (!this.gapItems || this.gapItems.length === 0) {
            this.container.innerHTML = '';
            return;
        }

        this.container.innerHTML = `
            <div class="gap-graph">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="width: 20px; height: 20px; color: var(--accent-cyan);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Research Gaps (${this.gapItems.length})</h4>
                </div>
                <div class="bubbles-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${this.gapItems.slice(0, 8).map((gap, index) => `
                        <div class="gap-item ${this.activeGap === index ? 'active' : ''}" 
                             data-index="${index}" 
                             style="padding: 1rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.8rem; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;">
                            <div style="display: flex; gap: 1rem; align-items: flex-start;">
                                <div style="width: 8px; height: 8px; background: var(--accent-cyan); border-radius: 50%; margin-top: 4px; flex-shrink: 0; box-shadow: 0 0 8px var(--accent-cyan);"></div>
                                <div style="line-height: 1.5; color: var(--text-main);">${escapeHTML(gap.text)}</div>
                            </div>
                        </div>
                    `).join('')}
                    ${this.gapItems.length > 8 ? `<div style="text-align: center; font-size: 0.7rem; color: var(--text-muted); margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 1px;">+ ${this.gapItems.length - 8} MORE GAPS IDENTIFIED</div>` : ''}
                </div>
            </div>
        `;

        this.container.querySelectorAll('.gap-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                const gap = this.gapItems[index];
                
                if (this.activeGap === index) {
                    this.activeGap = null;
                    this.onGapClick(null);
                } else {
                    this.activeGap = index;
                    this.onGapClick(gap.paper_id);
                }
                this.render();
            });
        });
    }
}
