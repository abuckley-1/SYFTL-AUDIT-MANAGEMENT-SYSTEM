const RM3_MAP = {
    'AD-HOC': { label: 'Major NC', color: '#ff0000' },
    'MANAGED': { label: 'Minor NC', color: '#ff9900' },
    'STANDARDISED': { label: 'OFI', color: '#ffff00' },
    'PREDICTABLE': { label: 'Conforming', color: '#00cc00' },
    'EXCELLENCE': { label: 'Conforming with Excellence', color: '#006600' }
};

function processAuditResults(responses) {
    let score = 0;
    let furtherEvidenceRequired = [];

    responses.forEach(q => {
        // AI Logic Simulation: Check for "Evidence" keywords
        const analysis = aiAnalyseResponse(q.text);
        
        if (analysis.confidence < 0.6) {
            q.status = "FURTHER EVIDENCE REQUIRED";
            furtherEvidenceRequired.push(q.id);
        } else {
            q.score = analysis.calculatedScore;
            q.rm3Level = mapScoreToRM3(q.score);
        }
    });

    // Automated Major NC for Deadline Breach
    if (Date.now() > new Date(auditDeadline)) {
        return "MAJOR NC - DEFAULT (FAILURE TO PARTICIPATE)";
    }

    return generateReportData(responses);
}

function mapScoreToRM3(percentage) {
    if (percentage < 30) return 'AD-HOC';
    if (percentage < 50) return 'MANAGED';
    if (percentage < 75) return 'STANDARDISED';
    if (percentage < 90) return 'PREDICTABLE';
    return 'EXCELLENCE';
}
