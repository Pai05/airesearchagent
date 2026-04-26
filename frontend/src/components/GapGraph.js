export class GapGraph {
    constructor(container, onGapClick) {
        this.container = container;
        this.onGapClick = onGapClick;
        this.activeGap = null;
    }

    setPapers(papers) {
        this.gapItems = [];
        papers.forEach(paper => {
            paper.gaps.forEach(gapText => {
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
                    <div style="width: 12px; height: 12px; background: var(--accent-cyan); border-radius: 50%; box-shadow: 0 0 10px var(--accent-cyan);"></div>
                    <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Research gaps found: ${this.gapItems.length}</h4>
                </div>
                <div class="bubbles-container">
                    ${this.gapItems.map((gap, index) => `
                        <div class="gap-bubble ${this.activeGap === index ? 'active' : ''}" data-index="${index}">
                            ${gap.text}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.container.querySelectorAll('.gap-bubble').forEach(bubble => {
            bubble.addEventListener('click', () => {
                const index = parseInt(bubble.dataset.index);
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
