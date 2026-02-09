const AuditeePortal = {
    auditData: null,
    questions: [],
    deadline: null,

    async init() {
        // In a real scenario, the ID comes from the URL
        const params = new URLSearchParams(window.location.search);
        const auditId = params.get('id') || "TEST_AUDIT";
        
        await this.loadAuditData(auditId);
        this.setupTimer();
        this.loadQuestions();
    },

    async loadAuditData(id) {
        // Fetching the specific audit from Master Memory
        const res = await fetch('data/schedules_2026.json');
        const all = await res.json();
        this.auditData = all.find(a => a.ref.includes(id)) || all[0];
        
        document.getElementById('auditTitle').innerText = this.auditData.title + " Questionnaire";
        document.getElementById('auditRef').innerText = "Reference: " + this.auditData.ref;
        
        // Load saved progress if exists
        const saved = localStorage.getItem(`sams_progress_${this.auditData.ref}`);
        if (saved) this.applySavedProgress(JSON.parse(saved));
    },

    setupTimer() {
        const issueDate = new Date(this.auditData.notificationSent || new Date());
        this.deadline = new Date(issueDate);
        this.deadline.setDate(this.deadline.getDate() + 14);

        const updateClock = () => {
            const now = new Date();
            const diff = this.deadline - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            const timerEl = document.getElementById('daysRemaining');
            timerEl.innerText = days >= 0 ? `${days} Days Left` : "EXPIRED";

            if (days < 0) {
                this.triggerAutoMajorNC();
            }
        };
        updateClock();
    },

    loadQuestions() {
        // Use the AI Bank to generate the 24-question set
        this.questions = AI_QuestionBank.generateAuditSet(this.auditData.title);
        const container = document.getElementById('questionsContainer');
        
        container.innerHTML = this.questions.map((q, i) => `
            <div class="question-block">
                <label>${i+1}. ${q.q} <span class="criteria-tag">(${q.ref})</span></label>
                <textarea id="ans_${i}" oninput="AuditeePortal.autoMark(${i})" placeholder="Provide detailed response and quote evidence..."></textarea>
                <div id="mark_${i}" class="auto-mark-indicator">Pending response...</div>
            </div>
        `).join('') + `
            <div class="question-block">
                <label>General and/or Further Comments</label>
                <textarea id="generalComments"></textarea>
            </div>
        `;
    },

    autoMark(index) {
        const answer = document.getElementById(`ans_${index}`).value;
        const indicator = document.getElementById(`mark_${index}`);
        
        // Automated judgement logic based on percentage/keyword detection
        if (answer.length < 5) {
            indicator.className = "auto-mark-indicator nc-major";
            indicator.innerText = "AD-HOC (Major NC) - Insufficient Detail";
        } else if (answer.toLowerCase().includes("yes") && !answer.toLowerCase().includes("reference")) {
            indicator.className = "auto-mark-indicator evidence-req";
            indicator.innerText = "Further Evidence Required - Please provide refs";
        } else {
            indicator.className = "auto-mark-indicator conforming";
            indicator.innerText = "PREDICTABLE (Conforming)";
        }
    },

    saveProgress() {
        const progress = {
            name: document.getElementById('auditeeName').value,
            dept: document.getElementById('deptName').value,
            answers: this.questions.map((_, i) => document.getElementById(`ans_${i}`).value)
        };
        localStorage.setItem(`sams_progress_${this.auditData.ref}`, JSON.stringify(progress));
        alert("Progress saved. You can return to this page within the 14-day window.");
    },

    async triggerAutoMajorNC() {
        alert("TIMELIMIT EXPIRED: An automatic Major Non-Conformance has been issued.");
        this.auditData.status = "MAJOR NC (AD-HOC)";
        // Push to master via GitHub API logic
    }
};

document.addEventListener('DOMContentLoaded', () => AuditeePortal.init());
