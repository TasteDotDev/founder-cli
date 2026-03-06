# Founder CLI — 112 Use Case Examples

Real prompts run through Founder CLI with real output. Each example is stored as a JSON file in [`docs/examples/`](examples/) with the full response.

> **Interactive version:** [Browse all examples with search and filtering](https://tastedotdev.github.io/founder-cli/examples.html)

---

## Table of Contents

- [Early Stage / Idea Validation](#early-stage--idea-validation) (15)
- [Fundraising & Pitch](#fundraising--pitch) (12)
- [Growth & Acquisition](#growth--acquisition) (15)
- [Pricing & Monetization](#pricing--monetization) (10)
- [Competition & Positioning](#competition--positioning) (10)
- [Team & Hiring](#team--hiring) (10)
- [Product & PMF](#product--pmf) (12)
- [Operations & Scale](#operations--scale) (8)
- [AI-Specific Scenarios](#ai-specific-scenarios) (12)
- [Decision Points](#decision-points) (8)

---

## Early Stage / Idea Validation

| # | Example | Prompt |
|:-:|:--------|:-------|
| 1 | [AI Tutoring App — Finding PMF](examples/001-ai-tutoring-pmf.json) | `founder "I have 200 beta users for my AI math tutoring app. 30% come back weekly but nobody's paying yet. How do I know if I have PMF?"` |
| 2 | [Solo Founder SaaS Pricing](examples/002-solo-saas-pricing.json) | `founder "I built an API monitoring tool. 50 companies using it free. I need to start charging but I'm a solo dev and don't know how to price it."` |
| 3 | [Marketplace Chicken-and-Egg](examples/003-marketplace-chicken-egg.json) | `founder "I'm building a marketplace connecting companies with AI prompt engineers. Classic chicken-and-egg. How do I solve this?"` |
| 4 | [Climate Tech Hardware GTM](examples/004-climate-hardware-gtm.json) | `founder "We have a carbon capture device for commercial buildings. $50K per unit. How do we go to market when the sales cycle is 6+ months?"` |
| 5 | [Validate B2B Without Building](examples/005-validate-without-building.json) | `founder "I think fintech companies need an AI tool to automate SOX compliance. How do I validate this without spending 6 months coding?"` |
| 6 | [Consumer App vs B2B Pivot](examples/006-consumer-vs-b2b.json) | `founder "Built a personal finance app. 10K users love it, NPS is 72, but conversion to paid is 0.3%. Three banks asked about licensing. What do I do?"` |
| 7 | [Immigrant Founder Visa Strategy](examples/007-immigrant-founder-visa.json) | `founder "I'm on an H1B visa and want to start a company. What's my best path?"` |
| 8 | [Regulated Industry Launch](examples/008-regulated-industry-launch.json) | `founder "We're building a remote patient monitoring platform. Need FDA clearance. How do we move fast in a regulated industry?"` |
| 9 | [Finding a Technical Co-Founder](examples/009-finding-technical-cofounder.json) | `founder "I spent 15 years in logistics. I know exactly what software this industry needs. But I can't code."` |
| 10 | [Physical Product Validation](examples/010-physical-product-validation.json) | `founder "I want to build a smart water bottle that tracks hydration. The hardware prototype costs $15K. How do I validate demand?"` |
| 11 | [Pet Services Marketplace](examples/011-pet-services-marketplace.json) | `founder "Building an Uber for pet sitting. Rover exists but their vetting is terrible. Can I compete?"` |
| 12 | [Agency to Product Transition](examples/012-agency-to-product.json) | `founder "We run a design agency doing $800K/yr. We keep building the same design system. Should we productize it?"` |
| 13 | [Boring B2B Vertical SaaS](examples/013-boring-vertical-saas.json) | `founder "Everyone's building AI agents. I want to build scheduling software for plumbing companies. Is boring B2B still a good bet?"` |
| 14 | [Open Source to Commercial](examples/014-open-source-commercial.json) | `founder "My open source database migration tool has 5K GitHub stars. How do I turn this into a business?"` |
| 15 | [Too Many Startup Ideas](examples/015-too-many-ideas.json) | `founder "I have 5 startup ideas and can't pick one. How do I decide?"` |

## Fundraising & Pitch

| # | Example | Prompt |
|:-:|:--------|:-------|
| 16 | [Pre-Seed Deck for AI Dev Tool](examples/016-pre-seed-ai-dev-tool.json) | `founder "We're raising pre-seed for our AI code review tool. $10K MRR, growing 25% MoM. Need help with our pitch deck."` |
| 17 | [Series A Narrative for Fintech](examples/017-series-a-narrative-fintech.json) | `founder "We're a fintech for gig workers. $1.2M ARR. Investors keep saying 'interesting but small market.' How do I fix the narrative?"` |
| 18 | [SAFE Note Terms](examples/018-safe-note-terms.json) | `founder "An angel offered $250K on a $4M post-money SAFE with pro rata rights. Is this fair?"` |
| 19 | [Angel Round Strategy](examples/019-angel-round-strategy.json) | `founder "I need to raise $500K from angels. 8 warm intros. How do I run this efficiently?"` |
| 20 | [Bootstrap to VC Decision](examples/020-bootstrap-to-vc.json) | `founder "We're profitable at $500K ARR. A VC offered $3M Series A. What are the real trade-offs?"` |
| 21 | [Pitch Deck Not Getting Meetings](examples/021-pitch-deck-no-meetings.json) | `founder "Sent my deck to 30 investors, got 2 meetings, both passed. What am I doing wrong?"` |
| 22 | [Revenue-Based Financing vs Equity](examples/022-rbf-vs-equity.json) | `founder "E-commerce brand doing $2M ARR. Need $300K for inventory. RBF, LOC, or equity?"` |
| 23 | [VC Meeting Preparation](examples/023-vc-meeting-prep.json) | `founder "Meeting with a partner at Andreessen tomorrow. What should I prepare for?"` |
| 24 | [Bridge Round After Missing Targets](examples/024-bridge-round-missed-targets.json) | `founder "Raised $5M Series A 18 months ago. Projected $3M ARR but at $1.2M. Need a bridge."` |
| 25 | [Crowdfunding for Hardware](examples/025-crowdfunding-hardware.json) | `founder "Working prototype of a portable air quality monitor. $45/unit cost, $129 retail. Kickstarter or direct?"` |
| 26 | [EU Investor Outreach](examples/026-eu-investor-outreach.json) | `founder "US climate tech startup. American VCs say too early. How do we approach EU investors?"` |
| 27 | [Strategic vs Financial Investor](examples/027-strategic-vs-financial-investor.json) | `founder "Two term sheets: $4M from a traditional VC vs $3M from Google Ventures with partnership. Which?"` |

## Growth & Acquisition

| # | Example | Prompt |
|:-:|:--------|:-------|
| 28 | [PLG for Developer Tool](examples/028-plg-developer-tool.json) | `founder "Developer observability tool. 2K free users, 40 paying. 2% conversion. How do I build PLG?"` |
| 29 | [Cold Email for Construction SaaS](examples/029-cold-email-construction.json) | `founder "Selling PM software to construction companies. 500 emails, 1% reply rate. What am I doing wrong?"` |
| 30 | [TikTok Growth for D2C](examples/030-tiktok-growth-d2c.json) | `founder "Men's skincare brand doing $50K/mo from Meta ads. CAC rising. How do I start on TikTok?"` |
| 31 | [Community-Led Growth](examples/031-community-led-growth.json) | `founder "Discord with 3K developers. Active but not driving revenue. How do I turn community into growth?"` |
| 32 | [Viral Loop Design](examples/032-viral-loop-design.json) | `founder "Real-time collaboration tool. Users love it but growth is flat. How do I build virality?"` |
| 33 | [SEO on a Budget](examples/033-seo-budget.json) | `founder "Zero organic traffic. Competitors rank for everything. Small team. What's a realistic SEO strategy?"` |
| 34 | [Partnership for Distribution](examples/034-partnership-distribution.json) | `founder "HR compliance tool for SMBs. How do we partner with Gusto or Rippling?"` |
| 35 | [Failed Referral Program](examples/035-failed-referral-program.json) | `founder "$40/mo subscription box. Referral program (give $10, get $10) — only 12 used it. What went wrong?"` |
| 36 | [Niche to Mainstream Expansion](examples/036-niche-to-mainstream.json) | `founder "We're #1 for yoga studios (800 customers). How do we expand to all fitness studios?"` |
| 37 | [Event-Led Growth ROI](examples/037-event-led-growth.json) | `founder "Should we sponsor developer conferences? $10-50K per event, unsure of ROI."` |
| 38 | [Reactivating Churned Users](examples/038-reactivating-churned-users.json) | `founder "2,000 churned accounts. Product improved a lot. How do I win them back?"` |
| 39 | [LinkedIn for B2B Buyers](examples/039-linkedin-b2b-buyers.json) | `founder "Our buyers are CFOs at mid-market companies. How do I reach them with content?"` |
| 40 | [Outbound Sales from Zero](examples/040-outbound-sales-zero.json) | `founder "Technical founder, just hired first SDR. No playbook. Help me build outbound from zero."` |
| 41 | [US to EU Expansion](examples/041-us-to-eu-expansion.json) | `founder "US SaaS doing $3M ARR. Getting EU inbound. Should we formally expand?"` |
| 42 | [Product Hunt Launch](examples/042-product-hunt-launch.json) | `founder "Launching on Product Hunt. Last time got 50 upvotes. How do we get Product of the Day?"` |

## Pricing & Monetization

| # | Example | Prompt |
|:-:|:--------|:-------|
| 43 | [Usage-Based API Pricing](examples/043-usage-based-api-pricing.json) | `founder "Document processing API. $99/mo flat but usage varies wildly. How do we switch to usage-based?"` |
| 44 | [Freemium Conversion](examples/044-freemium-conversion.json) | `founder "50K free users, 1.2% conversion, $12/mo. Benchmark is 3-5%. How do I double conversion?"` |
| 45 | [Enterprise Tier Pricing](examples/045-enterprise-tier-pricing.json) | `founder "SMBs at $49/seat. Enterprise wants SSO, audit logs. How do I price enterprise?"` |
| 46 | [AI Product Pricing Model](examples/046-ai-product-pricing.json) | `founder "AI writing assistant. Charge per word, per document, per seat, or per month?"` |
| 47 | [40% Price Increase Strategy](examples/047-price-increase-strategy.json) | `founder "Need to raise prices 40%. 800 customers. How to do this without a revolt?"` |
| 48 | [Marketplace Take Rate](examples/048-marketplace-take-rate.json) | `founder "Freelance marketplace taking 15%. Providers complain. How do we optimize take rate?"` |
| 49 | [Monetizing a Free Chrome Extension](examples/049-monetize-chrome-extension.json) | `founder "Chrome extension for tab management. 100K WAU, all free. How do I monetize?"` |
| 50 | [Two-Sided Platform Pricing](examples/050-two-sided-platform-pricing.json) | `founder "Climate tech job board. Employers pay $299/post. Candidates want premium features too."` |
| 51 | [Annual Plan Conversion](examples/051-annual-plan-conversion.json) | `founder "Only 15% choose annual plans. We offer 20% off. How do I shift the ratio?"` |
| 52 | [Credit-Based API Pricing](examples/052-credit-based-api-pricing.json) | `founder "Data enrichment API. Usage varies from 100 to 50K lookups/month. What model works?"` |

## Competition & Positioning

| # | Example | Prompt |
|:-:|:--------|:-------|
| 53 | [Competing Against Salesforce](examples/053-competing-against-salesforce.json) | `founder "CRM for real estate agents. Salesforce launched a real estate vertical. How do we survive?"` |
| 54 | [Differentiating AI Wrapper](examples/054-differentiating-ai-wrapper.json) | `founder "AI customer support chatbot. 200 competitors. Same models. How do we differentiate?"` |
| 55 | [Blue Ocean in Email Marketing](examples/055-blue-ocean-email-marketing.json) | `founder "Want to build email marketing. Mailchimp, ConvertKit, Beehiiv. Is there a blue ocean?"` |
| 56 | [Responding to Price War](examples/056-responding-to-price-war.json) | `founder "Competitor cut prices 50%. Customers asking why we're twice the price. Match or hold?"` |
| 57 | [Competing with Open Source](examples/057-competing-with-oss.json) | `founder "OSS version of what we sell hit 10K GitHub stars. We charge $299/mo. How do we justify paid?"` |
| 58 | [Network Effects Market Entry](examples/058-network-effects-entry.json) | `founder "Building a professional network for climate tech. LinkedIn is the gorilla. How do we start?"` |
| 59 | [Competitive Intelligence System](examples/059-competitive-intelligence.json) | `founder "6 competitors, keep getting blindsided by launches. How do I set up competitive intel?"` |
| 60 | [Creating a New Category](examples/060-creating-new-category.json) | `founder "Tool combining PM, CRM, and docs. Investors ask 'what category?' No good answer."` |
| 61 | [Patent Strategy for AI](examples/061-patent-strategy-ai.json) | `founder "Novel way to fine-tune LLMs. 4-person team. Should we patent? Seems expensive and slow."` |
| 62 | [Bootstrapped vs VC-Funded Competitor](examples/062-bootstrapped-vs-funded.json) | `founder "Competitor raised $50M. We're bootstrapped at $400K ARR. What's my playbook?"` |

## Team & Hiring

| # | Example | Prompt |
|:-:|:--------|:-------|
| 63 | [First 10 Hires](examples/063-first-10-hires.json) | `founder "Solo founder at $200K ARR. Who do I hire first — engineer, marketer, sales, or ops?"` |
| 64 | [Co-Founder Equity Split](examples/064-cofounder-equity-split.json) | `founder "Splitting equity with co-founder. I had the idea and 6 months of work. She's joining for engineering."` |
| 65 | [Remote Culture at Scale](examples/065-remote-culture-scale.json) | `founder "Remote-first, growing 15 to 50. Culture breaking. Communication fragmented."` |
| 66 | [Engineer vs Sales Hire Priority](examples/066-engineer-vs-sales-hire.json) | `founder "More sales opportunities than we can handle, but product has critical bugs. Engineer or salesperson first?"` |
| 67 | [Firing a Co-Founder](examples/067-firing-cofounder.json) | `founder "Co-founder checked out. No output for 3 months. Owns 40%. What do I do?"` |
| 68 | [Building an Advisory Board](examples/068-building-advisory-board.json) | `founder "I need advisors. How do I find them, what do I offer, how do I make sure they actually help?"` |
| 69 | [Startup Compensation Strategy](examples/069-startup-compensation.json) | `founder "Need to hire senior engineer. Big tech pays $350K+. I can afford $150K + equity."` |
| 70 | [Founder Burnout Recovery](examples/070-founder-burnout.json) | `founder "Working 80-hour weeks for 18 months. Running on fumes. Everything breaks without me."` |
| 71 | [Engineering Culture Setup](examples/071-engineering-culture.json) | `founder "8 engineers, no process. Drowning in code reviews. Engineering manager or tech lead?"` |
| 72 | [Diversity Hiring at Small Scale](examples/072-diversity-hiring.json) | `founder "6 people, all same background. Want to diversify but pipeline looks the same."` |

## Product & PMF

| # | Example | Prompt |
|:-:|:--------|:-------|
| 73 | [Superhuman PMF Survey How-To](examples/073-superhuman-pmf-howto.json) | `founder "Walk me through the 'very disappointed' survey with 500 active users."` |
| 74 | [Churn Crisis Diagnosis](examples/074-churn-crisis.json) | `founder "Monthly churn jumped from 3% to 8% in two months. How do I diagnose and fix this?"` |
| 75 | [Feature Prioritization](examples/075-feature-prioritization.json) | `founder "50 feature requests, 3 engineers. How do I ruthlessly prioritize?"` |
| 76 | [Pivot to Analytics](examples/076-pivot-to-analytics.json) | `founder "PM tool, $30K MRR flat for 6 months. Analytics dashboard gets most praise. Should we pivot?"` |
| 77 | [Going Upmarket to Enterprise](examples/077-going-upmarket.json) | `founder "SMBs at $29/mo. Enterprise wants SSO/SLA for $2K/mo. Do we go upmarket?"` |
| 78 | [Onboarding Drop-Off Fix](examples/078-onboarding-dropoff.json) | `founder "60% of signups don't complete onboarding. Tried tutorials and tooltips. Nothing works."` |
| 79 | [Rewrite vs Refactor](examples/079-rewrite-vs-refactor.json) | `founder "V1 has massive tech debt. Customers happy but features take 3x longer. Do we rewrite?"` |
| 80 | [Mobile App Decision](examples/080-mobile-app-decision.json) | `founder "Web app, customers want mobile. 4 engineers. Native iOS + Android feels consuming."` |
| 81 | [Analytics Setup from Zero](examples/081-analytics-zero.json) | `founder "Zero analytics. Don't know which features people use. Where do I start?"` |
| 82 | [A/B Testing with Low Traffic](examples/082-ab-testing-low-traffic.json) | `founder "5K visitors/month. Want to A/B test pricing page. Is it even possible?"` |
| 83 | [Product to Platform](examples/083-product-to-platform.json) | `founder "Customers want API and integrations. Three building on top of us. Should we become a platform?"` |
| 84 | [User Research on Zero Budget](examples/084-user-research-zero-budget.json) | `founder "Solo founder, no budget for user research. What can I realistically do?"` |

## Operations & Scale

| # | Example | Prompt |
|:-:|:--------|:-------|
| 85 | [SOC2 Compliance Decision](examples/085-soc2-compliance.json) | `founder "Three enterprise prospects require SOC2. 8 people. Costs $50-100K. Worth it?"` |
| 86 | [Infrastructure Scaling](examples/086-infrastructure-scaling.json) | `founder "App takes 8 seconds during peak. Single server. Optimize, serverless, or more servers?"` |
| 87 | [Payment Processor Selection](examples/087-payment-processor-selection.json) | `founder "Need a payment processor. Stripe, Adyen, Braintree, Square, Paddle. How do I choose?"` |
| 88 | [Hiring Internationally with EOR](examples/088-hiring-internationally-eor.json) | `founder "Want to hire 5 engineers in Portugal. Entity, EOR, or contractors?"` |
| 89 | [Scaling Customer Support](examples/089-scaling-support.json) | `founder "Personally answering 50 tickets/day. Afraid to hand off. How do I scale support?"` |
| 90 | [LLC vs C-Corp Decision](examples/090-llc-vs-ccorp.json) | `founder "Starting SaaS. Lawyer says C-Corp, accountant says LLC. Plan to raise eventually."` |
| 91 | [Security Incident Response Plan](examples/091-security-incident-response.json) | `founder "First enterprise customer wants our security incident response plan. We don't have one."` |
| 92 | [Burn Rate Optimization](examples/092-burn-rate-optimization.json) | `founder "$1.5M in bank, $100K/mo burn, $25K/mo revenue growing 10%. How to extend runway?"` |

## AI-Specific Scenarios

| # | Example | Prompt |
|:-:|:--------|:-------|
| 93 | [AI Agent Marketplace GTM](examples/093-ai-agent-marketplace-gtm.json) | `founder "App Store for AI agents. How do we go to market when the category barely exists?"` |
| 94 | [LLM Wrapper Moat](examples/094-llm-wrapper-moat.json) | `founder "Sales email generator on GPT-4. Terrified OpenAI will clone us. What's our moat?"` |
| 95 | [AI Unit Economics](examples/095-ai-unit-economics.json) | `founder "$0.12 per query in API calls. Users make 50-200 queries/month. How do I price this?"` |
| 96 | [Fine-Tuning vs RAG](examples/096-fine-tuning-vs-rag.json) | `founder "AI assistant for lawyers. Fine-tune or RAG? 500K documents."` |
| 97 | [AI Hallucination Trust Problem](examples/097-ai-trust-hallucination.json) | `founder "AI generates financial reports. Customers find errors. How do we solve the trust problem?"` |
| 98 | [AI Product Roadmap](examples/098-ai-product-roadmap.json) | `founder "AI writing tool. Users want better outputs, templates, team features, API. What next?"` |
| 99 | [Adding AI to Existing SaaS](examples/099-adding-ai-to-saas.json) | `founder "PM tool with 5K customers. Everyone wants AI features. What actually matters vs hype?"` |
| 100 | [AI Startup Team Composition](examples/100-ai-startup-team.json) | `founder "ML engineer starting AI company. What should my founding team look like?"` |
| 101 | [Navigating AI Regulation](examples/101-navigating-ai-regulation.json) | `founder "AI company processing personal data. EU AI Act coming. How do we stay compliant?"` |
| 102 | [AI Data Flywheel](examples/102-ai-data-flywheel.json) | `founder "10K users generating data daily. How do we turn this into competitive advantage?"` |
| 103 | [AI Partnership Strategy](examples/103-ai-partnership-strategy.json) | `founder "AI doc processing engine. Adobe, DocuSign, Notion could be partners. How do we approach them?"` |
| 104 | [AI Consulting to Product](examples/104-ai-consulting-to-product.json) | `founder "AI consulting firm doing $2M/yr. Same doc extraction problem. How to productize?"` |

## Decision Points

| # | Example | Prompt |
|:-:|:--------|:-------|
| 105 | [Pivot or Persevere](examples/105-pivot-or-persevere.json) | `founder "18 months in. $15K MRR flat for 4 months. Team demoralized. Pivot idea is exciting. What do we do?"` |
| 106 | [Raise vs Bootstrap](examples/106-raise-vs-bootstrap.json) | `founder "Profitable at $80K MRR, growing 8% MoM. VC wants to invest $5M. Should we take it?"` |
| 107 | [Acqui-Hire Offer](examples/107-acquihire-evaluation.json) | `founder "Google offered acqui-hire. $2M for company. We have $50K MRR. Good deal?"` |
| 108 | [Graceful Shutdown](examples/108-graceful-shutdown.json) | `founder "Decided to shut down. $200K in bank, 3 employees, 150 customers. How to do this right?"` |
| 109 | [Sell or Keep Building](examples/109-sell-or-keep-building.json) | `founder "$2M ARR growing 2x. $15M acquisition offer. 3 years in and tired. Do I sell?"` |
| 110 | [Market Downturn Response](examples/110-market-downturn-response.json) | `founder "Market turned. Series B investors want 3x growth but pipeline dried up. Cut or invest?"` |
| 111 | [New Product vs Going Deeper](examples/111-new-product-vs-deeper.json) | `founder "CRM for dentists, $1M ARR. Build billing module or add 20 requested features?"` |
| 112 | [No-Code to Code Migration](examples/112-nocode-to-code-migration.json) | `founder "Built MVP on Bubble/Zapier. $20K MRR. Stack breaking. Rewrite, co-founder, or agency?"` |

---

## Regenerating Examples

To regenerate the JSON files with real Founder CLI output:

```bash
tsx scripts/generate-examples.ts           # Run all (skips existing)
tsx scripts/generate-examples.ts --start 50 # Start at #50
tsx scripts/generate-examples.ts --only 1,5,9  # Specific IDs
```

---

<p align="center">
  <code>npm i -g @taste.dev/founder</code> &middot;
  <a href="https://github.com/TasteDotDev/founder-cli">GitHub</a> &middot;
  <a href="https://www.npmjs.com/package/@taste.dev/founder">npm</a>
</p>
