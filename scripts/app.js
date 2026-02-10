const SAMS = {
    repo: "abuckley-1/SYFTL-AUDIT-MANAGEMENT-SYSTEM",
    token: "YOUR_GITHUB_TOKEN_HERE", // Add your token back here

    async loadData() {
        const res = await fetch('data/schedules_2026.json');
        return await res.json();
    },

    // AI Question Generator based on brief
    generateAIQuestions(subject) {
        const core = [
            { q: `What is the businesses documented policies for ${subject}?`, ref: "ISO45001-5.2" },
            { q: `Is information regarding ${subject} available to all staff?`, ref: "ISO9001-7.4" },
            { q: `Is Top Management visibly committed to ${subject}?`, ref: "RM3-OC1" },
            { q: `Are risk assessments for ${subject} up to date?`, ref: "ISO45001-6.1.2" }
        ];
        // In a real build, this array would be expanded with 20 random technical clauses
        return core;
    },

    // Automated RM3 Marking Logic
    calculateMark(answer, fileCount) {
        const text = answer.toLowerCase();
        if (text.length < 5) return { level: "AD-HOC", color: "red", score: 0 };
        if (fileCount >= 3 && text.includes("policy")) return { level: "PREDICTABLE", color: "green", score: 85 };
        return { level: "MANAGED", color: "orange", score: 40 };
    },

    async pushToGitHub(data, message) {
        // Shared logic to update the JSON file in your repo
        console.log("Pushing to GitHub...", message);
        // (API Fetch logic here as previously provided)
    }
};
