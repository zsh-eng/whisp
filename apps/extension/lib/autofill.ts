function isOnClaudeWebsite() {
  return window.location.hostname === 'claude.ai';
}

function isOnChatgptWebsite() {
  return window.location.hostname === 'chatgpt.com';
}

function isOnDeepseekWebsite() {
  return window.location.hostname === 'chat.deepseek.com';
}

function isOnPerplexityWebsite() {
  return window.location.hostname === 'www.perplexity.ai';
}

type FillTextAreaReturn =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

type AutofillSelectors = {
  inputSelector: string;
  sendMessageSelector: string;
};

const CLAUDE_SELECTORS: AutofillSelectors = {
  inputSelector: '.ProseMirror',
  sendMessageSelector: 'button[aria-label="Send Message"]',
};

const CHATGPT_SELECTORS: AutofillSelectors = {
  inputSelector: '.ProseMirror',
  sendMessageSelector: 'button[aria-label="Send prompt"]',
};

const DEEPSEEK_SELECTORS: AutofillSelectors = {
  inputSelector: '#chat-input',
  sendMessageSelector: '.f6d670',
};

const PERPLEXITY_SELECTORS: AutofillSelectors = {
  inputSelector: 'textarea[placeholder="Ask anything..."]',
  sendMessageSelector: 'button[aria-label="Submit"]',
};

async function fillTextareaAndSendMessageGeneric(
  message: string,
  selectors: AutofillSelectors
): Promise<FillTextAreaReturn> {
  const inputElement = document.querySelector(selectors.inputSelector);
  if (!inputElement) {
    return {
      success: false,
      error: 'No input element found',
    };
  }
  console.log('filling in textarea')
  inputElement.textContent = message;

  // Give some time for the send message button to render.
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Send message only appears if there is some text content
  const sendMessageElement = document.querySelector(
    selectors.sendMessageSelector
  ) as HTMLButtonElement | null;

  if (!sendMessageElement) {
    return {
      success: false,
      error: 'No send message element found',
    };
  }

  console.log('clicking send message element');
  sendMessageElement.click();

  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log('done')
  return {
    success: true,
  };
}

export const UNSUPPORTED_WEBSITE_MESSAGE = 'Unsupported website';

export async function fillTextareaAndSendMessage(message: string) {
  if (isOnClaudeWebsite()) {
    return fillTextareaAndSendMessageGeneric(message, CLAUDE_SELECTORS);
  }

  if (isOnChatgptWebsite()) {
    return fillTextareaAndSendMessageGeneric(message, CHATGPT_SELECTORS);
  }

  if (isOnDeepseekWebsite()) {
    return fillTextareaAndSendMessageGeneric(message, DEEPSEEK_SELECTORS);
  }

  if (isOnPerplexityWebsite()) {
    return fillTextareaAndSendMessageGeneric(message, PERPLEXITY_SELECTORS);
  }

  return {
    success: false,
    error: UNSUPPORTED_WEBSITE_MESSAGE,
  };
}
