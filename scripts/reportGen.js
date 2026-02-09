function generateAuditReport(data) {
    const risk = calculateRisk(data.overallScore);
    
    return `
        <div class="report-page">
            <h1 style="color:var(--st-navy)">INTERNAL AUDIT REPORT: ${data.ref}</h1>
            <table class="audit-table">
                <tr><th>Criteria</th><th>Marking</th><th>RM3 Level</th></tr>
                ${data.results.map(r => `
                    <tr>
                        <td>${r.question}</td>
                        <td style="color:${SCORES[r.level].color}">${SCORES[r.level].label}</td>
                        <td>${r.level}</td>
                    </tr>
                `).join('')}
            </table>
            
            <div class="risk-exposure-box">
                <h3>Executive Risk Summary</h3>
                <p><b>Legal Exposure:</b> ${risk.legalRisk}</p>
                <p><b>Estimated Financial Risk (AI Data):</b> ${risk.financialExposure}</p>
            </div>

            <div class="sign-off">
                <p><b>Auditor:</b> ${data.auditorName} | Date: ${new Date().toLocaleDateString()}</p>
                <p><b>Head of SHEQ Sign-off:</b> ____________________</p>
            </div>
        </div>
    `;
}
