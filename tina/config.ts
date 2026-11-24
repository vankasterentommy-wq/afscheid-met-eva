import { defineConfig } from 'tinacms';
import type { Template, TinaField } from 'tinacms';

/* ------------------------------------------------------------------
   Afscheid met Eva – TinaCMS-schema
   Eva kan alle teksten, foto's en blokken aanpassen.
   Ontwerpkeuzes (kleuren, lettertypes, maten, uitsnedes) staan vast in
   de code; velden met ui.component 'hidden' zijn niet zichtbaar in Tina.
------------------------------------------------------------------- */

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.HEAD || // Netlify
  process.env.VERCEL_GIT_COMMIT_REF ||
  'main';

const hidden = { component: 'hidden' } as const;

const txt = (name: string, label: string, description?: string): TinaField => ({
  type: 'string',
  name,
  label,
  ...(description ? { description } : {}),
});

const area = (name: string, label: string, description?: string): TinaField => ({
  type: 'string',
  name,
  label,
  ui: { component: 'textarea' },
  ...(description ? { description } : {}),
});

const alinea = (name = 'tekst', label = 'Tekst'): TinaField =>
  area(name, label, 'Laat een lege regel tussen alinea’s.');

const lijst = (name = 'lijst', label = 'Opsomming'): TinaField => ({
  type: 'string',
  name,
  label,
  list: true,
});

const foto = (name = 'foto', label = 'Foto'): TinaField[] => [
  { type: 'image', name, label },
  txt(`${name}Alt`, 'Omschrijving van de foto', 'Korte beschrijving voor slechtzienden en Google.'),
  { type: 'string', name: `${name}Positie`, label: 'Uitsnede', ui: hidden },
];

const achtergrond: TinaField = {
  type: 'string',
  name: 'achtergrond',
  label: 'Achtergrond',
  options: [
    { value: 'ivoor', label: 'Ivoor' },
    { value: 'wit', label: 'Wit' },
    { value: 'blush', label: 'Blush (zacht roze)' },
  ],
};

const knoppen = (name = 'knoppen', label = 'Knoppen'): TinaField => ({
  type: 'object',
  name,
  label,
  list: true,
  ui: {
    itemProps: (item: Record<string, string>) => ({ label: item?.tekst || 'Knop' }),
    defaultItem: { tekst: 'Bel Eva', soort: 'bellen', stijl: 'primair' },
  },
  fields: [
    txt('tekst', 'Knoptekst'),
    {
      type: 'string',
      name: 'soort',
      label: 'Wat doet de knop?',
      options: [
        { value: 'bellen', label: 'Bellen (telefoonnummer uit Instellingen)' },
        { value: 'whatsapp', label: 'WhatsApp (nummer uit Instellingen)' },
        { value: 'link', label: 'Naar een pagina of website' },
      ],
    },
    txt('link', 'Link', 'Alleen bij “Naar een pagina”: bijvoorbeeld /contact'),
    {
      type: 'string',
      name: 'stijl',
      label: 'Uitstraling',
      options: [
        { value: 'primair', label: 'Gevuld (bordeaux)' },
        { value: 'secundair', label: 'Omlijnd' },
      ],
    },
  ],
});

const linkVeld = (name = 'link', label = 'Tekstlink'): TinaField => ({
  type: 'object',
  name,
  label,
  fields: [txt('tekst', 'Linktekst'), txt('url', 'Link naar', 'Bijvoorbeeld /over-eva')],
});

const variant = (name = 'variant'): TinaField => ({ type: 'string', name, label: 'Variant', ui: hidden });

const kaartVelden: TinaField[] = [
  txt('label', 'Klein label boven de titel'),
  txt('titel', 'Titel'),
  txt('prijs', 'Prijs'),
  alinea('tekst', 'Tekst'),
  lijst('lijst', 'Opsomming'),
  { type: 'boolean', name: 'alsLabels', label: 'Opsomming tonen als losse labels (tegels)' },
  area('noot', 'Kleine noot onderaan'),
];

const tekstKaarten: TinaField = {
  type: 'object',
  name: 'kaarten',
  label: 'Kaarten',
  list: true,
  ui: { itemProps: (item: Record<string, string>) => ({ label: item?.titel || item?.label || 'Kaart' }) },
  fields: kaartVelden,
};

/* ----------------------------- Blokken ----------------------------- */

