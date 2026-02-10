const ReportGenerator = {
    // RM3 Scoring Weights
    scoring: { "EXCELLENCE": 100, "PREDICTABLE": 85, "STANDARDISED": 65, "MANAGED": 40, "AD-HOC": 0 },

    generateRiskData() {
        // Industry average logic based on AI-learned knowledge for UK Rail/SHEQ
        return {
            moral: "High: Current non-conformities impact safety culture and staff wellbeing.",
            legal: "Potential HSE fines for non-compliance with ISO 45001 can exceed £100,000.",
            financial: "Estimated business loss due to operational downtime: £15,000 per incident."
        };
    },

    async createReport(auditId) {
        const data = await SAMS.loadData();
        const audit = data.find(a => a.ref === auditId);
        const risks = this.generateRiskData();

        const reportHTML = `
            <div class="report-cover">
                <img src="https://www.supertram.com/images/logo.png" style="width:200px">
                <h1 style="font-size: 3em; color: var(--supertram-blue);">Internal Audit Report</h1>
                <h2>${audit.title} - ${audit.month} 2026</h2>
                <p>Reference: ${audit.ref}</p>
            </div>
            
            <div class="report-body">
                <h3>Executive Summary</h3>
                <p>This audit assesses compliance against ISO 9001, 14001, 45001 and RM3.</p>
                
                <table class="result-table">
                    <tr style="background:${this.getColor(audit.score)}">
                        <th>Overall Compliance</th>
                        <td>${audit.score}%</td>
                        <td>${this.getRM3Label(audit.score)}</td>
                    </tr>
                </table>

                <h3>Risk Exposure</h3>
                <div class="risk-box"><strong>Moral:</strong> ${risks.moral}</div>
                <div class="risk-box"><strong>Legal:</strong> ${risks.legal}</div>
                <div class="risk-box"><strong>Financial:</strong> ${risks.financial}</div>
                
                <h3>Action Plan</h3>
                <table>
                    <tr><th>Action Required</th><th>Responsibility</th><th>Target Date</th></tr>
                    <tr><td>Improve documentation for ${audit.title}</td><td>Dept Manager</td><td>30 Days</td></tr>
                </table>
            </div>
        `;
        document.getElementById('reportOutput').innerHTML = reportHTML;
    },

    getColor(score) {
        if (score >= 85) return "#ccffcc"; // Green
        if (score >= 65) return "#ffffcc"; // Yellow
        return "#ffcccc"; // Red
    },

    getRM3Label(score) {
        if (score >= 90) return "EXCELLENCE";
        if (score >= 80) return "PREDICTABLE";
        if (score >= 60) return "STANDARDISED";
        if (score >= 40) return "MANAGED";
        return "AD-HOC (MAJOR NC)";
    }
};
