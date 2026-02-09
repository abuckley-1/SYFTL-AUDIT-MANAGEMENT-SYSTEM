function generateProfessionalReport(data) {
    const reportHtml = `
        <div class="report-cover">
            <h1>Internal Audit Report: ${data.ref}</h1>
            <h2>${data.scope}</h2>
            <p>Auditor: ${data.auditor} | Period: ${data.period}</p>
        </div>
        <div class="report-section">
            <h3>Audit Objective</h3>
            <p>The purpose of this audit is to assess the compliance of current business practices... meeting relevant criterion against legal, universal standards, and or best practice requirements in line with the SMS and other management systems.</p>
        </div>
        <div class="risk-exposure">
            <h3>Risk Exposure (AI Analysis)</h3>
            <table>
                <tr><td>Legal Risk</td><td>${data.legalRisk}</td></tr>
                <tr><td>Financial Risk</td><td>${data.financialRisk}</td></tr>
                <tr><td>Moral Risk</td><td>High/Medium/Low</td></tr>
            </table>
        </div>
        <div class="marking-table">
            ${generateMarkingTable(data.results)}
        </div>
    `;
    return reportHtml;
}
