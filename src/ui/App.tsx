import React, { useState, useCallback, useRef } from 'react';
import { Box, Text, Static, useApp, useStdout } from 'ink';
import TextInput from 'ink-text-input';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { join } from 'path';
import { getConfig, isConfigured } from '../config.js';
import { getAllCategories, getCategoryFrameworks } from '../skills/loader.js';
import { streamAgent } from '../agent-stream.js';
import ChatMessage, { type Message } from './ChatMessage.js';
import StatusLine from './StatusLine.js';
import { mascotLines } from './mascot.js';

function detectProject(): boolean {
  const markers = ['package.json', 'Cargo.toml', 'pyproject.toml', 'go.mod', 'Gemfile', 'pom.xml', 'build.gradle', '.git', 'README.md'];
  return markers.some((m) => existsSync(join(process.cwd(), m)));
}

const helpText = `
  ${chalk.bold('Interactive mode')}

  Just type your business problem and press Enter.

  ${chalk.cyan('quit')} / ${chalk.cyan('exit')} / ${chalk.cyan('Ctrl+C')}  Exit
  ${chalk.cyan('help')}                    Show this help
  ${chalk.cyan('list')}                    Show all categories
  ${chalk.cyan('list <category>')}         Show frameworks in a category
`;

function getFrameworkCount(): number {
  return getAllCategories().reduce((sum, c) => sum + c.frameworkCount, 0);
}

