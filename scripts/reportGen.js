/**
 * Supertram Sentinel - Report Generator
 * Purpose: Converts audit data into professional SHEQ reports
 * Reference: ST0096 Branding & Layout
 */

const ReportGenerator = {
    // 1. REPORT CONFIGURATION
    settings: {
        companyName: "Stagecoach Supertram",
        reportRef: "ST0096",
        logoPath: "STLogo.jpg"
    },

    // 2. MAIN GENERATION FUNCTION
    generate: function(auditData) {
        // auditData includes: scope, auditee, scores, evidence, and actions
        const risk = AuditEngine.projectRisk(auditData.overallRM3);
        
        const reportHTML = `
            <div class="report-wrapper">
                <header class="report-header">
                    <img src="${this.settings.logoPath}" class="report-logo">
                    <div class="header-text">
                        <h1>INTERNAL AUDIT REPORT</h1>
                        <p>Reference: ${auditData.ref || this.settings.reportRef}</p>
                    </div>
                </header>

                <section class="report-section">
                    <h2 class="section-title">1. Report Preparation and Approval</h2>
                    <table class="info-table">
                        <tr><td><strong>Process Owner:</strong></td><td>${auditData.auditee}</td></tr>
                        <tr><td><strong>Auditee Manager:</strong></td><td>N. Dobbs (HofENG)</td></tr>
                        <tr><td><strong>Audit Date:</strong></td><td>${new Date().toLocaleDateString()}</td></tr>
                    </table>
                </section>

                <section class="report-section highlight-box">
                    <h2 class="section-title">2. Executive Risk Summary</h2>
                    <p><strong>RM3 Maturity Level:</strong> <span class="status-${auditData.overallRM3.toLowerCase()}">${auditData.overallRM3}</span></p>
                    <p><strong>Legal Exposure:</strong> ${risk.legal}</p>
                    <p><strong>Financial Liability (Est):</strong> ${risk.financial}</p>
                </section>

                <section class="report-section">
                    <h2 class="section-title">3. Audit Findings & Scoring</h2>
                    <table class="findings-table">
                        <thead>
                            <tr>
                                <th>Criteria / Question</th>
                                <th>Evidence Found</th>
                                <th>Maturity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${auditData.findings.map(f => `
                                <tr>
                                    <td>${f.question}</td>
                                    <td>${f.evidence}</td>
                                    <td><strong>${f.level}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </section>

                <section class="report-section">
                    <h2 class="section-title">4. Recommendations and Actions</h2>
                    <div class="action-box">
                        <p><strong>Action 1:</strong> ${auditData.recommendation || "Review relevant training as referenced within the report."}</p>
                        <p><strong>Owner:</strong> N. Dobbs | <strong>Due:</strong> 30.01.2025</p>
                    </div>
                </section>

                <footer class="report-footer">
                    <div class="sign-off">
                        <p>__________________________</p>
                        <p>Head of SHEQ (Approval)</p>
                    </div>
                    <div class="sign-off">
                        <p>__________________________</p>
                        <p>Managing Director (Review)</p>
                    </div>
                </footer>
            </div>
        `;

        return reportHTML;
    },

    // 3. EXPORT TO PRINT
    printReport: function(elementId) {
        const content = document.getElementById(elementId).innerHTML;
        const win = window.open('', '', 'height=700,width=900');
        win.document.write('<html><head><title>Audit Report Print</title>');
        win.document.write('<link rel="stylesheet" href="styles.css">');
        win.document.write('</head><body>');
        win.document.write(content);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
    }
};
