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
            this.currentYearData = response.ok ? await response.json() : this.initializeBlankYear(year);
        } catch (err) {
            this.currentYearData = this.initializeBlankYear(year);
        }
        this.render(year);
    },

    // --- LOGIN LOGIC ---
    showLogin() {
        document.getElementById('loginModal').style.display = 'flex';
    },

    closeLogin() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('adminPass').value = '';
    },

    authenticateAdmin() {
        const pass = document.getElementById('adminPass').value;
        if (pass === "SupertramSHEQ2026") {
            this.isAdmin = true;
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('syncContainer').style.display = 'block';
            this.closeLogin();
            this.render(document.getElementById('yearSelector').value);
        } else {
            alert("Unauthorized Access.");
        }
    },

    // --- MODAL LOGIC ---
    openModal(index = null) {
        this.editingIndex = index;
        const modal = document.getElementById('auditModal');
        const audit = index !== null ? this.currentYearData[index] : { 
            month: 'Jan', title: '', auditee: '', dept: 'SHEQ', type: 'Internal', status: 'PLANNED' 
        };

        document.getElementById('modalTitle').value = audit.title === "none" ? "" : audit.title;
        document.getElementById('modalAuditee').value = audit.auditee === "n/a" ? "" : audit.auditee;
        document.getElementById('modalMonth').value = audit.month;
        
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
        if (confirm("Permanently delete this audit tile?")) {
            this.currentYearData.splice(index, 1);
            this.render(document.getElementById('yearSelector').value);
        }
    },

    // --- RENDER LOGIC ---
    render(year) {
        const container = document.getElementById('planContainer');
        if (!container) return;

        let html = '';
        
        if (this.isAdmin) {
            html += `<div class="month-card add-new-card" onclick="PlanGenerator.openModal()">
                        <div style="font-size:3rem;">+</div>
                        <p>Add Audit to ${year}</p>
                     </div>`;
        }

        this.currentYearData.forEach((audit, index) => {
            const statusClass = audit.status.toLowerCase().replace(/\s+/g, '-');
            html += `
                <div class="month-card card-type-${audit.type.toLowerCase()}">
                    <div class="month-label" style="font-weight:800; font-size:1.4rem; color:var(--st-navy);">${audit.month}</div>
                    <div class="status-badge badge-${statusClass}">${audit.status}</div>
                    <div style="margin-top:10px;">
                        <span style="font-size:0.7rem; color:var(--st-orange); font-weight:bold; text-transform:uppercase;">${audit.type}</span>
                        <h3 style="margin:5px 0; word-wrap:break-word;">${audit.title}</h3>
                        <p style="font-size:0.85rem; color:#666; margin:2px 0;"><strong>Ref:</strong> ${audit.ref}</p>
                        <p style="font-size:0.85rem; color:#666; margin:2px 0;"><strong>Dept:</strong> ${audit.dept}</p>
                        <p style="font-size:0.85rem; color:#666; margin:2px 0;"><strong>Auditee:</strong> ${audit.auditee}</p>
                    </div>
                    ${this.isAdmin ? `
                        <div class="admin-actions">
                            <button class="btn-edit-sm" onclick="PlanGenerator.openModal(${index})">Edit Details</button>
                            <button class="btn-delete-sm" onclick="PlanGenerator.deleteAudit(${index})">Delete</button>
                        </div>` : ''}
                </div>`;
        });
        container.innerHTML = html;
    },

    initializeBlankYear(year) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.map(m => ({
            month: m, title: "none", ref: `ST0096/NONE/${year}`, auditee: "n/a", dept: "n/a", status: "PLANNED", type: "Internal"
        }));
    },

    pushToMaster() {
        console.log(JSON.stringify(this.currentYearData, null, 2));
        alert("Data copied to Browser Console (F12). Paste into your GitHub data file.");
    }
};

document.addEventListener('DOMContentLoaded', () => PlanGenerator.loadYear());
