import type { SkillGroup } from './types';

/**
 * Skills, grouped by layer. Remove anything you can't comfortably discuss in an interview.
 * No percentages or ratings, on purpose.
 *
 * `note` is revealed when a visitor selects the skill. The "used in" list is calculated
 * automatically from each project's `tech` array, so it is always accurate.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: 'frontend',
    title: 'Frontend engineering',
    domain: 'product',
    summary: 'Interfaces that are fast, accessible and easy to maintain.',
    items: [
      { name: 'Angular', note: 'Standalone components, routing, reactive forms and services.' },
      { name: 'TypeScript', note: 'Strict typing to catch mistakes before they reach users.' },
      { name: 'JavaScript' },
      { name: 'HTML5', note: 'Semantic markup as the foundation for accessibility and SEO.' },
      { name: 'CSS3', note: 'Layout with grid and flexbox, design tokens, responsive type.' },
      { name: 'Bootstrap' },
      { name: 'Responsive interfaces', note: 'Layouts designed for phones first, not shrunk from desktop.' },
      { name: 'Component-based architecture' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend engineering',
    domain: 'product',
    summary: 'APIs and business logic that validate input and fail clearly.',
    items: [
      { name: 'Python' },
      { name: 'FastAPI', note: 'Typed endpoints with automatic request validation and docs.' },
      { name: 'REST API development', note: 'Resource-oriented endpoints with consistent errors.' },
      { name: 'API integration', note: 'Connecting third-party services behind small, testable adapters.' },
      { name: 'Authentication and authorization' },
      { name: 'Validation and error handling' },
    ],
  },
  {
    id: 'data',
    title: 'Databases',
    domain: 'data',
    summary: 'Data models that reflect the business and stay consistent.',
    items: [
      { name: 'MySQL' },
      { name: 'SQL' },
      { name: 'Relational database design', note: 'Tables, keys and relationships planned before features.' },
      { name: 'Data modelling' },
      { name: 'Normalisation' },
      { name: 'Query optimisation fundamentals', note: 'Indexes and query plans for the queries that matter.' },
      { name: 'SQLAlchemy' },
    ],
  },
  {
    id: 'security',
    title: 'Cybersecurity',
    domain: 'security',
    summary: 'Security fundamentals applied while building, and practised in a lab.',
    items: [
      { name: 'Security fundamentals' },
      { name: 'Secure coding principles', note: 'Validate input, encode output, keep secrets out of code.' },
      { name: 'Access control', note: 'Server-side checks for every protected action.' },
      { name: 'Vulnerability assessment fundamentals' },
      { name: 'Log analysis', note: 'Reading and correlating logs to reconstruct what happened.' },
      { name: 'Defensive security concepts' },
    ],
  },
  {
    id: 'ai',
    title: 'AI and automation',
    domain: 'data',
    summary: 'Practical AI, used where it beats a simple rule.',
    items: [
      { name: 'LLM API', note: 'Integrating language-model APIs with structured, validated output.' },
      { name: 'Workflow automation', note: 'Removing repetitive work with small, replaceable steps.' },
      { name: 'Structured data processing' },
      { name: 'AI-assisted development' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools and practice',
    domain: 'product',
    summary: 'The habits that keep a codebase healthy.',
    items: [
      { name: 'Git and GitHub' },
      { name: 'Linux', note: 'Comfortable on the command line and in server environments.' },
      { name: 'Testing and debugging' },
      { name: 'Documentation', note: 'READMEs and decision notes that the next person can follow.' },
    ],
  },
];
