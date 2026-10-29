/**
 * Content model for the portfolio.
 *
 * Everything a visitor reads lives in the files in this folder. Both the Angular
 * app and the zero-dependency static builder import from here, so editing a value
 * once updates every page.
 */

/** Where a project honestly stands. Shown as text, never as colour alone. */
export type ProjectStatus = 'completed' | 'in-development' | 'prototype' | 'concept' | 'experiment';

/** Which domain a project or skill belongs to. Each domain owns one accent colour. */
export type Domain = 'product' | 'data' | 'security';

/** Which generated preview to draw for a project when there is no real screenshot. */
export type PreviewKind = 'logistics' | 'social' | 'ai' | 'security' | 'commerce' | 'automation';

export interface Link {
  label: string;
  href: string;
}

export interface SiteConfig {
  /** Your full name, used in the wordmark, titles and structured data. */
  name: string;
  /** Optional shorter brand wordmark. Falls back to `name`. */
  wordmark?: string;
  /** Two characters drawn inside the monogram. Falls back to your initials. */
  monogram?: string;
  /** Plain-language role line used in titles and structured data. Keep it accurate. */
  role: string;
  /** Production origin with no trailing slash, e.g. https://www.yourdomain.com */
  siteUrl: string;
  /** Default meta description for the home page. */
  description: string;
  /** IANA time zone for the clock in the hero. Set to null to hide the clock. */
  timeZone: string | null;
  /** Short label printed next to the clock, e.g. "Eastern Time". */
  timeZoneLabel: string;
  /**
   * One sentence about what you are open to. Only fill this in if it is true today;
   * leave it null to hide the indicator entirely.
   */
  availability: string | null;
  contact: {
    /** Public email address. null hides the email button. */
    email: string | null;
    github: string | null;
    linkedin: string | null;
    /** Path to a PDF in /public (e.g. "/files/resume.pdf"). null hides the button. */
    resume: string | null;
    /**
     * Where the contact form posts. "/contact.php" uses the PHP handler for GoDaddy.
     * A Formspree/Web3Forms URL also works. null removes the form.
     */
    formEndpoint: string | null;
  };
}

export interface ArchitectureNode {
  id: string;
  label: string;
  detail?: string;
  /** Row in the diagram, top to bottom. */
  tier: number;
  domain?: Domain;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Architecture {
  caption: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

export interface DataTable {
  name: string;
  /** Prefix a field with "PK " or "FK " to mark keys. */
  fields: string[];
}

export interface DataModel {
  caption: string;
  tables: DataTable[];
  /** Pairs of table names that are related, drawn as connectors. */
  relations: [string, string][];
}

export interface Decision {
  title: string;
  body: string;
}

export interface CaseStudy {
  overview: string;
  problem: string;
  users: string[];
  objectives: string[];
  constraints: string[];
  features: string[];
  architecture?: Architecture;
  dataModel?: DataModel;
  decisions: Decision[];
  security: string[];
  challenges: string[];
  testing: string[];
  statusNote: string;
  lessons: string[];
  next: string[];
}

export interface Project {
  /** URL segment: /work/<slug>/ */
  slug: string;
  title: string;
  category: string;
  summary: string;
  domain: Domain;
  status: ProjectStatus;
  tech: string[];
  /** Shown on the home page when true. Keep four to six featured. */
  featured: boolean;
  preview: PreviewKind;
  /**
   * Optional real screenshot in /public/images. When set it replaces the generated
   * concept visual. Only use genuine screenshots.
   */
  image?: { src: string; alt: string; width: number; height: number };
  repoUrl: string | null;
  liveUrl: string | null;
  caseStudy: CaseStudy;
}

export interface SkillItem {
  name: string;
  /** One line of context revealed when the item is selected. */
  note?: string;
}

export interface SkillGroup {
  id: string;
  title: string;
  domain: Domain;
  summary: string;
  items: SkillItem[];
}

export interface Credential {
  title: string;
  /** Leave empty to hide. Never guess. */
  institution?: string;
  year?: string;
  note?: string;
}

export interface AboutContent {
  intro: string[];
  education: Credential[];
  certifications: Credential[];
  background: string[];
  learning: string[];
  interests: string[];
}
