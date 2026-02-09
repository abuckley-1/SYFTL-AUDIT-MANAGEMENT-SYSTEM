const auditSchedule = [
    { month: "January", scope: "COSHH Shadow Audit", auditee: "N. Dobbs ", type: "SHADOW", ref: "ST0096-S" },
    { month: "February", scope: "Fire Safety - Depot", auditee: "N. Dobbs ", type: "INTERNAL", ref: "ST0097" },
    { month: "March", scope: "ISO 9001 Quality Management", auditee: "S. English ", type: "SYSTEM", ref: "ST0098" },
    { month: "April", scope: "Contractor Management", auditee: "Engineering Team", type: "OPERATIONAL", ref: "ST0099" },
    { month: "May", scope: "ISO 14001 Environmental", auditee: "SHEQ Team", type: "SYSTEM", ref: "ST0100" },
    { month: "June", scope: "Training & Competence", auditee: "Dept Managers", type: "HR/S", ref: "ST0101" },
    { month: "July", scope: "ISO 45001 Health & Safety", auditee: "All Depts", type: "SYSTEM", ref: "ST0102" },
    { month: "August", scope: "Risk Assessment Review", auditee: "Process Owners", type: "RISK", ref: "ST0103" },
    { month: "September", scope: "Site Security & DPA", auditee: "Facilities", type: "SEC", ref: "ST0104" },
    { month: "October", scope: "Incident & Investigation", auditee: "Safety Manager [cite: 27]", type: "SAFETY", ref: "ST0105" },
    { month: "November", scope: "PPE & Stores Compliance", auditee: "Stores Lead", type: "INTERNAL", ref: "ST0106" },
    { month: "December", scope: "Management Review", auditee: "Executive ", type: "STRATEGIC", ref: "ST0107" }
];

const container = document.getElementById('auditCalendar');

auditSchedule.forEach(audit => {
    const card = document.createElement('div');
    card.className = `month-card ${audit.type === 'SHADOW' ? 'shadow-critical' : ''}`;
    card.innerHTML = `
        <div class="month-label">${audit.month}</div>
        <div class="audit-details">
            <strong>${audit.scope}</strong>
            <p>Ref: ${audit.ref}</p>
            <p>Auditee: ${audit.auditee}</p>
            <span class="type-tag">${audit.type}</span>
        </div>
    `;
    container.appendChild(card);
});
