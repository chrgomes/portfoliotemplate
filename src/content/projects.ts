import type { Project, ProjectStatus } from './types';

/**
 * Projects, in the order they appear.
 *
 * IMPORTANT — review before publishing. These entries were drafted from your brief.
 * Check every status, stack and sentence against what you have actually built.
 * Case studies describe design intent and approach; they make no claims about users,
 * revenue or results. Keep it that way unless you can back a claim up.
 *
 * To add a project: copy the template at the bottom of this file, give it a unique
 * slug, and set `featured: true` to show it on the home page.
 */

export const statusLabel: Record<ProjectStatus, string> = {
  completed: 'Completed',
  'in-development': 'In development',
  prototype: 'Prototype',
  concept: 'Concept',
  experiment: 'Experiment',
};

export const projects: Project[] = [
  {
    slug: 'transportation-management-system',
    title: 'Multi-tenant transportation management system',
    category: 'SaaS platform',
    summary:
      'A platform for freight brokers, 3PLs and carriers to run domestic Canadian and cross-border Canada–US shipments from quote to delivery.',
    domain: 'product',
    status: 'in-development',
    tech: ['Angular', 'TypeScript', 'Bootstrap', 'FastAPI', 'SQLAlchemy', 'MySQL'],
    featured: true,
    preview: 'logistics',
    repoUrl: null,
    liveUrl: null,
    caseStudy: {
      overview:
        'A multi-tenant SaaS application that gives each logistics company its own isolated workspace for customers, carriers and shipments, with a shared codebase and database.',
      problem:
        'Small brokerages and carriers often coordinate loads across spreadsheets, email threads and phone calls. Status lives in people’s heads, cross-border paperwork is easy to miss, and nobody has one reliable view of where a shipment is.',
      users: [
        'Freight brokers matching customer loads with carriers',
        'Dispatchers tracking shipments day to day',
        'Company administrators managing staff access',
      ],
      objectives: [
        'One record per shipment, from quote to proof of delivery',
        'Strict separation of every company’s data',
        'Role-appropriate access for brokers, dispatchers and admins',
        'A clear, fast interface for people who live in it all day',
      ],
      constraints: [
        'Every query must be scoped to a tenant — a leak between companies is unacceptable',
        'Cross-border shipments carry extra fields and documents that domestic ones do not',
        'Must stay maintainable by a small team',
      ],
      features: [
        'Shipment lifecycle tracking with status history',
        'Customer and carrier directories',
        'Role-based access control per tenant',
        'REST API consumed by the Angular frontend',
        'Domestic and cross-border shipment types',
      ],
      architecture: {
        caption: 'Request path from the browser to the tenant-scoped data layer.',
        nodes: [
          { id: 'ui', label: 'Angular SPA', detail: 'Bootstrap UI, route guards', tier: 0, domain: 'product' },
          { id: 'api', label: 'FastAPI', detail: 'REST endpoints, Pydantic validation', tier: 1, domain: 'product' },
          { id: 'auth', label: 'Auth & RBAC', detail: 'Tenant + role resolved per request', tier: 1, domain: 'security' },
          { id: 'svc', label: 'Domain services', detail: 'Shipments, parties, lifecycle rules', tier: 2, domain: 'product' },
          { id: 'orm', label: 'SQLAlchemy', detail: 'Tenant filter on every query', tier: 3, domain: 'data' },
          { id: 'db', label: 'MySQL', detail: 'Shared schema, tenant_id column', tier: 4, domain: 'data' },
        ],
        edges: [
          { from: 'ui', to: 'api', label: 'HTTPS + token' },
          { from: 'api', to: 'auth' },
          { from: 'api', to: 'svc' },
          { from: 'svc', to: 'orm' },
          { from: 'orm', to: 'db' },
        ],
      },
      dataModel: {
        caption: 'Core tables. Every business table carries a tenant_id.',
        // Tables fill a three-column grid left to right; order them so related tables sit side by side.
        tables: [
          { name: 'customers', fields: ['PK id', 'FK tenant_id', 'name', 'country'] },
          { name: 'tenants', fields: ['PK id', 'name', 'plan', 'created_at'] },
          { name: 'users', fields: ['PK id', 'FK tenant_id', 'email', 'role'] },
          { name: 'carriers', fields: ['PK id', 'FK tenant_id', 'name', 'authority_no'] },
          { name: 'shipments', fields: ['PK id', 'FK tenant_id', 'FK customer_id', 'FK carrier_id', 'type', 'status'] },
          { name: 'shipment_events', fields: ['PK id', 'FK shipment_id', 'status', 'occurred_at'] },
        ],
        relations: [
          ['tenants', 'users'],
          ['tenants', 'customers'],
          ['tenants', 'carriers'],
          ['customers', 'shipments'],
          ['carriers', 'shipments'],
          ['shipments', 'shipment_events'],
        ],
      },
      decisions: [
        {
          title: 'Shared schema with a tenant column',
          body: 'A single database with tenant_id on every business table keeps operations simple for a small team. The trade-off is that isolation depends on the application, so tenant filtering is enforced centrally rather than left to each query.',
        },
        {
          title: 'Status history as events',
          body: 'Shipment status changes are stored as rows in shipment_events instead of overwriting a single field, so the full timeline is always available.',
        },
        {
          title: 'Validation at the API boundary',
          body: 'Pydantic models validate every request before it reaches business logic, which keeps the domain services focused on rules rather than input checking.',
        },
      ],
      security: [
        'Tenant scope resolved from the authenticated user, never from request parameters',
        'Role checks on the server for every protected endpoint, not only in the UI',
        'Parameterised queries through the ORM',
        'Secrets loaded from environment variables, never committed',
      ],
      challenges: [
        'Making tenant isolation impossible to forget when adding new queries',
        'Modelling cross-border shipments without complicating domestic ones',
      ],
      testing: [
        'API tests for each endpoint, including requests that try to reach another tenant’s data',
        'Validation tests for malformed and boundary-case input',
        'Manual walkthroughs of the shipment lifecycle in the UI',
      ],
      statusNote: 'In active development. Details reflect the current design and may change as the build progresses.',
      lessons: [
        'Deciding the tenancy model first shapes almost every later decision',
        'An event history is cheap to add early and painful to retrofit',
      ],
      next: ['Document uploads for proof of delivery', 'Carrier-facing status updates', 'Reporting dashboard'],
    },
  },
  {
    slug: 'social-media-management-platform',
    title: 'Social media management platform',
    category: 'Web application',
    summary:
      'One workspace for planning, scheduling and reviewing social content across connected accounts, with roles for teams.',
    domain: 'product',
    status: 'in-development',
    tech: ['Angular', 'TypeScript', 'FastAPI', 'MySQL', 'REST APIs'],
    featured: true,
    preview: 'social',
    repoUrl: null,
    liveUrl: null,
    caseStudy: {
      overview:
        'A unified application for managing social media workflows: connecting accounts, scheduling posts, reviewing performance and administering a team’s access.',
      problem:
        'Teams that publish across several platforms juggle separate dashboards, logins and calendars. Planning is scattered and it is hard to see what is going out, when, and from which account.',
      users: ['Small business owners managing their own accounts', 'Marketing teams sharing a content calendar', 'Administrators managing seats and permissions'],
      objectives: [
        'A single content calendar across connected accounts',
        'Clear roles: who can draft, approve and publish',
        'Analytics presented simply enough to act on',
      ],
      constraints: [
        'Each social platform has its own API rules, rate limits and token lifetimes',
        'Access tokens for connected accounts must be stored securely',
      ],
      features: [
        'Dashboard with upcoming and recent posts',
        'Social account connection management',
        'Content scheduling calendar',
        'Analytics visualisation',
        'User roles and permissions',
        'Subscription and administrative controls',
      ],
      architecture: {
        caption: 'Scheduling flow from the calendar to each platform’s API.',
        nodes: [
          { id: 'ui', label: 'Dashboard', detail: 'Calendar, composer, analytics', tier: 0, domain: 'product' },
          { id: 'api', label: 'Application API', detail: 'Posts, accounts, roles', tier: 1, domain: 'product' },
          { id: 'vault', label: 'Token storage', detail: 'Encrypted OAuth tokens', tier: 1, domain: 'security' },
          { id: 'queue', label: 'Scheduler', detail: 'Due posts picked up on time', tier: 2, domain: 'data' },
          { id: 'ext', label: 'Platform APIs', detail: 'One adapter per network', tier: 3, domain: 'data' },
        ],
        edges: [
          { from: 'ui', to: 'api' },
          { from: 'api', to: 'vault' },
          { from: 'api', to: 'queue', label: 'scheduled post' },
          { from: 'queue', to: 'ext', label: 'publish' },
        ],
      },
      decisions: [
        {
          title: 'One adapter per platform',
          body: 'Each network sits behind the same small interface, so platform-specific quirks stay contained and a new network can be added without touching the scheduler.',
        },
        {
          title: 'Roles before features',
          body: 'Draft, approve and publish permissions were designed up front because they change how every screen behaves.',
        },
      ],
      security: [
        'OAuth tokens encrypted at rest and never sent to the browser',
        'Least-privilege scopes requested from each platform',
        'Server-side permission checks on every action',
      ],
      challenges: ['Handling token expiry and revoked access gracefully', 'Respecting each platform’s rate limits'],
      testing: ['Unit tests for each platform adapter against recorded responses', 'Permission tests for each role'],
      statusNote: 'In development. The name and feature set may change.',
      lessons: ['Third-party API limits should shape the design from day one, not be discovered late'],
      next: ['Approval workflow notifications', 'Bulk scheduling from a spreadsheet'],
    },
  },
  {
    slug: 'ai-structured-assistant',
    title: 'AI document-to-data assistant',
    category: 'AI application',
    summary:
      'Turns unstructured text such as emails or notes into validated, structured records using a language-model API — with checks before anything is saved.',
    domain: 'data',
    status: 'concept',
    tech: ['Python', 'FastAPI', 'LLM API', 'Pydantic', 'TypeScript'],
    featured: true,
    preview: 'ai',
    repoUrl: null,
    liveUrl: null,
    caseStudy: {
      overview:
        'A concept for a small tool that sends pasted text to a language model, asks for a strict structured response, validates it and shows the user exactly what will be saved.',
      problem:
        'Useful information often arrives as free text. Copying it into forms by hand is slow and error-prone, but blindly trusting model output is risky.',
      users: ['Operations staff re-keying details from emails', 'Anyone turning notes into tidy records'],
      objectives: [
        'Extract fields reliably into a defined schema',
        'Never save output that fails validation',
        'Make the model’s output reviewable before it is accepted',
      ],
      constraints: ['Model output can be wrong or malformed', 'Sensitive text should not be logged or retained unnecessarily'],
      features: ['Schema-driven extraction', 'Validation with clear error messages', 'Side-by-side review of source and result', 'Retry and error handling'],
      architecture: {
        caption: 'Extraction pipeline. The model never writes to storage directly.',
        nodes: [
          { id: 'ui', label: 'Review UI', detail: 'Paste, review, accept', tier: 0, domain: 'product' },
          { id: 'api', label: 'FastAPI', detail: 'Input limits, prompt assembly', tier: 1, domain: 'product' },
          { id: 'llm', label: 'Language model API', detail: 'Structured response', tier: 2, domain: 'data' },
          { id: 'val', label: 'Schema validation', detail: 'Pydantic models', tier: 2, domain: 'security' },
          { id: 'store', label: 'Accepted records', detail: 'Only after review', tier: 3, domain: 'data' },
        ],
        edges: [
          { from: 'ui', to: 'api' },
          { from: 'api', to: 'llm' },
          { from: 'llm', to: 'val' },
          { from: 'val', to: 'store', label: 'user accepts' },
        ],
      },
      decisions: [
        { title: 'Human in the loop', body: 'Results are proposed, not saved. The user confirms each record, which keeps errors visible and correctable.' },
        { title: 'Validate, don’t trust', body: 'Every response is parsed against a schema; anything that fails is shown as an error instead of being silently fixed.' },
      ],
      security: ['API key held server-side only', 'Input size limits and basic prompt-injection awareness', 'No retention of submitted text beyond the request'],
      challenges: ['Designing prompts that produce consistent structure', 'Explaining validation failures in plain language'],
      testing: ['Fixture texts with known expected output', 'Malformed-response tests for the validator'],
      statusNote: 'Concept. This page describes the planned design; nothing here is deployed yet.',
      lessons: [],
      next: ['Build a first working prototype', 'Add confidence highlighting per field'],
    },
  },
  {
    slug: 'defensive-security-lab',
    title: 'Defensive security lab',
    category: 'Cybersecurity',
    summary:
      'A home lab for practising log analysis, detection rules and incident write-ups — using simulated data in an isolated environment, not production systems.',
    domain: 'security',
    status: 'in-development',
    tech: ['Python', 'Linux', 'Log analysis', 'Detection rules'],
    featured: true,
    preview: 'security',
    repoUrl: null,
    liveUrl: null,
    caseStudy: {
      overview:
        'An isolated lab environment used to practise defensive security skills: collecting logs, writing detection rules, investigating simulated incidents and documenting findings.',
      problem:
        'Defensive skills are learned by doing, but practising on real systems is neither safe nor appropriate. A self-contained lab with simulated activity makes deliberate practice possible.',
      users: ['Myself, as a structured learning environment', 'Reviewers who want to see how I investigate and document'],
      objectives: ['Practise reading and correlating logs', 'Write and tune simple detection rules', 'Produce clear incident write-ups with remediation steps'],
      constraints: ['All activity is simulated and contained in the lab', 'No real user data or third-party systems'],
      features: ['Log collection from lab machines', 'Python scripts for parsing and summarising logs', 'Detection rules for common suspicious patterns', 'Incident write-up template'],
      architecture: {
        caption: 'Lab layout. Everything runs on an isolated network.',
        nodes: [
          { id: 'hosts', label: 'Lab machines', detail: 'Linux VMs generating activity', tier: 0, domain: 'product' },
          { id: 'collect', label: 'Log collection', detail: 'Central log store', tier: 1, domain: 'data' },
          { id: 'parse', label: 'Python tooling', detail: 'Parse, filter, summarise', tier: 2, domain: 'data' },
          { id: 'rules', label: 'Detection rules', detail: 'Pattern-based alerts', tier: 2, domain: 'security' },
          { id: 'report', label: 'Findings', detail: 'Write-up and remediation', tier: 3, domain: 'security' },
        ],
        edges: [
          { from: 'hosts', to: 'collect' },
          { from: 'collect', to: 'parse' },
          { from: 'collect', to: 'rules' },
          { from: 'rules', to: 'report' },
          { from: 'parse', to: 'report' },
        ],
      },
      decisions: [
        { title: 'Isolated by design', body: 'The lab has no route to other networks, so experiments cannot affect anything outside it.' },
        { title: 'Write it up every time', body: 'Each exercise ends with a short write-up, because communicating findings is as important as finding them.' },
      ],
      security: ['Simulated data only', 'Lab credentials are unique and disposable', 'No publication of anything that could aid misuse'],
      challenges: ['Generating realistic but safe activity', 'Reducing noisy alerts without missing real signals'],
      testing: ['Replaying known simulated events to confirm rules fire', 'Checking rules against normal activity for false positives'],
      statusNote: 'Ongoing learning project in a simulated environment. Not a production security service.',
      lessons: ['Good logging decisions upstream make investigation far easier downstream'],
      next: ['Add network traffic capture exercises', 'Publish sanitised write-ups'],
    },
  },
  {
    slug: 'ai-business-automation',
    title: 'AI-assisted business automation',
    category: 'Workflow automation',
    summary:
      'Routes incoming requests automatically: read, classify with an AI model, extract the details and hand off to the right place — with a person reviewing edge cases.',
    domain: 'data',
    status: 'concept',
    tech: ['Python', 'REST APIs', 'LLM API', 'Webhooks'],
    featured: true,
    preview: 'automation',
    repoUrl: null,
    liveUrl: null,
    caseStudy: {
      overview: 'A concept for automating a repetitive intake process by chaining small, testable steps, with AI used only where rules fall short.',
      problem: 'Many teams spend hours sorting the same kinds of requests by hand: reading, deciding where they go and copying details across systems.',
      users: ['Small teams handling inbound requests', 'Operations staff maintaining the workflow'],
      objectives: ['Remove repetitive sorting work', 'Keep every automated decision explainable', 'Send uncertain cases to a person'],
      constraints: ['Automation must fail safely', 'Integrations change, so each step must be replaceable'],
      features: ['Trigger from email or webhook', 'Rules first, AI classification second', 'Structured data extraction', 'Review queue for low-confidence items', 'Notifications on hand-off'],
      architecture: {
        caption: 'Each step is small and replaceable.',
        nodes: [
          { id: 'in', label: 'Trigger', detail: 'Email or webhook', tier: 0, domain: 'product' },
          { id: 'rules', label: 'Rules', detail: 'Cheap, predictable checks', tier: 1, domain: 'product' },
          { id: 'ai', label: 'AI classify', detail: 'Only when rules can’t decide', tier: 2, domain: 'data' },
          { id: 'review', label: 'Review queue', detail: 'Low confidence goes to a person', tier: 3, domain: 'security' },
          { id: 'out', label: 'Destination', detail: 'API call + notification', tier: 3, domain: 'data' },
        ],
        edges: [
          { from: 'in', to: 'rules' },
          { from: 'rules', to: 'ai' },
          { from: 'ai', to: 'out', label: 'confident' },
          { from: 'ai', to: 'review', label: 'unsure' },
        ],
      },
      decisions: [{ title: 'Rules before models', body: 'Deterministic rules handle the obvious cases cheaply; the model is reserved for the ambiguous ones.' }],
      security: ['Credentials for each integration stored server-side with least privilege', 'Audit log of every automated decision'],
      challenges: ['Choosing a confidence threshold that balances effort and accuracy'],
      testing: ['Sample request sets with expected routes', 'Failure tests for each integration'],
      statusNote: 'Concept. This page describes the planned design; nothing here is deployed yet.',
      lessons: [],
      next: ['Prototype with one real intake source'],
    },
  },

  /* ------------------------------------------------------------------------------
   * TEMPLATE — not shown (featured: false). Copy this block to add a project.
   * ---------------------------------------------------------------------------- */
  {
    slug: 'business-web-application',
    title: 'Business web application',
    category: 'E-commerce',
    summary:
      'An online storefront with product management, ordering and an admin area — a template entry, hidden until you build it.',
    domain: 'product',
    status: 'concept',
    tech: ['Angular', 'FastAPI', 'MySQL'],
    featured: false,
    preview: 'commerce',
    repoUrl: null,
    liveUrl: null,
    caseStudy: {
      overview: 'Describe what the application is in two or three sentences.',
      problem: 'What problem does it solve, and for whom?',
      users: ['Who uses it'],
      objectives: ['What it needs to achieve'],
      constraints: ['Limits you designed around'],
      features: ['Product catalogue', 'Cart and ordering', 'Admin area'],
      decisions: [{ title: 'A decision you made', body: 'Why you made it and what you traded off.' }],
      security: ['How you protected users and data'],
      challenges: ['What was hard'],
      testing: ['How you checked it works'],
      statusNote: 'Describe the current state honestly.',
      lessons: ['What you would do differently'],
      next: ['What comes next'],
    },
  },
];

export const featuredProjects = (): Project[] => projects.filter((p) => p.featured);

export const projectBySlug = (slug: string): Project | undefined => projects.find((p) => p.slug === slug);
