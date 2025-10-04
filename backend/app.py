from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from gpt_utils import summarize_note
from whisper_utils import transcribe_audio

app = Flask(__name__)
CORS(app)

# Root route
@app.route("/")
def home():
    return "Flask API is running! Use /api/summarize or /api/transcribe."

# Favicon
@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico')

# Summarization endpoint
@app.route("/api/summarize", methods=["POST"])
def summarize():
    note = request.json.get("note")
    if not note:
        return jsonify({"error": "No note provided"}), 400
    try:
        summary_text = summarize_note(note)
        return jsonify({"summary": summary_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Transcription endpoint
@app.route("/api/transcribe", methods=["POST"])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file uploaded"}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    try:
        with file.stream as f:
            text = transcribe_audio(f)
        return jsonify({"transcription": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
