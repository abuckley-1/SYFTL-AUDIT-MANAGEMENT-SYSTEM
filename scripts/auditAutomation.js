/**
 * Supertram Sentinel Automation Engine
 * Handles: 14-day Deadline Rule, Shadow Audit Triggers, and One-Month Notifications
 */

const fs = require('fs');

// 1. THE 14-DAY DEADLINE RULE
function checkComplianceDeadlines(auditList) {
    const today = new Date();
    auditList.forEach(audit => {
        if (audit.status === 'PENDING') {
            const issuedDate = new Date(audit.dateIssued);
            const daysDiff = (today - issuedDate) / (1000 * 60 * 60 * 24);

            if (daysDiff > 14) {
                console.log(`ALERT: Audit ${audit.ref} has exceeded 14 days. Flagging MAJOR NC.`);
                audit.status = 'MAJOR NC';
                audit.resultNotes = 'Default failure: Non-participation within 14-day window.';
                triggerShadowAudit(audit);
            }
        }
    });
}

// 2. THE SHADOW AUDIT TRIGGER (Based on ST0096 COSHH Failure)
function triggerShadowAudit(failedAudit) {
    if (failedAudit.status === 'MAJOR NC') {
        const shadowDate = new Date();
        shadowDate.setFullYear(shadowDate.getFullYear() + 1); // Schedule for 12 months later
        
        const shadowAudit = {
            ref: `${failedAudit.ref}-S`,
            scope: `${failedAudit.scope} (SHADOW AUDIT)`,
            auditee: "N. Dobbs", // HofENG takes oversight of Shadow Audits
            status: "SCHEDULED",
            scheduledMonth: shadowDate.toLocaleString('default', { month: 'long' })
        };
        
        console.log(`SYSTEM: Shadow Audit generated for ${shadowAudit.scheduledMonth} 2027`);
        // In a real environment, this would write to your database/JSON file
    }
}

// 3. ONE-MONTH NOTIFICATION LOGIC
function checkMonthlyReminders(schedule) {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    schedule.forEach(audit => {
        if (audit.month === nextMonth.toLocaleString('default', { month: 'short' })) {
            sendNotificationEmail(audit);
        }
    });
}

function sendNotificationEmail(audit) {
    console.log(`EMAIL SENT TO: ${audit.auditee}`);
    console.log(`SUBJECT: Audit Scope Notification - ${audit.scope}`);
    console.log(`BODY: This is your 1-month notice for audit ${audit.ref}...`);
}

// Execution block for GitHub Actions
// In a full setup, you would load your 'schedule.json' here
const mockSchedule = [{ ref: 'ST0096', scope: 'COSHH', auditee: 'G. Seaborn', status: 'PENDING', dateIssued: '2026-01-01' }];
checkComplianceDeadlines(mockSchedule);
