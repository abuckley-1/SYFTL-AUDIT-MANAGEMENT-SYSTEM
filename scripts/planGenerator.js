/**
 * Supertram Sentinel - Plan Generator
 * Purpose: Dynamically renders the 12-month Audit Schedule
 * Reference: ST0096 Systems Management
 */

const PlanGenerator = {
    // 1. MASTER SCHEDULE DATA
    // Aligned with Supertram departmental structures and ISO cycles
    auditSchedule: [
        { month: "Jan", scope: "COSHH Shadow Audit", auditee: "N. Dobbs (HofENG)", type: "SHADOW", ref: "ST0096-S", risk: "High" },
        { month: "Feb", scope: "Fire Safety - Depot", auditee: "N. Dobbs (HofENG)", type: "INTERNAL", ref: "ST0097", risk: "Med" },
        { month: "Mar", scope: "ISO 9001 Quality", auditee: "S. English (MD)", type: "SYSTEM", ref: "ST0098", risk: "Low" },
        { month: "Apr", scope: "Contractor Safety", auditee: "Eng. Team", type: "OPERATIONAL", ref: "ST0099", risk: "Med" },
        { month: "May", scope: "ISO 14001 Env.", auditee: "SHEQ Dept", type: "SYSTEM", ref: "ST0100", risk: "Low" },
        { month: "Jun", scope: "Training Logs", auditee: "HR / Managers", type: "HR/S", ref: "ST0101", risk: "Med" },
        { month: "Jul", scope: "ISO 45001 H&S", auditee: "All Depts", type: "SYSTEM", ref: "ST0102", risk: "Low" },
        { month: "Aug", scope: "Risk Assessments", auditee: "Process Owners", type: "RISK", ref: "ST0103", risk: "High" },
        { month: "Sep", scope: "Depot Security", auditee: "Facilities", type: "SEC", ref: "ST0104", risk: "Low" },
        { month: "Oct", scope: "Incidents/Near Miss", auditee: "Safety Mgr", type: "SAFETY", ref: "ST0105", risk: "Med" },
        { month: "Nov", scope: "PPE & Stores", auditee: "Stores Lead", type: "INTERNAL", ref: "ST0106", risk: "Med" },
        { month: "Dec", scope: "Management Review", auditee: "Executive", type: "STRATEGIC", ref: "ST0107", risk: "Low" }
    ],

    // 2. RENDERING ENGINE
    init: function() {
        const container = document.getElementById('planContainer');
        if (!container) return;

        let html = '';
        const currentMonthIndex = new Date().getMonth(); // 0-11

        this.auditSchedule.forEach((audit, index) => {
            // Logic to determine if this audit is the current focus
            const isCurrent = index === currentMonthIndex ? 'current-focus' : '';
            const isShadow = audit.type === 'SHADOW' ? 'shadow-critical' : '';

            html += `
                <div class="month-card ${isCurrent} ${isShadow}">
                    <div class="month-label">${audit.month.toUpperCase()}</div>
                    <div class="audit-info">
                        <h3>${audit.scope}</h3>
                        <p class="ref-no">Ref: ${audit.ref}</p>
                        <p class="auditee"><strong>Auditee:</strong> ${audit.auditee}</p>
                    </div>
                    <div class="card-footer">
                        <span class="type-tag">${audit.type}</span>
                        <span class="risk-indicator risk-${audit.risk.toLowerCase()}">Risk: ${audit.risk}</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};

// Start the generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    PlanGenerator.init();
});
