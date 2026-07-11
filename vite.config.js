import { defineConfig } from 'vite';
import {
  derived,
  renderTreatmentIndex,
  renderTreatmentPanels,
  renderFormacao,
  renderSchema,
} from './src/site.data.js';

/**
 * Injeta os dados de src/site.data.js no index.html em build/serve.
 * Tokens escalares: {{chave}} · Blocos gerados: {{@nome}}
 */
function siteDataPlugin() {
  return {
    name: 'site-data-inject',
    transformIndexHtml(html) {
      const d = derived();
      const blocks = {
        '@tratamentos_index': renderTreatmentIndex(),
        '@tratamentos_panels': renderTreatmentPanels(),
        '@formacao': renderFormacao(),
        '@schema': renderSchema(),
      };
      let out = html;
      for (const [key, value] of Object.entries(blocks)) {
        out = out.replaceAll(`{{${key}}}`, value);
      }
      out = out.replace(/\{\{([\w.]+)\}\}/g, (m, path) => {
        const value = path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), d);
        if (value == null) {
          console.warn(`[site-data] token não encontrado: ${path}`);
          return '';
        }
        return String(value);
      });
      return out;
    },
  };
}

export default defineConfig({
  plugins: [siteDataPlugin()],
  build: {
    target: 'es2020',
    cssTarget: 'safari15',
  },
});
