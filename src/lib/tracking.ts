/**
 * Google Analytics 4 / Google Ads. Alles staat UIT zolang er geen ID is ingevuld.
 * De ID's zijn environment variables bij Netlify (niet in Tina), zodat alleen Tommy ze beheert:
 *   PUBLIC_GA4_ID              bv. G-XXXXXXXXXX
 *   PUBLIC_GOOGLE_ADS_ID       bv. AW-123456789
 *   PUBLIC_ADS_LABEL_BEL       conversielabel voor klik op een belknop
 *   PUBLIC_ADS_LABEL_WHATSAPP  conversielabel voor klik op WhatsApp
 *   PUBLIC_ADS_LABEL_FORMULIER conversielabel voor een verstuurd contactformulier
 * Na het wijzigen van een ID bij Netlify: opnieuw deployen.
 */
const clean = (v: unknown) => (typeof v === 'string' && /^[A-Za-z0-9_-]+$/.test(v.trim()) ? v.trim() : '');

export const tracking = {
  ga4: clean(import.meta.env.PUBLIC_GA4_ID),
  ads: clean(import.meta.env.PUBLIC_GOOGLE_ADS_ID),
  labels: {
    bel: clean(import.meta.env.PUBLIC_ADS_LABEL_BEL),
    whatsapp: clean(import.meta.env.PUBLIC_ADS_LABEL_WHATSAPP),
    formulier: clean(import.meta.env.PUBLIC_ADS_LABEL_FORMULIER),
  },
};

export const trackingAan = !!(tracking.ga4 || tracking.ads);
