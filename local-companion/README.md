# Distill Local Companion

This is the local companion service for Distill. It allows you to run audio transcriptions and extractions entirely on your own hardware without relying on paid APIs.

## Requirements
1. **Ollama**: Download and install from [ollama.com](https://ollama.com/)
2. **Python 3.9+**

## Setup

1. Pull the default Ollama model:
   ```bash
   ollama pull llama3.2:3b
   ```
2. Start Ollama:
   ```bash
   ollama serve
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Companion

Start the server using uvicorn:
```bash
uvicorn server:app --host 127.0.0.1 --port 47341
```

Once running, select "Local Open Source" in the Distill dashboard. The dashboard will communicate directly with this local service. Audio stays on your machine, and no model API key is required.
