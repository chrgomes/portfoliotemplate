import type { Project, Decision, Architecture, DataModel, ProjectStatus } from '../content/types';

/**
 * The reusable case-study template: which sections appear, in what order, with what title.
 * Empty sections are skipped, so a new project only fills in what it has.
 * Both the Angular page and the static builder render from this list.
 */
export type CaseSection =
  | { id: string; title: string; kind: 'lede' | 'text'; text: string }
  | { id: string; title: string; kind: 'list'; items: string[] }
  | { id: string; title: string; kind: 'tags'; items: string[] }
  | { id: string; title: string; kind: 'architecture'; architecture: Architecture }
  | { id: string; title: string; kind: 'data-model'; dataModel: DataModel }
  | { id: string; title: string; kind: 'decisions'; decisions: Decision[] }
  | { id: string; title: string; kind: 'status'; status: ProjectStatus; text: string };

export function caseStudySections(p: Project): CaseSection[] {
  const cs = p.caseStudy;
  const out: CaseSection[] = [];
  const list = (id: string, title: string, items: string[]) => {
    if (items.length) out.push({ id, title, kind: 'list', items });
  };

  out.push({ id: 'overview', title: 'Overview', kind: 'lede', text: cs.overview });
  out.push({ id: 'problem', title: 'The problem', kind: 'text', text: cs.problem });
  list('users', 'Who it’s for', cs.users);
  list('objectives', 'Objectives', cs.objectives);
  list('constraints', 'Requirements and constraints', cs.constraints);
  list('features', 'Key features', cs.features);
  out.push({ id: 'stack', title: 'Technical stack', kind: 'tags', items: p.tech });
  if (cs.architecture) out.push({ id: 'architecture', title: 'Architecture', kind: 'architecture', architecture: cs.architecture });
  if (cs.dataModel) out.push({ id: 'data-model', title: 'Database design', kind: 'data-model', dataModel: cs.dataModel });
  if (cs.decisions.length) out.push({ id: 'decisions', title: 'Implementation decisions', kind: 'decisions', decisions: cs.decisions });
  list('security', 'Security considerations', cs.security);
  list('challenges', 'Challenges', cs.challenges);
  list('testing', 'Testing approach', cs.testing);
  out.push({ id: 'status', title: 'Current status', kind: 'status', status: p.status, text: cs.statusNote });
  list('lessons', 'Lessons learned', cs.lessons);
  list('next', 'Future improvements', cs.next);
  return out;
}

export const pad2 = (n: number): string => String(n).padStart(2, '0');
