import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def transcribe_audio(audio_file):
    result = openai.Audio.transcribe("whisper-1", audio_file)
    return result["text"]
