let banner = null;

function checkAndShowBanner() {
  chrome.storage.local.get(['dismissedStandupBanner'], (result) => {
    if (result.dismissedStandupBanner) return;

    if (window.location.hostname.includes('meet.google.com') || 
        window.location.hostname.includes('zoom.us') || 
        window.location.hostname.includes('teams.microsoft.com')) {
      
      banner = document.createElement('div');
      banner.style.position = 'fixed';
      banner.style.top = '20px';
      banner.style.right = '20px';
      banner.style.backgroundColor = '#000';
      banner.style.color = '#fff';
      banner.style.padding = '16px';
      banner.style.borderRadius = '8px';
      banner.style.boxShadow = '0 4px 20px rgba(72,38,185,0.4)';
      banner.style.zIndex = '999999';
      banner.style.fontFamily = 'sans-serif';
      banner.style.border = '1px solid #4826B9';
      banner.style.display = 'flex';
      banner.style.flexDirection = 'column';
      banner.style.gap = '12px';
      
      banner.innerHTML = `
        <div style="font-weight: bold; display: flex; align-items: center; gap: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4826B9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          Standup detected. Distill this meeting?
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button id="distill-dismiss-btn" style="background: transparent; border: 1px solid #333; color: #8A859C; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Dismiss</button>
          <button id="distill-yes-btn" style="background: #4826B9; border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">Yes</button>
        </div>
      `;

      document.body.appendChild(banner);

      document.getElementById('distill-dismiss-btn').addEventListener('click', () => {
        chrome.storage.local.set({ dismissedStandupBanner: true });
        banner.remove();
      });

      document.getElementById('distill-yes-btn').addEventListener('click', () => {
        // In a real implementation, this could auto-start the background recording
        // For MVP, we instruct the user to open the extension popup
        banner.innerHTML = '<div style="font-size: 12px; padding: 4px;">Please open the Distill AI extension popup to start recording.</div>';
        setTimeout(() => banner.remove(), 4000);
      });
    }
  });
}

// Run after a short delay to ensure DOM is loaded and it's not a fleeting navigation
setTimeout(checkAndShowBanner, 3000);
