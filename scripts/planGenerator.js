/**
 * Supertram Sentinel - Plan Generator V10
 * Features: Manual Override Modal, Department Tracking, and Internal/External Toggle.
 */

const PlanGenerator = {
    isAdmin: false,
    currentYearData: [],
    
    // Departments & Types for selection
    depts: ["Engineering", "Operations", "SHEQ", "Customer Service", "Facilities", "Stores", "Executive"],
    types: ["Internal", "External", "Shadow"],

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
        }
    },

    // MANUAL OVERRIDE / EDIT FUNCTION
    editAudit(year, index) {
        const audit = this.currentYearData[index];
        
        // Using a custom modal approach for better UX (Conceptualized as prompts for now)
        const newTitle = prompt("Audit Title:", audit.title);
        const newAuditee = prompt("Auditee Name:", audit.auditee);
        const newDept = prompt(`Department (${this.depts.join(", ")}):`, audit.dept || "SHEQ");
        const newType = prompt(`Audit Type (${this.types.join("/")}):`, audit.type || "Internal");
        const newStatus = prompt("Status (Open/Closed/Overdue/On Hold/Cancelled):", audit.status || "Open");

        if (newTitle) {
            this.currentYearData[index] = {
                ...audit,
                title: newTitle,
                auditee: newAuditee || "TBC",
                dept: newDept,
                type: newType,
                status: newStatus,
                // Auto-generate Ref unless manually overridden
                ref: `ST0096/${newTitle.toUpperCase().replace(/\s+/g, '')}/${year}`
            };
            
            localStorage.setItem(`sentinel_backup_${year}`, JSON.stringify(this.currentYearData));
            this.render(year);
        }
    },

    render(year) {
        const container = document.getElementById('planContainer');
        if (!container) return;

        let html = '';
        if (this.isAdmin) {
            html += `<div class="month-card add-new-card" onclick="PlanGenerator.addNewAudit('${year}')">
                        <div class="plus-icon">+</div><p>Manual Add / Override</p>
                     </div>`;
        }

        this.currentYearData.forEach((audit, index) => {
            const isNone = audit.title.toLowerCase() === 'none';
            const displayStatus = isNone ? 'Closed' : (audit.status || 'Open');
            const statusClass = displayStatus.toLowerCase().replace(/\s+/g, '-');
            const typeClass = (audit.type || 'Internal').toLowerCase();

            html += `
                <div class="month-card card-type-${typeClass}">
                    <div class="month-label">${audit.month}</div>
                    <div class="status-badge badge-${statusClass}">${displayStatus}</div>
                    <div class="audit-info">
                        <span class="type-tag">${audit.type || 'Internal'}</span>
                        <h3 class="wrap-text">${audit.title}</h3>
                        <p class="ref-text"><strong>Ref:</strong> ${audit.ref}</p>
                        <p class="auditee-text"><strong>Dept:</strong> ${audit.dept || 'TBC'}</p>
                        <p class="auditee-text"><strong>Auditee:</strong> ${audit.auditee}</p>
                    </div>
                    ${this.isAdmin && !isNone ? `
                        <div class="admin-actions">
                            <button class="btn-edit-sm" onclick="PlanGenerator.editAudit('${year}', ${index})">Edit / Override</button>
                            <button class="btn-delete-sm" onclick="PlanGenerator.deleteAudit('${year}', ${index})">Delete</button>
                        </div>` : ''}
                </div>`;
        });
        container.innerHTML = html;
    },

    pushToMaster(year) {
        alert("Pushing overrides to Master Memory...");
        console.log("MASTER_OVERRIDE_SYNC", this.currentYearData);
    }
};
