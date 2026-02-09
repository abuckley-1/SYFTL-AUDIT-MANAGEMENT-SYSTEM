const PlanGenerator = {
    isAdmin: false,
    currentYearData: [],
    editingIndex: null,
    
    // Updated Departments: Added Engineering and Customer Services
    lists: {
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        depts: ["All departments Managers", "Senior Leadership Team", "Operations", "Engineering", "Customer Services", "HR", "SHEQ", "Commercial", "Finance", "Procurement", "IT", "Facilities", "RSM", "Infrastructure", "Training", "OTHER"],
        types: ["Internal", "External", "Shadow", "OTHER"],
        status: ["OPEN", "CLOSED", "OVERDUE", "ON-HOLD", "CANCELLED", "PLANNED", "OTHER"]
    },

    async loadYear() {
        const year = document.getElementById('yearSelector').value;
        const localBackup = localStorage.getItem(`sentinel_backup_${year}`);
        
        if (localBackup) {
            this.currentYearData = JSON.parse(localBackup);
        } else {
            try {
                const response = await fetch(`./data/schedules_${year}.json`);
                this.currentYearData = response.ok ? await response.json() : this.initializeBlankYear(year);
            } catch (err) {
                this.currentYearData = this.initializeBlankYear(year);
            }
        }
        this.render(year);
    },

    showLogin() { document.getElementById('loginModal').style.display = 'flex'; },
    closeLogin() { document.getElementById('loginModal').style.display = 'none'; },
    
    authenticateAdmin() {
        if (document.getElementById('adminPass').value === "SupertramSHEQ2026") {
            this.isAdmin = true;
            document.getElementById('loginBtn').style.display = 'none';
            document.getElementById('syncContainer').style.display = 'block';
            this.closeLogin();
            this.render(document.getElementById('yearSelector').value);
        } else { alert("Incorrect Password"); }
    },

    openModal(index = null) {
        this.editingIndex = index;
        const audit = index !== null ? this.currentYearData[index] : { 
            month: 'Jan', title: '', auditee: '', dept: 'SHEQ', type: 'Internal', status: 'PLANNED', period: '' 
        };

        document.getElementById('modalTitle').value = audit.title === "none" ? "" : audit.title;
        document.getElementById('modalAuditee').value = audit.auditee === "n/a" ? "" : audit.auditee;
        document.getElementById('modalPeriod').value = audit.period || "";
        
        this.fillDropdown('modalMonth', this.lists.months, audit.month);
        this.fillDropdown('modalDept', this.lists.depts, audit.dept);
        this.fillDropdown('modalType', this.lists.types, audit.type);
        this.fillDropdown('modalStatus', this.lists.status, audit.status);

        document.getElementById('auditModal').style.display = 'flex';
    },

    fillDropdown(id, list, selectedValue) {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = list.map(opt => `<option value="${opt}" ${opt === selectedValue ? 'selected' : ''}>${opt}</option>`).join('');
    },

    closeModal() { document.getElementById('auditModal').style.display = 'none'; },

    saveModal() {
        const year = document.getElementById('yearSelector').value;
        const title = document.getElementById('modalTitle').value || "none";
        
        const updatedAudit = {
            month: document.getElementById('modalMonth').value,
            period: document.getElementById('modalPeriod').value || "N/A",
            title: title,
            auditee: document.getElementById('modalAuditee').value || "n/a",
            dept: document.getElementById('modalDept').value,
            type: document.getElementById('modalType').value,
            status: document.getElementById('modalStatus').value,
            ref: title !== "none" ? `ST0096/${title.toUpperCase().replace(/\s+/g, '')}/${year}` : `ST0096/NONE/${year}`
        };

        if (this.editingIndex !== null) this.currentYearData[this.editingIndex] = updatedAudit;
        else this.currentYearData.push(updatedAudit);

        localStorage.setItem(`sentinel_backup_${year}`, JSON.stringify(this.currentYearData));
        this.render(year);
        this.closeModal();
    },

    render(year) {
        const container = document.getElementById('planContainer');
        let html = this.isAdmin ? `<div class="month-card add-new-card" onclick="PlanGenerator.openModal()">+<br><span style="font-size:1rem">Add Audit to ${year}</span></div>` : '';

        this.currentYearData.forEach((audit, index) => {
            const statusClass = audit.status.toLowerCase().replace(/\s+/g, '-');
            html += `
                <div class="month-card">
                    <div class="month-label">${audit.month} <span style="font-size:0.8rem; color:#999;">(${audit.period || 'N/A'})</span></div>
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
                        <button class="btn-delete-sm" onclick="if(confirm('Delete?')){PlanGenerator.currentYearData.splice(${index},1);PlanGenerator.render('${year}')}">Delete</button>
                    </div>` : ''}
                </div>`;
        });
        container.innerHTML = html;
    },

    initializeBlankYear(year) {
        return this.lists.months.map(m => ({ month: m, period: 'P1', title: "none", ref: `ST0096/NONE/${year}`, auditee: "n/a", dept: "n/a", status: "PLANNED", type: "Internal" }));
    },

    // AUTOMATED GITHUB PUSH
    async pushToMaster() {
        if (!confirm("Are you sure you want to save changes?")) {
            // If cancel is pressed, clear local changes and logout as requested
            localStorage.removeItem(`sentinel_backup_${document.getElementById('yearSelector').value}`);
            window.location.reload(); 
            return;
        }

        const year = document.getElementById('yearSelector').value;
        const token = "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"; 
        const repo = "Abuckley-1/SYFTL-AUDIT-MANAGEMENT-SYSTEM";
        const path = `data/schedules_${year}.json`;

        try {
            // 1. Get current file data to get the SHA hash
            const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
                headers: { 'Authorization': `token ${token}` }
            });
            const fileData = await getRes.json();

            // 2. Push the update
            const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Audit update for ${year}`,
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(this.currentYearData, null, 2)))),
                    sha: fileData.sha
                })
            });

            if (putRes.ok) {
                alert("✅ SUCCESS: Master Memory updated automatically!");
                localStorage.removeItem(`sentinel_backup_${year}`); // Clear backup after successful live save
            } else {
                throw new Error("GitHub rejected the save.");
            }
        } catch (err) {
            alert("❌ ERROR: Could not save to GitHub automatically. Check your internet or GitHub status.");
            console.error(err);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => PlanGenerator.loadYear());
