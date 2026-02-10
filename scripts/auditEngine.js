/**
 * Supertram AMS - Audit Engine
 * Handles the selection, performance, and submission of internal audits
 */
const AuditEngine = {
    allAudits: [],
    
    // 1. Initialize and Load Data using the Universal Path
    async init() {
        console.log("SAMS: Initializing Audit Engine...");
        try {
            // Universal Path: Points directly to the data folder from the root
            const res = await fetch('data/schedules_2026.json');
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            this.allAudits = await res.json();
            console.log("SAMS: Data successfully loaded.", this.allAudits);
            this.populateSelector();
        } catch (e) {
            console.error("SAMS: Critical Load Error - Ensure file exists at /data/schedules_2026.json", e);
            document.getElementById('auditSelector').innerHTML = 
                '<option>Error: Could not load schedules</option>';
        }
    },

    // 2. Populate the Dropdown with available (non-placeholder) audits
    populateSelector() {
        const select = document.getElementById('auditSelector');
        // Filter out 'none' placeholders from the schedule
        const openAudits = this.allAudits.filter(a => a.title !== 'none' && a.title !== '');
        
        if (openAudits.length === 0) {
            select.innerHTML = '<option>No audits found in schedule</option>';
            return;
        }

        select.innerHTML = '<option value="">-- Choose Audit to Perform --</option>' + 
            openAudits.map((a, i) => {
                const statusIcon = a.status === 'CLOSED' ? '✅ ' : '⏳ ';
                return `<option value="${i}">${statusIcon}${a.month}: ${a.title}</option>`;
            }).join('');
    },

    // 3. Load specific details when an audit is selected
    loadAuditDetails() {
        const idx = document.getElementById('auditSelector').value;
        const form = document.getElementById('auditForm');
        
        if (idx === "") {
            form.style.display = 'none';
            return;
        }
        
        // Match the selected index against our filtered list
        const openAudits = this.allAudits.filter(a => a.title !== 'none' && a.title !== '');
        const audit = openAudits[idx];

        document.getElementById('displayRef').innerText = audit.ref;
        document.getElementById('displayDept').innerText = audit.dept;
        form.style.display = 'block';
    },

    // 4. Submit results back to GitHub via the Master Sync
    async submitAudit() {
        const obs = document.getElementById('observations').value;
        const score = document.getElementById('complianceScore').value;

        if (!obs) {
            alert("Please enter observations before submitting.");
            return;
        }

        if (!confirm("Submit these findings to the Master Memory?")) return;

        // Find the audit in the master list and update it
        const ref = document.getElementById('displayRef').innerText;
        const masterIdx = this.allAudits.findIndex(a => a.ref === ref);

        if (masterIdx !== -1) {
            this.allAudits[masterIdx].status = 'CLOSED';
            this.allAudits[masterIdx].score = score + "%";
            this.allAudits[masterIdx].lastUpdated = new Date().toISOString();
            
            await this.pushUpdate();
        }
    },

    // 5. GitHub API Integration
    async pushUpdate() {
        const token = "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";
        const repo = "abuckley-1/SYFTL-AUDIT-MANAGEMENT-SYSTEM";
        const path = "data/schedules_2026.json";

        try {
            // Get current file SHA
            const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
                headers: { 'Authorization': `token ${token}` }
            });
            const fileData = await getRes.json();

            // Push updated JSON
            const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Audit Completed: ${document.getElementById('displayRef').innerText}`,
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(this.allAudits, null, 2)))),
                    sha: fileData.sha
                })
            });

            if (putRes.ok) {
                alert("Audit Successfully Synced to Cloud!");
                window.location.href = "index.html";
            }
        } catch (err) {
            console.error("Sync Error:", err);
            alert("Connection Error: Could not sync to GitHub.");
        }
    }
};

// Start the script when the page finishes loading
document.addEventListener('DOMContentLoaded', () => AuditEngine.init());
