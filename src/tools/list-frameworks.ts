import { tool } from 'ai';
import { z } from 'zod';
import { getAllCategories, getCategoryFrameworks } from '../skills/loader.js';

export const listFrameworksTool = tool({
  description:
    'List available business frameworks. Call with a category to see frameworks in that category, or without to see all categories with framework counts.',
  parameters: z.object({
    category: z
      .string()
      .optional()
      .describe('Optional category name to list frameworks for. Omit to list all categories.'),
  }),
  execute: async ({ category }) => {
    if (category) {
      const frameworks = getCategoryFrameworks(category);
      if (!frameworks.length) {
        return {
          error: `No frameworks found in category "${category}". Available categories: ${getAllCategories().map(c => c.name).join(', ')}`,
        };
      }
      return {
        category,
        frameworks: frameworks.map(f => ({
          slug: f.slug,
          name: f.name,
          description: f.description,
        })),
      };
    }

    const categories = getAllCategories();
    return {
      categories: categories.map(c => ({
        name: c.name,
        description: c.description,
        frameworkCount: c.frameworkCount,
      })),
      totalFrameworks: categories.reduce((sum, c) => sum + c.frameworkCount, 0),
    };
  },
});
