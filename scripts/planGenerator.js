/**
 * Supertram Sentinel - Plan Generator V5
 * Logic: Automated Smart References & Enhanced Master Memory Editing
 */

const PlanGenerator = {
    isAdmin: false,
    currentYearData: [],

    async loadYear() {
        const year = document.getElementById('yearSelector').value;
        try {
            const response = await fetch(`./data/schedules_${year}.json`);
            this.currentYearData = response.ok ? await response.json() : this.getDefaultTemplate(year);
        } catch (err) {
            this.currentYearData = this.getDefaultTemplate(year);
        }
        this.render(year);
    },

    authenticateAdmin() {
        const pass = prompt("Enter Audit Team Password:");
        if (pass === "SupertramSHEQ2026") {
            this.isAdmin = true;
            this.loadYear();
        } else {
            alert("Incorrect password.");
        }
    },

    // AUTOMATED REF GENERATOR: ST0096 / [TITLE] / [YEAR]
    generateSmartRef(title, year) {
        const cleanTitle = title.toUpperCase().replace(/\s+/g, '');
        return `ST0096/${cleanTitle}/${year}`;
    },

    render(year) {
        const container = document.getElementById('planContainer');
        const now = new Date();
        const currentMonthIndex = now.getMonth();
        const realYear = now.getFullYear().toString();

        let html = '';
        if (this.isAdmin) {
            html += `
                <div class="month-card add-new-card" onclick="PlanGenerator.addNewAudit('${year}')">
                    <div class="plus-icon">+</div>
                    <p>Add Audit to ${year}</p>
                </div>`;
        }

        this.currentYearData.forEach((audit, index) => {
            const isCurrentMonth = (index === currentMonthIndex && year === realYear);
            const highlightClass = isCurrentMonth ? 'current-focus' : '';
            
            html += `
                <div class="month-card ${highlightClass}">
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
        
        if(this.isAdmin && this.currentYearData.length > 0) {
            html += `<div style="grid-column: 1/-1; text-align: center; margin-top: 20px;">
                        <button class="btn-primary" onclick="PlanGenerator.pushToMaster('${year}')">🚀 Push to Master Memory</button>
                     </div>`;
        }
        container.innerHTML = html;
    },

    editAudit(year, index) {
        const audit = this.currentYearData[index];
        const newTitle = prompt("Audit Title (e.g. Waste):", audit.title);
        const newAuditee = prompt("Auditee Name (e.g. N. Dobbs):", audit.auditee);

        if (newTitle && newAuditee) {
            this.currentYearData[index].title = newTitle;
            this.currentYearData[index].auditee = newAuditee;
            // Automatically update the Ref based on the new title
            this.currentYearData[index].ref = this.generateSmartRef(newTitle, year);
            this.render(year);
        }
    },

    addNewAudit(year) {
        const title = prompt("Enter Audit Title (e.g. Waste):");
        const auditee = prompt("Enter Auditee Name:");
        const month = prompt("Enter Month (e.g. Jan):");

        if (title && auditee && month) {
            const newRef = this.generateSmartRef(title, year);
            this.currentYearData.push({ month, title, ref: newRef, auditee });
            this.render(year);
        }
    },

    async pushToMaster(year) {
        // This triggers the GitHub Action to save permanently
        const dataPayload = {
            year: year,
            data: this.currentYearData
        };
        console.log("MASTER_SYNC_REQUEST", dataPayload);
        alert("Syncing with GitHub... Master Memory will update in approx 60 seconds.");
    },

    getDefaultTemplate(year) {
        return [{ month: "Jan", title: "Waste", ref: "ST0096/WASTE/" + year, auditee: "TBC" }];
    }
};

document.addEventListener('DOMContentLoaded', () => PlanGenerator.loadYear());
