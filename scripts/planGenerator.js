/**
 * Supertram Sentinel - Plan Generator V2
 * Includes: Year Switching, Admin Authentication, and Phase-based Routing
 */

const PlanGenerator = {
    isAdmin: false,

    // Example Schedule Data (In a live app, this would be a JSON file or Database)
    data: {
        "2026": [
            { month: "Jan", title: "COSHH Shadow Audit", ref: "ST0096-S", auditee: "N. Dobbs" },
            { month: "Feb", title: "Fire Safety - Depot", ref: "ST0097", auditee: "N. Dobbs" },
            { month: "Mar", title: "ISO 9001 Systems", ref: "ST0098", auditee: "S. English" },
            // ... (rest of the 12 months)
        ]
    },

    loadYear: function() {
        const year = document.getElementById('yearSelector').value;
        this.render(year);
    },

    authenticateAdmin: function() {
        const pass = prompt("Enter Audit Team Password to Edit:");
        if (pass === "SupertramSHEQ2026") { // Example Password
            this.isAdmin = true;
            alert("Admin Mode Active: You can now edit tile details.");
            this.loadYear();
        } else {
            alert("Incorrect Password.");
        }
    },

    render: function(year) {
        const container = document.getElementById('planContainer');
        const currentMonthIndex = new Date().getMonth();
        const currentDay = new Date().getDate();
        const selectedYear = new Date().getFullYear().toString();

        let html = '';
        const yearData = this.data[year] || this.data["2026"]; // Fallback to 2026

        yearData.forEach((audit, index) => {
            const isCurrentMonth = (index === currentMonthIndex && year === selectedYear);
            const highlightClass = isCurrentMonth ? 'current-focus' : '';
            
            // Determine Phase Logic
            let phaseAction = "";
            if (isCurrentMonth) {
                phaseAction = currentDay <= 14 ? "initial-phase" : "evidence-phase";
            }

            html += `
                <div class="month-card ${highlightClass}" onclick="PlanGenerator.handleTileClick('${phaseAction}')">
                    <div class="month-label">${audit.month}</div>
                    <div class="audit-info">
                        <h3>${audit.title}</h3>
                        <p><strong>Ref:</strong> ${audit.ref}</p>
                        <p><strong>Auditee:</strong> ${audit.auditee}</p>
                    </div>
                    ${this.isAdmin ? '<button class="btn-sm">Edit Details</button>' : ''}
                </div>
            `;
        });
        container.innerHTML = html;
    },

    handleTileClick: function(phase) {
        if (phase === "initial-phase") {
            window.location.href = "audit-form.html?mode=initial";
        } else if (phase === "evidence-phase") {
            window.location.href = "audit-form.html?mode=evidence";
        } else {
            alert("This audit is not currently in an active window.");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => PlanGenerator.loadYear());
