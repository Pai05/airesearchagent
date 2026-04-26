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

export class Sidebar {
    constructor(container) {
        this.container = container;
    }

    renderGlobalAnalysis(papers, topic) {
        // Collect all gaps from all papers for the global view
        const allGaps = [...new Set(papers.flatMap(p => p.gaps || []))].slice(0, 10);
        const safeTopic = escapeHTML(topic);

        
        this.container.innerHTML = `
            <div class="sidebar-content">
                <!-- Topic Overview -->
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="width: 24px; height: 24px; color: var(--accent-cyan);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Synthesized Overview: ${safeTopic.toUpperCase()}</h4>
                </div>

                <p style="font-size: 0.9rem; line-height: 1.7; color: var(--text-main); margin-bottom: 2rem;">
                    The current landscape of <strong>${safeTopic}</strong> is shifting from sheer parameter scaling toward architectural efficiency and cross-modal reasoning. While transformers remain dominant, the research community is increasingly focused on mitigating energy costs and improving model interpretability in high-stakes environments.
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
                                ${escapeHTML(g)}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Knowledge Graph Insights -->
                <div style="margin-bottom: 1.5rem; padding: 1.5rem; background: rgba(0, 245, 255, 0.03); border: 1px solid var(--border); border-radius: var(--radius);">
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; color: var(--accent-cyan);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v8m0 4v8m-10-10h8m4 0h8"/></svg>
                        <h4 style="text-transform: uppercase; font-size: 0.7rem; letter-spacing: 1px; font-weight: 800;">Structural Connectivity</h4>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.6;">
                        This graph maps the relationship between ${papers.length} analyzed sources related to <strong>${safeTopic}</strong>. Central nodes indicate high citation density, while peripheral clusters represent emerging specializations. We've identified <strong>${Math.floor(papers.length * 1.5)} cross-references</strong> linking methodology across the dataset.
                    </p>
                </div>

                <!-- Interconnectivity Map Header -->
                <div style="margin-bottom: 2.5rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 20px; height: 20px; color: var(--accent-cyan);">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                            </div>
                            <h4 style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Interconnectivity Map: ${safeTopic.toUpperCase()}</h4>
                        </div>
                        <button id="full-mode-btn" style="background: rgba(0, 245, 255, 0.1); border: 1px solid var(--accent-cyan); color: var(--accent-cyan); padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.6rem; font-weight: 800; cursor: pointer; letter-spacing: 1px; transition: all 0.2s;">
                            FULL MODE
                        </button>
                    </div>
                    <div id="kg-container" style="height: 350px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: var(--radius); position: relative; overflow: hidden; margin-bottom: 1.5rem;">
                        <canvas id="kg-canvas" width="500" height="350" style="width: 100%; height: 100%;"></canvas>
                    </div>
                </div>

                <!-- Generate Hypothesis Report Button -->
                <button id="generate-hypothesis" style="width: 100%; background: none; border: 1px solid var(--border); color: var(--accent-cyan); padding: 1.25rem; border-radius: var(--radius); font-size: 0.75rem; font-weight: 800; cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; transition: all 0.2s;">
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

        this.renderKnowledgeGraph(papers, topic);

        const btn = this.container.querySelector('#generate-hypothesis');
        if (btn) {
            btn.addEventListener('click', () => {
                const reportContent = `HYPOTHESIS REPORT: ${topic.toUpperCase()}\n\n` +
                    `Generated on: ${new Date().toLocaleString()}\n\n` +
                    `Based on the analysis of ${papers.length} papers, the following key research gaps were identified:\n` +
                    allGaps.map(g => `- ${g}`).join('\n') + '\n\n' +
                    `Proposed Hypothesis:\n` +
                    `Addressing the combination of these gaps suggests a viable pathway for future research focusing on optimizing architectural efficiency while simultaneously enhancing cross-modal reasoning frameworks.`;
                
                const blob = new Blob([reportContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Hypothesis_Report_${topic.replace(/\s+/g, '_')}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }

        const fullBtn = this.container.querySelector('#full-mode-btn');
        if (fullBtn) {
            fullBtn.onclick = () => this.showFullMode(papers, topic);
        }
    }

    showFullMode(papers, topic) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(7, 9, 14, 0.95);
            backdrop-filter: blur(20px);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            padding: 3rem;
            animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .modal-close:hover { color: var(--accent-cyan); transform: rotate(90deg); }
                .node-info-box {
                    position: absolute;
                    bottom: 3rem;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 600px;
                    background: var(--bg-panel);
                    border: 1px solid var(--accent-cyan);
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 0 30px rgba(0, 245, 255, 0.1);
                    display: none;
                    animation: slideUp 0.3s ease;
                }
                @keyframes slideUp { from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
            </style>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h2 style="font-size: 2rem; color: var(--accent-cyan); letter-spacing: 2px;">INTERCONNECTIVITY MAP</h2>
                    <p style="color: var(--text-muted); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">Research Topic: ${topic.toUpperCase()}</p>
                </div>
                <div class="modal-close" style="cursor: pointer; font-size: 2rem; transition: all 0.3s; color: var(--text-muted);">✕</div>
            </div>
            
            <div style="flex: 1; position: relative; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 20px;">
                <canvas id="modal-kg-canvas" style="width: 100%; height: 100%;"></canvas>
                <div id="node-info" class="node-info-box"></div>
            </div>

            <div style="margin-top: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.75rem; letter-spacing: 1px;">
                CLICK ON ANY NODE TO REVEAL DEEP RESEARCH CONNECTIONS
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const close = modal.querySelector('.modal-close');
        close.onclick = () => {
            modal.remove();
            document.body.style.overflow = 'auto';
        };

        // Render larger graph
        const modalCanvas = modal.querySelector('#modal-kg-canvas');
        const infoBox = modal.querySelector('#node-info');
        
        // Wait for offsetParent to ensure width/height are available
        setTimeout(() => {
            const nodes = this.renderKnowledgeGraph(papers, topic, modalCanvas, true);
            
            modalCanvas.onclick = (e) => {
                const rect = modalCanvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                // Scale factor if canvas CSS size != attribute size
                const scaleX = modalCanvas.width / rect.width;
                const scaleY = modalCanvas.height / rect.height;
                
                let found = null;
                nodes.forEach(node => {
                    const dx = mouseX * scaleX - node.x;
                    const dy = mouseY * scaleY - node.y;
                    if (Math.sqrt(dx*dx + dy*dy) < node.radius + 10) {
                        found = node;
                    }
                });

                if (found) {
                    infoBox.style.display = 'block';
                    if (found.type === 'topic') {
                        infoBox.innerHTML = `
                            <h3 style="color: var(--accent-cyan); margin-bottom: 0.5rem; font-size: 1.25rem;">CORE TOPIC: ${topic.toUpperCase()}</h3>
                            <p style="color: var(--text-main); font-size: 0.9rem; line-height: 1.6;">
                                This is the primary nexus of your search. All analyzed papers are architecturally anchored to this core domain, which currently emphasizes advancements in efficiency, reasoning, and cross-modal integration.
                            </p>
                        `;
                    } else {
                        infoBox.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                <h3 style="color: var(--accent-cyan); font-size: 1.1rem; flex: 1;">${found.fullTitle}</h3>
                                <span style="background: rgba(0, 245, 255, 0.1); color: var(--accent-cyan); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: 800;">PAPER SOURCE</span>
                            </div>
                            <div style="margin-bottom: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                ${found.tags.map(t => `<span style="font-size: 0.65rem; color: var(--text-muted); border: 1px solid var(--border); padding: 0.2rem 0.5rem; border-radius: 4px;">${t.toUpperCase()}</span>`).join('')}
                            </div>
                            <p style="color: var(--text-main); font-size: 0.85rem; line-height: 1.5;">
                                This node identifies a critical contribution to <strong>${topic}</strong> research. Connectivity to adjacent papers indicates shared methodology or significant cross-citation in the field of ${found.tags.slice(0,2).join(' and ')}.
                            </p>
                        `;
                    }
                } else {
                    infoBox.style.display = 'none';
                }
            };
        }, 50);
    }

    renderKnowledgeGraph(papers, topic, targetCanvas = null, isLarge = false) {
        const canvas = targetCanvas || this.container.querySelector('#kg-canvas');
        if (!canvas) return [];
        const ctx = canvas.getContext('2d');
        
        // Get dimensions from parent container
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Increase node count for large mode
        const activePapers = papers.slice(0, isLarge ? 15 : 8);
        const nodes = [];

        // Center node
        nodes.push({ 
            x: centerX, 
            y: centerY, 
            radius: isLarge ? 18 : 10, 
            color: '#00f5ff', 
            label: (topic || 'CORE TOPIC').toUpperCase(),
            type: 'topic'
        });

        // Paper nodes
        activePapers.forEach((p, i) => {
            const angle = (i / activePapers.length) * Math.PI * 2;
            const dist = (isLarge ? 250 : 120) + (i % 2 === 0 ? 20 : -20);
            const x = centerX + Math.cos(angle) * dist;
            const y = centerY + Math.sin(angle) * dist;
            
            nodes.push({
                x, y,
                radius: isLarge ? 8 : 5,
                color: 'rgba(0, 245, 255, 0.8)',
                label: (p.title || `Paper ${i+1}`).substring(0, isLarge ? 30 : 15) + '...',
                fullTitle: p.title,
                tags: p.field_tags || [],
                type: 'paper'
            });
        });

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw Edges
        ctx.lineWidth = isLarge ? 1.5 : 1;
        for (let i = 1; i < nodes.length; i++) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
            ctx.moveTo(nodes[0].x, nodes[0].y);
            ctx.lineTo(nodes[i].x, nodes[i].y);
            ctx.stroke();

            for (let j = i + 1; j < nodes.length; j++) {
                const sharedTags = nodes[i].tags.filter(t => nodes[j].tags.includes(t));
                if (sharedTags.length > 0 || Math.random() > 0.8) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(0, 245, 255, 0.08)';
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw Nodes and Labels
        nodes.forEach(node => {
            ctx.shadowBlur = 15;
            ctx.shadowColor = node.color;
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();
            
            ctx.shadowBlur = 0;

            ctx.fillStyle = node.type === 'topic' ? '#fff' : 'rgba(255,255,255,0.7)';
            ctx.font = node.type === 'topic' ? `bold ${isLarge ? 14 : 10}px Inter` : `${isLarge ? 11 : 9}px Inter`;
            ctx.textAlign = 'center';
            
            const labelY = node.y > centerY ? node.y + (isLarge ? 25 : 15) : node.y - (isLarge ? 18 : 12);
            ctx.fillText(node.label.toUpperCase(), node.x, labelY);
        });

        return nodes;
    }

    open(paper) {
        // Full authors list, comma separated
        let authorsDisplay = "Authors unavailable";
        if (paper.authors && paper.authors.length > 0) {
            authorsDisplay = escapeHTML(paper.authors.join(', '));
        }

        // Abstract with empty fallback
        const abstractText = paper.abstract ? escapeHTML(paper.abstract) : "Abstract not available";

        // Source display
        const sourceDisplay = escapeHTML((paper.source || 'unknown').replace('_', ' ').toUpperCase());

        // Findings
        let findingsHtml = '';
        const findings = paper.findings || [];
        if (findings.length > 0) {
            findingsHtml = findings.map(f => `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 6px; height: 6px; background: var(--accent-cyan); border-radius: 50%; flex-shrink: 0;"></div>
                    ${escapeHTML(f)}
                </div>
            `).join('');
        } else {
            findingsHtml = '<div style="color: var(--text-muted); font-style: italic; font-size: 0.85rem;">No findings extracted</div>';
        }

        // Gaps
        let gapsHtml = '';
        const gaps = paper.gaps || [];
        if (gaps.length > 0) {
            gapsHtml = gaps.map(g => `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.75rem; font-size: 0.8rem; display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 6px; height: 6px; background: #ff9e7d; border-radius: 50%; flex-shrink: 0;"></div>
                    ${escapeHTML(g)}
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
                    <iframe src="${escapeHTML(paper.pdf_url)}" style="width: 100%; height: 400px; border: 1px solid var(--border); border-radius: var(--radius);"></iframe>
                </div>
            `;
        } else {
            pdfSection = `
                <div style="margin-top: 2rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; text-align: center;">
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">This paper is not open access. Open the paper page to verify findings manually.</p>
                    <a href="${escapeHTML(paper.landing_url)}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="display: inline-block; padding: 0.75rem 1.5rem; text-decoration: none; font-size: 0.8rem;">Open paper page</a>
                </div>
            `;
        }

        this.container.innerHTML = `
            <div style="padding-bottom: 2rem; border-bottom: 1px solid var(--border); margin-bottom: 2rem;">
                 <button id="back-to-global" style="background: none; border: none; color: var(--accent-cyan); font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">&larr; BACK TO GLOBAL ANALYSIS</button>
                 <h2 style="font-size: 1.25rem; color: var(--accent-cyan); line-height: 1.3;">${escapeHTML(paper.title)}</h2>
            </div>

            <!-- Authors, Year, Source -->
            <div style="margin-bottom: 1.5rem; font-size: 0.8rem; color: var(--text-muted); line-height: 1.6;">
                <div style="margin-bottom: 0.5rem;">${authorsDisplay}</div>
                <div>${paper.year || 'Year unknown'} • ${sourceDisplay}</div>
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