const hero: Template = {
  name: 'hero',
  label: 'Openingsblok (home)',
  fields: [
    txt('eyebrow', 'Klein kopje boven de titel'),
    txt('titel', 'Titel'),
    area('tekst', 'Tekst'),
    knoppen(),
    lijst('usps', 'Korte punten onder de knoppen'),
    ...foto(),
    { type: 'image', name: 'badge', label: 'Rond embleem bij de foto' },
  ],
};

const paginakop: Template = {
  name: 'paginakop',
  label: 'Paginakop',
  fields: [
    txt('eyebrow', 'Klein kopje boven de titel'),
    txt('titel', 'Titel'),
    area('intro', 'Introductietekst'),
    txt('label', 'Label onder de tekst (optioneel)', 'Bijvoorbeeld “Kosteloos en vrijblijvend”'),
  ],
};

const fotoTekst: Template = {
  name: 'fotoTekst',
  label: 'Foto + tekst',
  fields: [
    achtergrond,
    { type: 'boolean', name: 'fotoRechts', label: 'Foto rechts (op computerscherm)' },
    ...foto(),
    txt('eyebrow', 'Klein kopje boven de titel'),
    area('titel', 'Titel'),
    alinea('tekst', 'Tekst'),
    lijst('lijst', 'Opsomming'),
    lijst('chips', 'Labels (tegels)'),
    alinea('tekstNa', 'Tekst na de labels'),
    knoppen(),
    linkVeld(),
    variant(),
  ],
};

const kaarten: Template = {
  name: 'kaarten',
  label: 'Fotokaarten (swipebaar op mobiel)',
  fields: [
    txt('eyebrow', 'Klein kopje boven de titel'),
    area('titel', 'Titel', 'Elke nieuwe regel wordt ook een nieuwe regel op de site.'),
    area('intro', 'Introductietekst'),
    {
      type: 'object',
      name: 'kaarten',
      label: 'Kaarten',
      list: true,
      ui: { itemProps: (item: Record<string, string>) => ({ label: item?.titel || 'Kaart' }) },
      fields: [
        ...foto(),
        txt('titel', 'Titel'),
        txt('subtitel', 'Subtitel'),
        area('tekst', 'Tekst'),
        lijst('lijst', 'Opsomming'),
        txt('link', 'Link (hele kaart klikbaar)', 'Bijvoorbeeld /kosten. Laat leeg als de kaart niet klikbaar is.'),
      ],
    },
  ],
};

const belkaart: TinaField = {
  type: 'object',
  name: 'belkaart',
  label: 'Belkaart (bordeaux)',
  fields: [
    { type: 'boolean', name: 'toon', label: 'Belkaart tonen' },
    { type: 'boolean', name: 'metFoto', label: 'Met foto en naam van Eva' },
    { type: 'image', name: 'foto', label: 'Foto van Eva' },
    txt('naam', 'Naam'),
    txt('functie', 'Functie'),
    txt('label', 'Kopje boven het telefoonnummer'),
    knoppen(),
  ],
};

const stappenKort: Template = {
  name: 'stappenKort',
  label: 'Stappen + belkaart',
  fields: [
    txt('eyebrow', 'Klein kopje boven de titel'),
    txt('titel', 'Titel'),
    {
      type: 'object',
      name: 'stappen',
      label: 'Stappen',
      list: true,
      ui: { itemProps: (item: Record<string, string>) => ({ label: item?.titel || 'Stap' }) },
      fields: [txt('titel', 'Titel'), area('tekst', 'Tekst')],
    },
    linkVeld(),
    belkaart,
  ],
};

const stappen: Template = {
  name: 'stappen',
  label: 'Stappen (genummerd, inklapbaar)',
  fields: [
    belkaart,
    txt('titel', 'Titel'),
    txt('hint', 'Hulptekst (alleen mobiel)'),
    {
      type: 'object',
      name: 'stappen',
      label: 'Stappen',
      list: true,
      ui: { itemProps: (item: Record<string, string>) => ({ label: item?.titel || 'Stap' }) },
      fields: [txt('titel', 'Titel'), alinea('tekst', 'Uitleg'), area('noot', 'Kleine noot (schuingedrukt)')],
    },
    {
      type: 'object',
      name: 'checklist',
      label: 'Checklist-kaart ernaast',
      fields: [txt('titel', 'Titel'), lijst('lijst', 'Opsomming'), area('noot', 'Kleine noot onderaan')],
    },
    ...foto('foto', 'Foto onder de checklist (alleen computerscherm)'),
  ],
};

