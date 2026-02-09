// Automated Audit Scope Notification System
const AuditMailer = {
    // Standard template based on Supertram ST0096 protocols
    generateEmail: function(audit) {
        return {
            to: audit.auditeeEmail,
            cc: "sheq.coordinator@supertram.com, n.dobbs@supertram.com", // HofENG as per report
            subject: `AUDIT SCOPE NOTIFICATION: ${audit.ref} - ${audit.scope}`,
            body: `
                Dear ${audit.auditee},

                In accordance with the Sheffield Supertram Annual Audit Schedule, this email serves as 
                your ONE MONTH notification for the following upcoming internal audit:

                AUDIT REF:   ${audit.ref}
                SCOPE:       ${audit.scope}
                START DATE:  ${audit.startDate}
                CRITERIA:    ISO 9001, 14001, 45001, RM3, and Policy ST0096

                As per our methodology, the questionnaire phase will begin on Day 1 of the audit month. 
                Please ensure all relevant documentation and evidence streams are ready for review.

                Failure to participate as per the schedule may result in a Major Non-Conformance 
                under Clause 7 of the Conformity Criteria.

                Regards,
                
                Sentinel AMS Automation
                (On behalf of the SHEQ Department)
            `
        };
    },

    checkAndSend: function(schedule) {
        const today = new Date();
        const notificationWindow = new Date();
        notificationWindow.setDate(today.getDate() + 30); // 30-day "one month" trigger

        schedule.forEach(audit => {
            const auditStart = new Date(audit.startDate);
            if (auditStart.toDateString() === notificationWindow.toDateString()) {
                this.triggerEmail(this.generateEmail(audit));
            }
        });
    }
};
