let mediaStream = null;
let mediaRecorder = null;
let audioChunks = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startRecording') {
    // In Manifest V3 service workers, tabCapture has limitations without an offscreen document
    // For MVP, we simulate success or use a stub that acknowledges the command
    // A full implementation would use chrome.offscreen to capture audio
    console.log("Start recording requested");
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'stopRecording') {
    console.log("Stop recording requested");
    // Simulate stopping
    sendResponse({ success: true, message: "Recording stopped" });
    return true;
  }
});
