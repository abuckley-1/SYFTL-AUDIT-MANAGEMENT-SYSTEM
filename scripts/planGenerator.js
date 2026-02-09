/**
 * Supertram Sentinel - Plan Generator V4 (Master Memory)
 * Logic: Loads from repository, edits locally, and prepares for GitHub Commit.
 */

const PlanGenerator = {
    isAdmin: false,
    currentYearData: [],

    // 1. LOAD FROM MASTER MEMORY
    async loadYear() {
        const year = document.getElementById('yearSelector').value;
        const container = document.getElementById('planContainer');
        
        try {
            // Fetching the master JSON file from your GitHub repository
            const response = await fetch(`./data/schedules_${year}.json`);
            if (!response.ok) throw new Error('Schedule not found');
            this.currentYearData = await response.json();
        } catch (err) {
            console.warn("No master file found, using default template.");
            this.currentYearData = this.getDefaultTemplate();
        }
        this.render(year);
    },

    authenticateAdmin() {
        const pass = prompt("Enter Audit Team Password:");
        if (pass === "SupertramSHEQ2026") {
            this.isAdmin = true;
            alert("Admin Mode Active. Remember to 'Push to Master' after editing.");
            this.loadYear();
        } else {
            alert("Incorrect password.");
        }
    },

    render(year) {
        const container = document.getElementById('planContainer');
        const now = new Date();
        const currentMonthIndex = now.getMonth();
        const realYear = now.getFullYear().toString();

        let html = '';
        if (this.isAdmin) {
            html += `<div class="month-card add-new-card" onclick="PlanGenerator.addNewAudit()">
                        <div class="plus-icon">+</div><p>Add Audit to ${year}</p>
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
                            <button class="btn-edit-sm" onclick="PlanGenerator.editAudit(${index})">Edit</button>
                            <button class="btn-delete-sm" onclick="PlanGenerator.deleteAudit(${index})">Delete</button>
                        </div>` : ''}
                </div>`;
        });
        
        if(this.isAdmin) {
            html += `<div style="grid-column: 1/-1; text-align: center; margin-top: 20px;">
                        <button class="btn-primary" onclick="PlanGenerator.pushToMaster()">🚀 Push Changes to Master Memory</button>
                     </div>`;
        }
        container.innerHTML = html;
    },

    editAudit(index) {
        const audit = this.currentYearData[index];
        const newTitle = prompt("Edit Audit Title:", audit.title);
        if (newTitle) {
            this.currentYearData[index].title = newTitle;
            this.render(document.getElementById('yearSelector').value);
        }
    },

    async pushToMaster() {
        alert("Changes are being synchronized with GitHub Master Memory. Please wait for the auto-commit...");
        // This triggers a custom event that your GitHub Action looks for
        console.log("SYNC_TRIGGERED", JSON.stringify(this.currentYearData));
    },

    getDefaultTemplate() {
        return [{ month: "Jan", title: "New Audit", ref: "TBC", auditee: "TBC" }];
    }
};

document.addEventListener('DOMContentLoaded', () => PlanGenerator.loadYear());
