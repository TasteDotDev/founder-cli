#!/usr/bin/env tsx
/**
 * Generate example JSON files by running each prompt through `founder`.
 * Resumable — skips prompts whose JSON already exists.
 *
 * Usage:  tsx scripts/generate-examples.ts
 *         tsx scripts/generate-examples.ts --start 50   # start at #50
 *         tsx scripts/generate-examples.ts --only 1,5,9  # specific IDs
 */
import { execSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const OUT_DIR = resolve(import.meta.dirname!, "../docs/examples");
mkdirSync(OUT_DIR, { recursive: true });

// ── Prompt definitions ─────────────────────────────────────────
interface Example {
  id: number;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  context: string;
  prompt: string;
}

const examples: Example[] = [
  // ── Early Stage / Idea Validation (1-15) ─────────────────────
  {
    id: 1,
    title: "AI Tutoring App — Finding PMF",
    slug: "ai-tutoring-pmf",
    category: "early-stage",
    tags: ["pmf", "ai", "edtech", "beta-users"],
    context:
      "Solo founder building an AI tutor for high school math, 200 beta users, 30% weekly retention",
    prompt:
      "I have 200 beta users for my AI math tutoring app. 30% come back weekly but nobody's paying yet. How do I know if I have PMF?",
  },
  {
    id: 2,
    title: "Solo Founder SaaS Pricing",
    slug: "solo-saas-pricing",
    category: "early-stage",
    tags: ["pricing", "saas", "solo-founder", "api"],
    context:
      "Developer who built an API monitoring tool, 50 free users, ready to charge",
    prompt:
      "I built an API monitoring tool. 50 companies using it free. I need to start charging but I'm a solo dev and don't know how to price it.",
  },
  {
    id: 3,
    title: "Marketplace Chicken-and-Egg",
    slug: "marketplace-chicken-egg",
    category: "early-stage",
    tags: ["marketplace", "cold-start", "two-sided", "ai"],
    context: "Building a freelance platform for AI prompt engineers",
    prompt:
      "I'm building a marketplace connecting companies with AI prompt engineers. Classic chicken-and-egg — no supply without demand, no demand without supply. How do I solve this?",
  },
  {
    id: 4,
    title: "Climate Tech Hardware GTM",
    slug: "climate-hardware-gtm",
    category: "early-stage",
    tags: ["climate-tech", "hardware", "enterprise", "sales-cycle"],
    context:
      "Carbon capture device for commercial buildings, $50K price point",
    prompt:
      "We have a carbon capture device for commercial buildings. $50K per unit. Works great in pilots. How do we go to market when the sales cycle is 6+ months?",
  },
  {
    id: 5,
    title: "Validate B2B Without Building",
    slug: "validate-without-building",
    category: "early-stage",
    tags: ["validation", "lean", "fintech", "compliance"],
    context: "Wants to build an AI compliance tool for fintech companies",
    prompt:
      "I think fintech companies need an AI tool to automate SOX compliance. I haven't built anything yet. How do I validate this without spending 6 months coding?",
  },
  {
    id: 6,
    title: "Consumer App vs B2B Pivot",
    slug: "consumer-vs-b2b",
    category: "early-stage",
    tags: ["pivot", "b2b", "b2c", "fintech"],
    context:
      "Built a personal finance app, users love it but won't pay, banks keep reaching out",
    prompt:
      "Built a personal finance app. 10K users love it, NPS is 72, but conversion to paid is 0.3%. Meanwhile three banks have asked about licensing our tech. What do I do?",
  },
  {
    id: 7,
    title: "Immigrant Founder Visa Strategy",
    slug: "immigrant-founder-visa",
    category: "early-stage",
    tags: ["immigration", "legal", "visa", "co-founder"],
    context: "H1B holder wanting to start a company in the US",
    prompt:
      "I'm on an H1B visa and want to start a company. I have $30K saved and a co-founder who's a citizen. What's my best path to not get deported while building this?",
  },
  {
    id: 8,
    title: "Regulated Industry Launch",
    slug: "regulated-industry-launch",
    category: "early-stage",
    tags: ["health-tech", "regulation", "fda", "compliance"],
    context: "Health tech startup for remote patient monitoring",
    prompt:
      "We're building a remote patient monitoring platform. Need FDA clearance. How do we move fast in a regulated industry without getting shut down?",
  },
  {
    id: 9,
    title: "Finding a Technical Co-Founder",
    slug: "finding-technical-cofounder",
    category: "early-stage",
    tags: ["co-founder", "non-technical", "equity", "logistics"],
    context:
      "Non-technical founder with domain expertise in logistics",
    prompt:
      "I spent 15 years in logistics. I know exactly what software this industry needs. But I can't code. How do I find a technical co-founder without getting scammed or giving away too much equity?",
  },
  {
    id: 10,
    title: "Physical Product Validation",
    slug: "physical-product-validation",
    category: "early-stage",
    tags: ["hardware", "validation", "crowdfunding", "consumer"],
    context: "Smart water bottle with hydration tracking",
    prompt:
      "I want to build a smart water bottle that tracks hydration and syncs with health apps. The hardware prototype costs $15K. How do I validate demand before spending that?",
  },
  {
    id: 11,
    title: "Pet Services Marketplace",
    slug: "pet-services-marketplace",
    category: "early-stage",
    tags: ["marketplace", "competition", "pets", "trust"],
    context: "Connecting pet owners with vetted pet sitters",
    prompt:
      "Building an Uber for pet sitting. Rover exists but their vetting is terrible and they take 20%. Can I compete?",
  },
  {
    id: 12,
    title: "Agency to Product Transition",
    slug: "agency-to-product",
    category: "early-stage",
    tags: ["productize", "agency", "saas", "design"],
    context:
      "Design agency wanting to productize their most common deliverable",
    prompt:
      "We run a design agency doing $800K/yr. We keep building the same design system setup for every client. Should we productize it?",
  },
  {
    id: 13,
    title: "Boring B2B Vertical SaaS",
    slug: "boring-vertical-saas",
    category: "early-stage",
    tags: ["vertical-saas", "trades", "plumbing", "market-analysis"],
    context: "Software for plumbing companies",
    prompt:
      "Everyone's building AI agents. I want to build scheduling software for plumbing companies. Is boring B2B still a good bet?",
  },
  {
    id: 14,
    title: "Open Source to Commercial",
    slug: "open-source-commercial",
    category: "early-stage",
    tags: ["open-source", "monetization", "developer-tool", "community"],
    context: "Built an open source database tool with 5K GitHub stars",
    prompt:
      "My open source database migration tool has 5K GitHub stars and 200 daily active users. How do I turn this into a business without alienating the community?",
  },
  {
    id: 15,
    title: "Too Many Startup Ideas",
    slug: "too-many-ideas",
    category: "early-stage",
    tags: ["idea-selection", "prioritization", "founder-market-fit"],
    context: "Serial ideator who can't commit to one thing",
    prompt:
      "I have 5 startup ideas and can't pick one. AI recruiting tool, restaurant inventory app, crypto portfolio tracker, developer analytics, and a pet health app. How do I decide?",
  },

  // ── Fundraising & Pitch (16-27) ──────────────────────────────
  {
    id: 16,
    title: "Pre-Seed Deck for AI Dev Tool",
    slug: "pre-seed-ai-dev-tool",
    category: "fundraising",
    tags: ["pre-seed", "pitch-deck", "ai", "developer-tool"],
    context: "Building an AI code review tool, $10K MRR, 2 founders",
    prompt:
      "We're raising pre-seed for our AI code review tool. $10K MRR, growing 25% month-over-month. Need help with our pitch deck.",
  },
  {
    id: 17,
    title: "Series A Narrative for Fintech",
    slug: "series-a-narrative-fintech",
    category: "fundraising",
    tags: ["series-a", "fintech", "narrative", "tam"],
    context:
      "Fintech for gig workers, $1.2M ARR, need to tell a bigger story",
    prompt:
      "We're a fintech helping gig workers manage irregular income. $1.2M ARR, 15K users. Series A investors keep saying 'interesting but small market.' How do I fix the narrative?",
  },
  {
    id: 18,
    title: "SAFE Note Terms",
    slug: "safe-note-terms",
    category: "fundraising",
    tags: ["safe", "angel", "terms", "negotiation"],
    context: "First-time founder with a term sheet from an angel",
    prompt:
      "An angel offered $250K on a $4M post-money SAFE with pro rata rights and a side letter for board observer seat. Is this fair? What should I push back on?",
  },
  {
    id: 19,
    title: "Angel Round Strategy",
    slug: "angel-round-strategy",
    category: "fundraising",
    tags: ["angel", "fundraising-process", "speed", "closing"],
    context: "Need $500K, have warm intros to 8 angels",
    prompt:
      "I need to raise $500K from angels. I have warm intros to 8 potential investors. How do I run this process efficiently without it dragging on for 6 months?",
  },
  {
    id: 20,
    title: "Bootstrap to VC Decision",
    slug: "bootstrap-to-vc",
    category: "fundraising",
    tags: ["bootstrap", "vc", "trade-offs", "profitability"],
    context:
      "Profitable SaaS at $500K ARR considering taking VC money",
    prompt:
      "We're profitable at $500K ARR, growing 80% YoY. A VC offered a $3M Series A. We don't need the money but wonder if we should take it to grow faster. What are the real trade-offs?",
  },
  {
    id: 21,
    title: "Pitch Deck Not Getting Meetings",
    slug: "pitch-deck-no-meetings",
    category: "fundraising",
    tags: ["pitch-deck", "outreach", "optimization", "investors"],
    context: "Existing deck getting no responses from investors",
    prompt:
      "I've sent my deck to 30 investors and got 2 meetings, both passed. Something's wrong with my pitch. Here's my approach: problem, solution, market, team, ask. What am I doing wrong?",
  },
  {
    id: 22,
    title: "Revenue-Based Financing vs Equity",
    slug: "rbf-vs-equity",
    category: "fundraising",
    tags: ["rbf", "financing", "ecommerce", "working-capital"],
    context:
      "E-commerce brand doing $2M ARR, need working capital",
    prompt:
      "We're an e-commerce brand doing $2M ARR. Need $300K for inventory. Should I do revenue-based financing, a line of credit, or give up equity?",
  },
  {
    id: 23,
    title: "VC Meeting Preparation",
    slug: "vc-meeting-prep",
    category: "fundraising",
    tags: ["vc-meeting", "preparation", "tier-1", "strategy"],
    context: "First meeting with a tier-1 VC partner tomorrow",
    prompt:
      "I have a meeting with a partner at Andreessen tomorrow. First time pitching a top-tier firm. What should I prepare for that I'm probably not thinking about?",
  },
  {
    id: 24,
    title: "Bridge Round After Missing Targets",
    slug: "bridge-round-missed-targets",
    category: "fundraising",
    tags: ["bridge", "down-round", "runway", "investor-relations"],
    context:
      "Raised Series A 18 months ago, burning cash, need bridge",
    prompt:
      "We raised a $5M Series A 18 months ago. Projected $3M ARR by now but we're at $1.2M. 10 months of runway. Need a bridge round. How do I approach existing investors?",
  },
  {
    id: 25,
    title: "Crowdfunding for Hardware",
    slug: "crowdfunding-hardware",
    category: "fundraising",
    tags: ["crowdfunding", "kickstarter", "hardware", "consumer"],
    context: "Consumer electronics product ready for manufacturing",
    prompt:
      "We have a working prototype of a portable air quality monitor. Manufacturing is ready at $45/unit, we'd sell at $129. Should we do Kickstarter or go direct?",
  },
  {
    id: 26,
    title: "EU Investor Outreach",
    slug: "eu-investor-outreach",
    category: "fundraising",
    tags: ["international", "eu", "climate-tech", "cross-border"],
    context:
      "US-based startup wanting to raise from EU investors",
    prompt:
      "We're a US climate tech startup. American VCs say we're too early but we've heard EU investors are more climate-friendly. How do we approach EU fundraising from the US?",
  },
  {
    id: 27,
    title: "Strategic vs Financial Investor",
    slug: "strategic-vs-financial-investor",
    category: "fundraising",
    tags: ["term-sheet", "strategic", "google-ventures", "negotiation"],
    context:
      "Two term sheets on the table, one from a strategic corporate VC",
    prompt:
      "We have two term sheets: $4M from a traditional VC at $20M pre, and $3M from Google Ventures at $18M pre with a partnership agreement. Which do I take?",
  },

  // ── Growth & Acquisition (28-42) ─────────────────────────────
  {
    id: 28,
    title: "PLG for Developer Tool",
    slug: "plg-developer-tool",
    category: "growth",
    tags: ["plg", "developer-tool", "conversion", "freemium"],
    context:
      "Developer observability tool with 2K free users, 40 paying",
    prompt:
      "We have a developer observability tool. 2K free users, 40 paying ($99/mo). Free-to-paid conversion is 2%. How do I build a real PLG motion?",
  },
  {
    id: 29,
    title: "Cold Email for Construction SaaS",
    slug: "cold-email-construction",
    category: "growth",
    tags: ["cold-email", "outbound", "construction", "b2b"],
    context:
      "Selling project management software to construction companies",
    prompt:
      "I'm selling PM software to construction companies. They don't respond to cold emails. I've sent 500 emails with a 1% reply rate. What am I doing wrong?",
  },
  {
    id: 30,
    title: "TikTok Growth for D2C",
    slug: "tiktok-growth-d2c",
    category: "growth",
    tags: ["tiktok", "d2c", "skincare", "content"],
    context:
      "Skincare brand for men, $50K/mo revenue, all from Meta ads",
    prompt:
      "We're a men's skincare brand doing $50K/mo entirely from Meta ads. CAC is $35 and rising. Everyone says TikTok but I don't know how to create content. Where do I start?",
  },
  {
    id: 31,
    title: "Community-Led Growth",
    slug: "community-led-growth",
    category: "growth",
    tags: ["community", "discord", "developer", "engagement"],
    context:
      "Developer education platform with a Discord of 3K members",
    prompt:
      "We have a Discord with 3K developers learning our platform. It's active but isn't driving revenue. How do I turn community into a growth engine?",
  },
  {
    id: 32,
    title: "Viral Loop Design",
    slug: "viral-loop-design",
    category: "growth",
    tags: ["virality", "collaboration", "network-effects", "remote"],
    context:
      "Collaboration tool for remote teams, low organic growth",
    prompt:
      "We built a real-time collaboration tool for remote teams. Users love it but growth is flat. How do I build virality into the product?",
  },
  {
    id: 33,
    title: "SEO on a Budget",
    slug: "seo-budget",
    category: "growth",
    tags: ["seo", "content", "b2b-saas", "resource-constrained"],
    context: "B2B SaaS with zero organic traffic",
    prompt:
      "We have zero organic traffic. Our competitors rank for everything. We're a small team and can't produce 50 articles a month. What's a realistic SEO strategy?",
  },
  {
    id: 34,
    title: "Partnership for Distribution",
    slug: "partnership-distribution",
    category: "growth",
    tags: ["partnerships", "channel", "hr-tech", "smb"],
    context:
      "HR tech startup wanting to reach SMBs through payroll providers",
    prompt:
      "We're an HR compliance tool for SMBs. Selling direct is expensive. How do we partner with payroll companies like Gusto or Rippling to reach their customers?",
  },
  {
    id: 35,
    title: "Failed Referral Program",
    slug: "failed-referral-program",
    category: "growth",
    tags: ["referral", "subscription", "ecommerce", "incentives"],
    context:
      "E-commerce subscription box, $40/mo, 5K subscribers",
    prompt:
      "We run a $40/mo subscription box. 5K subscribers. We tried a referral program (give $10, get $10) and only 12 people used it. What went wrong?",
  },
  {
    id: 36,
    title: "Niche to Mainstream Expansion",
    slug: "niche-to-mainstream",
    category: "growth",
    tags: ["expansion", "vertical-saas", "fitness", "competition"],
    context:
      "Vertical SaaS for yoga studios growing beyond initial niche",
    prompt:
      "We're the #1 software for yoga studios (800 customers). We want to expand to all fitness studios but Mindbody owns that market. How do we expand without losing our niche?",
  },
  {
    id: 37,
    title: "Event-Led Growth ROI",
    slug: "event-led-growth",
    category: "growth",
    tags: ["events", "conferences", "developer-relations", "roi"],
    context:
      "Developer tool wanting to use conferences for acquisition",
    prompt:
      "We're a small dev tool company. Should we sponsor developer conferences? They cost $10-50K per event and I'm not sure of the ROI.",
  },
  {
    id: 38,
    title: "Reactivating Churned Users",
    slug: "reactivating-churned-users",
    category: "growth",
    tags: ["churn", "win-back", "reactivation", "saas"],
    context:
      "SaaS tool with 2K churned accounts from the last year",
    prompt:
      "We have 2,000 churned accounts from the past year. Our product has improved a lot since they left. How do I win them back?",
  },
  {
    id: 39,
    title: "LinkedIn for B2B Buyers",
    slug: "linkedin-b2b-buyers",
    category: "growth",
    tags: ["linkedin", "b2b", "cfo", "content-marketing"],
    context:
      "Selling compliance software to CFOs, need to reach decision-makers",
    prompt:
      "Our buyers are CFOs at mid-market companies. They're not on Twitter or TikTok. How do I reach them with content?",
  },
  {
    id: 40,
    title: "Outbound Sales from Zero",
    slug: "outbound-sales-zero",
    category: "growth",
    tags: ["outbound", "sales-playbook", "sdr", "first-hire"],
    context:
      "First sales hire at a technical founder's company",
    prompt:
      "I'm a technical founder who just hired our first SDR. I have no sales playbook, no sequences, no nothing. Help me build the outbound engine from zero.",
  },
  {
    id: 41,
    title: "US to EU Expansion",
    slug: "us-to-eu-expansion",
    category: "growth",
    tags: ["international", "eu", "expansion", "gdpr"],
    context: "SaaS tool expanding from US to European market",
    prompt:
      "We're a US SaaS doing $3M ARR. We're getting inbound from European companies. Should we formally expand to EU? What does that actually involve?",
  },
  {
    id: 42,
    title: "Product Hunt Launch",
    slug: "product-hunt-launch",
    category: "growth",
    tags: ["product-hunt", "launch", "strategy", "community"],
    context: "Planning a Product Hunt launch for maximum impact",
    prompt:
      "We're launching on Product Hunt next month. Last time we tried, we got 50 upvotes and nothing happened. How do we actually get Product of the Day?",
  },

  // ── Pricing & Monetization (43-52) ───────────────────────────
  {
    id: 43,
    title: "Usage-Based API Pricing",
    slug: "usage-based-api-pricing",
    category: "pricing",
    tags: ["usage-based", "api", "pricing-model", "migration"],
    context:
      "API for document processing, currently charging flat monthly fee",
    prompt:
      "We have a document processing API. Charging $99/mo flat fee but usage varies wildly — some customers process 100 docs, others process 50K. How do we switch to usage-based?",
  },
  {
    id: 44,
    title: "Freemium Conversion Optimization",
    slug: "freemium-conversion",
    category: "pricing",
    tags: ["freemium", "conversion", "pricing-psychology", "saas"],
    context:
      "Productivity app with 50K free users, 1.2% conversion to paid",
    prompt:
      "50K free users, 1.2% paid conversion, $12/mo price point. Industry benchmark is 3-5%. How do I double my conversion without crippling the free tier?",
  },
  {
    id: 45,
    title: "Enterprise Tier Pricing",
    slug: "enterprise-tier-pricing",
    category: "pricing",
    tags: ["enterprise", "sso", "upsell", "feature-gating"],
    context: "Mid-market SaaS adding enterprise features",
    prompt:
      "We sell to SMBs at $49/seat/mo. Enterprise companies keep asking for SSO, audit logs, and custom roles. How do I price an enterprise tier without building a whole new product?",
  },
  {
    id: 46,
    title: "AI Product Pricing Model",
    slug: "ai-product-pricing",
    category: "pricing",
    tags: ["ai", "pricing", "tokens", "writing-tool"],
    context:
      "AI writing assistant trying to figure out pricing units",
    prompt:
      "We built an AI writing assistant. Should we charge per word generated, per document, per seat, or per month? Every AI company seems to do it differently.",
  },
  {
    id: 47,
    title: "40% Price Increase Strategy",
    slug: "price-increase-strategy",
    category: "pricing",
    tags: ["price-increase", "retention", "communication", "migration"],
    context: "Need to raise prices 40% without losing customers",
    prompt:
      "Our costs went up and we need to raise prices 40%. We have 800 customers on monthly plans. How do we do this without a revolt?",
  },
  {
    id: 48,
    title: "Marketplace Take Rate",
    slug: "marketplace-take-rate",
    category: "pricing",
    tags: ["marketplace", "take-rate", "two-sided", "supply"],
    context: "Service marketplace currently taking 15%",
    prompt:
      "We're a freelance marketplace taking 15%. Providers complain it's too high. Clients don't care. How do we optimize our take rate without killing supply?",
  },
  {
    id: 49,
    title: "Monetizing a Free Chrome Extension",
    slug: "monetize-chrome-extension",
    category: "pricing",
    tags: ["chrome-extension", "monetization", "free-to-paid", "productivity"],
    context: "Chrome extension with 100K users, no revenue",
    prompt:
      "I built a Chrome extension for tab management. 100K weekly active users, all free. How do I monetize without killing growth?",
  },
  {
    id: 50,
    title: "Two-Sided Platform Pricing",
    slug: "two-sided-platform-pricing",
    category: "pricing",
    tags: ["platform", "two-sided", "job-board", "climate-tech"],
    context:
      "Job board for climate tech, charging employers only",
    prompt:
      "We run a climate tech job board. Employers pay $299/post. We get 500 posts/month but candidates want premium features too. Should we charge both sides?",
  },
  {
    id: 51,
    title: "Annual Plan Conversion",
    slug: "annual-plan-conversion",
    category: "pricing",
    tags: ["annual", "monthly", "pricing-psychology", "retention"],
    context:
      "SaaS struggling to get customers to commit annually",
    prompt:
      "Only 15% of our customers choose annual plans. We offer 20% off for annual but nobody takes it. How do I shift the ratio?",
  },
  {
    id: 52,
    title: "Credit-Based API Pricing",
    slug: "credit-based-api-pricing",
    category: "pricing",
    tags: ["credits", "api", "data-enrichment", "variable-usage"],
    context: "Data enrichment API deciding on billing model",
    prompt:
      "We have a data enrichment API. Some customers need 100 lookups/month, others need 50K. Subscription tiers feel wrong because usage is so variable. What model works?",
  },

  // ── Competition & Positioning (53-62) ─────────────────────────
  {
    id: 53,
    title: "Competing Against Salesforce",
    slug: "competing-against-salesforce",
    category: "competition",
    tags: ["competition", "crm", "vertical-saas", "real-estate"],
    context:
      "Small CRM startup competing against Salesforce in a vertical",
    prompt:
      "We built a CRM specifically for real estate agents. Salesforce just launched a real estate vertical. We have 500 customers to their infinity. How do we survive?",
  },
  {
    id: 54,
    title: "Differentiating AI Wrapper",
    slug: "differentiating-ai-wrapper",
    category: "competition",
    tags: ["ai", "wrapper", "moat", "differentiation"],
    context: "Built a GPT wrapper and now everyone has one",
    prompt:
      "We launched an AI customer support chatbot 6 months ago. Now there are 200 competitors doing the same thing with the same models. How do we differentiate?",
  },
  {
    id: 55,
    title: "Blue Ocean in Email Marketing",
    slug: "blue-ocean-email-marketing",
    category: "competition",
    tags: ["blue-ocean", "email-marketing", "saturated", "positioning"],
    context: "Entering the email marketing space",
    prompt:
      "I want to build an email marketing tool. Mailchimp, ConvertKit, Beehiiv — the market seems saturated. Is there a blue ocean opportunity I'm missing?",
  },
  {
    id: 56,
    title: "Responding to Price War",
    slug: "responding-to-price-war",
    category: "competition",
    tags: ["price-war", "competitive-response", "value", "positioning"],
    context: "Competitor just dropped their price 50%",
    prompt:
      "Our main competitor just cut their prices by 50%. Our customers are asking why we're twice the price now. Do we match or hold?",
  },
  {
    id: 57,
    title: "Competing with Open Source",
    slug: "competing-with-oss",
    category: "competition",
    tags: ["open-source", "commercial", "positioning", "enterprise"],
    context:
      "Commercial product competing with a popular OSS tool",
    prompt:
      "An open source version of what we sell just hit 10K GitHub stars. We charge $299/mo. How do we justify paid when free exists?",
  },
  {
    id: 58,
    title: "Network Effects Market Entry",
    slug: "network-effects-entry",
    category: "competition",
    tags: ["network-effects", "linkedin", "professional-network", "niche"],
    context:
      "Building a new professional network competing with LinkedIn",
    prompt:
      "We're building a professional network for climate tech professionals. LinkedIn is the 800-pound gorilla. How do we even get started?",
  },
  {
    id: 59,
    title: "Competitive Intelligence System",
    slug: "competitive-intelligence",
    category: "competition",
    tags: ["competitive-intel", "monitoring", "small-team", "strategy"],
    context:
      "Need to systematically track what competitors are doing",
    prompt:
      "We have 6 direct competitors and I keep getting blindsided by their launches. How do I set up a competitive intelligence system as a small team?",
  },
  {
    id: 60,
    title: "Creating a New Category",
    slug: "creating-new-category",
    category: "competition",
    tags: ["category-creation", "positioning", "narrative", "investors"],
    context: "Product that doesn't fit existing categories",
    prompt:
      "We built a tool that combines project management, CRM, and document collaboration. Investors keep asking 'what category is this?' and I don't have a good answer.",
  },
  {
    id: 61,
    title: "Patent Strategy for AI Startup",
    slug: "patent-strategy-ai",
    category: "competition",
    tags: ["patents", "ip", "ai", "defensive"],
    context:
      "AI startup wondering about protecting their approach",
    prompt:
      "We developed a novel way to fine-tune LLMs for specific industries. Should we patent it? We're a 4-person team and patents seem expensive and slow.",
  },
  {
    id: 62,
    title: "Bootstrapped vs VC-Funded Competitor",
    slug: "bootstrapped-vs-funded",
    category: "competition",
    tags: ["bootstrap", "competition", "asymmetric", "resources"],
    context:
      "Bootstrapped vs. VC-backed competitor with 10x your budget",
    prompt:
      "Our competitor just raised $50M. We're bootstrapped at $400K ARR. They're going to outspend us on everything. What's my playbook?",
  },

  // ── Team & Hiring (63-72) ────────────────────────────────────
  {
    id: 63,
    title: "First 10 Hires",
    slug: "first-10-hires",
    category: "team",
    tags: ["hiring", "first-hires", "solo-founder", "prioritization"],
    context: "Solo founder at $200K ARR ready to hire",
    prompt:
      "I'm a solo founder at $200K ARR. It's just me. I need to start hiring but don't know who to hire first — engineer, marketer, salesperson, or ops person?",
  },
  {
    id: 64,
    title: "Co-Founder Equity Split",
    slug: "cofounder-equity-split",
    category: "team",
    tags: ["equity", "co-founder", "vesting", "negotiation"],
    context: "Two co-founders trying to divide equity fairly",
    prompt:
      "My co-founder and I are splitting equity. I had the idea and have been working on it for 6 months. She's joining now and will handle all engineering. 50/50 doesn't feel right but I don't want to offend her.",
  },
  {
    id: 65,
    title: "Remote Culture at Scale",
    slug: "remote-culture-scale",
    category: "team",
    tags: ["remote", "culture", "scaling", "communication"],
    context:
      "Remote-first company growing from 15 to 50 people",
    prompt:
      "We're remote-first, growing from 15 to 50 people this year. The culture that worked at 15 is breaking. Communication is fragmented, new hires feel lost, and decisions take forever.",
  },
  {
    id: 66,
    title: "Engineer vs Sales Hire Priority",
    slug: "engineer-vs-sales-hire",
    category: "team",
    tags: ["hiring", "prioritization", "engineering", "sales"],
    context: "Need both but can only afford one",
    prompt:
      "We have more sales opportunities than we can handle, but our product also has critical bugs. Do I hire an engineer or a salesperson first?",
  },
  {
    id: 67,
    title: "Firing a Co-Founder",
    slug: "firing-cofounder",
    category: "team",
    tags: ["co-founder", "separation", "equity", "difficult-conversations"],
    context:
      "Co-founder isn't contributing, awkward conversation ahead",
    prompt:
      "My co-founder has basically checked out. Hasn't shipped anything in 3 months, misses meetings, and I think he's working on something else. He owns 40% of the company. What do I do?",
  },
  {
    id: 68,
    title: "Building an Advisory Board",
    slug: "building-advisory-board",
    category: "team",
    tags: ["advisors", "equity", "board", "mentorship"],
    context:
      "Need advisors but don't know how to structure it",
    prompt:
      "I keep hearing I need advisors. How do I find them, what do I offer, and how do I make sure they actually help instead of just taking equity?",
  },
  {
    id: 69,
    title: "Startup Compensation Strategy",
    slug: "startup-compensation",
    category: "team",
    tags: ["compensation", "equity", "competing-with-bigtech", "hiring"],
    context:
      "How to pay when you can't compete with big tech salaries",
    prompt:
      "I need to hire a senior engineer. Big tech pays $350K+. I can afford $150K + equity. How do I make this compelling?",
  },
  {
    id: 70,
    title: "Founder Burnout Recovery",
    slug: "founder-burnout",
    category: "team",
    tags: ["burnout", "delegation", "wellbeing", "single-point-of-failure"],
    context: "Working 80-hour weeks for 18 months straight",
    prompt:
      "I've been working 80-hour weeks for 18 months. Revenue is growing but I'm running on fumes. I can't take a vacation because everything breaks without me. Help.",
  },
  {
    id: 71,
    title: "Engineering Culture Setup",
    slug: "engineering-culture",
    category: "team",
    tags: ["engineering", "culture", "tech-lead", "process"],
    context:
      "First engineering manager hire, team of 8 engineers",
    prompt:
      "We have 8 engineers and no process. I'm the technical co-founder but I'm drowning in code reviews and architecture decisions. Do I hire an engineering manager or a tech lead?",
  },
  {
    id: 72,
    title: "Diversity Hiring at Small Scale",
    slug: "diversity-hiring",
    category: "team",
    tags: ["diversity", "hiring", "inclusion", "pipeline"],
    context:
      "Want to build a diverse team but limited applicant pool",
    prompt:
      "We're 6 people, all white men from similar backgrounds. We genuinely want to diversify but every candidate pipeline looks the same. What are we doing wrong?",
  },

  // ── Product & PMF (73-84) ────────────────────────────────────
  {
    id: 73,
    title: "Superhuman PMF Survey How-To",
    slug: "superhuman-pmf-howto",
    category: "product",
    tags: ["pmf", "survey", "superhuman", "methodology"],
    context:
      "Running the 'very disappointed' test on your product",
    prompt:
      "I've heard about the 'how would you feel if you could no longer use this product' survey. We have 500 active users. Walk me through exactly how to run this and what to do with the results.",
  },
  {
    id: 74,
    title: "Churn Crisis Diagnosis",
    slug: "churn-crisis",
    category: "product",
    tags: ["churn", "retention", "crisis", "diagnosis"],
    context:
      "Monthly churn jumped from 3% to 8% over two months",
    prompt:
      "Our monthly churn jumped from 3% to 8% in the last two months. Revenue is still growing but the trend is terrifying. How do I diagnose and fix this?",
  },
  {
    id: 75,
    title: "Feature Prioritization",
    slug: "feature-prioritization",
    category: "product",
    tags: ["prioritization", "backlog", "rice", "roadmap"],
    context:
      "50 feature requests, 3 engineers, need to pick the right 5",
    prompt:
      "We have 50 feature requests on the backlog. 3 engineers. Customers are asking for everything. How do I ruthlessly prioritize?",
  },
  {
    id: 76,
    title: "Pivot to Analytics",
    slug: "pivot-to-analytics",
    category: "product",
    tags: ["pivot", "analytics", "pmf", "product-strategy"],
    context:
      "Current product isn't working, adjacent opportunity looks better",
    prompt:
      "We've been building a project management tool for 18 months. $30K MRR but flat for 6 months. Our analytics dashboard feature gets the most praise. Should we pivot to just analytics?",
  },
  {
    id: 77,
    title: "Going Upmarket to Enterprise",
    slug: "going-upmarket",
    category: "product",
    tags: ["enterprise", "smb", "upmarket", "segment-strategy"],
    context:
      "Product works for SMBs but enterprise wants different things",
    prompt:
      "We sell to SMBs at $29/mo. Two enterprise companies want to pay $2K/mo but need SSO, SLA, and an admin console. Do we go upmarket?",
  },
  {
    id: 78,
    title: "Onboarding Drop-Off Fix",
    slug: "onboarding-dropoff",
    category: "product",
    tags: ["onboarding", "activation", "ux", "conversion"],
    context: "60% of signups never complete setup",
    prompt:
      "60% of new signups don't complete onboarding. They sign up, see the dashboard, and leave. We've tried tutorials and tooltips. Nothing works.",
  },
  {
    id: 79,
    title: "Rewrite vs Refactor",
    slug: "rewrite-vs-refactor",
    category: "product",
    tags: ["technical-debt", "rewrite", "refactor", "engineering"],
    context:
      "V1 has technical debt but customers are happy",
    prompt:
      "Our V1 was built fast and has massive technical debt. Customers are happy but every new feature takes 3x longer than it should. Do we rewrite?",
  },
  {
    id: 80,
    title: "Mobile App Decision",
    slug: "mobile-app-decision",
    category: "product",
    tags: ["mobile", "pwa", "native", "resource-planning"],
    context: "Web app considering native mobile apps",
    prompt:
      "Our web app works but customers keep asking for a mobile app. We're 4 engineers. Building native iOS and Android feels like it would consume us. What's the move?",
  },
  {
    id: 81,
    title: "Analytics Setup from Zero",
    slug: "analytics-zero",
    category: "product",
    tags: ["analytics", "metrics", "setup", "product-data"],
    context:
      "No analytics setup, flying blind on product usage",
    prompt:
      "We have zero analytics. I don't know which features people use, where they drop off, or what drives retention. Where do I start without boiling the ocean?",
  },
  {
    id: 82,
    title: "A/B Testing with Low Traffic",
    slug: "ab-testing-low-traffic",
    category: "product",
    tags: ["ab-testing", "experimentation", "low-traffic", "pricing"],
    context:
      "Only 5K monthly visitors, want to test pricing page",
    prompt:
      "We get 5K visitors/month. I want to A/B test our pricing page but I've heard you need massive traffic for statistical significance. Is A/B testing even possible for us?",
  },
  {
    id: 83,
    title: "Product to Platform",
    slug: "product-to-platform",
    category: "product",
    tags: ["platform", "api", "ecosystem", "strategy"],
    context:
      "Customers want to build on top of your product",
    prompt:
      "Customers keep asking for an API and integrations. Three have asked about building on top of us. Should we become a platform?",
  },
  {
    id: 84,
    title: "User Research on Zero Budget",
    slug: "user-research-zero-budget",
    category: "product",
    tags: ["user-research", "lean", "solo-founder", "discovery"],
    context:
      "Need customer insights but can't afford a research team",
    prompt:
      "I know I should be doing user research but I'm a solo founder with no budget for it. What can I realistically do?",
  },

  // ── Operations & Scale (85-92) ───────────────────────────────
  {
    id: 85,
    title: "SOC2 Compliance Decision",
    slug: "soc2-compliance",
    category: "operations",
    tags: ["soc2", "compliance", "enterprise", "cost-benefit"],
    context:
      "Enterprise customers requiring SOC2, expensive to get",
    prompt:
      "Three enterprise prospects require SOC2. We're 8 people. SOC2 compliance costs $50-100K and takes 6 months. Is it worth it at our stage?",
  },
  {
    id: 86,
    title: "Infrastructure Scaling",
    slug: "infrastructure-scaling",
    category: "operations",
    tags: ["infrastructure", "scaling", "performance", "database"],
    context:
      "App is slow, need to decide on scaling approach",
    prompt:
      "Our app takes 8 seconds to load during peak hours. We're on a single server. Do I optimize the current setup, go serverless, or add more servers?",
  },
  {
    id: 87,
    title: "Payment Processor Selection",
    slug: "payment-processor-selection",
    category: "operations",
    tags: ["payments", "vendor-selection", "stripe", "fintech"],
    context:
      "Choosing between 5 similar tools for a critical function",
    prompt:
      "I need to pick a payment processor. Stripe, Adyen, Braintree, Square, and Paddle all seem fine. How do I choose without spending a month evaluating?",
  },
  {
    id: 88,
    title: "Hiring Internationally with EOR",
    slug: "hiring-internationally-eor",
    category: "operations",
    tags: ["international", "eor", "portugal", "remote-hiring"],
    context: "Opening first office outside the US",
    prompt:
      "We want to hire 5 engineers in Portugal. Do we open an entity, use an EOR, or hire contractors? What are the real trade-offs?",
  },
  {
    id: 89,
    title: "Scaling Customer Support",
    slug: "scaling-support",
    category: "operations",
    tags: ["support", "scaling", "delegation", "founder"],
    context:
      "Support volume doubling, founder still answering tickets",
    prompt:
      "I'm personally answering 50 support tickets a day. It's eating my entire day but I'm afraid to hand it off because customers love the founder touch. How do I scale support?",
  },
  {
    id: 90,
    title: "LLC vs C-Corp Decision",
    slug: "llc-vs-ccorp",
    category: "operations",
    tags: ["legal", "entity", "c-corp", "llc"],
    context: "Deciding between LLC and C-Corp",
    prompt:
      "Starting a SaaS company. My lawyer says C-Corp, my accountant says LLC. I plan to raise money eventually. What's the right structure?",
  },
  {
    id: 91,
    title: "Security Incident Response Plan",
    slug: "security-incident-response",
    category: "operations",
    tags: ["security", "incident-response", "enterprise", "compliance"],
    context:
      "No security plan and just got your first enterprise customer",
    prompt:
      "We just signed our first enterprise customer and they want our security incident response plan. We don't have one. How do I create a real one quickly?",
  },
  {
    id: 92,
    title: "Burn Rate Optimization",
    slug: "burn-rate-optimization",
    category: "operations",
    tags: ["burn-rate", "runway", "financial-planning", "cost-cutting"],
    context: "18 months of runway, want to extend to 24",
    prompt:
      "We have $1.5M in the bank, burning $100K/month. Revenue is $25K/month growing 10% MoM. How do I extend runway from 20 months to 30 without killing growth?",
  },

  // ── AI-Specific Scenarios (93-104) ───────────────────────────
  {
    id: 93,
    title: "AI Agent Marketplace GTM",
    slug: "ai-agent-marketplace-gtm",
    category: "ai",
    tags: ["ai-agents", "marketplace", "category-creation", "gtm"],
    context:
      "Building a marketplace for AI agents, pre-launch",
    prompt:
      "We're building a marketplace where businesses can discover and deploy AI agents. Think 'App Store for AI agents.' How do we go to market when the category barely exists?",
  },
  {
    id: 94,
    title: "LLM Wrapper Moat",
    slug: "llm-wrapper-moat",
    category: "ai",
    tags: ["llm", "wrapper", "moat", "defensibility"],
    context:
      "AI product built on GPT-4, worried about defensibility",
    prompt:
      "We built a sales email generator on top of GPT-4. Works great but we're terrified OpenAI will launch something similar or a competitor will clone us in a weekend. What's our moat?",
  },
  {
    id: 95,
    title: "AI Unit Economics",
    slug: "ai-unit-economics",
    category: "ai",
    tags: ["ai", "unit-economics", "api-costs", "pricing"],
    context:
      "AI product spending $20K/month on API calls, not sure how to pass costs through",
    prompt:
      "Our AI product costs us $0.12 per user query in API calls. Users make 50-200 queries/month. How do I price this so we're profitable?",
  },
  {
    id: 96,
    title: "Fine-Tuning vs RAG",
    slug: "fine-tuning-vs-rag",
    category: "ai",
    tags: ["fine-tuning", "rag", "architecture", "legal-tech"],
    context:
      "Building an AI product, deciding on technical approach",
    prompt:
      "We're building an AI assistant for lawyers. Should we fine-tune a model on legal data or use RAG? Our legal dataset is 500K documents.",
  },
  {
    id: 97,
    title: "AI Hallucination Trust Problem",
    slug: "ai-trust-hallucination",
    category: "ai",
    tags: ["ai-safety", "trust", "hallucination", "fintech"],
    context:
      "Customers worried about AI hallucinations in your product",
    prompt:
      "Our AI generates financial reports. Customers love the speed but keep finding small errors — wrong numbers, fabricated sources. How do we solve the trust problem?",
  },
  {
    id: 98,
    title: "AI Product Roadmap",
    slug: "ai-product-roadmap",
    category: "ai",
    tags: ["ai", "roadmap", "prioritization", "writing-tool"],
    context: "AI startup figuring out what to build next",
    prompt:
      "We launched our AI writing tool 6 months ago. Users want: better outputs, more templates, team features, API access, and integrations. What do we build next?",
  },
  {
    id: 99,
    title: "Adding AI to Existing SaaS",
    slug: "adding-ai-to-saas",
    category: "ai",
    tags: ["ai-features", "saas", "project-management", "hype"],
    context:
      "Non-AI SaaS company adding AI capabilities",
    prompt:
      "We're a project management tool with 5K customers. Everyone's asking for AI features. What AI capabilities actually matter vs. what's just hype?",
  },
  {
    id: 100,
    title: "AI Startup Team Composition",
    slug: "ai-startup-team",
    category: "ai",
    tags: ["ai", "hiring", "founding-team", "ml-engineer"],
    context:
      "Founding an AI company, deciding on first hires",
    prompt:
      "I'm a machine learning engineer starting an AI company. What should my founding team look like? Do I need another ML person or should I hire differently?",
  },
  {
    id: 101,
    title: "Navigating AI Regulation",
    slug: "navigating-ai-regulation",
    category: "ai",
    tags: ["ai-regulation", "eu-ai-act", "compliance", "legal"],
    context:
      "AI company worried about upcoming regulation in EU and US",
    prompt:
      "We're an AI company processing personal data. EU AI Act is coming, US states are passing their own laws. How do we stay compliant without drowning in legal work?",
  },
  {
    id: 102,
    title: "AI Data Flywheel",
    slug: "ai-data-flywheel",
    category: "ai",
    tags: ["data", "flywheel", "moat", "network-effects"],
    context:
      "Building a data flywheel for your AI product",
    prompt:
      "Everyone says 'data is the moat' for AI companies. We have 10K users generating data daily. How do we actually turn this into a competitive advantage?",
  },
  {
    id: 103,
    title: "AI Partnership Strategy",
    slug: "ai-partnership-strategy",
    category: "ai",
    tags: ["ai", "partnerships", "enterprise", "business-development"],
    context:
      "Small AI startup wanting to partner with larger tech companies",
    prompt:
      "We built an AI document processing engine. Adobe, DocuSign, and Notion could all be great partners. How do we approach companies 1000x our size?",
  },
  {
    id: 104,
    title: "AI Consulting to Product Transition",
    slug: "ai-consulting-to-product",
    category: "ai",
    tags: ["ai", "consulting", "productize", "transition"],
    context:
      "Consulting firm with AI expertise wanting to productize",
    prompt:
      "We're an AI consulting firm doing $2M/year. We keep solving the same document extraction problem for different clients. How do we transition to a product company?",
  },

  // ── Decision Points (105-112) ────────────────────────────────
  {
    id: 105,
    title: "Pivot or Persevere",
    slug: "pivot-or-persevere",
    category: "decisions",
    tags: ["pivot", "persevere", "morale", "metrics"],
    context:
      "18 months in, metrics are mediocre, team is tired",
    prompt:
      "18 months in. $15K MRR, flat for 4 months. Team of 5 is demoralized. We have a pivot idea that's exciting but means starting over. Do we pivot or push through?",
  },
  {
    id: 106,
    title: "Raise vs Bootstrap",
    slug: "raise-vs-bootstrap",
    category: "decisions",
    tags: ["raise", "bootstrap", "competition", "growth"],
    context: "Profitable business at an inflection point",
    prompt:
      "We're profitable at $80K MRR, growing 8% month-over-month. A VC wants to invest $5M. We don't need the money but competitors are raising. Should we take it?",
  },
  {
    id: 107,
    title: "Acqui-Hire Offer Evaluation",
    slug: "acquihire-evaluation",
    category: "decisions",
    tags: ["acqui-hire", "acquisition", "google", "valuation"],
    context:
      "Big tech company wants to buy your startup for the team",
    prompt:
      "Google offered to acqui-hire our team. $2M for the company plus packages for all 4 of us. We have $50K MRR. Is this a good deal or are we selling too cheap?",
  },
  {
    id: 108,
    title: "Graceful Shutdown Playbook",
    slug: "graceful-shutdown",
    category: "decisions",
    tags: ["shutdown", "wind-down", "legal", "communication"],
    context:
      "Startup isn't working, need to wind down responsibly",
    prompt:
      "We've decided to shut down. $200K in the bank, 3 employees, 150 customers, and outstanding contracts. How do I do this without burning bridges or getting sued?",
  },
  {
    id: 109,
    title: "Sell or Keep Building",
    slug: "sell-or-keep-building",
    category: "decisions",
    tags: ["acquisition", "founder-fatigue", "valuation", "exit"],
    context: "Acquisition offer for a growing company",
    prompt:
      "We're doing $2M ARR growing 2x. Got an acquisition offer for $15M. I'm 3 years in and tired but the business is working. Do I sell?",
  },
  {
    id: 110,
    title: "Market Downturn Response",
    slug: "market-downturn-response",
    category: "decisions",
    tags: ["downturn", "cost-cutting", "board", "scenario-planning"],
    context:
      "VC funding dried up, growth targets unrealistic now",
    prompt:
      "The market turned. Our Series B investors want 3x growth but our pipeline dried up overnight. Do we cut costs aggressively or keep investing in growth?",
  },
  {
    id: 111,
    title: "New Product vs Going Deeper",
    slug: "new-product-vs-deeper",
    category: "decisions",
    tags: ["product-line", "expansion", "vertical-saas", "dental"],
    context:
      "One product working, tempted to build a second",
    prompt:
      "Our CRM for dentists is doing great — $1M ARR, 500 customers. We could build a patient billing module (new product) or add 20 features our dentists are asking for. Which path?",
  },
  {
    id: 112,
    title: "No-Code to Code Migration",
    slug: "nocode-to-code-migration",
    category: "decisions",
    tags: ["no-code", "migration", "technical-debt", "hiring"],
    context:
      "Non-technical founder using no-code, approaching limits",
    prompt:
      "I built our MVP on Bubble/Zapier. We have $20K MRR and 200 customers. The no-code stack is breaking and I can't add features fast enough. Do I rewrite in code, find a technical co-founder, or hire an agency?",
  },
];

// ── Helpers ────────────────────────────────────────────────────

function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

interface RunResult {
  response: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  frameworks: number;
  searches: number;
  filesRead: number;
}

async function runFounder(prompt: string): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const proc = spawn("founder", [prompt], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
      cwd: "/tmp", // run from /tmp so it doesn't read project files
    });

    proc.stdout.on("data", (d: Buffer) => chunks.push(d));
    proc.stderr.on("data", (d: Buffer) => chunks.push(d));

    const timeout = setTimeout(() => {
      proc.kill("SIGTERM");
      reject(new Error("Timeout after 300s"));
    }, 300_000);

    proc.on("close", (code) => {
      clearTimeout(timeout);
      const raw = Buffer.concat(chunks).toString("utf8");
      const clean = stripAnsi(raw).trim();

      // Parse model line (first line: "  provider/model")
      const modelMatch = clean.match(/^\s*([\w-]+\/[\w.-]+)/);
      const model = modelMatch?.[1] ?? "unknown";

      // Parse stats line (last line like "  12.3k in → 2.1k out  ·  3 frameworks  ·  2 searches")
      const statsMatch = clean.match(
        /([\d.]+)k?\s*in\s*→\s*([\d.]+)k?\s*out(?:\s*·\s*(\d+)\s*framework)?(?:s)?(?:\s*·\s*(\d+)\s*search)?(?:es)?(?:\s*·\s*(\d+)\s*file)?/
      );

      let tokensIn = 0,
        tokensOut = 0,
        frameworks = 0,
        searches = 0,
        filesRead = 0;

      if (statsMatch) {
        const parseNum = (s: string | undefined) => {
          if (!s) return 0;
          const n = parseFloat(s);
          return s.includes("k") || n > 100 ? Math.round(n * (n < 100 ? 1000 : 1)) : Math.round(n * 1000);
        };
        tokensIn = parseNum(statsMatch[1]);
        tokensOut = parseNum(statsMatch[2]);
        frameworks = parseInt(statsMatch[3] ?? "0", 10);
        searches = parseInt(statsMatch[4] ?? "0", 10);
        filesRead = parseInt(statsMatch[5] ?? "0", 10);
      }

      // Remove model line and stats line from response
      const lines = clean.split("\n");
      // Remove first line (model) and any "project:" line
      let startIdx = 0;
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (
          lines[i].match(/^\s*([\w-]+\/[\w.-]+)/) ||
          lines[i].match(/^\s*project:/) ||
          lines[i].match(/^-\s*(Thinking|Browsing|Searching|Applying|Reading)/)
        ) {
          startIdx = i + 1;
        }
      }
      // Remove trailing stats line
      let endIdx = lines.length;
      for (let i = lines.length - 1; i >= Math.max(0, lines.length - 5); i--) {
        if (lines[i].match(/\d+\.?\d*k?\s*in\s*→/)) {
          endIdx = i;
          break;
        }
      }

      const response = lines
        .slice(startIdx, endIdx)
        .join("\n")
        .replace(/^[\s-]*(Thinking|Browsing|Searching|Applying|Reading)[^\n]*\n/gm, "")
        .trim();

      resolve({ response, model, tokensIn, tokensOut, frameworks, searches, filesRead });
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  let startId = 1;
  let onlyIds: Set<number> | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--start" && args[i + 1]) {
      startId = parseInt(args[i + 1], 10);
      i++;
    }
    if (args[i] === "--only" && args[i + 1]) {
      onlyIds = new Set(args[i + 1].split(",").map(Number));
      i++;
    }
  }

  const toRun = examples.filter((e) => {
    if (onlyIds) return onlyIds.has(e.id);
    return e.id >= startId;
  });

  console.log(`\n🚀 Generating ${toRun.length} examples...\n`);

  let done = 0;
  let failed = 0;

  for (const ex of toRun) {
    const filename = `${String(ex.id).padStart(3, "0")}-${ex.slug}.json`;
    const filepath = resolve(OUT_DIR, filename);

    // Skip if already exists
    if (existsSync(filepath)) {
      const existing = JSON.parse(readFileSync(filepath, "utf8"));
      if (existing.response && existing.response.length > 100) {
        console.log(`  ⏭  #${ex.id} ${ex.title} (already exists)`);
        done++;
        continue;
      }
    }

    console.log(`  ⏳ #${ex.id} ${ex.title}...`);
    const startTime = Date.now();

    try {
      const result = await runFounder(ex.prompt);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      const json = {
        id: ex.id,
        title: ex.title,
        slug: ex.slug,
        category: ex.category,
        tags: ex.tags,
        context: ex.context,
        prompt: ex.prompt,
        response: result.response,
        metadata: {
          model: result.model,
          tokensIn: result.tokensIn,
          tokensOut: result.tokensOut,
          frameworks: result.frameworks,
          searches: result.searches,
          filesRead: result.filesRead,
          generatedAt: new Date().toISOString(),
          elapsedSeconds: parseFloat(elapsed),
        },
      };

      writeFileSync(filepath, JSON.stringify(json, null, 2) + "\n");
      done++;
      console.log(
        `  ✅ #${ex.id} ${ex.title} (${elapsed}s, ${result.frameworks} frameworks, ${result.searches} searches)`
      );
    } catch (err: any) {
      failed++;
      console.error(`  ❌ #${ex.id} ${ex.title}: ${err.message}`);
    }
  }

  console.log(`\n📊 Done: ${done} generated, ${failed} failed\n`);
}

main().catch(console.error);
