import copy from '@/lib/konsadem-copy.json';

/** Lines of a copy section that sit between two headings. */
export function between(lines: string[], from: string, to?: string) {
  const start = lines.indexOf(from);
  const end = to ? lines.indexOf(to) : -1;
  return lines.slice(start + 1, end === -1 ? undefined : end).filter((l) => !l.startsWith('Heading:'));
}

/** "Label. Rest of the sentence." → ['Label', 'Rest of the sentence.'] */
export function lead(line: string): [string, string] {
  const i = line.indexOf('. ');
  return i === -1 ? [line, ''] : [line.slice(0, i), line.slice(i + 2)];
}

export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Project detail → the "Client · Place · Years" facts and the prose that follows them. */
export function projectParts(detail: string) {
  const lastSeparator = detail.lastIndexOf(' · ');
  const end = detail.indexOf('. ', Math.max(0, lastSeparator));
  if (end === -1) return { meta: detail.replace(/\.$/, '').split(' · '), description: '' };
  return { meta: detail.slice(0, end).split(' · '), description: detail.slice(end + 2) };
}

export const leadership = between(copy.about, 'Leadership', 'Tools and technology').map((line) => {
  const end = line.indexOf('. ', line.indexOf(','));
  const [name, ...role] = line.slice(0, end).split(', ');
  return { name, role: role.join(', '), bio: line.slice(end + 2) };
});

export const values = between(copy.about, 'Our values', 'Leadership').map(lead);
export const story = between(copy.about, 'Our story', 'Mission').map(lead);
export const reasons = between(copy.why, 'Six reasons', 'Who we work for').map((l) => lead(l.replace(/^\d+\.\s*/, '')));
export const clients = between(copy.why, 'Who we work for', 'Pull quote').map(lead);
export const pullQuote = (between(copy.why, 'Pull quote')[0] || '').replace(/^"|"$/g, '');

const officeLines = between(copy.contact, 'Offices', 'Footer').slice(2, 10);
export const offices = officeLines.filter((_, i) => i % 2 === 0).map((name, i) => ({ name, address: officeLines[i * 2 + 1] }));
export const phones = ['+234 803 326 1692', '+234 802 894 9960', '+234 901 776 1044', '+250 782 087 000'];
