document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const apiEndpointInput = document.getElementById('apiEndpoint');
  const webhookUrlInput = document.getElementById('webhookUrl');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const sendToJiraBtn = document.getElementById('sendToJiraBtn');
  const retryBtn = document.getElementById('retryBtn');
  const statusText = document.getElementById('statusText');
  const timer = document.getElementById('timer');
  const loader = document.getElementById('loader');
  const preview = document.getElementById('preview');
  const errorContainer = document.getElementById('errorContainer');
  const togglePassword = document.getElementById('togglePassword');

  togglePassword.addEventListener('click', () => {
    const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
    apiKeyInput.setAttribute('type', type);
    
    // Toggle icon (slash vs normal)
    if (type === 'text') {
      togglePassword.innerHTML = `<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>`;
    } else {
      togglePassword.innerHTML = `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`;
    }
  });

  let recordingInterval;
  let seconds = 0;
  let currentExtractedTickets = [];

  function showError(msg) {
    errorContainer.textContent = msg;
    errorContainer.style.display = 'block';
  }

  function hideError() {
    errorContainer.style.display = 'none';
  }

  retryBtn.addEventListener('click', () => {
    hideError();
    preview.style.display = 'none';
    sendToJiraBtn.style.display = 'none';
    retryBtn.style.display = 'none';
    startBtn.style.display = 'block';
    statusText.textContent = 'Status: Ready';
    timer.style.display = 'none';
    timer.textContent = '00:00';
    seconds = 0;
  });

  // Load saved settings
  chrome.storage.local.get(['groqApiKey', 'distillApiEndpoint', 'distillWebhookUrl', 'isRecording', 'recordingStartTime'], (result) => {
    if (result.groqApiKey) apiKeyInput.value = result.groqApiKey;
    if (result.distillApiEndpoint) apiEndpointInput.value = result.distillApiEndpoint;
    if (result.distillWebhookUrl) webhookUrlInput.value = result.distillWebhookUrl;

    // Restore recording state if popup was closed
    if (result.isRecording && result.recordingStartTime) {
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
      statusText.textContent = 'Status: Recording';
      timer.style.display = 'block';
      
      const elapsed = Math.floor((Date.now() - result.recordingStartTime) / 1000);
      seconds = elapsed > 0 ? elapsed : 0;
      updateTimer(); // Initial render
      
      recordingInterval = setInterval(updateTimer, 1000);
    }
  });

  apiKeyInput.addEventListener('change', (e) => chrome.storage.local.set({ groqApiKey: e.target.value }));
  apiEndpointInput.addEventListener('change', (e) => chrome.storage.local.set({ distillApiEndpoint: e.target.value }));
  webhookUrlInput.addEventListener('change', (e) => chrome.storage.local.set({ distillWebhookUrl: e.target.value }));

  function updateTimer() {
    seconds++;
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    timer.textContent = `${mins}:${secs}`;
  }

  startBtn.addEventListener('click', () => {
    hideError();
    chrome.runtime.sendMessage({ action: 'startRecording' }, (response) => {
      if (response && response.success) {
        chrome.storage.local.set({ isRecording: true, recordingStartTime: Date.now() });
        
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        statusText.textContent = 'Status: Recording';
        timer.style.display = 'block';
        seconds = 0;
        timer.textContent = '00:00';
        recordingInterval = setInterval(updateTimer, 1000);
      } else {
        showError('Could not start recording. ' + (response?.error || 'Make sure you are on a valid Meet or Zoom tab.'));
      }
    });
  });

  stopBtn.addEventListener('click', () => {
    hideError();
    chrome.storage.local.remove(['isRecording', 'recordingStartTime']);
    clearInterval(recordingInterval);
    stopBtn.style.display = 'none';
    timer.style.display = 'none';
    statusText.textContent = 'Status: Processing';
    loader.style.display = 'block';

    chrome.runtime.sendMessage({ action: 'stopRecording' });
  });

  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'recordingFinished') {
      chrome.storage.local.remove(['isRecording', 'recordingStartTime']);
      try {
        const base64Audio = request.base64Audio;
        const fetchResponse = await fetch(base64Audio);
        const audioBlob = await fetchResponse.blob();
        
        const apiKey = apiKeyInput.value.trim();
        const endpoint = apiEndpointInput.value.trim() || 'http://localhost:3000/api/extract';

        if (!apiKey) {
          throw new Error("Missing Groq API Key. Please provide your BYOK.");
        }

        const formData = new FormData();
        formData.append("file", audioBlob, "meeting_audio.webm");
        formData.append("schema", "standup");

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}` },
          body: formData
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to process audio via API.");
        }

        const json = await response.json();
        
        loader.style.display = 'none';
        statusText.textContent = 'Status: Ready';
        showPreview(json.entities);
      } catch (err) {
        loader.style.display = 'none';
        statusText.textContent = 'Status: Error';
        showError(err.message);
        retryBtn.style.display = 'block';
      }
    }
  });

  function showPreview(entities) {
    preview.style.display = 'block';
    sendToJiraBtn.style.display = 'block';
    preview.innerHTML = '';
    
    currentExtractedTickets = Array.isArray(entities) ? entities : (entities.extracted_tickets || []);

    if (currentExtractedTickets.length === 0) {
      preview.innerHTML = '<div style="color:#ef4444">No tickets extracted.</div>';
      sendToJiraBtn.style.display = 'none';
      retryBtn.style.display = 'block';
      return;
    }

    currentExtractedTickets.forEach(t => {
      const div = document.createElement('div');
      div.className = 'ticket';
      const title = t.title || t.summary || "Untitled";
      const type = t.type || "Task";
      const priority = t.priority || "Medium";
      
      div.innerHTML = `
        <div class="ticket-title">${title}</div>
        <div class="ticket-meta">${type} • ${priority}</div>
      `;
      preview.appendChild(div);
    });
    retryBtn.style.display = 'block';
  }

  sendToJiraBtn.addEventListener('click', async () => {
    hideError();
    const webhookUrl = webhookUrlInput.value.trim();
    
    if (!webhookUrl) {
      showError("Please enter a Jira Webhook URL.");
      return;
    }

    const originalText = sendToJiraBtn.textContent;
    sendToJiraBtn.textContent = 'Sending...';
    sendToJiraBtn.disabled = true;

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets: currentExtractedTickets })
      });

      if (!response.ok) {
        throw new Error("Webhook request failed. HTTP " + response.status);
      }

      sendToJiraBtn.textContent = 'Sent!';
      sendToJiraBtn.style.background = '#22c55e';
      
      setTimeout(() => {
        window.close();
      }, 1500);

    } catch (err) {
      sendToJiraBtn.textContent = originalText;
      sendToJiraBtn.disabled = false;
      showError(err.message);
    }
  });
});
