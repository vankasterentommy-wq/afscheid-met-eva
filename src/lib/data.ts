import { requestWithMetadata } from '@tinacms/astro';
import client from '../../tina/__generated__/client';

/** Pagina uit content/pages/<slug>.json (primaire Tina-form). */
export const getPage = (slug: string) =>
  requestWithMetadata(client.queries.pagina({ relativePath: `${slug}.json` }), { priority: 'primary' });

/** Instellingen uit content/settings/site.json. */
export const getSettings = () =>
  requestWithMetadata(client.queries.instellingen({ relativePath: 'site.json' }));

export type PageResult = Awaited<ReturnType<typeof getPage>>;
export type SettingsResult = Awaited<ReturnType<typeof getSettings>>;
export type PageData = NonNullable<PageResult['data']['pagina']>;
export type Settings = NonNullable<SettingsResult['data']['instellingen']>;
