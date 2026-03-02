import { tool } from 'ai';
import { z } from 'zod';
import { loadFramework, getAllCategories, getCategoryFrameworks } from '../skills/loader.js';

export const applyFrameworkTool = tool({
  description:
    'Load and apply a business framework. Call this for each framework you want to apply to the user\'s problem. Returns the expert instructions for the framework.',
  parameters: z.object({
    category: z
      .string()
      .describe('Category name: strategy, marketing, finance, innovation, organization, decision-making, communication, productivity, leadership, psychology, sales, mental-models, operations, design, negotiation, wellbeing'),
    framework: z
      .string()
      .describe('Framework slug (lowercase with hyphens, e.g. "porters-five-forces", "lean-canvas")'),
  }),
  execute: async ({ category, framework }) => {
    const body = loadFramework(category, framework);

    if (!body) {
      // Try to find it in other categories
      const categories = getAllCategories();
      for (const cat of categories) {
        const found = loadFramework(cat.name, framework);
        if (found) {
          return {
            found: true,
            category: cat.name,
            framework,
            content: found,
          };
        }
      }

      return {
        found: false,
        error: `Framework "${framework}" not found in category "${category}". Use listFrameworks to see available frameworks.`,
      };
    }

    return {
      found: true,
      category,
      framework,
      content: body,
    };
  },
});
