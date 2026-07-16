/**
 * Training / scraping AI user-agents to disallow in robots.txt.
 * Search engines (Googlebot, Bingbot) remain allowed via the default `*` rule.
 */
export const AI_SCRAPER_USER_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'CCBot',
  'Google-Extended',
  'anthropic-ai',
  'ClaudeBot',
  'Claude-Web',
  'Bytespider',
  'Amazonbot',
  'Applebot-Extended',
  'meta-externalagent',
  'Meta-ExternalAgent',
  'PerplexityBot',
  'YouBot',
  'cohere-ai',
  'Diffbot',
  'ImagesiftBot',
  'Omgilibot',
  'Omgili',
  'Timpibot',
  'AI2Bot',
  'webzio-extended'
] as const;
