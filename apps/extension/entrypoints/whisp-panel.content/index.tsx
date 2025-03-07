import { createRoot } from 'react-dom/client';
import WhispPanelApp from './whisp-panel-app';
export default defineContentScript({
  registration: 'runtime',
  matches: [],
  cssInjectionMode: 'ui',
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'side-panel',
      position: 'inline',
      anchor: 'body',
      onMount(container, shadow) {
        // To ensure that a site's font size doesn't mess with our panel
        // All styling for our tailwind willl have to be in <em> tags
        const style = document.createElement('style');
        style.textContent = `
          :host {
            font-size: 16px !important;
          }
        `;
        shadow.appendChild(style);

        container.style.position = 'relative';
        container.style.zIndex = '100000';

        const app = document.createElement('div');
        const root = createRoot(app);
        root.render(<WhispPanelApp />);

        container.append(app);
        return { root };
      },
      onRemove: async (elements) => {
        elements?.root.unmount();
      },
    });

    ui.mount();

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.action === 'whisp-panel-content-script-loaded') {
        sendResponse(true);
      }
    });
  },
});
