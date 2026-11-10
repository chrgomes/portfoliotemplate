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
    slug: 'ecommerce-parcel-shipping-platform',
    title: 'Ecommerce parcel shipping platform',
    category: 'Shipping platform',
    summary:
      'A website where customers get a quote, book and pay for parcel shipping, then track their parcel through to delivery.',
    domain: 'product',
    status: 'in-development',
    tech: ['Angular', 'TypeScript', 'FastAPI', 'MySQL'],
    featured: true,
    preview: 'parcel',
    repoUrl: null,
    liveUrl: null,
    caseStudy: {
      overview:
        'An ecommerce shipping platform where customers book and pay for parcel shipping online, from the first quote to tracking the delivery.',
      problem:
        'Customers sending a parcel want to see the price, book the shipment and pay in one place, then know where their parcel is without having to call anyone.',
      users: ['Customers booking and paying for parcel shipments', 'Administrators managing bookings'],
      objectives: [],
      constraints: [],
      features: ['Shipping quotes', 'Online booking and checkout', 'Shipping label printing', 'Parcel tracking', 'Admin dashboard'],
      decisions: [],
      security: [],
      challenges: [],
      testing: [],
      statusNote:
        'In development. Carrier and payment service integrations are still being built, and the feature set may change.',
      lessons: [],
      next: ['Carrier integration', 'Payment service integration'],
    },
  },
  {
    slug: 'baking-ecommerce-website',
    title: 'Baking ecommerce website',
    category: 'Ecommerce',
    summary: 'An online bakery where customers browse the menu, order and pay, built for the bakery owner to run sales online.',
    domain: 'product',
    status: 'in-development',
    tech: ['Angular', 'TypeScript', 'FastAPI', 'MySQL'],
    featured: true,
    preview: 'commerce',
    repoUrl: null,
    liveUrl: null,
    caseStudy: {
      overview:
        'An ecommerce website for a bakery, where customers order and pay online and the owner manages products and orders in one place.',
      problem: 'A bakery owner needs a way to take orders and payments online, and keep track of them, without handling everything by phone or in person.',
      users: ['Bakery owners selling online', 'Customers ordering and paying online'],
      objectives: [],
      constraints: [],
      features: ['Product menu', 'Cart and checkout', 'Custom cake orders', 'Pickup and delivery scheduling', 'Admin area for products and orders'],
      decisions: [],
      security: [],
      challenges: [],
      testing: [],
      statusNote: 'In development. The feature set may change as the build progresses.',
      lessons: [],
      next: [],
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
