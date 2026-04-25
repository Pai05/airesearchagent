import re

def extract_findings_mock(abstract: str) -> tuple[list[str], list[str]]:
    """
    Extract findings and gaps from abstract by parsing sentences.
    - Findings: sentences with numbers, results, percentages, or key findings
    - Gaps: sentences with limitations, future work, or negations
    """
    if not abstract or len(abstract.strip()) < 20:
        return [], []
    
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', abstract.strip())
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    if not sentences:
        return [], []
    
    findings = []
    gaps = []
    
    # Score sentences for findings (numbers, results, key claims)
    scored_findings = []
    for sent in sentences:
        score = 0
        # Boost for numbers and percentages
        if re.search(r'\d+[\.,]\d+|[\d]+%|\d+\s*(times|fold|higher|lower|greater)', sent):
            score += 3
        # Boost for result keywords
        if any(kw in sent.lower() for kw in ['found', 'showed', 'demonstrated', 'results', 'observed', 'identified', 'analysis', 'indicates', 'suggests']):
            score += 2
        # Boost for comparative claims
        if any(kw in sent.lower() for kw in ['outperforms', 'better', 'worse', 'exceeds', 'reduces', 'increases', 'compared']):
            score += 2
        # Prefer longer sentences
        score += len(sent) // 50
        
        if score > 0:
            scored_findings.append((score, sent))
    
    # Score sentences for gaps (negations, future work, limitations)
    scored_gaps = []
    for sent in sentences:
        score = 0
        # Boost for future work and open questions
        if any(kw in sent.lower() for kw in ['future', 'further', 'remains', 'unclear', 'unknown', 'need', 'should', 'lack', 'limited', 'few', 'little']):
            score += 3
        # Boost for limitations and challenges
        if any(kw in sent.lower() for kw in ['limitation', 'challenge', 'difficult', 'problem', 'issue', 'not', 'no study', 'rarely', 'absent', 'underexplored']):
            score += 3
        # Boost for comparative negations
        if any(kw in sent.lower() for kw in ['not compared', 'not studied', 'not examined', 'not investigated']):
            score += 2
        # Prefer longer sentences
        score += len(sent) // 50
        
        if score > 0:
            scored_gaps.append((score, sent))
    
    # Sort and pick top 3 findings
    scored_findings.sort(key=lambda x: x[0], reverse=True)
    findings = [s[1] for s in scored_findings[:3]]
    
    # Sort and pick top 2 gaps
    scored_gaps.sort(key=lambda x: x[0], reverse=True)
    gaps = [s[1] for s in scored_gaps[:2]]
    
    # Fallback: if not enough findings, use longest sentences
    if len(findings) < 3:
        all_by_length = sorted(
            [(len(s), s) for s in sentences],
            key=lambda x: x[0],
            reverse=True
        )
        findings.extend([s[1] for s in all_by_length if s[1] not in findings][:3-len(findings)])
    
    # Fallback: if not enough gaps, use sentences with uncertainty
    if len(gaps) < 2:
        for sent in sentences:
            if any(kw in sent.lower() for kw in ['more research', 'further work', 'unknown', 'unclear']) and sent not in gaps:
                gaps.append(sent)
                if len(gaps) >= 2:
                    break
    
    # Clean and truncate to reasonable length
    findings = [re.sub(r'\s+', ' ', s).strip() for s in findings[:3]]
    gaps = [re.sub(r'\s+', ' ', s).strip() for s in gaps[:2]]
    
    return findings, gaps
