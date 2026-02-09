/**
 * Supertram Sentinel - Plan Generator V16
 * Features: Custom Modal UI (No more browser prompts), Clickable Dropdowns,
 * Future-Date Logic, and Master Memory Sync.
 */

const PlanGenerator = {
    isAdmin: false,
    currentYearData: [],
    editingIndex: null,
    
    lists: {
        depts: ["All departments Managers", "Senior Leadership Team", "Operations", "HR", "SHEQ", "Commercial", "Finance", "Procurement", "IT", "Facilities", "RSM", "Infrastructure", "Training", "OTHER"],
        types: ["Internal", "External", "Shadow", "OTHER"],
        status: ["OPEN", "CLOSED", "OVERDUE", "ON-HOLD", "CANCELLED", "PLANNED", "OTHER"]
    },

    async loadYear() {
        const year = document.getElementById('yearSelector').value;
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

    // OPEN THE CUSTOM MODAL
    openModal(index = null) {
        this.editingIndex = index;
        const modal = document.getElementById('auditModal');
        const audit = index !== null ? this.currentYearData[index] : { month: 'Jan', title: '', auditee: '', dept: 'SHEQ', type: 'Internal', status: 'PLANNED' };

        // Fill inputs
        document.getElementById('modalTitle').value = audit.title === "none" ? "" : audit.title;
        document.getElementById('modalAuditee').value = audit.auditee === "n/a" ? "" : audit.auditee;
        document.getElementById('modalMonth').value = audit.month;
        
        // Populate Dropdowns
        this.fillDropdown('modalDept', this.lists.depts, audit.dept);
        this.fillDropdown('modalType', this.lists.types, audit.type);
        this.fillDropdown('modalStatus', this.lists.status, audit.status);

        modal.style.display = 'flex';
    },

    fillDropdown(id, list, selectedValue) {
        const select = document.getElementById(id);
        select.innerHTML = list.map(opt => `<option value="${opt}" ${opt === selectedValue ? 'selected' : ''}>${opt}</option>`).join('');
    },

    closeModal() {
        document.getElementById('auditModal').style.display = 'none';
    },

    saveModal() {
        const year = document.getElementById('yearSelector').value;
        const title = document.getElementById('modalTitle').value || "none";
        
        const updatedAudit = {
            month: document.getElementById('modalMonth').value,
            title: title,
            auditee: document.getElementById('modalAuditee').value || "n/a",
            dept: document.getElementById('modalDept').value,
            type: document.getElementById('modalType').value,
            status: document.getElementById('modalStatus').value,
            ref: title !== "none" ? `ST0096/${title.toUpperCase().replace(/\s+/g, '')}/${year}` : `ST0096/NONE/${year}`
        };

        if (this.editingIndex !== null) {
            this.currentYearData[this.editingIndex] = updatedAudit;
        } else {
            this.currentYearData.push(updatedAudit);
        }

        localStorage.setItem(`sentinel_backup_${year}`, JSON.stringify(this.currentYearData));
        this.closeModal();
        this.render(year);
    },

    deleteAudit(index) {
        if (confirm("Delete this audit?")) {
            const year = document.getElementById('yearSelector').value;
            this.currentYearData.splice(index, 1);
            localStorage.setItem(`sentinel_backup_${year}`, JSON.stringify(this.currentYearData));
            this.render(year);
        }
    },

    initializeBlankYear(year) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();
        return months.map((m, idx) => ({
            month: m, title: "none", ref: `ST0096/NONE/${year}`, auditee: "n/a", dept: "n/a", 
            status: (idx >= now.getMonth() && year >= now.getFullYear()) ? "PLANNED" : "CLOSED", 
            type: "Internal"
        }));
    },

    render(year) {
        const container = document.getElementById('planContainer');
        if (!container) return;
        let html = this.isAdmin ? `<div class="month-card add-new-card" onclick="PlanGenerator.openModal()">
                                    <div class="plus-icon">+</div><p>Add New Audit</p></div>` : '';

        this.currentYearData.forEach((audit, index) => {
            const statusClass = audit.status.toLowerCase().replace(/\s+/g, '-');
            html += `
                <div class="month-card card-type-${audit.type.toLowerCase()}">
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
                        <button class="btn-edit-sm" onclick="PlanGenerator.openModal(${index})">Edit Details</button>
                        <button class="btn-delete-sm" onclick="PlanGenerator.deleteAudit(${index})">Delete</button>
                    </div>` : ''}
                </div>`;
        });
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', () => PlanGenerator.loadYear());
