# Afscheid met Eva – website (Astro + TinaCMS)

Statische Astro-site met TinaCMS visual editing, gehost op Netlify. Eva past teksten, foto's en blokken aan via `/admin`. Elke opslag wordt een commit in GitHub, en Netlify bouwt de site daarna automatisch opnieuw.

## Lokaal draaien

```bash
npm install                 # past ook automatisch een Windows-fix toe op de Tina-CLI (zie onder)
npm run dev                 # = tinacms dev -c "astro dev"
```

- Site: http://localhost:4321
- Beheer: http://localhost:4321/admin/index.html (lokale modus, geen login; opslaan schrijft direct in `content/`)

Productiebuild zonder TinaCloud: `npm run build:local`. Op Netlify draait `npm run build` (`tinacms build && astro build`).

## Structuur

| Map / bestand | Inhoud |
|---|---|
| `content/pages/*.json` | Teksten en foto's per pagina (één bestand per pagina, `blokken` in volgorde) |
| `content/settings/site.json` | Telefoon, WhatsApp, e-mail, KvK, btw, werkgebied, menu, footer, belband |
| `tina/config.ts` | Tina-schema: collecties **Pagina's** en **Instellingen**, alle bloktemplates (Nederlandse labels) |
| `src/components/blocks/` | Eén Astro-component per bloktype + `Blocks.astro` (dispatcher) |
| `src/components/layout/` | Header, Footer, vaste belbalk (Mbar) |
| `src/layouts/Base.astro` | `<head>` (SEO, OG/Twitter, JSON-LD, fonts), header/footer, scripts |
| `src/lib/islands.ts` + `src/pages/tina-island/[name].ts` | Bewerkbare regio's voor visual editing (on-demand Netlify Function) |
| `src/styles/global.css` | CSS uit de bron (mobile-first, desktop vanaf `min-width: 861px`), onderaan de aanvullingen |
| `public/img/` | Alle foto's (Tina-mediamap) |
| `scripts/` | Controles: `compare.mjs`, `css-equiv.mjs`, `checks.mjs`, `serve.mjs`, admin-tests |

De site is `output: 'static'`. Alleen `/tina-island/*` draait als functie, en alleen in de bewerkmodus van `/admin`.

## Deployen (Netlify + TinaCloud)

1. Push naar GitHub (privé-repo `afscheid-met-eva`).
2. TinaCloud (app.tina.io): project koppelen aan de repo, branch `main`. Neem de **Client ID** en een **read-only token** over.
3. Netlify: site importeren uit GitHub. `netlify.toml` regelt het build command en de publish-map. Zet deze environment variables:
   - `TINA_CLIENT_ID` = Client ID uit TinaCloud
   - `TINA_TOKEN` = read-only token uit TinaCloud
   - `SITE_URL` = definitieve domeinnaam (canonical, sitemap, OG-tags). Standaard `https://afscheidmeteva.nl`.
4. Netlify Forms: het formulier `contact` wordt automatisch gedetecteerd. Zet onder *Forms → Notifications* een e-mailmelding naar Eva.

Elke opslag in Tina maakt een commit, waarna Netlify automatisch een nieuwe build start (± 1–2 min).

## Nieuw bloktype toevoegen

1. **Schema**: maak in `tina/config.ts` een `Template` (bijv. `const video: Template = { name: 'video', label: 'Video', fields: [...] }`) en voeg het toe aan `templates` van het veld `blokken`. Geef velden Nederlandse labels. Ontwerpkeuzes horen niet in Tina; gebruik zo nodig `ui: { component: 'hidden' }`.
2. **Component**: maak `src/components/blocks/Video.astro`. Typ `data` met `PaginaBlokkenVideo` uit `tina/__generated__/types` (wordt gegenereerd door `tinacms dev`). Zet `data-tina-field={tinaField(d)}` op het root-element en `tinaField(d, 'veldnaam')` op elk bewerkbaar element.
3. **Dispatcher**: voeg in `Blocks.astro` een `case 'PaginaBlokkenVideo'` toe.
4. CSS in `global.css` (mobile-first, desktop in `@media (min-width: 861px)`).

## Google Analytics / Google Ads (staat uit tot er een ID is)

Er wordt niets van Google geladen en er verschijnt geen cookiemelding zolang deze environment variables bij Netlify leeg zijn. Na het invullen moet je opnieuw deployen (*Deploys → Trigger deploy*).

