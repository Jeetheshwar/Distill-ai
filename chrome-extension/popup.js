document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const apiEndpointInput = document.getElementById('apiEndpoint');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const sendToJiraBtn = document.getElementById('sendToJiraBtn');
  const statusText = document.getElementById('statusText');
  const timer = document.getElementById('timer');
  const loader = document.getElementById('loader');
  const preview = document.getElementById('preview');

  let recordingInterval;
  let seconds = 0;

  // Load API key and Endpoint
  chrome.storage.local.get(['groqApiKey', 'distillApiEndpoint'], (result) => {
    if (result.groqApiKey) {
      apiKeyInput.value = result.groqApiKey;
    }
    if (result.distillApiEndpoint) {
      apiEndpointInput.value = result.distillApiEndpoint;
    }
  });

  apiKeyInput.addEventListener('change', (e) => {
    chrome.storage.local.set({ groqApiKey: e.target.value });
  });

  apiEndpointInput.addEventListener('change', (e) => {
    chrome.storage.local.set({ distillApiEndpoint: e.target.value });
  });

  function updateTimer() {
    seconds++;
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    timer.textContent = `${mins}:${secs}`;
  }

  startBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'startRecording' }, (response) => {
      if (response && response.success) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        statusText.textContent = 'Status: Recording';
        timer.style.display = 'block';
        seconds = 0;
        timer.textContent = '00:00';
        recordingInterval = setInterval(updateTimer, 1000);
      } else {
        alert('Could not start recording. ' + (response?.error || 'Make sure you are on a valid tab.'));
      }
    });
  });

  stopBtn.addEventListener('click', () => {
    clearInterval(recordingInterval);
    stopBtn.style.display = 'none';
    timer.style.display = 'none';
    statusText.textContent = 'Status: Processing';
    loader.style.display = 'block';

    // Tell background script to stop recording.
    // The offscreen document will then finish encoding and send "recordingFinished"
    chrome.runtime.sendMessage({ action: 'stopRecording' });
  });

  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'recordingFinished') {
      try {
        const base64Audio = request.base64Audio;
        
        // Convert Base64 back to Blob
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
          headers: {
            "Authorization": `Bearer ${apiKey}`
          },
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
        alert(err.message);
      }
    }
  });

  function showPreview(entities) {
    preview.style.display = 'block';
    sendToJiraBtn.style.display = 'block';
    
    preview.innerHTML = '';
    
    // Check if it's the Llama3 JSON array or a single object
    const tickets = Array.isArray(entities) ? entities : (entities.extracted_tickets || []);

    if (tickets.length === 0) {
      preview.innerHTML = '<div style="color:red">No tickets extracted.</div>';
      return;
    }

    tickets.forEach(t => {
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
  }

  sendToJiraBtn.addEventListener('click', () => {
    sendToJiraBtn.textContent = 'Sending...';
    setTimeout(() => {
      sendToJiraBtn.textContent = 'Sent!';
      sendToJiraBtn.style.background = '#22c55e';
      setTimeout(() => {
        window.close();
      }, 1000);
    }, 1000);
  });
});
