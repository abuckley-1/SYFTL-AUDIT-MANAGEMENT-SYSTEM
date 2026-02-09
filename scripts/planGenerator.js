/**
 * Supertram Sentinel - Plan Generator V8
 * Logic: Sequenced editing for Title, Auditee, and Status. 
 * Auto-generates Ref based on Title.
 */

const PlanGenerator = {
    isAdmin: false,
    currentYearData: [],

    async loadYear() {
        const year = document.getElementById('yearSelector').value;
        try {
            const response = await fetch(`./data/schedules_${year}.json`);
            if (response.ok) {
                this.currentYearData = await response.json();
            } else {
                const local = localStorage.getItem(`sentinel_backup_${year}`);
                this.currentYearData = local ? JSON.parse(local) : this.getDefaultTemplate(year);
            }
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
        }
    },

    // SMART REF GENERATOR (e.g., ST0096/WASTE/2026)
    generateSmartRef(title, year) {
        const cleanTitle = title.toUpperCase().replace(/[^A-Z0-9]/g, '');
        return `ST0096/${cleanTitle}/${year}`;
    },

    // UPDATED EDIT LOGIC
    editAudit(year, index) {
        const audit = this.currentYearData[index];

        // 1. EDIT TITLE
        const newTitle = prompt("Step 1: Edit Audit Title (e.g., WASTE):", audit.title);
        if (!newTitle) return;

        // 2. EDIT AUDITEE
        const newAuditee = prompt("Step 2: Edit Auditee Name:", audit.auditee);
        if (newAuditee === null) return;

        // 3. EDIT STATUS
        const newStatus = prompt("Step 3: Edit Status (Open, Closed, Overdue, Cancelled, On Hold):", audit.status || "Open");
        if (newStatus === null) return;

        // APPLY CHANGES
        this.currentYearData[index].title = newTitle;
        this.currentYearData[index].auditee = newAuditee;
        this.currentYearData[index].status = newStatus;
        
        // AUTO-GENERATE REF
        this.currentYearData[index].ref = this.generateSmartRef(newTitle, year);

        // SAVE & REFRESH
        localStorage.setItem(`sentinel_backup_${year}`, JSON.stringify(this.currentYearData));
        this.render(year);
    },

    addNewAudit(year) {
        const title = prompt("Audit Title:");
        if (!title) return;
        const auditee = prompt("Auditee Name:");
        const month = prompt("Month (e.g., Jan):", "Jan");

        this.currentYearData.push({
            month: month,
            title: title,
            ref: this.generateSmartRef(title, year),
            auditee: auditee || "TBC",
            status: "Open"
        });

        localStorage.setItem(`sentinel_backup_${year}`, JSON.stringify(this.currentYearData));
        this.render(year);
    },

    render(year) {
        const container = document.getElementById('planContainer');
        if (!container) return;

        let html = '';
        if (this.isAdmin) {
            html += `<div class="month-card add-new-card" onclick="PlanGenerator.addNewAudit('${year}')">
                        <div class="plus-icon">+</div><p>Add New Audit to ${year}</p>
                     </div>`;
        }

        this.currentYearData.forEach((audit, index) => {
            // Logic for status color classes
            const statusClass = (audit.status || "Open").toLowerCase().replace(/\s+/g, '-');

            html += `
                <div class="month-card">
                    <div class="month-label">${audit.month}</div>
                    <div class="status-badge badge-${statusClass}">${audit.status || 'Open'}</div>
                    <div class="audit-info">
                        <h3>${audit.title}</h3>
                        <p><strong>Ref:</strong> ${audit.ref}</p>
                        <p><strong>Auditee:</strong> ${audit.auditee}</p>
                    </div>
                    ${this.isAdmin ? `
                        <div class="admin-actions">
                            <button class="btn-edit-sm" onclick="PlanGenerator.editAudit('${year}', ${index})">Edit Details</button>
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
        alert("Syncing with GitHub... ensure your browser console shows 'DATA_READY'.");
        console.log("DATA_READY:", this.currentYearData);
    },

    getDefaultTemplate(year) {
        return [{ month: "Jan", title: "Waste", ref: "ST0096/WASTE/" + year, auditee: "TBC", status: "Open" }];
    }
};

document.addEventListener('DOMContentLoaded', () => PlanGenerator.loadYear());
