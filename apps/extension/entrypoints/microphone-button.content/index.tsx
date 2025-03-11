import { createRoot } from 'react-dom/client';
import { MicrophoneButton } from './microphone-button';

export default defineContentScript({
  registration: 'manifest',
  matches: [
    'https://claude.ai/*',
    'https://chatgpt.com/*',
    'https://chat.deepseek.com/*',
    'https://www.perplexity.ai/*',
  ],
  cssInjectionMode: 'ui',
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'microphone-button',
      position: 'inline',
      anchor: 'body',
      onMount(container, shadow) {
        const root = createRoot(container);
        root.render(<MicrophoneButton />);
      },
    });

    ui.mount();
  },
});
