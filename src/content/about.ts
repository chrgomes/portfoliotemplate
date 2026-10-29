import type { AboutContent } from './types';

/**
 * About section. Fill in institutions and years yourself — they are left blank rather
 * than guessed. Empty lists and blank fields are hidden automatically.
 */
export const about: AboutContent = {
  intro: [
    'I’m a technology professional with a background in computer systems, web development and digital strategy. My work spans full-stack engineering, AI-powered applications and cybersecurity.',
    'I like understanding how systems work, finding where they can be better, and turning ideas into useful digital products.',
    'Studying marketing and SEO alongside software means I think about who a product is for and how they will find it — not just how it is built.',
  ],
  education: [
    { title: 'Computer Systems Technology — Advanced Diploma', institution: '', year: '' },
    { title: 'Digital marketing', institution: '', year: '' },
    { title: 'SEO training', institution: '', year: '' },
  ],
  // Add certifications only once they are earned, e.g. { title: 'CompTIA Security+', year: '2026' }
  certifications: [],
  background: [
    // Add roles or freelance work you can verify, e.g. 'Freelance web developer — small business sites'
  ],
  learning: ['Defensive security and log analysis', 'Production-grade API design', 'Applied AI with structured, validated output'],
  interests: ['SaaS products', 'Secure application design', 'Workflow automation', 'Developer experience'],
};
