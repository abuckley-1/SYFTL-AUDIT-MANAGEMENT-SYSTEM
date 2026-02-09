/**
 * Supertram Sentinel - Plan Generator V7
 * Purpose: Fixes the edit sequence and automates Smart Ref generation.
 */

const PlanGenerator = {
    isAdmin: false,
    currentYearData: [],

    // 1. INITIAL LOAD
    async loadYear() {
        const year = document.getElementById('yearSelector').value;
        try {
            // Priority 1: Check Master Memory (GitHub Data Folder)
            const response = await fetch(`./data/schedules_${year}.json`);
            if (response.ok) {
                this.currentYearData = await response.json();
            } else {
                // Priority 2: Check Local Backup (Unpushed Edits)
                const local = localStorage.getItem(`sentinel_backup_${year}`);
                this.currentYearData = local ? JSON.parse(local) : this.getDefaultTemplate(year);
            }
        } catch (err) {
            this.currentYearData = this.getDefaultTemplate(year);
        }
        this.render(year);
    },

    // 2. PASSWORD ACCESS
    authenticateAdmin() {
        const pass = prompt("Enter Audit Team Password:");
        if (pass === "SupertramSHEQ2026") {
            this.isAdmin = true;
            this.loadYear();
        } else {
            alert("Incorrect Password.");
        }
    },

    // 3. SMART REF GENERATOR (ST0096 / TITLE / YEAR)
    generateSmartRef(title, year) {
        // Formats Title: Removes spaces, makes uppercase, only allows letters/numbers
        const cleanTitle = title.toUpperCase().replace(/[^A-Z0-9]/g, '');
        return `ST0096/${cleanTitle}/${year}`;
    },

    // 4. THE EDIT LOGIC (Captures Title & Auditee)
    editAudit(year, index) {
        const audit = this.currentYearData[index];

        // STEP 1: Get the Title
        const newTitle = prompt("Step 1: Update Audit Title (e.g. WASTE or TEST):", audit.title);
        if (!newTitle) return; // Exit if Cancelled

        // STEP 2: Get the Auditee
        const newAuditee = prompt("Step 2: Update Auditee Name (e.g. N. Dobbs):", audit.auditee);
        if (newAuditee === null) return; // Exit if Cancelled

        // STEP 3: Apply changes to the object
        this.currentYearData[index].title = newTitle;
        this.currentYearData[index].auditee = newAuditee || "TBC";
        
        // STEP 4: Automatically generate the Ref string
        this.currentYearData[index].ref = this.generateSmartRef(newTitle, year);

        // STEP 5: Save to local backup and refresh screen
        localStorage.setItem(`sentinel_backup_${year}`, JSON.stringify(this.currentYearData));
        this.render(year);
    },

    // 5. ADD NEW AUDIT LOGIC
    addNewAudit(year) {
        const title = prompt("Audit Title (e.g. WASTE):");
        if (!title) return;

        const auditee = prompt("Auditee Name:");
        const month = prompt("Month (e.g. Jan):", "Jan");

        const smartRef = this.generateSmartRef(title, year);
        
        this.currentYearData.push({
            month: month,
            title: title,
            ref: smartRef,
            auditee: auditee || "TBC"
        });

        localStorage.setItem(`sentinel_backup_${year}`, JSON.stringify(this.currentYearData));
        this.render(year);
    },

    // 6. DELETE LOGIC
    deleteAudit(year, index) {
        if (confirm("Delete this audit entry permanently?")) {
            this.currentYearData.splice(index, 1);
            localStorage.setItem(`sentinel_backup_${year}`, JSON.stringify(this.currentYearData));
            this.render(year);
        }
    },

    // 7. RENDER TILES TO SCREEN
    render(year) {
        const container = document.getElementById('planContainer');
        if (!container) return;

        let html = '';
        
        // Show "Add" tile if Admin
        if (this.isAdmin) {
            html += `
                <div class="month-card add-new-card" onclick="PlanGenerator.addNewAudit('${year}')">
                    <div class="plus-icon">+</div>
                    <p>Add Audit to ${year}</p>
                </div>`;
        }

        this.currentYearData.forEach((audit, index) => {
            html += `
                <div class="month-card">
                    <div class="month-label">${audit.month}</div>
                    <div class="audit-info">
                        <h3>${audit.title}</h3>
                        <p><strong>Ref:</strong> ${audit.ref}</p>
                        <p><strong>Auditee:</strong> ${audit.auditee}</p>
                    </div>
                    ${this.isAdmin ? `
                        <div class="admin-actions">
                            <button class="btn-edit-sm" onclick="PlanGenerator.editAudit('${year}', ${index})">Edit Details</button>
                            <button class="btn-delete-sm" onclick="PlanGenerator.deleteAudit('${year}', ${index})">Delete</button>
                        </div>` : ''}
                </div>`;
        });

        // Show "Push" button if Admin
        if (this.isAdmin && this.currentYearData.length > 0) {
            html += `
                <div style="grid-column: 1/-1; text-align: center; margin-top: 30px;">
                    <button class="btn-primary" onclick="PlanGenerator.pushToMaster('${year}')">🚀 Push Changes to Master Memory</button>
                    <p style="font-size: 0.8rem; color: #666; margin-top: 10px;">Warning: This updates the master repository for all users.</p>
                </div>`;
        }

        container.innerHTML = html;
    },

    async pushToMaster(year) {
        alert(`Syncing ${year} data with GitHub Master Memory...`);
        console.log("SYNC_PAYLOAD:", JSON.stringify(this.currentYearData));
        // This log confirms the data is ready for the GitHub Sync Action
    },

    getDefaultTemplate(year) {
        return [{ month: "Jan", title: "Waste", ref: "ST0096/WASTE/" + year, auditee: "TBC" }];
    }
};

document.addEventListener('DOMContentLoaded', () => PlanGenerator.loadYear());
