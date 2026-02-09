// Data-driven Logic based on ST0096 COSHH Audit [cite: 191]
const AuditAutomation = {
    checkDeadlines: function(auditDate) {
        const submissionDate = new Date();
        const deadline = new Date(auditDate);
        deadline.setDate(deadline.getDate() + 14); // 14-Day rule 

        if (submissionDate > deadline) {
            return {
                status: "MAJOR NC",
                reason: "Failure to participate as per schedule [cite: 158]"
            };
        }
    },

    triggerShadowAudit: function(result) {
        // If Major NC found (as in ST0096 [cite: 191]), schedule a repeat for 12 months time
        if (result === "Major NC") {
            console.log("System Action: Shadow Audit scheduled for Dec 2026.");
            // Code here to append to schedule.json
        }
    }
};
