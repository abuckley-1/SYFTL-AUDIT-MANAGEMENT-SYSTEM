/**
 * Supertram Sentinel - Plan Generator V15
 * Features: 
 * - Standardized Dropdowns (Dept, Type, Status)
 * - Future-Date Logic (Automatic 'PLANNED' status)
 * - Infinite Audit Tiles (Beyond 12 months)
 * - Automatic Ref Generation (ST0096/TITLE/YEAR)
 * - Full Manual Override for Audit Team
 */

const PlanGenerator = {
    isAdmin: false,
    currentYearData: [],
    
    // Standardized Options for Dropdowns
    lists: {
        depts: [
            "All departments Managers", "Senior Leadership Team", "Operations", 
            "HR", "SHEQ", "Commercial", "Finance", "Procurement", 
            "IT", "Facilities", "RSM", "Infrastructure", "Training", "OTHER"
        ],
        types: ["Internal", "External", "Shadow", "OTHER"],
        status: ["OPEN", "CLOSED", "OVERDUE", "ON-HOLD", "CANCELLED", "PLANNED", "OTHER"]
    },

    /**
     * INITIAL LOAD: Fetch data from GitHub or initialize blank year
     */
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

    /**
     * SECURITY: Simple Admin Login
     */
    authenticateAdmin() {
        const pass = prompt("Enter Audit Team Password:");
        if (pass === "SupertramSHEQ2026") {
            this.isAdmin = true;
            this.loadYear();
        } else {
            alert("Incorrect Password.");
        }
    },

    /**
     * UI HELPER: Converts an array into a numbered list for selection via prompt
     */
    selectFromList(listName, promptText) {
        const options = this.lists[listName];
        let menu = promptText + "\n\n" + options.map((opt, i) => `${i + 1}: ${opt}`).join("\n");
        let choice = prompt(menu);
        let index = parseInt(choice) - 1;
        
        // Return selection or default to 'OTHER' if invalid
        return (options[index]) ? options[index] : options[options.length - 1];
    },

    /**
     * CREATE: Add a brand new audit tile (beyond the initial 12)
     */
    addNewAudit(year) {
        const title = prompt("New Audit Title (e.g. Spot Check):");
        if (!title) return;

        const month = prompt("Which month is this for? (e.g. Feb):", "Jan");
        const auditee = prompt("Auditee Name (Individual or Group):");
        
        const dept = this.selectFromList("depts", "Select Department:");
        const type = this.selectFromList("types", "Select Audit Type:");
        const status = this.selectFromList("status", "Select Initial Status:");

        const newAudit = {
            month: month,
            title: title,
            ref: `ST0096/${title.toUpperCase().replace(/\s+/g, '')}/${year}`,
            auditee: auditee || "TBC",
            dept: dept,
            status: status,
            type: type
        };

        this.currentYearData.push(newAudit);
        this.saveAndRefresh(year);
    },

    /**
     * UPDATE: Edit existing audit details using standardized lists
     */
    editAudit(year, index) {
        const audit = this.currentYearData[index];
        const newTitle = prompt("Audit Title:", audit.title === "none" ? "" : audit.title);
        if (newTitle === null) return;

        const newAuditee = prompt("Auditee Name:", audit.auditee === "n/a" ? "" : audit.auditee);
        
        const newDept = this.selectFromList("depts", "Select Department:");
        const newType = this.selectFromList("types", "Select Audit Type:");
        const newStatus = this.selectFromList("status", "Select Status:");

        this.currentYearData[index] = {
            ...audit,
            title: newTitle || "none",
            auditee: newAuditee || "n/a",
            dept: newDept,
            type: newType,
            status: newStatus,
            ref: newTitle && newTitle !== "none" 
                 ? `ST0096/${newTitle.toUpperCase().replace(/\s+/g, '')}/${year}` 
                 : `ST0096/NONE/${year}`
        };
        
        this.saveAndRefresh(year);
    },

    /**
     * DELETE: Remove a tile completely
     */
    deleteAudit(year, index) {
        if (confirm("Permanently delete this audit tile from the schedule?")) {
            this.currentYearData.splice(index, 1);
            this.saveAndRefresh(year);
        }
    },

    /**
     * INITIALIZE: Create a baseline 12-month schedule for a new year
     */
    initializeBlankYear(year) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        const currentMonthIdx = now.getMonth();
        const currentYear = now.getFullYear();

        return months.map((m, idx) => {
            // Logic: Future months in the current or future year default to 'PLANNED'
            let defaultStatus = "CLOSED";
            if (parseInt(year) > currentYear || (parseInt(year) === currentYear && idx >= currentMonthIdx)) {
                defaultStatus = "PLANNED";
            }

            return { 
                month: m, 
                title: "none", 
                ref: `ST0096/NONE/${year}`, 
                auditee: "n/a", 
                dept: "n/a", 
                status: defaultStatus, 
                type: "Internal" 
            };
        });
    },

    /**
     * PERSISTENCE: Save to local storage and update view
     */
    saveAndRefresh(year) {
        localStorage.setItem(`sentinel_backup_${year}`, JSON.stringify(this.currentYearData));
        this.render(year);
    },

    /**
     * RENDER: Draw the cards to the screen
     */
    render(year) {
        const container = document.getElementById('planContainer');
        if (!container) return;

        let html = '';
        
        // Admin 'Add' Tile
        if (this.isAdmin) {
            html += `
                <div class="month-card add-new-card" onclick="PlanGenerator.addNewAudit('${year}')">
                    <div class="plus-icon">+</div>
                    <p>Add New Audit Tile</p>
                </div>`;
        }

        this.currentYearData.forEach((audit, index) => {
            const isNone = audit.title.toLowerCase() === 'none';
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
                    ${this.isAdmin ? `
                        <div class="admin-actions">
                            <button class="btn-edit-sm" onclick="PlanGenerator.editAudit('${year}', ${index})">Edit / Override</button>
                            <button class="btn-delete-sm" onclick="PlanGenerator.deleteAudit('${year}', ${index})">Delete</button>
                        </div>` : ''}
                </div>`;
        });
        
        // Output Button for GitHub Sync
        if(this.isAdmin && this.currentYearData.length > 0) {
            html += `<div style="grid-column: 1/-1; text-align: center; margin-top: 30px;">
                        <button class="btn-primary" onclick="PlanGenerator.pushToMaster('${year}')">🚀 Push Changes to Master Memory</button>
                     </div>`;
        }
        
        container.innerHTML = html;
    },

    pushToMaster(year) {
        const dataStr = JSON.stringify(this.currentYearData, null, 2);
        console.log("--- COPY DATA BELOW FOR GITHUB ---");
        console.log(dataStr);
        alert("Data generated in Browser Console (F12). Copy it to your 'data/schedules_" + year + ".json' file on GitHub.");
    }
};

// Start the application
document.addEventListener('DOMContentLoaded', () => PlanGenerator.loadYear());
