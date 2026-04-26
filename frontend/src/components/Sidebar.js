export class Sidebar {
    constructor(container) {
        this.container = container;
    }

    renderGlobalAnalysis(papers, topic) {
        // Collect all gaps from all papers for the global view
        const allGaps = [...new Set(papers.flatMap(p => p.gaps))].slice(0, 5);
        
        this.container.innerHTML = `
            <div class="sidebar-content">
                <!-- Topic Overview -->
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="width: 24px; height: 24px; color: var(--accent-cyan);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Synthesized Overview: ${topic.toUpperCase()}</h4>
                </div>

                <p style="font-size: 0.9rem; line-height: 1.7; color: var(--text-main); margin-bottom: 2rem;">
                    The current landscape of <strong>${topic}</strong> is shifting from sheer parameter scaling toward architectural efficiency and cross-modal reasoning. While transformers remain dominant, the research community is increasingly focused on mitigating energy costs and improving model interpretability in high-stakes environments.
                </p>

                <!-- Global Research Gaps -->
                <div style="margin-bottom: 2.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="width: 20px; height: 20px; color: #ff9e7d;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        </div>
                        <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Global Research Gaps</h4>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${allGaps.map(g => `
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.75rem;">
                                <div style="width: 6px; height: 6px; background: var(--accent-cyan); border-radius: 50%;"></div>
                                ${g}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Knowledge Graph Placeholder -->
                <div style="margin-bottom: 2.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="width: 20px; height: 20px; color: var(--accent-cyan);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                        </div>
                        <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Knowledge Graph</h4>
                    </div>
                    <div style="height: 200px; background: rgba(0,0,0,0.2); border: 1px dashed var(--border); border-radius: var(--radius); position: relative; overflow: hidden;">
                        <!-- SVG "Graph" simulation -->
                        <svg width="100%" height="100%" style="opacity: 0.4;">
                            <line x1="50" y1="50" x2="150" y2="100" stroke="var(--accent-cyan)" stroke-width="1"/>
                            <line x1="150" y1="100" x2="250" y2="50" stroke="var(--accent-cyan)" stroke-width="1"/>
                            <line x1="150" y1="100" x2="100" y2="150" stroke="var(--accent-cyan)" stroke-width="1"/>
                            <circle cx="50" cy="50" r="4" fill="var(--accent-cyan)"/>
                            <circle cx="150" cy="100" r="6" fill="var(--accent-cyan)"/>
                            <circle cx="250" cy="50" r="4" fill="var(--accent-cyan)"/>
                            <circle cx="100" cy="150" r="4" fill="var(--accent-cyan)"/>
                        </svg>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Mapping Neural Relationships...</div>
                    </div>
                </div>

                <!-- Generate Hypothesis Report Button -->
                <button style="width: 100%; background: none; border: 1px solid var(--border); color: var(--accent-cyan); padding: 1.25rem; border-radius: var(--radius); font-size: 0.75rem; font-weight: 800; cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; transition: all 0.2s;">
                    GENERATE HYPOTHESIS REPORT
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </button>

                <!-- Footer Intel -->
                <div style="margin-top: auto; background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 1.5rem; border-radius: var(--radius);">
                    <div style="display: flex; align-items: center; gap: 1rem; color: var(--text-muted); margin-bottom: 1rem;">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                         <span style="font-size: 0.65rem; font-weight: 800;">LIVE INTEL FEED</span>
                    </div>
                    <p style="font-size: 0.7rem; color: var(--text-muted); font-style: italic;">Tracing new arXiv submissions in real-time...</p>
                </div>
            </div>
        `;
    }

    open(paper) {
        // Full authors list, comma separated
        let authorsDisplay = "Authors unavailable";
        if (paper.authors && paper.authors.length > 0) {
            authorsDisplay = paper.authors.join(', ');
        }

        // Abstract with empty fallback
        const abstractText = paper.abstract ? paper.abstract : "Abstract not available";

        // Source display
        const sourceDisplay = paper.source.replace('_', ' ').toUpperCase();

        // Findings
        let findingsHtml = '';
        if (paper.findings.length > 0) {
            findingsHtml = paper.findings.map(f => `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 6px; height: 6px; background: var(--accent-cyan); border-radius: 50%; flex-shrink: 0;"></div>
                    ${f}
                </div>
            `).join('');
        } else {
            findingsHtml = '<div style="color: var(--text-muted); font-style: italic; font-size: 0.85rem;">No findings extracted</div>';
        }

        // Gaps
        let gapsHtml = '';
        if (paper.gaps.length > 0) {
            gapsHtml = paper.gaps.map(g => `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 6px; height: 6px; background: #ff9e7d; border-radius: 50%; flex-shrink: 0;"></div>
                    ${g}
                </div>
            `).join('');
        } else {
            gapsHtml = '<div style="color: var(--text-muted); font-style: italic; font-size: 0.85rem;">No gaps identified</div>';
        }

        // PDF section — with proper landing_url fallback
        let pdfSection = '';
        if (paper.pdf_url) {
            pdfSection = `
                <div style="margin-top: 2rem;">
                    <p style="font-size: 0.7rem; color: var(--accent-cyan); font-style: italic; margin-bottom: 0.75rem;">Reading the paper directly confirms findings are not hallucinated.</p>
                    <iframe src="${paper.pdf_url}" style="width: 100%; height: 400px; border: 1px solid var(--border); border-radius: var(--radius);"></iframe>
                </div>
            `;
        } else {
            pdfSection = `
                <div style="margin-top: 2rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; text-align: center;">
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">This paper is not open access. Open the paper page to verify findings manually.</p>
                    <a href="${paper.landing_url}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="display: inline-block; padding: 0.75rem 1.5rem; text-decoration: none; font-size: 0.8rem;">Open paper page</a>
                </div>
            `;
        }

        this.container.innerHTML = `
            <div style="padding-bottom: 2rem; border-bottom: 1px solid var(--border); margin-bottom: 2rem;">
                 <button id="back-to-global" style="background: none; border: none; color: var(--accent-cyan); font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">&larr; BACK TO GLOBAL ANALYSIS</button>
                 <h2 style="font-size: 1.25rem; color: var(--accent-cyan); line-height: 1.3;">${paper.title}</h2>
            </div>

            <!-- Authors, Year, Source -->
            <div style="margin-bottom: 1.5rem; font-size: 0.8rem; color: var(--text-muted); line-height: 1.6;">
                <div style="margin-bottom: 0.5rem;">${authorsDisplay}</div>
                <div>${paper.year} • ${sourceDisplay}</div>
            </div>

            <!-- Abstract -->
            <div style="margin-bottom: 2rem;">
                <h4 style="text-transform: uppercase; font-size: 0.7rem; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 1rem;">Full Abstract</h4>
                <p style="font-size: 0.875rem; line-height: 1.6; color: var(--text-main);">${abstractText}</p>
            </div>

            <!-- Key Findings -->
            <div style="margin-bottom: 2rem;">
                <h4 style="text-transform: uppercase; font-size: 0.7rem; color: var(--accent-cyan); letter-spacing: 1px; margin-bottom: 1rem;">Key Findings</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${findingsHtml}
                </div>
            </div>

            <!-- Research Gaps -->
            <div style="margin-bottom: 2rem;">
                <h4 style="text-transform: uppercase; font-size: 0.7rem; color: #ff9e7d; letter-spacing: 1px; margin-bottom: 1rem;">Research Gaps</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${gapsHtml}
                </div>
            </div>

            <!-- PDF / Landing URL section -->
            ${pdfSection}
        `;

        this.container.querySelector('#back-to-global').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('show-global-analysis'));
        });
    }
}
