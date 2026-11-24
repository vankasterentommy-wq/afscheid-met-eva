import type { Settings } from './data';

/** Splitst een tekstvak in alinea's (lege regel = nieuwe alinea). */
export const paras = (t?: string | null): string[] =>
  (t ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/** Splitst op enkele regeleinden (voor titels met <br>). */
export const lines = (t?: string | null): string[] => (t ?? '').split(/\n/).map((l) => l.trim()).filter(Boolean);

export const telHref = (s?: Settings | null) => `tel:${s?.contact?.telefoonLink ?? ''}`;
export const waHref = (s?: Settings | null) => `https://wa.me/${s?.contact?.whatsapp ?? ''}`;
/** Placeholder-adressen als [info@…] krijgen een mailto zonder haakjes. */
export const mailHref = (s?: Settings | null) => `mailto:${(s?.contact?.email ?? '').replace(/[[\]]/g, '')}`;

export interface KnopLike {
  tekst?: string | null;
  soort?: string | null;
  link?: string | null;
  stijl?: string | null;
}

export const knopHref = (k: KnopLike, s?: Settings | null): string => {
  if (k.soort === 'bellen') return telHref(s);
  if (k.soort === 'whatsapp') return waHref(s);
  return safeUrl(k.link) || '/';
};

/** Alleen veilige links (geen javascript: e.d.). */
export const safeUrl = (u?: string | null): string => {
  const v = (u ?? '').trim();
  if (!v) return '';
  if (/^(\/|#|https?:|mailto:|tel:)/i.test(v)) return v;
  return '';
};

export const bgClass = (a?: string | null) => (a === 'wit' ? 'white' : a === 'blush' ? 'blush' : undefined);

export const isActive = (link: string | null | undefined, path: string) => {
  const l = (link ?? '').replace(/\/$/, '');
  const p = path.replace(/\.html$/, '').replace(/\/$/, '');
  return !!l && l !== '' && (p === l || p.startsWith(l + '/'));
};