function getWelcomeMessage(cols: number): Message {
  const total = getFrameworkCount();
  const categories = getAllCategories();
  const catCount = categories.length;
  const ruleWidth = Math.min(cols, 72);
  const rule = chalk.gray('─'.repeat(ruleWidth));

  const m = chalk.bold.magenta;
  const d = chalk.gray;
  const c = chalk.cyan;
  const g = chalk.green;
  const y = chalk.yellow;
  const w = chalk.white;

  const jargon = [
    // OG batch
    y('"pre-PMF but post-vibe"'),
    g('"$4.2k MRR, hockey stick any day"'),
    c('"6 months runway, tops"'),
    m('"it\'s a platform play"'),
    y('"we need to 10x our GTM"'),
    g('"AI wrapper but make it SaaS"'),
    c('"move fast and ship things"'),
    m('"this is my 3rd pivot"'),
    y('"we\'re default alive*" (*maybe)'),
    g('"just need a technical cofounder"'),
    c('"it\'s like Uber but for X"'),
    m('"YC W26, stealth mode"'),
    y('"ramen profitable, let\'s go"'),
    g('"TAM is basically everyone"'),
    c('"fundraising is just storytelling"'),
    y('"we\'re building in public"'),
    m('"disrupting a $1T market"'),
    g('"LLM + vertical = moat"'),
    // Fundraising & VCs
    y('"we\'re oversubscribed (1 angel)"'),
    g('"our burn rate is... efficient"'),
    c('"just closed our pre-seed-seed"'),
    m('"we turned down a term sheet*"'),
    y('"*it was a SAFE at $200k"'),
    g('"hot deal, cap table is clean"'),
    c('"investor update: still alive"'),
    m('"bridge round to the bridge round"'),
    y('"we don\'t need VC" (needs VC)"'),
    g('"our lead investor is... me"'),
    c('"convertible note go brrrr"'),
    m('"dilution is just a number"'),
    y('"Series A is 6 months away" (x4)"'),
    g('"we\'ll raise when we want to"'),
    c('"bootstrapped (parents\' money)"'),
    m('"warm intro or cold grave"'),
    y('"deck is fire, metrics are... warm"'),
    g('"we passed on the acqui-hire"'),
    c('"our cap table has... character"'),
    m('"SAFE note but make it unsafe"'),
    y('"angels only, no devils"'),
    // PMF & Product
    g('"PMF is a state of mind"'),
    c('"users love it (n=3, all friends)"'),
    m('"we have product-market vibes"'),
    y('"NPS is off the charts (n=2)"'),
    g('"users can\'t live without it*"'),
    c('"*they haven\'t tried it yet"'),
    m('"retention is... a journey"'),
    y('"we\'re pre-revenue by choice"'),
    g('"DAU is up! (I logged in twice)"'),
    c('"churn is just reverse growth"'),
    m('"the product sells itself (it doesn\'t)"'),
    y('"waitlist of 10k (bots mostly)"'),
    g('"activation rate: undefined"'),
    c('"we sunset that feature (it broke)"'),
    m('"MVP stands for my viable prayer"'),
    y('"shipping > thinking about shipping"'),
    g('"our v2 will fix everything"'),
    c('"users want simplicity (adds tabs)"'),
    m('"we\'re product-led (no sales team)"'),
    y('"feature-complete*" (*no features)"'),
    // Growth & Marketing
    g('"we went viral (on HN, 3 upvotes)"'),
    c('"growth is exponential (from 0 to 1)"'),
    m('"organic growth only (broke)"'),
    y('"our CAC is technically zero"'),
    g('"LTV:CAC is infinity/0"'),
    c('"word of mouth is our GTM"'),
    m('"content marketing = tweets"'),
    y('"SEO strategy: exist on internet"'),
    g('"we\'re the #1 Google result*"'),
    c('"*for our exact brand name"'),
    m('"influencer strategy: be one"'),
    y('"dark social is just no traffic"'),
    g('"community-led = Discord with 12"'),
    c('"B2B2C2B2... someone pays us"'),
    m('"our funnel is more of a sieve"'),
    y('"PLG but nobody\'s leading"'),
    g('"1000 true fans, 997 to go"'),
    c('"marketing budget: vibes"'),
    m('"referral program (tell ur mom)"'),
    y('"brand awareness: my mom knows"'),
    // AI & Tech
    g('"it\'s not an AI wrapper, it\'s an AI... layer"'),
    c('"GPT wrapper with extra steps"'),
    m('"we fine-tuned a model (prompt)"'),
    y('"our AI is proprietary (API call)"'),
    g('"RAG is our entire moat"'),
    c('"training data = Wikipedia"'),
    m('"AI-native, cloud-native, native"'),
    y('"we replaced the intern with AI"'),
    g('"our model hallucinates features"'),
    c('"AGI but for spreadsheets"'),
    m('"transformer architecture (Google Sheets)"'),
    y('"embedding everything, understanding nothing"'),
    g('"prompt engineering is engineering"'),
    c('"vector DB is our personality"'),
    m('"AI co-pilot for AI co-pilots"'),
    y('"it\'s ML, not if-else (it\'s if-else)"'),
    g('"neural net (two-layer perceptron)"'),
    c('"deep tech (3 API calls deep)"'),
    // Startup Life
    m('"sleep is a feature, not a bug"'),
    y('"we work weekends (have no choice)"'),
    g('"flat hierarchy (2 people)"'),
    c('"culture is our superpower (no AC)"'),
    m('"the garage is our office (evicted)"'),
    y('"CEO/CTO/CFO/janitor, same person"'),
    g('"unlimited PTO (no one takes any)"'),
    c('"we\'re a family (dysfunctional)"'),
    m('"startup speed (missed deadline)"'),
    y('"hustle culture (exhaustion)"'),
    g('"wearing many hats (can\'t afford help)"'),
    c('"fail fast (too fast)"'),
    m('"iterate or die (doing both)"'),
    y('"the grind never stops (please stop)"'),
    g('"first hire: head of vibes"'),
    c('"competitive salary: equity"'),
    m('"work-life balance (laughs)"'),
    y('"office snacks = instant ramen"'),
    // Metrics & Data
    g('"our metrics are... directional"'),
    c('"ARR if you squint at MRR"'),
    m('"growth rate: yes"'),
    y('"revenue: ask again later"'),
    g('"cohort analysis (2 cohorts)"'),
    c('"data-driven (gut feeling)"'),
    m('"north star metric: survival"'),
    y('"KPIs: keeping people interested"'),
    g('"unit economics work at scale*"'),
    c('"*we have 3 users"'),
    m('"margin is a social construct"'),
    y('"negative churn (creative math)"'),
    g('"engagement is through the roof*"'),
    c('"*the roof is very low"'),
    // Strategy & Vision
    m('"first mover disadvantage"'),
    y('"second mover, first to pivot"'),
    g('"we\'re category-defining (no market)"'),
    c('"blue ocean (no customers either)"'),
    m('"moat: we work harder"'),
    y('"competitive advantage: desperation"'),
    g('"network effects (5 users know each other)"'),
    c('"winner take all (we\'re not winning)"'),
    m('"strategic patience (stalling)"'),
    y('"land and expand (just landed)"'),
    g('"our flywheel is a hamster wheel"'),
    c('"10x better (10x more confusing)"'),
    m('"first-principles thinking (guessing)"'),
    y('"defensible IP (a blog post)"'),
    // SV Culture
    g('"that\'s not a pivot, it\'s a leap"'),
    c('"we iterate in public"'),
    m('"demo day ready (not really)"'),
    y('"office hours with ourselves"'),
    g('"advisor: my uber driver"'),
    c('"board meeting (dinner with dad)"'),
    m('"quarterly review (first quarter ever)"'),
    y('"thought leader (tweeter)"'),
    g('"ecosystem player (user of ecosystems)"'),
    c('"silicon valley state of mind (in Ohio)"'),
    m('"hacker house (messy apartment)"'),
    y('"co-working space (Starbucks)"'),
    g('"networking event (open bar)"'),
    c('"fireside chat (space heater)"'),
    m('"founder mode (panic mode)"'),
    // Sales & Revenue
    y('"enterprise ready (added login)"'),
    g('"our pipeline is full (of leads from 2024)"'),
    c('"closing deals (closing laptop)"'),
    m('"outbound strategy: spam"'),
    y('"inbound leads: mom, spam, recruiters"'),
    g('"free tier forever (can\'t charge)"'),
    c('"pricing: vibes-based"'),
    m('"$0 to $1 ARR, the hardest gap"'),
    y('"whale hunting (goldfish catching)"'),
    g('"upsell (they bought nothing)"'),
    c('"logo customers: our logo"'),
    m('"sales cycle: eternal"'),
    // Pivots & Direction
    y('"pivot-to-AI speedrun"'),
    g('"same app, different TLD"'),
    c('"this is the one (said 4x)"'),
    m('"idea maze (actually lost)"'),
    y('"market timing is everything (we\'re late)"'),
    g('"stealth mode = no users"'),
    c('"soft launch (launch nobody saw)"'),
    m('"hard launch (servers crashed)"'),
    y('"always be shipping (what though?)"'),
    g('"build measure learn cry repeat"'),
    c('"validated learning (googled it)"'),
    m('"customer discovery (asked roommate)"'),
    // Misc SV Wisdom
    y('"ideas are cheap, execution is free"'),
    g('"strong opinions, loosely held (always)"'),
    c('"the future is already here (not for us)"'),
    m('"10x engineer (10x the bugs)"'),
    y('"full-stack founder (Stack Overflow)"'),
    g('"no-code revolution (can\'t code)"'),
    c('"low-code (also can\'t code)"'),
    m('"technical debt is just debt now"'),
    y('"microservices (one service)"'),
    g('"blockchain-adjacent (uses a database)"'),
    c('"web3 curious (web2 confused)"'),
    m('"the metaverse is dead, long live AR"'),
    y('"we\'re a DevTool (for ourselves)"'),
    g('"API-first (API-only, no frontend)"'),
    c('"infra play (runs on Heroku)"'),
    m('"open source our FOMO"'),
    y('"developer experience (our experience)"'),
    g('"serverless (the server is somewhere)"'),
    c('"edge computing (laptop on desk edge)"'),
    m('"composable architecture (duct tape)"'),
    y('"the market is $X billion (not for us)"'),
    g('"solving a real pain point (our pain)"'),
    c('"scratching our own itch (rash now)"'),
    m('"dogfooding (the food is bad)"'),
    y('"eating our own cooking (raw)"'),
    g('"done is better than perfect (done?)"'),
    c('"perfect is the enemy of shipped"'),
    m('"ship it and they will come (they didn\'t)"'),
  ];
  // Pick 3 random jargon lines for variety
  const shuffled = jargon.sort(() => Math.random() - 0.5).slice(0, 3);

  // Pad colored strings to a visible width (ignoring ANSI escape codes)
  const vpad = (s: string, w: number) => {
    const vis = s.replace(/\x1b\[[0-9;]*m/g, '').length;
    return s + ' '.repeat(Math.max(0, w - vis));
  };

  // Chafa mascot (--fg-only, zero background colors) + speech bubble
  const bubble = [
    d('╭───────────────────────────────────╮'),
    `${d('│')} ${vpad(shuffled[0], 34)}${d('│')}`,
    `${d('│')} ${vpad(shuffled[1], 34)}${d('│')}`,
    `${d('│')} ${vpad(shuffled[2], 34)}${d('│')}`,
    d('╰───────────────────────────────────╯'),
  ];
  const art = mascotLines.map((line: string, i: number) => {
    if (i >= 5 && i <= 9) return line + '  ' + (bubble[i - 5] || '');
    return line;
  });

  const block = [
    m('  ███████╗ ██████╗ ██╗   ██╗███╗   ██╗██████╗ ███████╗██████╗'),
    m('  ██╔════╝██╔═══██╗██║   ██║████╗  ██║██╔══██╗██╔════╝██╔══██╗'),
    m('  █████╗  ██║   ██║██║   ██║██╔██╗ ██║██║  ██║█████╗  ██████╔╝'),
    m('  ██╔══╝  ██║   ██║██║   ██║██║╚██╗██║██║  ██║██╔══╝  ██╔══██╗'),
    m('  ██║     ╚██████╔╝╚██████╔╝██║ ╚████║██████╔╝███████╗██║  ██║'),
    m('  ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝'),
  ];

  const tagline = `  ${chalk.bold.magenta('Founder CLI')} ${chalk.white('—')} ${chalk.italic.white('Your business thinking partner.')}  ${chalk.gray(`${total} frameworks · ${catCount} categories`)}`;

  const catList = categories.map(cat =>
    `  ${c(cat.name.padEnd(16))} ${chalk.white(`${cat.frameworkCount}`)}`
  ).join('\n');

  return {
    role: 'system',
    text: `
${art.join('\n')}

${block.join('\n')}

${tagline}

${rule}
${catList}
${rule}

  ${chalk.white('Describe your problem and press Enter.')} ${chalk.gray('I\'ll pick the frameworks and do the work.')}
  ${chalk.gray('Type')} ${c('help')} ${chalk.gray('for commands ·')} ${c('list <category>')} ${chalk.gray('to browse.')}`,
  };
}

export default function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const cols = stdout?.columns ?? 80;
  const [messages, setMessages] = useState<Message[]>([getWelcomeMessage(cols)]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [statusText, setStatusText] = useState('Thinking...');
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const handleSubmit = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setInput('');

    if (trimmed === 'quit' || trimmed === 'exit' || trimmed === 'q') {
      exit();
      return;
    }

    if (trimmed === 'help') {
      setMessages(prev => [...prev, { role: 'system', text: helpText }]);
      return;
    }

    if (trimmed === 'list' || trimmed.startsWith('list ')) {
      const parts = trimmed.split(/\s+/);
      const category = parts[1];
      let listText = '';

      if (category) {
        const frameworks = getCategoryFrameworks(category);
        if (!frameworks.length) {
          listText = chalk.red(`Unknown category: ${category}`);
        } else {
          listText = chalk.bold(`\n${category} frameworks:\n`) + '\n';
          for (const fw of frameworks) {
            listText += `  ${chalk.cyan(fw.slug)} — ${fw.name}: ${fw.description}\n`;
          }
        }
      } else {
        const categories = getAllCategories();
        const total = getFrameworkCount();
        listText = chalk.bold('\nAvailable categories:\n') + '\n';
        for (const cat of categories) {
          listText += `  ${chalk.cyan(cat.name.padEnd(20))} ${chalk.gray(`${cat.frameworkCount} frameworks`)}  ${cat.description}\n`;
        }
        listText += `\n  ${chalk.gray('Total: ' + total + ' frameworks')}`;
      }

      setMessages(prev => [...prev, { role: 'system', text: listText }]);
      return;
    }

    // Parse optional flags: -c category, -f framework
    let category: string | undefined;
    let framework: string | undefined;
    let userInput = trimmed;

    const catMatch = trimmed.match(/^-c\s+(\S+)\s+([\s\S]+)$/);
    if (catMatch) {
      category = catMatch[1];
      userInput = catMatch[2];
    }

    const fwMatch = trimmed.match(/^-f\s+(\S+)\s+([\s\S]+)$/);
    if (fwMatch) {
      framework = fwMatch[1];
      userInput = fwMatch[2];
    }

    setMessages(prev => [...prev, { role: 'user', text: userInput }]);
    setIsThinking(true);
    setStatusText('Thinking...');

    const config = getConfig();
    const allowFileAccess = detectProject();

    // Build conversation history from previous messages
    const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    for (const msg of messagesRef.current) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        history.push({ role: msg.role, content: msg.text });
      }
    }

    let responseText = '';
    let model = '';
    let usage = { promptTokens: 0, completionTokens: 0 };
    let frameworkCount = 0;
    let searchCount = 0;
    let fileCount = 0;

    for await (const event of streamAgent({ config, input: userInput, category, framework, allowFileAccess, history })) {
      switch (event.type) {
        case 'model':
          model = `${event.provider}/${event.modelId}`;
          break;
        case 'status':
          setStatusText(event.text);
          break;
        case 'chunk':
          responseText += event.text;
          break;
        case 'done':
          usage = event.usage;
          frameworkCount = event.frameworkCount;
          searchCount = event.searchCount;
          fileCount = event.fileCount;
          break;
        case 'error':
          setIsThinking(false);
          setMessages(prev => [...prev, { role: 'system', text: chalk.red(event.message) }]);
          return;
      }
    }

    setIsThinking(false);
    setMessages(prev => [...prev, {
      role: 'assistant',
      text: responseText,
      model,
      usage,
      frameworkCount,
      searchCount,
      fileCount,
    }]);
  }, [exit]);

  return (
    <>
      <Static items={messages}>
        {(msg, i) => (
          <Box key={i} flexDirection="column">
            <ChatMessage msg={msg} />
            <Text>{' '}</Text>
          </Box>
        )}
      </Static>

      <Box borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false} borderColor="gray">
        <Box flexGrow={1}>
          {isThinking ? (
            <StatusLine text={statusText} />
          ) : (
            <Box>
              <Text bold color="magenta">founder </Text><Text dimColor>› </Text>
              <TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
