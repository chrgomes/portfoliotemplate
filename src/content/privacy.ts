import { site } from './site.config';

/**
 * Privacy notice, shown at /privacy/.
 *
 * Every sentence here describes what the code actually does. If you add analytics, embed
 * third-party content, change the contact form, or change retention in contact-config.php,
 * update this file and the `updated` date. This is a plain-language notice, not legal advice.
 */

export interface PrivacySection {
  title: string;
  paragraphs?: string[];
  items?: string[];
}

/** Date this notice last changed, as YYYY-MM-DD. */
export const privacyUpdated = '2026-10-30';

const reach = (): string =>
  site.contact.email ? `email ${site.contact.email}` : 'use the contact form on the home page';

export function privacySections(): PrivacySection[] {
  return [
    {
      title: 'The short version',
      paragraphs: [
        'This site doesn’t use cookies, analytics, advertising or tracking of any kind, and it doesn’t load anything from other companies. The only personal information it handles is what you choose to send through the contact form.',
      ],
    },
    {
      title: 'What’s stored in your browser',
      paragraphs: [
        'If you use the light/dark switch to pick the theme your device isn’t using, your choice is saved in your browser’s local storage under the name “theme”, so the site remembers it next time. If your browser blocks storage, it’s kept only for the open tab instead. It never leaves your device and isn’t sent to me. Switch back to match your device and it’s removed. You can also clear it at any time by clearing this site’s data in your browser settings.',
      ],
    },
    {
      title: 'When you send a message',
      paragraphs: [
        'The contact form asks for your name, email address and message. I use them only to read and reply to your message, and never sell or share them.',
        'Your message is delivered to my email inbox and kept there as ordinary correspondence. It isn’t saved anywhere else on the website’s server, except in the case below.',
      ],
    },
    {
      title: 'Spam protection',
      paragraphs: ['To keep out automated spam, the form uses a few checks that run on this site’s own server, with no outside service:'],
      items: [
        'Your browser solves a small puzzle in the background before sending. It doesn’t collect anything about you or your device.',
        'To limit how many messages one connection can send, your IP address is stored only in scrambled, one-way form (a salted hash) and deleted within a day.',
        'Messages caught by the spam filter are kept in a private log on the server, so a real message flagged by mistake isn’t lost. These logs are deleted automatically after 30 days.',
      ],
    },
    {
      title: 'Hosting',
      paragraphs: [
        'Like almost every website, the web host records standard server logs, such as IP addresses, pages requested, browser type and time. These are used for security and keeping the site running, and are kept and deleted under the host’s own policies.',
      ],
    },
    {
      title: 'Your choices',
      paragraphs: [
        `You can ask what information I have from you, or ask me to correct or delete it. To do that, or with any question about this notice, ${reach()}.`,
      ],
    },
    {
      title: 'Changes',
      paragraphs: ['If how this site handles information changes, I’ll update this page and the date at the top.'],
    },
  ];
}
