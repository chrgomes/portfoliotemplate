import type { SiteConfig } from './types';

/**
 * Personal details. This is the only file that holds them — components read from here.
 * Anything left null is hidden on the live site (and flagged in the preview build).
 */
export const site: SiteConfig = {
  name: 'Chris Gomes',
  wordmark: undefined,
  monogram: undefined,
  role: 'Full-stack software developer',
  siteUrl: 'https://www.example.com',
  description:
    'Full-stack developer building modern web applications, AI-powered tools and secure software — from data model to interface.',

  timeZone: 'America/Toronto',
  timeZoneLabel: 'Eastern Time',

  // Only set this if it is true right now, e.g. 'Open to junior and intermediate developer roles'.
  availability: null,

  contact: {
    email: null, // e.g. 'hello@yourdomain.com'
    github: null, // e.g. 'https://github.com/your-handle'
    linkedin: null, // e.g. 'https://www.linkedin.com/in/your-handle'
    resume: null, // e.g. '/files/resume.pdf' (put the PDF in public/files/)
    formEndpoint: '/contact.php',
    challengeEndpoint: '/contact.php?action=challenge',
  },
};

/** Hero and section copy that isn't tied to a project. */
export const copy = {
  // Three lines; each steps in to echo the stacked layers of the hero diagram.
  heroLines: ['Engineering', 'the next layer', 'of digital.'],
  heroLead:
    'I build modern web applications, intelligent digital products and practical software, with a focus on usability, performance and secure engineering.',
  positioning:
    'I turn complex ideas into practical digital products, combining thoughtful design, modern engineering and a security-first mindset.',
  workTitle: 'Selected work',
  workLead: 'Practical solutions, built to solve real problems. Each one is labelled with where it honestly stands.',
  expertiseTitle: 'What I work with',
  expertiseLead:
    'Grouped by the layer of a system it belongs to. Select a skill to see what it means in practice and where it shows up in my projects.',
  philosophyTitle: 'How I approach a build',
  aboutTitle: 'About',
  processTitle: 'From problem to shipped software',
  contactTitle: 'Have an interesting problem to solve?',
  contactLead:
    "I'm always interested in thoughtful ideas, useful applications and people who value good engineering.",
};

export const principles = [
  {
    title: 'Understand the problem',
    body: 'Understand the business objective, user requirements and constraints before choosing a technical solution.',
    glyph: 'understand',
  },
  {
    title: 'Design with intention',
    body: 'Create intuitive interfaces, maintainable architecture and logical data structures.',
    glyph: 'design',
  },
  {
    title: 'Build for real-world use',
    body: 'Prioritise reliability, validation, performance, usability and maintainability.',
    glyph: 'build',
  },
  {
    title: 'Think about security',
    body: 'Build in secure development practices, appropriate access control and data protection from the start.',
    glyph: 'secure',
  },
] as const;

export const processSteps = [
  {
    title: 'Discover',
    glyph: 'discover',
    body: 'Understand the problem, the people affected and the requirements that actually matter.',
    output: 'Problem statement, user needs, constraints',
  },
  {
    title: 'Architect',
    glyph: 'architect',
    body: 'Plan the application, the data model and the technical approach before writing features.',
    output: 'Data model, API outline, component map',
  },
  {
    title: 'Develop',
    glyph: 'develop',
    body: 'Build the interface, backend and integrations in small, reviewable increments.',
    output: 'Working features behind version control',
  },
  {
    title: 'Validate',
    glyph: 'validate',
    body: 'Test functionality, usability, security and performance against the original requirements.',
    output: 'Test results, fixed defects, review notes',
  },
  {
    title: 'Refine',
    glyph: 'refine',
    body: 'Improve the experience through iteration and feedback once real people use it.',
    output: 'Prioritised improvements',
  },
] as const;
