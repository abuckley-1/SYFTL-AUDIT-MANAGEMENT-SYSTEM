const AI_QuestionBank = {
    // Mandatory anchor questions for every audit
    getMandatoryQuestions(subject) {
        return [
            { q: `What is the businesses documented policies and or procedures with regards to ${subject}? (Please quote title and reference)`, ref: "ISO 45001 - Clause 5.2 / RM3 - OC1" },
            { q: `Is all information and relevant instructions regards to ${subject} communicated and available to all relevant staff?`, ref: "ISO 9001 - Clause 7.4" },
            { q: `Is 'TOP' management visibly committed to compliance with regards to ${subject}?`, ref: "ISO 9001 - Clause 5.1 / ISO 45001 - Clause 5.1" },
            { q: `Are the relevant risk assessments to ${subject} up to date?`, ref: "ISO 45001 - Clause 6.1.2" }
        ];
    },

    // The technical criteria pool
    criteriaPool: {
        iso9001: [
            { q: "How does the organization ensure that outsourced processes related to [SUBJECT] are controlled?", ref: "ISO 9001 - Clause 8.4" },
            { q: "What evidence exists that monitoring and measurement resources for [SUBJECT] are fit for purpose?", ref: "ISO 9001 - Clause 7.1.5" },
            { q: "How are changes to the [SUBJECT] process evaluated to ensure continued conformity?", ref: "ISO 9001 - Clause 8.5.6" }
        ],
        iso14001: [
            { q: "What are the significant environmental aspects associated with [SUBJECT] at this site?", ref: "ISO 14001 - Clause 6.1.2" },
            { q: "How does the business determine its life cycle perspective regarding [SUBJECT]?", ref: "ISO 14001 - Clause 8.1" },
            { q: "What emergency preparedness and response tests have been conducted for [SUBJECT] risks?", ref: "ISO 14001 - Clause 8.2" }
        ],
        iso45001: [
            { q: "How are non-managerial workers consulted and involved in the management of [SUBJECT]?", ref: "ISO 45001 - Clause 5.4" },
            { q: "What process is used to identify legal and other requirements for [SUBJECT]?", ref: "ISO 45001 - Clause 6.1.3" },
            { q: "How is the 'Hierarchy of Controls' applied when addressing [SUBJECT] hazards?", ref: "ISO 45001 - Clause 8.1.2" }
        ],
        rm3: [
            { q: "Does the management system for [SUBJECT] show evidence of being 'Standardised' across the business?", ref: "RM3 - OC2" },
            { q: "How does the business monitor the health and safety culture specifically regarding [SUBJECT]?", ref: "RM3 - OP1" },
            { q: "What evidence is there of board-level review of [SUBJECT] performance data?", ref: "RM3 - OC1" }
        ]
    },

    generateAuditSet(subject) {
        let fullSet = [...this.getMandatoryQuestions(subject)];
        
        // Pick 5 random from each category
        ['iso9001', 'iso14001', 'iso45001', 'rm3'].forEach(cat => {
            let shuffled = this.criteriaPool[cat].sort(() => 0.5 - Math.random());
            let selected = shuffled.slice(0, 5).map(item => ({
                q: item.q.replace("[SUBJECT]", subject),
                ref: item.ref
            }));
            fullSet = [...fullSet, ...selected];
        });

        return fullSet;
    }
};
