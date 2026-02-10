/**
 * Supertram AMS - Dashboard Logic
 * Visualizes audit data and compliance KPIs
 */
const Dashboard = {
    chart: null,

    async init() {
        console.log("SAMS: Initializing Dashboard...");
        try {
            // Universal Path to the Master Memory
            const res = await fetch('data/schedules_2026.json');
            if (!res.ok) throw new Error("Could not load 2026 schedule");
            
            const data = await res.json();
            this.renderStats(data);
            this.renderChart(data);
            this.updateDate();
        } catch (e) {
            console.error("Dashboard Load Error:", e);
        }
    },

    updateDate() {
        const now = new Date();
        document.getElementById('currentDate').innerText = now.toLocaleDateString('en-GB', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    },

    renderStats(data) {
        // 1. Completion Rate: % of audits that are 'CLOSED'
        const totalAudits = data.filter(a => a.title !== 'none' && a.title !== '').length;
        const closedAudits = data.filter(a => a.status === 'CLOSED').length;
        const rate = totalAudits > 0 ? Math.round((closedAudits / totalAudits) * 100) : 0;
        
        document.getElementById('completionRate').innerText = `${rate}%`;

        // 2. Major NC Count: Includes those auto-issued by the timer
        const majorNCs = data.filter(a => 
            a.status === 'MAJOR NC (AD-HOC)' || 
            (a.score && parseInt(a.score) < 40)
        ).length;
        
        const ncDisplay = document.getElementById('majorNCs');
        ncDisplay.innerText = majorNCs;
        ncDisplay.style.color = majorNCs > 0 ? "#ff4d4d" : "#4ade80";

        // 3. Overdue Actions: Audits that are past their month but not closed
        const currentMonthIdx = new Date().getMonth();
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        
        const overdue = data.filter((a, i) => {
            const auditMonthIdx = months.indexOf(a.month);
            return auditMonthIdx < currentMonthIdx && a.status !== 'CLOSED';
        }).forEach(a => console.warn(`Overdue Audit Detected: ${a.ref}`));
    },

    renderChart(data) {
        const ctx = document.getElementById('complianceChart').getContext('2d');
        
        // Prepare data for the chart: Compliance scores by month
        const monthlyData = data.filter(a => a.title !== 'none').map(a => ({
            month: a.month,
            score: a.score ? parseInt(a.score) : 0
        }));

        if (this.chart) this.chart.destroy();

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.map(d => d.month),
                datasets: [{
                    label: 'Compliance Score %',
                    data: monthlyData.map(d => d.score),
                    backgroundColor: monthlyData.map(d => {
                        if (d.score >= 85) return '#4ade80'; // Green
                        if (d.score >= 65) return '#facc15'; // Yellow
                        if (d.score > 0) return '#fb923c';   // Orange
                        return '#1e293b';                    // Empty/Dark
                    }),
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.1)' } },
                    x: { grid: { display: false } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => Dashboard.init());
