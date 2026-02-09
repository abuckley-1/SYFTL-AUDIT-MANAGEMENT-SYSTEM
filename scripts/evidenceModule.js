const EvidenceModule = {
    flaggedItems: [],
    
    async init() {
        // Retrieve audits marked as 'Further Evidence Required' from Master Memory
        const res = await fetch('data/schedules_2026.json');
        const data = await res.json();
        // For this demo, we filter items that were flagged in the first stage
        this.renderEvidenceInputs();
    },

    renderEvidenceInputs() {
        const container = document.getElementById('evidenceList');
        // Simulated flagged questions from Stage 1
        const items = ["Waste Policy Documentation", "Risk Assessment Communication Logs"];
        
        container.innerHTML = items.map((item, i) => `
            <div class="evidence-block">
                <h3>Q: ${item}</h3>
                <p class="instruction">Requirement: Upload a minimum of 3 files (e.g., PDFs, Photos, Logs)</p>
                <input type="file" id="file_${i}_1" class="file-input" multiple>
                <textarea id="desc_${i}" placeholder="Describe how these files satisfy the criteria..."></textarea>
                <div id="status_${i}" class="file-count-warning">0/3 files attached</div>
            </div>
        `).join('');

        // Listen for file changes to track the 'Minimum 3' rule
        document.querySelectorAll('.file-input').forEach((input, i) => {
            input.onchange = (e) => {
                const count = e.target.files.length;
                const status = document.getElementById(`status_${i}`);
                status.innerText = `${count}/3 files attached`;
                status.style.color = count >= 3 ? "green" : "red";
            };
        });
    },

    async submitAll() {
        const inputs = document.querySelectorAll('.file-input');
        let allValid = true;

        inputs.forEach(input => {
            if (input.files.length < 3) allValid = false;
        });

        if (!allValid) {
            alert("Mandatory Requirement: You must provide a minimum of 3 files per request to satisfy the Auditor.");
            return;
        }

        if (!confirm("Confirm submission. Failure to satisfy requirements will result in an automated RM3 'Managed' (Minor NC) score.")) return;

        await this.pushFinalResults();
    },

    async pushFinalResults() {
        // Logic to push to GitHub and update status to 'REPORTING MONTH'
        alert("Evidence Received. System is now generating the Automated Audit Report.");
        window.location.href = "index.html";
    }
};
EvidenceModule.init();
