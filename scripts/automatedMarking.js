const AutomatedMarking = {
    // RM3 & ISO scoring palette
    levels: {
        AD_HOC: { label: "Major NC", color: "red", score: 0 },
        MANAGED: { label: "Minor NC", color: "orange", score: 40 },
        STANDARDISED: { label: "OFI", color: "yellow", score: 65 },
        PREDICTABLE: { label: "Conforming", color: "lightgreen", score: 85 },
        EXCELLENCE: { label: "Excellence", color: "green", score: 100 }
    },

    analyzeResponse(answer, fileCount) {
        let level = this.levels.AD_HOC; // Default
        const text = answer.toLowerCase();

        // 1. Check for Excellence (Predictable + Top Management + Proactive)
        if (text.includes("top management") && text.includes("review") && fileCount >= 5) {
            level = this.levels.EXCELLENCE;
        } 
        // 2. Check for Predictable (Comprehensive + 3 Files)
        else if (fileCount >= 3 && text.length > 50) {
            level = this.levels.PREDICTABLE;
        }
        // 3. Check for Standardised (Policy quoted + some evidence)
        else if (text.includes("policy") || text.includes("procedure")) {
            level = this.levels.STANDARDISED;
        }
        // 4. Managed (Minor NC - Needs more evidence)
        else if (text.length > 10) {
            level = this.levels.MANAGED;
        }

        return level;
    }
};
