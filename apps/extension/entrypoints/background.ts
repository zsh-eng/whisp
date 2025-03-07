async function executeWhispPanelScriptIfNotRunning(tabId: number) {
  let isScriptExecuted = false;
  try {
    isScriptExecuted = await browser.tabs.sendMessage(tabId, {
      action: 'whisp-panel-content-script-loaded',
    });
    console.log('message reply is', isScriptExecuted);
  } catch {
    console.log('Side panel content script not executed, executing it now');
  } finally {
    if (!isScriptExecuted) {
      await browser.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content-scripts/whisp-panel.js'],
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

async function handleStartRecording(tab: chrome.tabs.Tab) {
  if (!tab.id) {
    return true;
  }

  await executeWhispPanelScriptIfNotRunning(tab.id);
  await browser.tabs.sendMessage(tab.id, {
    action: 'start-recording',
  });
}

export default defineBackground(() => {
  browser.commands.onCommand.addListener((command, tab) => {
    console.log('Command', command);
    if (command === 'start-recording') {
      handleStartRecording(tab);
    }
  });
});