const checklist: Template = {
  name: 'checklist',
  label: 'Checklist-kaarten',
  fields: [
    achtergrond,
    txt('eyebrow', 'Klein kopje boven de titel'),
    txt('titel', 'Titel'),
    area('intro', 'Introductietekst'),
    tekstKaarten,
    {
      type: 'object',
      name: 'band',
      label: 'Balk met knop onderaan',
      fields: [area('tekst', 'Tekst'), txt('knopTekst', 'Knoptekst'), txt('knopLink', 'Knop link', 'Bijvoorbeeld /contact')],
    },
  ],
};

const tarieven: Template = {
  name: 'tarieven',
  label: 'Tarieven',
  fields: [
    achtergrond,
    txt('eyebrow', 'Klein kopje boven de titel'),
    txt('titel', 'Titel'),
    area('intro', 'Introductietekst'),
    {
      type: 'object',
      name: 'pakketten',
      label: 'Pakketten (de middelste wordt uitgelicht)',
      list: true,
      ui: { itemProps: (item: Record<string, string>) => ({ label: item?.naam || 'Pakket' }) },
      fields: [txt('naam', 'Naam'), txt('prijs', 'Prijs'), area('tekst', 'Omschrijving')],
    },
    area('noot', 'Tekst onder de pakketten'),
    tekstKaarten,
  ],
};

const faq: Template = {
  name: 'faq',
  label: 'Veelgestelde vragen',
  fields: [
    achtergrond,
    txt('eyebrow', 'Klein kopje boven de titel'),
    txt('titel', 'Titel'),
    {
      type: 'object',
      name: 'vragen',
      label: 'Vragen',
      list: true,
      ui: { itemProps: (item: Record<string, string>) => ({ label: item?.vraag || 'Vraag' }) },
      fields: [
        txt('vraag', 'Vraag'),
        alinea('antwoord', 'Antwoord'),
        txt('linkTekst', 'Linktekst onder het antwoord (optioneel)'),
        txt('linkUrl', 'Link naar', 'Bijvoorbeeld /voor-overlijden'),
      ],
    },
  ],
};

const citaat: Template = {
  name: 'citaat',
  label: 'Citaatband (bordeaux)',
  fields: [area('citaat', 'Citaat'), txt('naam', 'Naam onder het citaat'), area('toelichting', 'Toelichting onder het citaat')],
};

const ervaringen: Template = {
  name: 'ervaringen',
  label: 'Ervaringen',
  fields: [
    {
      type: 'object',
      name: 'infokaart',
      label: 'Infokaart ervoor (optioneel)',
      fields: [txt('eyebrow', 'Klein kopje'), txt('titel', 'Titel'), area('tekst', 'Tekst')],
    },
    {
      type: 'object',
      name: 'ervaringen',
      label: 'Ervaringen',
      list: true,
      ui: { itemProps: (item: Record<string, string>) => ({ label: item?.naam || 'Ervaring' }) },
      fields: [
        txt('label', 'Klein kopje'),
        area('citaat', 'Ervaring (zonder aanhalingstekens)'),
        txt('naam', 'Naam en plaats'),
      ],
    },
  ],
};

const contact: Template = {
  name: 'contact',
  label: 'Contactkaart + formulier',
  fields: [
    txt('belTekst', 'Tekst bij telefoonnummer'),
    txt('whatsappTitel', 'Titel WhatsApp'),
    txt('whatsappTekst', 'Tekst bij WhatsApp'),
    txt('emailTekst', 'Tekst bij e-mailadres'),
    txt('gebiedTekst', 'Tekst bij werkgebied'),
    ...foto('foto', 'Foto (alleen computerscherm)'),
    txt('formTitel', 'Titel formulier'),
    txt('formVraag', 'Vraag boven de keuzes'),
    lijst('onderwerpen', 'Keuzes'),
    txt('labelNaam', 'Label naam'),
    txt('labelTelefoon', 'Label telefoon'),
    txt('labelEmail', 'Label e-mail'),
    txt('labelBericht', 'Label bericht'),
    txt('knopTekst', 'Knoptekst'),
    area('formNoot', 'Tekst onder de knop'),
  ],
};

