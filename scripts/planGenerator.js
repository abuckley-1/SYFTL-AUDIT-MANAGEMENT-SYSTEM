/**
 * Supertram Sentinel - Plan Generator V14
 * Features: Standardized Dropdowns, Future-Date Logic (PLANNED), 
 * and persistent Add/Edit Manual Overrides.
 */

const PlanGenerator = {
    isAdmin: false,
    currentYearData: [],
    
    // Standardized Options for Dropdowns
    lists: {
        depts: ["All departments Managers", "Senior Leadership Team", "Operations", "HR", "SHEQ", "Commercial", "Finance", "Procurement", "IT", "Facilities", "RSM", "Infrastructure", "Training", "OTHER"],
        types: ["Internal", "External", "Shadow", "OTHER"],
        status: ["OPEN", "CLOSED", "OVERDUE", "ON-HOLD", "CANCELLED", "PLANNED", "OTHER"]
    },

    async loadYear() {
        const year = document.getElementById('yearSelector').value;
        const container = document.getElementById('planContainer');
        if (container) container.innerHTML = "<p style='padding:20px;'>Syncing Master Memory...</p>";

        try {
            const response = await fetch(`./data/schedules_${year}.json`);
            if (response.ok) {
                this.currentYearData = await response.json();
            } else {
                const local = localStorage.getItem(`sentinel_backup_${year}`);
                this.currentYearData = local ? JSON.parse(local) : this.initializeBlankYear(year);
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
        }
    },

    // HELPER: Create a numbered list for prompt selection (Acting as a dropdown)
    selectFromList(listName, promptText) {
        const options = this.lists[listName];
        let menu = promptText + "\n" + options.map((opt, i) => `${i + 1}: ${opt}`).join("\n");
        let choice = prompt(menu);
        let index = parseInt(choice) - 1;
        return (options[index]) ? options[index] : options[options.length - 1]; // Default to OTHER
    },

    addNewAudit(year) {
        const title = prompt("New Audit Title (e.g. Spot Check):");
        if (!title) return;

        const month = prompt("Which month? (e.g. Feb):", "Jan");
        const auditee = prompt("Auditee Name:");
        
        // Use Dropdowns
        const dept = this.selectFromList("depts", "Select Department:");
        const type = this.selectFromList("types", "Select Audit Type:");
        const status = this.selectFromList("status", "Select Status:");

        this.currentYearData.push({
            month, title, auditee, dept, type, status,
            ref: `ST0096/${title.toUpperCase().replace(/\s+/g, '')}/${year}`
        });
        this.saveAndRefresh(year);
    },

    editAudit(year, index) {
        const audit = this.currentYearData[index];
        const newTitle = prompt("Audit Title:", audit.title);
        if (newTitle === null) return;

        const newAuditee = prompt("Auditee Name:", audit.auditee);
        
        // Dropdown selections
        const newDept = this.selectFromList("depts", "Select Department:");
        const newType = this.selectFromList("types", "Select Audit Type:");
        const newStatus = this.selectFromList("status", "Select Status:");

        this.currentYearData[index] = {
            ...audit,
            title: newTitle,
            auditee: newAuditee || "TBC",
            dept: newDept,
            type: newType,
            status: newStatus,
            ref: `ST0096/${newTitle.toUpperCase().replace(/\s+/g, '')}/${year}`
        };
        this.saveAndRefresh(year);
    },

    initializeBlankYear(year) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonthIdx = new Date().getMonth();
        const currentYearIdx = new Date().getFullYear();

        return months.map((m, idx) => {
            // Logic: If month is in the future, default to PLANNED
            let defaultStatus = (idx > currentMonthIdx && year >= currentYearIdx) ? "PLANNED" : "CLOSED";
            return { 
                month: m, title: "none", ref: `ST0096/NONE/${year}`, 
                auditee: "n/a", dept: "n/a", status: defaultStatus, type: "Internal" 
            };
        });
    },

    saveAndRefresh(year) {
        localStorage.setItem(`sentinel_backup_${year}`, JSON.stringify(this.currentYearData));
        this.render(year);
    },

    render(year) {
        const container = document.getElementById('planContainer');
        if (!container) return;
        let html = '';
        
        if (this.isAdmin) {
            html += `<div class="month-card add-new-card" onclick="PlanGenerator.addNewAudit('${year}')">
                        <div class="plus-icon">+</div><p>Add New Audit Tile</p>
                     </div>`;
        }

        this.currentYearData.forEach((audit, index) => {
            const statusClass = (audit.status || 'OPEN').toLowerCase().replace(/\s+/g, '-');
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
                    ${this.isAdmin ? `<div class="admin-actions">
                        <button class="btn-edit-sm" onclick="PlanGenerator.editAudit('${year}', ${index})">Edit Details</button>
                        <button class="btn-delete-sm" onclick="PlanGenerator.deleteAudit('${year}', ${index})">Delete</button>
                    </div>` : ''}
                </div>`;
        });
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', () => PlanGenerator.loadYear());
