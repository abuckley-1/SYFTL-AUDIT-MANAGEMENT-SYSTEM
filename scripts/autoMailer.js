/**
 * Supertram Sentinel - Automated Notification Engine
 * Purpose: Sends 'One Month Prior' Audit Scope Notifications
 * Aligned with: ST0096 SHEQ Compliance
 */

const AuditMailer = {
    // 1. PROFESSIONAL EMAIL TEMPLATE
    // Specifically structured to mirror the COSHH Control 2025 reporting style
    generateTemplate: function(audit) {
        return {
            subject: `OFFICIAL NOTIFICATION: Internal Audit Scope - ${audit.ref} (${audit.month} 2026)`,
            body: `
Dear ${audit.auditee},

In accordance with the Sheffield Supertram Annual Audit Schedule and Procedure ST0096, this email serves as your formal ONE MONTH notice for the upcoming audit.

AUDIT DETAILS:
--------------------------------------------------
REFERENCE:   ${audit.ref}
SCOPE:       ${audit.scope}
AUDITEE:     ${audit.auditee}
TARGET DATE: ${audit.month} 2026
CRITERIA:    RM3, ISO 9001, 14001, 45001 & Legislation
--------------------------------------------------

OBJECTIVE:
The objective is to evaluate current workplace practices against relevant standards. 
Please ensure that all evidence, including SYPOL records, training logs, and 
procedural documentation, is available for review by the start of the audit month.

IMPORTANT:
As per the 14-day rule, failure to provide requested evidence within two weeks 
of the audit start date will result in an automatic MAJOR NON-CONFORMANCE (Ad-Hoc).

Regards,

Sentinel AMS Automation
On behalf of the Head of SHEQ
            `
        };
    },

    // 2. SCHEDULING LOGIC
    // Compares today's date with the audit plan to find audits due in 30 days
    processNotifications: function(schedule) {
        const today = new Date();
        const notificationTarget = new Date();
        notificationTarget.setMonth(today.getMonth() + 1); // Looking exactly 1 month ahead

        const targetMonthName = notificationTarget.toLocaleString('default', { month: 'short' });

        console.log(`--- Sentinel Mailer: Checking for ${targetMonthName} Audits ---`);

        schedule.forEach(audit => {
            if (audit.month === targetMonthName) {
                const email = this.generateTemplate(audit);
                this.dispatchEmail(audit.auditee, email);
            }
        });
    },

    // 3. DISPATCH LOGIC
    // In a GitHub Actions environment, this would integrate with an SMTP server or SendGrid
    dispatchEmail: function(recipient, email) {
        console.log(`[MAIL SENT] To: ${recipient}`);
        console.log(`[SUBJECT] ${email.subject}`);
        console.log(`[CONTENT] Notification successfully queued.`);
        console.log('--------------------------------------------------');
    }
};

// 4. DATA INTEGRATION (Matching your 2026 Plan)
const auditPlan2026 = [
    { month: "Jan", scope: "COSHH Shadow Audit", auditee: "N. Dobbs", ref: "ST0096-S" },
    { month: "Feb", scope: "Fire Safety - Depot", auditee: "N. Dobbs", ref: "ST0097" },
    { month: "Mar", scope: "ISO 9001 Systems", auditee: "S. English", ref: "ST0098" },
    { month: "Apr", scope: "Contractor Management", auditee: "Engineering Team", ref: "ST0099" },
    { month: "May", scope: "ISO 14001 Environmental", auditee: "SHEQ Team", ref: "ST0100" },
    { month: "Jun", scope: "Training & Competence", auditee: "Dept Managers", ref: "ST0101" },
    { month: "Jul", scope: "ISO 45001 H&S", auditee: "All Depts", ref: "ST0102" },
    { month: "Aug", scope: "Risk Review", auditee: "Process Owners", ref: "ST0103" },
    { month: "Sep", scope: "Security", auditee: "Facilities", ref: "ST0104" },
    { month: "Oct", scope: "Incident Investigation", auditee: "Safety Manager", ref: "ST0105" },
    { month: "Nov", scope: "Stores Compliance", auditee: "Stores Lead", ref: "ST0106" },
    { month: "Dec", scope: "Management Review", auditee: "Executive", ref: "ST0107" }
];

// RUN THE CHECK
AuditMailer.processNotifications(auditPlan2026);
