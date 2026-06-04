let mediaRecorder = null;
let audioChunks = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'offscreenStartRecording') {
    startRecording(request.streamId)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
  
  if (request.action === 'offscreenStopRecording') {
    stopRecording()
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function startRecording(streamId) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      }
    });

    // CRITICAL: Play the audio back to the user so they can still hear the meeting!
    // When tabCapture intercepts the stream, it mutes the tab by default.
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(audioCtx.destination);

    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      // Stop all tracks to release microphone/tab capture
      stream.getTracks().forEach(track => track.stop());

      // Convert to base64 to send across extension messaging
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64data = reader.result;
        // Broadcast the finished audio
        chrome.runtime.sendMessage({
          action: 'recordingFinished',
          base64Audio: base64data
        });
      };
    };

    mediaRecorder.start();
  } catch (error) {
    console.error("Error starting recording in offscreen document:", error);
    throw error;
  }
}

async function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}
