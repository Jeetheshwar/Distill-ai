let recordingTabId = null;

async function setupOffscreenDocument(path) {
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  // Create document
  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['USER_MEDIA'],
    justification: 'Recording tab audio for Distill extraction'
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startRecording') {
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) throw new Error("No active tab found");
        
        recordingTabId = tab.id;

        // Ensure offscreen document is ready
        await setupOffscreenDocument('offscreen.html');

        // Request stream ID from tabCapture
        chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, (streamId) => {
          if (chrome.runtime.lastError || !streamId) {
            console.error("tabCapture error:", chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError?.message || "Failed to get streamId" });
            return;
          }

          // Pass streamId to offscreen document
          chrome.runtime.sendMessage({
            action: 'offscreenStartRecording',
            streamId: streamId
          }, (response) => {
            if (chrome.runtime.lastError) {
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
              sendResponse({ success: true });
            }
          });
        });
      } catch (err) {
        console.error(err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'stopRecording') {
    (async () => {
      try {
        // We just tell the offscreen document to stop
        chrome.runtime.sendMessage({ action: 'offscreenStopRecording' }, (response) => {
          sendResponse({ success: true });
          
          // Optionally close the offscreen document after a delay
          // setTimeout(() => {
          //   chrome.offscreen.closeDocument();
          // }, 10000); // Wait enough time for encoding
        });
      } catch (err) {
        console.error(err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }
});