const tekst: Template = {
  name: 'tekst',
  label: 'Tekst (leeskolom)',
  fields: [achtergrond, txt('eyebrow', 'Klein kopje boven de titel'), txt('titel', 'Titel'), alinea('tekst', 'Tekst')],
};

/* ----------------------------- Config ----------------------------- */

export default defineConfig({
  branch,
  clientId: process.env.TINA_CLIENT_ID || process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'img',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'pagina',
        label: 'Pagina’s',
        path: 'content/pages',
        format: 'json',
        ui: {
          allowedActions: { create: true, delete: true },
          router: ({ document }) => {
            const slug = document._sys.filename;
            return slug === 'home' ? '/' : `/${slug}`;
          },
        },
        fields: [
          {
            type: 'object',
            name: 'seo',
            label: 'Google & WhatsApp-voorbeeld',
            fields: [
              txt('titel', 'Paginatitel', 'Wordt getoond in Google en in het tabblad.'),
              area('omschrijving', 'Omschrijving', 'Korte samenvatting (ongeveer 150 tekens) voor Google en WhatsApp.'),
            ],
          },
          {
            type: 'object',
            name: 'blokken',
            label: 'Blokken',
            list: true,
            ui: { visualSelector: true },
            templates: [
              hero,
              paginakop,
              fotoTekst,
              kaarten,
              stappenKort,
              stappen,
              checklist,
              tarieven,
              faq,
              citaat,
              ervaringen,
              contact,
              tekst,
            ],
          },
        ],
      },
      {
        name: 'instellingen',
        label: 'Instellingen',
        path: 'content/settings',
        format: 'json',
        match: { include: 'site' },
        ui: {
          global: true,
          allowedActions: { create: false, delete: false },
        },
        fields: [
          {
            type: 'object',
            name: 'contact',
            label: 'Contactgegevens',
            fields: [
              txt('telefoon', 'Telefoonnummer (zoals getoond)', 'Bijvoorbeeld 06 51 58 73 26'),
              txt('telefoonLink', 'Telefoonnummer internationaal', 'Bijvoorbeeld +31651587326 (zonder spaties)'),
              txt('whatsapp', 'WhatsApp-nummer', 'Internationaal zonder + en spaties, bijvoorbeeld 31651587326'),
              txt('email', 'E-mailadres'),
              txt('werkgebied', 'Werkgebied'),
              txt('bereikbaar', 'Bereikbaarheid', 'Bijvoorbeeld “Dag en nacht bereikbaar”'),
              txt('functie', 'Functie / keurmerk'),
            ],
          },
          {
            type: 'object',
            name: 'bedrijf',
            label: 'Bedrijfsgegevens',
            fields: [txt('naam', 'Bedrijfsnaam'), txt('kvk', 'KvK-nummer'), txt('btw', 'Btw-nummer')],
          },
          {
            type: 'object',
            name: 'menu',
            label: 'Menu',
            list: true,
            ui: { itemProps: (item: Record<string, string>) => ({ label: item?.tekst || 'Menu-item' }) },
            fields: [txt('tekst', 'Tekst'), txt('link', 'Link', 'Bijvoorbeeld /kosten')],
          },
          {
            type: 'object',
            name: 'knoppen',
            label: 'Vaste knopteksten',
            fields: [
              txt('bel247', 'Belknop in menu en onderbalk'),
              txt('belMet', 'Belknop met nummer (voor het nummer)', 'Bijvoorbeeld “Bel” → “Bel 06 51 58 73 26”'),
              txt('whatsapp', 'WhatsApp-knop in menu'),
              txt('whatsappKort', 'WhatsApp-knop in onderbalk'),
            ],
          },
          {
            type: 'object',
            name: 'callband',
            label: 'Belband onderaan elke pagina',
            fields: [txt('titel', 'Titel'), area('tekst', 'Tekst'), txt('knopBericht', 'Tekst tweede knop')],
          },
          {
            type: 'object',
            name: 'footer',
            label: 'Footer',
            fields: [
              area('tekst', 'Tekst onder het logo'),
              txt('kopContact', 'Kopje contact'),
              txt('kopMenu', 'Kopje menu'),
              txt('kopWerkgebied', 'Kopje werkgebied'),
              txt('copyright', 'Copyrightregel'),
              txt('privacy', 'Linktekst privacy'),
              txt('voorwaarden', 'Linktekst voorwaarden'),
            ],
          },
        ],
      },
    ],
  },
});
