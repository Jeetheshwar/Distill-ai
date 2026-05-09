document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const sendToJiraBtn = document.getElementById('sendToJiraBtn');
  const statusText = document.getElementById('statusText');
  const timer = document.getElementById('timer');
  const loader = document.getElementById('loader');
  const preview = document.getElementById('preview');

  let recordingInterval;
  let seconds = 0;

  // Load API key
  chrome.storage.local.get(['groqApiKey'], (result) => {
    if (result.groqApiKey) {
      apiKeyInput.value = result.groqApiKey;
    }
  });

  apiKeyInput.addEventListener('change', (e) => {
    chrome.storage.local.set({ groqApiKey: e.target.value });
  });

  function updateTimer() {
    seconds++;
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    timer.textContent = `${mins}:${secs}`;
  }

  startBtn.addEventListener('click', () => {
    // Tell background script to start recording using tabCapture
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
        alert('Could not start recording. Make sure you are on a valid tab.');
      }
    });
  });

  stopBtn.addEventListener('click', () => {
    clearInterval(recordingInterval);
    stopBtn.style.display = 'none';
    timer.style.display = 'none';
    statusText.textContent = 'Status: Processing';
    loader.style.display = 'block';

    // Tell background script to stop recording
    chrome.runtime.sendMessage({ action: 'stopRecording' }, (response) => {
      // In MVP, we might simulate the upload if no real backend is hooked up to the extension yet
      // We will pretend to hit the local Distill API
      setTimeout(() => {
        loader.style.display = 'none';
        statusText.textContent = 'Status: Ready';
        showPreview();
      }, 2000);
    });
  });

  function showPreview() {
    preview.style.display = 'block';
    sendToJiraBtn.style.display = 'block';
    
    // Mock response for MVP
    const mockTickets = [
      { title: "Implement Jira webhook setup", type: "Task", priority: "High" },
      { title: "Design review for modal", type: "Blocker", priority: "Medium" }
    ];

    preview.innerHTML = '';
    mockTickets.forEach(t => {
      const div = document.createElement('div');
      div.className = 'ticket';
      div.innerHTML = `
        <div class="ticket-title">${t.title}</div>
        <div class="ticket-meta">${t.type} • ${t.priority}</div>
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
