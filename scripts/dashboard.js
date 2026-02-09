const Dashboard = {
    async init() {
        try {
            const res = await fetch('./data/schedules_2026.json');
            const data = await res.json();
            this.updateStats(data);
            this.renderTrendChart(data);
            this.renderLeaderboard(data);
        } catch (e) { console.error("Data offline", e); }
    },

    updateStats(data) {
        const stats = {
            total: data.length,
            closed: data.filter(a => a.status === 'CLOSED').length,
            overdue: data.filter(a => a.status === 'OVERDUE').length,
            open: data.filter(a => a.status === 'OPEN').length
        };

        document.getElementById('totalSchedules').innerText = stats.total;
        document.getElementById('completionRate').innerText = Math.round((stats.closed / stats.total) * 100) + "%";
        document.getElementById('openActions').innerText = stats.open;
        document.getElementById('overdueCount').innerText = stats.overdue;
    },

    renderTrendChart(data) {
        const ctx = document.getElementById('trendChart').getContext('2d');
        // Mocking 2025 data for comparison logic
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: '2026 Completion',
                    data: [90, 85, 95, 88, 92, 100],
                    borderColor: '#F26522',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(242, 101, 34, 0.1)'
                }, {
                    label: '2025 (Prev Year)',
                    data: [70, 75, 80, 78, 85, 88],
                    borderColor: '#1D3C6E',
                    borderDash: [5, 5],
                    tension: 0.4
                }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
    },

    renderLeaderboard(data) {
        const depts = {};
        data.forEach(a => {
            if (!depts[a.dept]) depts[a.dept] = { total: 0, closed: 0 };
            depts[a.dept].total++;
            if (a.status === 'CLOSED') depts[a.dept].closed++;
        });

        const container = document.getElementById('deptLeaderboard');
        container.innerHTML = Object.entries(depts).map(([name, stat]) => {
            const pct = Math.round((stat.closed / stat.total) * 100);
            return `
                <div class="leader-row">
                    <span class="leader-name">${name}</span>
                    <div class="leader-bar"><div class="fill" style="width:${pct}%"></div></div>
                    <span class="leader-pct">${pct}%</span>
                </div>`;
        }).join('');
    }
};
Dashboard.init();