| Variable | Voorbeeld | Waarvoor |
|---|---|---|
| `PUBLIC_GA4_ID` | `G-XXXXXXXXXX` | Google Analytics 4 |
| `PUBLIC_GOOGLE_ADS_ID` | `AW-123456789` | Google Ads |
| `PUBLIC_ADS_LABEL_BEL` | `AbC-dEfGhI` | conversie: klik op een belknop (`tel:`) |
| `PUBLIC_ADS_LABEL_WHATSAPP` | | conversie: klik op een WhatsApp-link |
| `PUBLIC_ADS_LABEL_FORMULIER` | | conversie: bezoek aan `/bedankt` na het formulier |

- **Consent Mode v2, "basic":** de Google-tag laadt pas nadat iemand op *Akkoord* klikt. Kiest iemand *Liever niet*, dan wordt er niets geladen. Intrekken via *Cookie-instellingen* in de footer verwijdert de `_ga`/`_gcl`-cookies.
- De keuze wordt 12 maanden onthouden (localStorage). Daarna vraagt de site opnieuw.
- GA4-events: `bel_klik`, `whatsapp_klik`, `formulier_verstuurd`.
- Eva past de teksten van de melding aan in Tina (*Instellingen → Cookiemelding*). De ID's staan bewust niet in Tina.
- **Privacyverklaring:** zodra dit aanstaat, moet de verklaring een cookieparagraaf hebben (Google Analytics/Ads, doel, bewaartermijn, doorgifte naar de VS, intrekken van toestemming).
- Code: `src/lib/tracking.ts`, `src/components/layout/Consent.astro`. Test: `scripts/consent-test.mjs`.

## Controles (fase 4)

```bash
NETLIFY=true npm run build:local       # build met Netlify Image CDN-URL's
node scripts/serve.mjs dist 4500       # emuleert Netlify (pretty URLs, gzip, Image CDN)
node scripts/serve.mjs _bron 4501      # bron (uitgepakte zip in _bron/)
node scripts/compare.mjs               # screenshots 390/1440 bron ↔ nieuw + pixeldiff → _controle/
node scripts/css-equiv.mjs             # computed styles bron-CSS ↔ omgezette CSS (5 breedtes)
node scripts/checks.mjs                # overflow, tikvlakken, hero-knop, letterlijke tekstcontrole
```

## Aandachtspunten

- **Privacyverklaring (verplicht te vermelden):** inzendingen van het contactformulier worden verwerkt en opgeslagen via **Netlify Forms** (Netlify, Inc., VS), en meldingen gaan per e-mail naar Eva. De privacyverklaring (`content/pages/privacy.json`) noemt dit, inclusief het **IP-adres** en de Google-cookies (door Eva goedgekeurd).
- **Algemene voorwaarden: bewust (nog) geen pagina.** De pagina en de footerlink zijn weggehaald tot er tekst is. Terugzetten: maak `src/pages/voorwaarden.astro` (`<Page slug="voorwaarden" path="/voorwaarden" />`) en `content/pages/voorwaarden.json` (paginakop + tekstblok; zie git-historie, commit vóór "Voorwaarden-pagina tijdelijk weg"), en vul in Tina bij Instellingen → Footer de "Linktekst voorwaarden" in (leeg = geen link).
- **Nog te bevestigen:** `SITE_URL` blijft voorlopig `https://afscheidmeteva.nl` tot het domein vastligt.
- **Netlify-badge:** nieuwe projecten op het gratis plan tonen rechtsonder een "Powered by Netlify"-badge, die op mobiel over de WhatsApp-knop valt. Die is uitgezet via *Project configuration → General → Powered by Netlify badge*. Controleer dit na elke wijziging van het Netlify-plan of -project.
- **Huisstijl ligt vast:** de taupe subtitels op de kaarten zijn Eva's kleurkeuze. Lighthouse meldt daar een contrastwaarschuwing over; die laten we bewust staan.
- **Windows-fix**: `scripts/patch-tina-windows.mjs` (postinstall) repareert een bug in `@tinacms/cli` waardoor `tinacms dev/build` crasht als het projectpad een spatie bevat. Op Netlify doet het niets.
- **Foto's**: in de Netlify-build gaan foto's via de Netlify Image CDN (AVIF/WebP, srcset). Lokaal en in de bewerkpreview worden de originelen getoond. Alleen de hero-foto laadt eager.
- **Fonts**: Yeseva One en Jost zijn zelf gehost via `@fontsource` (geen Google-verbinding).
- **JSON-LD**: `FuneralHome` bestaat niet in schema.org, daarom gebruiken we `LocalBusiness`.
