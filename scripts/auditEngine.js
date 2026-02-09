const AuditEngine = {
    allAudits: [],
    
    async init() {
        console.log("Audit Engine Initializing...");
        try {
            // Use 'data/...' instead of './data/...' for better compatibility
            const res = await fetch('data/schedules_2026.json');
            
            if (!res.ok) throw new Error("File not found on server");
            
            this.allAudits = await res.json();
            console.log("Data loaded:", this.allAudits);
            this.populateSelector();
        } catch (e) { 
            console.error("Critical Load Error:", e);
            document.getElementById('auditSelector').innerHTML = '<option>Error: Could not connect to Master Memory</option>';
        }
    },

    populateSelector() {
        const select = document.getElementById('auditSelector');
        // Filter out the 'none' placeholders, but let's show 'Closed' ones for testing
        const availableAudits = this.allAudits.filter(a => a.title !== 'none');
        
        if (availableAudits.length === 0) {
            select.innerHTML = '<option value="">No audits found in 2026 schedule</option>';
            return;
        }

        select.innerHTML = '<option value="">-- Select an Audit to Perform --</option>' + 
            availableAudits.map((a, i) => {
                const statusSuffix = a.status === 'Closed' ? ' (ALREADY DONE)' : '';
                return `<option value="${i}">${a.month}: ${a.title}${statusSuffix}</option>`;
            }).join('');
    },

    loadAuditDetails() {
        const val = document.getElementById('auditSelector').value;
        if (val === "") {
            document.getElementById('auditForm').style.display = 'none';
            return;
        }
        
        const available = this.allAudits.filter(a => a.title !== 'none');
        const audit = available[val];
        
        document.getElementById('displayRef').innerText = audit.ref;
        document.getElementById('displayDept').innerText = audit.dept;
        document.getElementById('auditForm').style.display = 'block';
    }
    // ... rest of your submitAudit code remains the same
};

document.addEventListener('DOMContentLoaded', () => AuditEngine.init());
