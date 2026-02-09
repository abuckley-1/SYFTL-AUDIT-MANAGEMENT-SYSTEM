const DashboardManager = {
    async init() {
        try {
            // Fetch the same live file we updated earlier
            const response = await fetch('./data/schedules_2026.json');
            const data = await response.json();
            this.calculateKPIs(data);
        } catch (err) {
            console.error("Dashboard failed to load data:", err);
        }
    },

    calculateKPIs(data) {
        // 1. Basic Stats
        const total = data.length;
        const closed = data.filter(a => a.status === "CLOSED").length;
        const overdue = data.filter(a => a.status === "OVERDUE").length;
        const open = data.filter(a => a.status === "OPEN").length;
        const completionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

        // 2. Update the UI
        document.getElementById('totalSchedules').innerText = total;
        document.getElementById('completionRate').innerText = completionRate + "%";
        document.getElementById('openActions').innerText = open;
        document.getElementById('overdueCount').innerText = overdue;

        // 3. Automated Dept Breakdown
        const deptStats = {};
        data.forEach(audit => {
            if (!deptStats[audit.dept]) deptStats[audit.dept] = { total: 0, closed: 0 };
            deptStats[audit.dept].total++;
            if (audit.status === "CLOSED") deptStats[audit.dept].closed++;
        });

        this.renderDeptList(deptStats);
    },

    renderDeptList(stats) {
        const container = document.getElementById('deptBreakdown');
        let html = '';
        
        for (const [dept, count] of Object.entries(stats)) {
            if (dept === "n/a") continue;
            const pct = Math.round((count.closed / count.total) * 100);
            html += `
                <div class="dept-row">
                    <span class="dept-name">${dept}</span>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${pct}%"></div>
                    </div>
                    <span class="dept-pct">${pct}%</span>
                </div>
            `;
        }
        container.innerHTML = html;
    }
};

document.addEventListener('DOMContentLoaded', () => DashboardManager.init());
