import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: ({ browser }) => ({
    name: 'Whisp',
    permissions: ['activeTab', 'scripting'],
    web_accessible_resources: [
      {
        resources: ['content-scripts/whisp-panel.css'],
        matches: ['<all_urls>'],
      },
      {
        resources: ['content-scripts/whisp-panel.js'],
        matches: ['<all_urls>'],
      },
    ],
    commands: {
      'start-recording': {
        description: 'Start recording audio',
        suggested_key: {
          default: 'Ctrl+Shift+X',
          mac: 'Command+Shift+X',
        },
      },
    },
  }),
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
