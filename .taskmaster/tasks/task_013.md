# Task ID: 13

**Title:** V2 Chrome Extension Discovery Research

**Status:** pending

**Dependencies:** 12

**Priority:** medium

**Description:** Conduct market research on Chrome Web Store paid/freemium extensions: analyze successful e-commerce seller tools, information extraction utilities, and BYO-API-key AI helpers. Document findings in ventures/v2/RESEARCH.md.

**Details:**

Research process:
1. Survey Chrome Web Store extensions:
   - Filter by category: Productivity, Shopping
   - Look for: user counts >10k, paid or freemium
   - Note: pricing model, reviews, last updated

2. Candidate directions from PRD:
   a. **E-commerce seller utilities** - Amazon/eBay sellers (professionals with money)
   b. **Information extraction/export** - must use official APIs only, no scraping
   c. **BYO-API-key AI helpers** - user provides their OpenAI/Anthropic key, zero serving cost

3. Policy/ToS check for each:
   - Chrome Web Store policies (no deceptive, no scraping ToS-protected sites)
   - Target platform ToS (Amazon, eBay, etc.)
   - List any restricted permissions to avoid

4. Write `ventures/v2/RESEARCH.md`:
```markdown
# V2 Research: Chrome Extension

## Market Survey
[Table of relevant extensions]

## Policy Analysis
- Chrome Web Store: [relevant policies]
- Target platforms: [ToS constraints]

## Candidate Directions
### 1. [Direction]
- Target user: [who]
- Recurring job: [what]
- Revenue model: [freemium with X limit]
- Competitors: [gaps]
- Technical approach: [APIs used]
- Policy risk: [assessment]

## Validation Gate
[All criteria checked]

## Decision
[Chosen direction]
```

5. Align with V1 learnings (what worked/didn't)

**Test Strategy:**

1. Verify policy citations against current Chrome Web Store docs.
2. Test ToS compliance claims by reading actual platform ToS.
3. Confirm competitor data is current.
4. Review validation gate completeness.

## Subtasks

### 13.1. Survey Chrome Web Store for Paid/Freemium Extensions

**Status:** pending  
**Dependencies:** None  

Systematically survey Chrome Web Store extensions in Productivity and Shopping categories, filtering for extensions with >10k users that use paid or freemium models. Document extension name, user count, pricing model, rating, review highlights, and last updated date in a structured table format.

**Details:**

Research methodology:
1. Navigate Chrome Web Store categories: Productivity, Shopping, Developer Tools
2. Apply filters for highly-rated extensions and sort by user count
3. For each relevant extension (>10k users, paid/freemium), capture:
   - Name and publisher
   - User count and rating
   - Pricing model (one-time, subscription, freemium limits)
   - Key features and target audience
   - Recent reviews (focus on 1-3 star for gaps)
   - Last updated date (indicator of maintenance)
4. Focus areas per PRD candidate directions:
   - E-commerce seller tools (Amazon, eBay, Shopify helpers)
   - Information extraction/export utilities
   - AI-powered tools (especially BYO-API-key models)
5. Create markdown table summarizing findings for RESEARCH.md

### 13.2. Analyze Chrome Web Store Policies and Target Platform ToS

**Status:** pending  
**Dependencies:** 13.1  

Review Chrome Web Store developer policies for extensions, focusing on restrictions around permissions, scraping, and data handling. Analyze ToS for target platforms (Amazon, eBay) to identify compliance requirements and risks for each candidate direction.

**Details:**

Policy analysis scope:
1. Chrome Web Store Developer Program Policies:
   - Manifest V3 requirements and permission justification
   - Prohibited practices (deceptive behavior, scraping protected content)
   - Data handling and privacy requirements
   - Monetization policies (ExtensionPay, external payment processors)
   - Update and maintenance expectations
2. Target platform ToS analysis:
   - Amazon Associates/Seller Central API terms
   - eBay Developer Program terms
   - Restrictions on automation, data extraction, account access
3. Permission risk assessment:
   - List permissions to avoid (e.g., broad host permissions, tabs access without justification)
   - Document required permissions per candidate direction
   - Note any permissions that trigger additional review
4. Create compliance matrix mapping each candidate direction to policy constraints

### 13.3. Evaluate Candidate Directions Against Validation Gate

**Status:** pending  
**Dependencies:** 13.1, 13.2  

Assess each candidate direction (e-commerce seller utilities, information extraction, BYO-API-key AI helpers) against the venture validation gate criteria: buyers with money, recurring job, paid competitor with gaps, ≤1 week build, no policy/ToS risk.

**Details:**

Validation gate evaluation for each direction:
1. E-commerce seller utilities:
   - Target user: Amazon/eBay sellers (professionals with budget)
   - Recurring job: Inventory management, pricing, listing optimization
   - Competitor gaps: From review analysis in subtask 1
   - Build estimate: Scope to ≤1 week
   - Policy risk: From ToS analysis in subtask 2
2. Information extraction/export:
   - Must use official APIs only (no scraping)
   - Assess available APIs and rate limits
   - Revenue viability at free API tiers
3. BYO-API-key AI helpers:
   - Zero serving cost model analysis
   - User trust requirements for API key handling
   - Differentiation from existing AI extensions
4. Score each direction on validation criteria
5. Apply lessons from V1 Figma plugin research (Task 10) if available
6. Document clear recommendation with rationale

### 13.4. Write ventures/v2/RESEARCH.md with V1 Learnings

**Status:** pending  
**Dependencies:** 13.1, 13.2, 13.3  

Create the comprehensive research document at ventures/v2/RESEARCH.md following the template structure, incorporating market survey data, policy analysis, candidate evaluations, and learnings from V1 Figma plugin research.

**Details:**

Document structure per template:
1. Market Survey section:
   - Table of surveyed extensions with all captured data points
   - Summary of market landscape and opportunity areas
2. Policy Analysis section:
   - Chrome Web Store policy summary with citations
   - Target platform ToS constraints
   - Permissions risk matrix
3. Candidate Directions section (for each):
   - Target user profile
   - Recurring job description
   - Revenue model (freemium with specific limits)
   - Competitors and documented gaps
   - Technical approach (APIs, permissions needed)
   - Policy risk assessment (low/medium/high with rationale)
4. Validation Gate section:
   - Checklist of all criteria with pass/fail per direction
5. V1 Learnings section:
   - What worked in V1 research/launch process
   - What to do differently for V2
6. Decision section:
   - Chosen direction with clear rationale
   - Next steps for Task 14 (build phase)
