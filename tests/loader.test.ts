import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { join } from 'path';
import {
  parseFrontmatter,
  stripFrontmatter,
  parseFrameworks,
  extractExpertInstructions,
  getAllCategories,
  getCategoryFrameworks,
  loadFramework,
  setSkillsDir,
  resetSkillsDir,
} from '../src/skills/loader.js';

// Point to the actual skills directory for integration tests
const SKILLS_DIR = join(__dirname, '..', '..', 'skills');

beforeAll(() => {
  setSkillsDir(SKILLS_DIR);
});

afterAll(() => {
  resetSkillsDir();
});

describe('parseFrontmatter', () => {
  it('parses YAML frontmatter', () => {
    const text = `---
name: strategy
description: "Strategic analysis frameworks"
argument-hint: [framework-name] [context]
---

# Strategy`;

    const fm = parseFrontmatter(text);
    expect(fm.name).toBe('strategy');
    expect(fm.description).toBe('Strategic analysis frameworks');
    expect(fm['argument-hint']).toBe('[framework-name] [context]');
  });

  it('returns empty object for no frontmatter', () => {
    const fm = parseFrontmatter('# No frontmatter here');
    expect(fm).toEqual({});
  });
});

describe('stripFrontmatter', () => {
  it('removes frontmatter', () => {
    const text = `---
name: test
---

# Content`;

    const result = stripFrontmatter(text);
    expect(result).toBe('# Content');
  });

  it('returns text unchanged if no frontmatter', () => {
    const text = '# No frontmatter';
    expect(stripFrontmatter(text)).toBe(text);
  });
});

describe('parseFrameworks', () => {
  const sampleFrameworks = `# Test Frameworks

---

## Porter's Five Forces
**Slug**: \`porters-five-forces\`

**Description**: Analyze competitive dynamics in an industry

**When to use**: When evaluating market attractiveness

**Expert instructions**:
\`\`\`
You are a strategy expert. Analyze the five forces.
\`\`\`

---

## SWOT Analysis
**Slug**: \`swot-analysis\`

**Description**: Assess strengths, weaknesses, opportunities, threats

**When to use**: When doing a strategic overview

**Expert instructions**:
\`\`\`
You are a strategy expert. Conduct SWOT analysis.
\`\`\`
`;

  it('parses multiple frameworks', () => {
    const frameworks = parseFrameworks(sampleFrameworks);
    expect(frameworks).toHaveLength(2);
  });

  it('extracts slug correctly', () => {
    const frameworks = parseFrameworks(sampleFrameworks);
    expect(frameworks[0].slug).toBe('porters-five-forces');
    expect(frameworks[1].slug).toBe('swot-analysis');
  });

  it('extracts name correctly', () => {
    const frameworks = parseFrameworks(sampleFrameworks);
    expect(frameworks[0].name).toBe("Porter's Five Forces");
    expect(frameworks[1].name).toBe('SWOT Analysis');
  });

  it('extracts description correctly', () => {
    const frameworks = parseFrameworks(sampleFrameworks);
    expect(frameworks[0].description).toBe('Analyze competitive dynamics in an industry');
  });

  it('preserves full body', () => {
    const frameworks = parseFrameworks(sampleFrameworks);
    expect(frameworks[0].body).toContain('Expert instructions');
    expect(frameworks[0].body).toContain('five forces');
  });
});

describe('extractExpertInstructions', () => {
  it('extracts instructions from framework body', () => {
    const body = `## Test
**Slug**: \`test\`

**Expert instructions**:
\`\`\`
You are an expert. Do the thing.
\`\`\``;

    const instructions = extractExpertInstructions(body);
    expect(instructions).toBe('You are an expert. Do the thing.');
  });

  it('returns null when no instructions found', () => {
    const instructions = extractExpertInstructions('## Just a heading');
    expect(instructions).toBeNull();
  });
});

describe('getAllCategories (integration)', () => {
  it('returns all 16 categories', () => {
    const categories = getAllCategories();
    expect(categories.length).toBe(16);
  });

  it('each category has name, description, and framework count', () => {
    const categories = getAllCategories();
    for (const cat of categories) {
      expect(cat.name).toBeTruthy();
      expect(cat.frameworkCount).toBeGreaterThan(0);
    }
  });

  it('includes expected categories', () => {
    const categories = getAllCategories();
    const names = categories.map(c => c.name);
    expect(names).toContain('strategy');
    expect(names).toContain('marketing');
    expect(names).toContain('finance');
    expect(names).toContain('innovation');
  });

  it('total framework count is approximately 568', () => {
    const categories = getAllCategories();
    const total = categories.reduce((sum, c) => sum + c.frameworkCount, 0);
    expect(total).toBeGreaterThanOrEqual(500);
    expect(total).toBeLessThanOrEqual(600);
  });
});

describe('getCategoryFrameworks (integration)', () => {
  it('returns frameworks for strategy', () => {
    const frameworks = getCategoryFrameworks('strategy');
    expect(frameworks.length).toBeGreaterThan(40);
  });

  it('each framework has slug, name, description', () => {
    const frameworks = getCategoryFrameworks('strategy');
    for (const fw of frameworks) {
      expect(fw.slug).toBeTruthy();
      expect(fw.name).toBeTruthy();
      expect(fw.description).toBeTruthy();
    }
  });

  it('returns empty array for unknown category', () => {
    const frameworks = getCategoryFrameworks('nonexistent');
    expect(frameworks).toEqual([]);
  });
});

describe('loadFramework (integration)', () => {
  it('loads a specific framework', () => {
    const body = loadFramework('strategy', 'porters-five-forces');
    expect(body).toBeTruthy();
    expect(body).toContain('Expert instructions');
  });

  it('returns null for unknown framework', () => {
    const body = loadFramework('strategy', 'nonexistent-framework');
    expect(body).toBeNull();
  });
});
