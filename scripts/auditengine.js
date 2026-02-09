// Automated RM3 and Risk Scoring Engine
const SCORES = {
    'AD-HOC': { label: 'Major NC', color: '#d32f2f', weight: 0 },
    'MANAGED': { label: 'Minor NC', color: '#ef6c00', weight: 25 },
    'STANDARDISED': { label: 'OFI', color: '#fbc02d', weight: 50 },
    'PREDICTABLE': { label: 'Conforming', color: '#388e3c', weight: 80 },
    'EXCELLENCE': { label: 'Conforming with Excellence', color: '#1b5e20', weight: 100 }
};

function calculateRisk(scorePercentage) {
    // Web Research Logic: Average HSE Fines for rail/heavy industry in 2025: £800k - £6M
    const legalRisk = scorePercentage < 40 ? "HIGH - Potential HSE Prosecution" : "LOW - SMS Compliant";
    const financialExposure = scorePercentage < 40 ? "£1.2M - £5M (Est. Fine + Costs)" : "£0 (Operational Normal)";
    return { legalRisk, financialExposure };
}

function autoScoreResponse(text) {
    // Simulation of AI detection for evidence keywords
    const keywords = ['procedure', 'ref', 'st0', 'evidence', 'signed', 'calibrated'];
    let hits = keywords.filter(k => text.toLowerCase().includes(k)).length;
    
    if (text.length < 10) return 'AD-HOC';
    if (hits > 3) return 'PREDICTABLE';
    if (hits > 1) return 'STANDARDISED';
    return 'MANAGED';
}

// Logic for Automated Major NC if 14 days passed
function checkDeadline(issueDate) {
    const diff = (new Date() - new Date(issueDate)) / (1000 * 60 * 60 * 24);
    if (diff > 14) return "MAJOR NC - DEFAULT FAILURE TO PARTICIPATE";
}
