# Task ID: 10

**Title:** V1 Figma Plugin Discovery Research

**Status:** pending

**Dependencies:** 9 ✓

**Priority:** high

**Description:** Conduct market research on paid Figma plugins: survey top performers by installs/ratings, analyze review complaints for gaps, identify 3-5 candidate product directions, and write ventures/v1/RESEARCH.md with validation gate analysis.

**Details:**

Research process:
1. Survey Figma Community paid plugins:
   - Top 20 by install count
   - Categories: accessibility, design systems, content/data, export, automation
   - Note: price, rating, review count, last updated

2. Analyze gaps via reviews:
   - 1-3 star reviews for top plugins
   - Common complaints (speed, features, UX)
   - Unmet requests in comments

3. Evaluate candidate directions against validation gate:
   a. **Accessibility/contrast audit** - professionals (designers at agencies)
   b. **Localization/copy management** - recurring (every project)
   c. **Data population** - many competitors exist
   d. **Export automation** - technical, crowded

4. Write `ventures/v1/RESEARCH.md`:
```markdown
# V1 Research: Figma Plugin

## Market Survey
[Table of top paid plugins with metrics]

## Gap Analysis
[Review complaints, unmet needs]

## Candidate Directions
### 1. [Direction Name]
- Target user: [who]
- Job-to-be-done: [what]
- Recurrence: [frequency]
- Competitors: [list + their gaps]
- Build estimate: [days]
- Risk: [policy/technical]

## Validation Gate
- [x] Buyers are professionals: ...
- [x] Job recurs: ...
- [x] Paid competitor exists: ...
- [x] Buildable in ≤1 week: ...
- [x] No policy risk: ...

## Decision
[Chosen direction with rationale]
```

**Test Strategy:**

1. Verify all data points are current (check plugin pages manually).
2. Confirm validation gate criteria are all addressed.
3. Review decision rationale for logical consistency.
4. Cross-check competitor analysis against actual plugin functionality.

## Subtasks

### 10.1. Survey Figma Community for Top 20 Paid Plugins

**Status:** pending  
**Dependencies:** None  

Explore the Figma Community marketplace to identify and document the top 20 paid plugins by install count across key categories: accessibility, design systems, content/data, export, and automation.

**Details:**

Navigate to Figma Community (figma.com/community) and filter for paid plugins. For each of the top 20 by install count, record: plugin name, category, price point, star rating, total review count, install count, and last updated date. Organize findings into a structured table format. Cover all five target categories to ensure breadth of market understanding. Note any plugins that appear in multiple categories or have hybrid functionality.

### 10.2. Analyze 1-3 Star Reviews for Gaps and Complaints

**Status:** pending  
**Dependencies:** 10.1  

Conduct a systematic analysis of negative reviews (1-3 stars) across the top surveyed plugins to identify common pain points, feature gaps, and unmet user needs.

**Details:**

For each of the top 10 most-installed plugins from the survey, read through 1-3 star reviews. Categorize complaints into themes: performance/speed issues, missing features, poor UX/usability, pricing concerns, bugs/reliability, and support responsiveness. Track the frequency of each complaint type. Document specific feature requests mentioned in reviews. Look for patterns that indicate systemic market gaps rather than one-off issues. Create a prioritized list of unmet needs based on frequency and severity.

### 10.3. Evaluate 3-5 Candidate Directions Against Validation Gate

**Status:** pending  
**Dependencies:** 10.1, 10.2  

Assess each candidate product direction (accessibility/contrast audit, localization/copy management, data population, export automation) against the five validation gate criteria to determine viability.

**Details:**

For each of the 3-5 candidate directions, systematically evaluate: (1) Are buyers professionals who can expense tools? Identify the target user persona and their purchasing context. (2) Does the job recur regularly? Assess frequency of use case in typical workflows. (3) Does a paid competitor already exist? List existing solutions and their pricing. (4) Can it be built in ≤1 week? Estimate technical complexity and scope. (5) Are there policy risks? Check Figma's plugin guidelines and any platform restrictions. Score each direction and identify the strongest candidates based on validation gate pass/fail results.

### 10.4. Write ventures/v1/RESEARCH.md with Full Analysis

**Status:** pending  
**Dependencies:** 10.1, 10.2, 10.3  

Compile all research findings into a comprehensive RESEARCH.md document following the specified template, including market survey table, gap analysis, candidate evaluations, validation gate checklist, and final decision with rationale.

**Details:**

Create the ventures/v1/ directory if needed. Write RESEARCH.md following the exact template structure: Market Survey section with a formatted table of top paid plugins and their metrics. Gap Analysis section summarizing review complaints and unmet needs discovered. Candidate Directions section with detailed breakdown for each option including target user, job-to-be-done, recurrence frequency, competitors with gaps, build estimate, and risks. Validation Gate section with checkbox-style criteria confirmation for each direction. Decision section stating the chosen direction with clear rationale tied to validation gate results and gap analysis findings.
