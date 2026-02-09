/**
 * Supertram AMS - Audit Engine
 * Handles the performance and submission of internal audits
 */
const AuditEngine = {
    allAudits: [],
    
    async init() {
        console.log("SAMS: Initializing Audit Engine...");
        
        // Array of possible paths to find the data file
        const paths = [
            'data/schedules_2026.json',    // Root relative
            './data/schedules_2026.json',  // Current dir relative
            '../data/schedules_2026.json'  // Parent dir relative
        ];

        let loaded = false;

        for (const path of paths) {
            try {
                console.log(`SAMS: Attempting to fetch from: ${path}`);
                const res = await fetch(path);
                if (res.ok) {
                    this.allAudits = await res.json();
                    console.log("SAMS: Data successfully loaded from " + path);
                    loaded = true;
                    break; 
                }
            } catch (e) {
                console.warn(`SAMS: Failed to load from ${path}`);
            }
        }

        if (loaded) {
            this.populateSelector();
        } else {
            console.error("SAMS: All data paths failed.");
            document.getElementById('auditSelector').innerHTML = 
                '<option>Error: Data file not found (404)</option>';
        }
    },

    populateSelector() {
        const select = document.getElementById('auditSelector');
        // Filter out the 'none' placeholders we used in the plan generator
        const availableAudits = this.allAudits.filter(a => a.title !== 'none' && a.title !== '');
        
        if (availableAudits.length === 0) {
            select.innerHTML = '<option value="">No audits found in the 2026 schedule</option>';
            return;
        }

        select.innerHTML = '<option value="">-- Select an Audit to Perform --</option>' + 
            availableAudits.map((a, i) => {
                const statusSuffix = a.status === 'CLOSED' ? ' ✅' : '';
                return `<option value="${i}">${a.month}: ${a.title}${statusSuffix}</option>`;
            }).join('');
    },

    loadAuditDetails() {
        const val = document.getElementById('auditSelector').value;
        const form = document.getElementById('auditForm');
        
        if (val === "") {
            form.style.display = 'none';
            return;
        }
        
        const available = this.allAudits.filter(a => a.title !== 'none' && a.title !== '');
        const audit = available[val];
        
        document.getElementById('displayRef').innerText = audit.ref || "N/A";
        document.getElementById('displayDept').innerText = audit.dept || "N/A";
        form.style.display = 'block';
    },

    async submitAudit() {
        if(!confirm("Are you sure you want to submit this audit? This will update the Master Memory.")) return;

        const selector = document.getElementById('auditSelector');
        const available = this.allAudits.filter(a => a.title !== 'none' && a.title !== '');
        const selectedAudit = available[selector.value];
        
        // Find the specific audit in the master list using the Reference number
        const masterIdx = this.allAudits.findIndex(a => a.ref === selectedAudit.ref);
        
        if (masterIdx === -1) {
            alert("Error: Could not match audit reference in master list.");
            return;
        }

        // Update the data object
        this.allAudits[masterIdx].status = 'CLOSED';
        this.allAudits[masterIdx].score = document.getElementById('complianceScore').value + "%";
        this.allAudits[masterIdx].observations = document.getElementById('observations').value;
        this.allAudits[masterIdx].actions = document.getElementById('actions').value;

        await this.pushUpdate();
    },

    async pushUpdate() {
        // Use your Personal Access Token
        const token = "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";
        const repo = "abuckley-1/SYFTL-AUDIT-MANAGEMENT-SYSTEM";
        const path = "data/schedules_2026.json";

        try {
            // 1. Get the SHA to allow the update
            const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
                headers: { 'Authorization': `token ${token}` }
            });
            const fileData = await getRes.json();

            // 2. Push the updated JSON to GitHub
            const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `token ${token}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    message: `Audit Completed: ${document.getElementById('displayRef').innerText}`,
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(this.allAudits, null, 2)))),
                    sha: fileData.sha
                })
            });

            if(putRes.ok) {
                // 3. Kick the Master Sync Workflow
                await fetch(`https://api.github.com/repos/${repo}/actions/workflows/master-sync.yml/dispatches`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json' 
                    },
                    body: JSON.stringify({ ref: 'main' })
                });

                alert("✅ SUCCESS: Audit Submitted and Master Memory Synchronized!");
                window.location.href = "index.html"; // Return to dashboard
            } else {
                alert("❌ Error: GitHub rejected the update.");
            }
        } catch (err) {
            console.error(err);
            alert("❌ Sync Error: Could not connect to GitHub.");
        }
    }
};

// Start the engine when the page loads
document.addEventListener('DOMContentLoaded', () => AuditEngine.init());

checkDeadlines(audit) {
    if (!audit.notificationSent) return "PLANNED";
    
    const issuedDate = new Date(audit.notificationSent);
    const today = new Date();
    const diffDays = Math.ceil((today - issuedDate) / (1000 * 60 * 60 * 24));

    if (diffDays > 14 && audit.status !== "CLOSED") {
        return "MAJOR NC (AD-HOC) - AUTO ISSUED";
    }
    return `ACTIVE - ${14 - diffDays} DAYS REMAINING`;
}
