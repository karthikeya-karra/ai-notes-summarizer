import os
import requests
from dotenv import load_dotenv

load_dotenv()
HF_API_KEY = os.getenv("HF_API_KEY")

def summarize_note(note):
    # Use smaller, faster model
    API_URL = "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6"
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}

    # Optional: truncate very long notes to first 1000 words
    truncated_note = " ".join(note.split()[:1000])

    payload = {"inputs": truncated_note}
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            return result[0]["summary_text"]
        else:
            return f"Error: {response.status_code}, {response.text}"
    except requests.exceptions.Timeout:
        return "Error: Request timed out. Try shorter note or check your network."
    except Exception as e:
        return f"Error: {str(e)}"
