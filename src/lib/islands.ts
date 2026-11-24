/**
 * Bewerkbare regio's voor Tina visual editing. De bridge haalt bij elke wijziging
 * in /admin de betreffende regio opnieuw op via /tina-island/<naam>.
 */
import type { IslandRegistry } from '@tinacms/astro/experimental';
import Blocks from '../components/blocks/Blocks.astro';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';
import Mbar from '../components/layout/Mbar.astro';
import { getPage, getSettings, type PageResult, type SettingsResult } from './data';
import { trackingAan } from './tracking';

const settingsOf = (d: unknown) => (d as SettingsResult | undefined)?.data?.instellingen ?? null;

export const islands: IslandRegistry = {
  page: {
    fetch: async (_req, params) => {
      const [page, settings] = await Promise.all([getPage(params.get('slug') ?? 'home'), getSettings()]);
      return { page, settings };
    },
    component: Blocks,
    wrapper: { tag: 'main' },
    propsFromData: (d) => {
      const x = d as { page?: PageResult; settings?: SettingsResult };
      return { page: x.page?.data?.pagina ?? null, settings: x.settings?.data?.instellingen ?? null };
    },
  },
  header: {
    fetch: () => getSettings(),
    component: Header,
    wrapper: { tag: 'header', className: 'bar' },
    propsFromData: (d, params) => ({ settings: settingsOf(d), path: params.get('path') ?? '/' }),
  },
  footer: {
    fetch: () => getSettings(),
    component: Footer,
    wrapper: { tag: 'footer' },
    propsFromData: (d) => ({ settings: settingsOf(d), cookies: trackingAan }),
  },
  mbar: {
    fetch: () => getSettings(),
    component: Mbar,
    wrapper: { tag: 'div', className: 'mbar' },
    propsFromData: (d) => ({ settings: settingsOf(d) }),
  },
};
