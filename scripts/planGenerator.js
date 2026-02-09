/**
 * Supertram Sentinel - Plan Generator V3
 * Full functionality for multi-year editing and two-phase questionnaire routing.
 */

const PlanGenerator = {
    isAdmin: false,
    
    // Initial data structure
    data: JSON.parse(localStorage.getItem('sentinel_audit_data')) || {
        "2024": [],
        "2025": [],
        "2026": [
            { month: "Jan", title: "COSHH Shadow Audit", ref: "ST0096-S", auditee: "N. Dobbs" },
            { month: "Feb", title: "Fire Safety - Depot", ref: "ST0097", auditee: "N. Dobbs" },
            { month: "Mar", title: "ISO 9001 Systems", ref: "ST0098", auditee: "S. English" },
            { month: "Apr", title: "Contractor Safety", ref: "ST0099", auditee: "Engineering Team" },
            { month: "May", title: "ISO 14001 Environmental", ref: "ST0100", auditee: "SHEQ Team" },
            { month: "Jun", title: "Training & Competence", ref: "ST0101", auditee: "Dept Managers" },
            { month: "Jul", title: "ISO 45001 H&S", ref: "ST0102", auditee: "All Depts" },
            { month: "Aug", title: "Risk Review", ref: "ST0103", auditee: "Process Owners" },
            { month: "Sep", title: "Security & DPA", ref: "ST0104", auditee: "Facilities" },
            { month: "Oct", title: "Incident Investigation", ref: "ST0105", auditee: "Safety Manager" },
            { month: "Nov", title: "PPE & Stores", ref: "ST0106", auditee: "Stores Lead" },
            { month: "Dec", title: "Management Review", ref: "ST0107", auditee: "Executive Team" }
        ],
        "2027": []
    },

    loadYear: function() {
        const year = document.getElementById('yearSelector').value;
        this.render(year);
    },

    authenticateAdmin: function() {
        const pass = prompt("Enter Audit Team Password:");
        if (pass === "SupertramSHEQ2026") {
            this.isAdmin = true;
            alert("Admin Mode Active: You can now edit any audit or add new entries.");
            this.loadYear();
        } else {
            alert("Incorrect password.");
        }
    },

    render: function(year) {
        const container = document.getElementById('planContainer');
        const now = new Date();
        const currentMonthIndex = now.getMonth();
        const currentDay = now.getDate();
        const realYear = now.getFullYear().toString();

        let html = '';

        if (this.isAdmin) {
            html += `
                <div class="month-card add-new-card" onclick="PlanGenerator.addNewAudit('${year}')">
                    <div class="plus-icon">+</div>
                    <p>Add New Audit to ${year}</p>
                </div>`;
        }

        const yearData = this.data[year] || [];
        yearData.forEach((audit, index) => {
            const isCurrentMonth = (index === currentMonthIndex && year === realYear);
            const highlightClass = isCurrentMonth ? 'current-focus' : '';
            
            // Phase Logic: Initial (Days 1-14) | Evidence (Days 15+)
            let phase = "";
            if (isCurrentMonth) {
                phase = currentDay <= 14 ? "initial" : "evidence";
            }

            html += `
                <div class="month-card ${highlightClass}">
                    <div class="month-label">${audit.month}</div>
                    <div class="audit-info" onclick="PlanGenerator.handleTileClick('${phase}')">
                        <h3>${audit.title}</h3>
                        <p><strong>Ref:</strong> ${audit.ref}</p>
                        <p><strong>Auditee:</strong> ${audit.auditee}</p>
                    </div>
                    ${this.isAdmin ? `
                        <div class="admin-actions">
                            <button class="btn-edit-sm" onclick="PlanGenerator.editAudit('${year}', ${index})">Edit</button>
                            <button class="btn-delete-sm" onclick="PlanGenerator.deleteAudit('${year}', ${index})">Delete</button>
                        </div>` : ''}
                </div>`;
        });
        container.innerHTML = html;
    },

    handleTileClick: function(phase) {
        if (!phase) {
            alert("This audit is not in the current active window (First or second two weeks of the month).");
            return;
        }
        window.location.href = `audit-form.html?mode=${phase}`;
    },

    editAudit: function(year, index) {
        const audit = this.data[year][index];
        const newTitle = prompt("Edit Audit Title:", audit.title);
        const newRef = prompt("Edit Reference:", audit.ref);
        const newAuditee = prompt("Edit Auditee Name:", audit.auditee);
        if (newTitle && newRef && newAuditee) {
            this.data[year][index] = { ...audit, title: newTitle, ref: newRef, auditee: newAuditee };
            this.saveData();
        }
    },

    addNewAudit: function(year) {
        const title = prompt("Enter Audit Title:");
        const ref = prompt("Enter Reference (e.g., ST0099):");
        const auditee = prompt("Enter Auditee Name:");
        const month = prompt("Enter Month (e.g., Jan, Feb):");
        if (title && ref && auditee && month) {
            if (!this.data[year]) this.data[year] = [];
            this.data[year].push({ month, title, ref, auditee });
            this.saveData();
        }
    },

    deleteAudit: function(year, index) {
        if (confirm("Are you sure you want to delete this audit entry?")) {
            this.data[year].splice(index, 1);
            this.saveData();
        }
    },

    saveData: function() {
        localStorage.setItem('sentinel_audit_data', JSON.stringify(this.data));
        this.loadYear();
    }
};

document.addEventListener('DOMContentLoaded', () => PlanGenerator.loadYear());
