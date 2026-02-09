/**
 * Supertram Sentinel - Audit Engine
 * Handles: Dynamic Scoring, RM3 Mapping, and Legal/Financial Risk Projection
 */

const AuditEngine = {
    // 1. SCORING CRITERIA (Aligned with RM3 Maturity Model)
    criteria: {
        'AD-HOC': { label: 'Major NC', weight: 0, color: '#E30613' },      // Red
        'MANAGED': { label: 'Minor NC', weight: 25, color: '#F26522' },    // Orange
        'STANDARDISED': { label: 'OFI', weight: 50, color: '#fbc02d' },    // Yellow
        'PREDICTABLE': { label: 'Conforming', weight: 80, color: '#388e3c' }, // Green
        'EXCELLENCE': { label: 'Excellence', weight: 100, color: '#1b5e20' }  // Dark Green
    },

    // 2. AUTOMATED SCORING LOGIC
    // Calculates a percentage based on the number of questions and their maturity level
    calculateFinalScore: function(responses) {
        let totalPossible = responses.length * 100;
        let totalEarned = 0;

        responses.forEach(res => {
            totalEarned += this.criteria[res.level].weight;
        });

        const percentage = (totalEarned / totalPossible) * 100;
        return {
            percentage: Math.round(percentage),
            rm3Level: this.getRM3Level(percentage)
        };
    },

    // 3. RM3 MATURITY MAPPING
    getRM3Level: function(percentage) {
        if (percentage < 30) return 'AD-HOC';
        if (percentage < 50) return 'MANAGED';
        if (percentage < 75) return 'STANDARDISED';
        if (percentage < 90) return 'PREDICTABLE';
        return 'EXCELLENCE';
    },

    // 4. RISK PROJECTION (Based on 2025/2026 HSE Sentencing Guidelines)
    // Derived from heavy industry/rail safety data regarding failure to participate
    projectRisk: function(rm3Level) {
        let riskProfile = {
            legal: "LOW - SMS Compliant",
            financial: "£0 (Operational Normal)",
            moral: "LOW - Staff Safety Assured"
        };

        if (rm3Level === 'AD-HOC' || rm3Level === 'MANAGED') {
            riskProfile.legal = "HIGH - Potential HSE Intervention/Prosecution";
            riskProfile.financial = "£1.2M - £4.5M (Est. Fine + Legal Costs)";
            riskProfile.moral = "HIGH - Increased Risk of Workplace Injury";
        }

        return riskProfile;
    },

    // 5. DEADLINE MONITORING (The 14-Day Rule)
    // This function is called during the submission to check if the auditee delayed
    checkSubmissionCompliance: function(issueDate) {
        const today = new Date();
        const start = new Date(issueDate);
        const diffDays = Math.ceil((today - start) / (1000 * 60 * 60 * 24));

        if (diffDays > 14) {
            return {
                compliant: false,
                penalty: "MAJOR NC",
                reason: `Default failure to participate within the mandated 14-day window (Submitted Day ${diffDays}).`
            };
        }
        return { compliant: true };
    }
};

// Export for use in other scripts if needed
if (typeof module !== 'undefined') {
    module.exports = AuditEngine;
}

const AuditEngine = {
    allAudits: [],
    
    async init() {
        try {
            const res = await fetch('./data/schedules_2026.json');
            this.allAudits = await res.json();
            this.populateSelector();
        } catch (e) { console.error("Sync Error", e); }
    },

    populateSelector() {
        const select = document.getElementById('auditSelector');
        const openAudits = this.allAudits.filter(a => a.status !== 'CLOSED' && a.title !== 'none');
        
        select.innerHTML = '<option value="">-- Choose Audit --</option>' + 
            openAudits.map((a, i) => `<option value="${i}">${a.month}: ${a.title}</option>`).join('');
    },

    loadAuditDetails() {
        const idx = document.getElementById('auditSelector').value;
        if (idx === "") return;
        
        const audit = this.allAudits.filter(a => a.status !== 'CLOSED' && a.title !== 'none')[idx];
        document.getElementById('displayRef').innerText = audit.ref;
        document.getElementById('displayDept').innerText = audit.dept;
        document.getElementById('auditForm').style.display = 'block';
    },

    async submitAudit() {
        if(!confirm("Submit audit results? This will update the Master Memory.")) return;

        const idx = document.getElementById('auditSelector').value;
        const selectedAudit = this.allAudits.filter(a => a.status !== 'CLOSED' && a.title !== 'none')[idx];
        
        // Find the original index in the main array and update it
        const masterIdx = this.allAudits.findIndex(a => a.ref === selectedAudit.ref);
        this.allAudits[masterIdx].status = 'CLOSED';
        this.allAudits[masterIdx].score = document.getElementById('complianceScore').value + "%";

        // Re-use the push logic from your planGenerator
        await this.pushUpdate();
    },

    async pushUpdate() {
        const token = "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";
        const repo = "abuckley-1/SYFTL-AUDIT-MANAGEMENT-SYSTEM";
        const path = "data/schedules_2026.json";

        // Get SHA
        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            headers: { 'Authorization': `token ${token}` }
        });
        const fileData = await getRes.json();

        // Push
        const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: `Audit Completed: ${document.getElementById('displayRef').innerText}`,
                content: btoa(unescape(encodeURIComponent(JSON.stringify(this.allAudits, null, 2)))),
                sha: fileData.sha
            })
        });

        if(putRes.ok) {
            alert("Audit Saved Successfully!");
            window.location.href = "index.html";
        }
    }
};
AuditEngine.init();
