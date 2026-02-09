/**
 * Supertram Sentinel - Plan Generator V12
 * Features: Blank Year Initialization, Multi-Field Manual Override, 
 * Auto-Ref Generation, and Text-Wrapping.
 */

const PlanGenerator = {
    isAdmin: false,
    currentYearData: [],
    depts: ["Engineering", "Operations", "SHEQ", "Customer Service", "Facilities", "Stores", "Executive"],
    types: ["Internal", "External", "Shadow"],

    async loadYear() {
        const year = document.getElementById('yearSelector').value;
        const container = document.getElementById('planContainer');
        if (container) container.innerHTML = "<p style='padding:20px;'>Accessing Master Memory...</p>";

        try {
            // 1. Try to fetch the master file from GitHub
            const response = await fetch(`./data/schedules_${year}.json`);
            if (response.ok) {
                this.currentYearData = await response.json();
            } else {
                // 2. If file doesn't exist, check for unpushed local edits
                const local = localStorage.getItem(`sentinel_backup_${year}`);
                if (local) {
                    this.currentYearData = JSON.parse(local);
                } else {
                    // 3. If totally blank, initialize with the 12-month 'none' template
                    this.currentYearData = this.initializeBlankYear(year);
                }
            }
        } catch (err) {
            this.currentYearData = this.initializeBlankYear(year);
        }
        this.render(year);
    },

    authenticateAdmin() {
        const pass = prompt("Enter Audit Team Password:");
        if (pass === "SupertramSHEQ2026") {
            this.isAdmin = true;
            this.loadYear();
        } else {
            alert("Incorrect Password.");
        }
    },

    // MANUAL OVERRIDE / FULL EDITOR
    editAudit(year, index) {
        const audit = this.currentYearData[index];
        
        // Step-by-step prompts to capture all required metadata
        const newTitle = prompt("Audit Title (e.g. WASTE):", audit.title === "none" ? "" : audit.title);
        if (newTitle === null) return; 

        const newAuditee = prompt("Auditee Name:", audit.auditee === "n/a" ? "" : audit.auditee);
        const newDept = prompt(`Department (${this.depts.join("/")}):`, audit.dept || "SHEQ");
        const newType = prompt(`Type (Internal/External/Shadow):`, audit.type || "Internal");
        const newStatus = prompt("Status (Open/Closed/Overdue/On Hold/Cancelled):", audit.status || "Open");

        // Update the data object
        this.currentYearData[index] = {
            ...audit,
            title: newTitle || "none",
            auditee: newAuditee || "n/a",
            dept: newDept || "n/a",
            type: newType || "Internal",
            status: newStatus || (newTitle === "none" ? "Closed" : "Open"),
            // Auto-generate Smart Ref based on Title
            ref: newTitle && newTitle !== "none" ? `ST0096/${newTitle.toUpperCase().replace(/\s+/g, '')}/${year}` : `ST0096/NONE/${year}`
        };
        
        localStorage.setItem(`sentinel_backup_${year}`, JSON.stringify(this.currentYearData));
        this.render(year);
    },

    // INITIALIZE A BLANK YEAR TEMPLATE
    initializeBlankYear(year) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.map(m => ({ 
            month: m, 
            title: "none", 
            ref: `ST0096/NONE/${year}`, 
            auditee: "n/a", 
            dept: "n/a", 
            status: "Closed", 
            type: "Internal" 
        }));
    },

    render(year) {
        const container = document.getElementById('planContainer');
        if (!container) return;

        let html = '';
        this.currentYearData.forEach((audit, index) => {
            const isNone = audit.title.toLowerCase() === 'none';
            const statusClass = (audit.status || 'Open').toLowerCase().replace(/\s+/g, '-');
            const typeClass = (audit.type || 'Internal').toLowerCase();

            html += `
                <div class="month-card card-type-${typeClass}">
                    <div class="month-label">${audit.month}</div>
                    <div class="status-badge badge-${statusClass}">${audit.status}</div>
                    <div class="audit-info">
                        <span class="type-tag">${audit.type}</span>
                        <h3 class="wrap-text">${audit.title}</h3>
                        <p class="ref-text"><strong>Ref:</strong> ${audit.ref}</p>
                        <p class="auditee-text"><strong>Dept:</strong> ${audit.dept}</p>
                        <p class="auditee-text"><strong>Auditee:</strong> ${audit.auditee}</p>
                    </div>
                    ${this.isAdmin ? `
                        <div class="admin-actions">
                            <button class="btn-edit-sm" onclick="PlanGenerator.editAudit('${year}', ${index})">Edit / Override</button>
                        </div>` : ''}
                </div>`;
        });
        
        if(this.isAdmin) {
            html += `<div style="grid-column: 1/-1; text-align: center; margin-top: 30px;">
                        <button class="btn-primary" onclick="PlanGenerator.pushToMaster('${year}')">🚀 Push Changes to Master Memory</button>
                     </div>`;
        }
        container.innerHTML = html;
    },

    pushToMaster(year) {
        // Prepare the JSON for the GitHub data/ folder
        const output = JSON.stringify(this.currentYearData, null, 2);
        console.log("DATA_FOR_MASTER_FILE:", output);
        alert("Syncing with GitHub. Ensure you copy the 'DATA_FOR_MASTER_FILE' from the console into your data/schedules_" + year + ".json file.");
    }
};

document.addEventListener('DOMContentLoaded', () => PlanGenerator.loadYear());
