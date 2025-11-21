from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from gtts import gTTS
import os
import uuid
import requests

app = Flask(__name__)
CORS(app)

# --- Configuration ---
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta2/models/gemini-2.5-flash:generateText"
VOICE_FOLDER = "voices"

# Ensure voice folder exists
os.makedirs(VOICE_FOLDER, exist_ok=True)

# --------------------------
# Route: Generate TTS
# --------------------------
@app.post("/generate-voice")
def generate_voice():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Generate unique filename
    filename = f"voice_{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(VOICE_FOLDER, filename)

    # Generate TTS
    tts = gTTS(text=text, lang="en")
    tts.save(filepath)

    return jsonify({"url": f"/voices/{filename}"}), 200

# --------------------------
# Route: Serve TTS files
# --------------------------
@app.route("/voices/<path:filename>")
def serve_voice(filename):
    file_path = os.path.join(VOICE_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    return send_file(file_path)

# --------------------------
# Route: Enhance Prompt (Gemini AI)
# --------------------------
@app.post("/enhance-script")
def enhance_script():
    data = request.get_json()
    prompt = data.get("prompt", "")
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "prompt": {"text": prompt},
        "temperature": 0.7,
        "candidate_count": 1,
        "max_output_tokens": 500
    }

    response = requests.post(GEMINI_URL, headers=headers, json=payload)
    if response.status_code != 200:
        return jsonify({"error": "AI generation failed", "details": response.text}), 500

    result = response.json()
    try:
        enhanced_script = result["candidates"][0]["content"]
    except (KeyError, IndexError):
        enhanced_script = prompt  # fallback

    return jsonify({"script": enhanced_script})


if __name__ == "__main__":
    app.run(port=5001, debug=True)
