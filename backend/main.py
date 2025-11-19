# backend/main.py
import os
import io
import time
import base64
import tempfile
import requests
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from gtts import gTTS
from werkzeug.utils import secure_filename

load_dotenv()

app = Flask(__name__)
CORS(app)

# ==========================
# CONFIG (from .env)
# ==========================
HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PORT = int(os.getenv("PORT", 5002))

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ==========================
# In-memory / simple store
# ==========================
# For production, persist per-user (DB or session). This is minimal.
SELECTED_VOICE = None

# voice mapping used for preview + audio generation
VOICE_MAP = {
    "nova": {"lang": "en", "tld": "co.uk"},
    "orion": {"lang": "en", "tld": "com.au"},
    "lyra": {"lang": "en", "tld": "ie"},
    "atlas": {"lang": "en", "tld": "us"},
    "iris": {"lang": "en", "tld": "in"},
    "cedar": {"lang": "en", "tld": "ca"},
}

# ==========================
# Health
# ==========================
@app.get("/")
def home():
    return jsonify({"status": "ok", "service": "avatar-backend"})

# ==========================
# Preview voice (Page 2)
# POST { text, voice }
# returns MP3 audio
# ==========================
@app.route("/preview-voice", methods=["POST"])
def preview_voice():
    try:
        data = request.get_json(force=True)
        text = data.get("text")
        voice_code = data.get("voice")

        if not text:
            return jsonify({"error": "No text provided"}), 400

        v = VOICE_MAP.get(voice_code, {"lang": "en", "tld": "us"})
        tts = gTTS(text=text, lang=v["lang"], tld=v["tld"], slow=False)

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        tts.save(tmp.name)
        return send_file(tmp.name, mimetype="audio/mpeg")

    except Exception as e:
        app.logger.exception("preview_voice failed")
        return jsonify({"error": str(e)}), 500

# ==========================
# Save selected voice (Page 2 -> Page 3)
# POST { voiceCode }
# ==========================
@app.route("/save-selected-voice", methods=["POST"])
def save_selected_voice():
    global SELECTED_VOICE
    data = request.get_json(force=True)
    voice = data.get("voiceCode")
    if not voice:
        return jsonify({"error": "voiceCode required"}), 400
    if voice not in VOICE_MAP:
        return jsonify({"error": "unknown voiceCode"}), 400
    SELECTED_VOICE = voice
    return jsonify({"message": "voice saved", "voice": SELECTED_VOICE})

# ==========================
# Enhance script (Gemini)
# POST { text }
# ==========================
@app.route("/enhance-script", methods=["POST"])
def enhance_script():
    try:
        data = request.get_json(force=True)
        text = data.get("text")
        if not text:
            return jsonify({"error": "text required"}), 400

        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText"
        payload = {"prompt": f"Rewrite and enhance this ad script professionally:\n\n{text}"}
        resp = requests.post(f"{url}?key={GEMINI_API_KEY}", json=payload, timeout=30)
        resp.raise_for_status()
        result = resp.json()
        enhanced = result.get("candidates", [{}])[0].get("output_text")
        if not enhanced:
            return jsonify({"error": "Gemini returned no text", "raw": result}), 500
        return jsonify({"enhancedText": enhanced})
    except Exception as e:
        app.logger.exception("enhance_script failed")
        return jsonify({"error": str(e)}), 500

# ==========================
# Generate HeyGen Video
# POST form-data:
#   text, avatar_id, background, videoType, optional avatar_image (file)
# Flow:
#   - Ensure SELECTED_VOICE exists
#   - Generate TTS audio with gTTS according to selected voice
#   - Convert audio to base64 and send to HeyGen's generation endpoint
#   - Poll HeyGen status until done or timeout; return final video URL
# ==========================
@app.route("/generate-heygen-video", methods=["POST"])
def generate_heygen_video():
    global SELECTED_VOICE
    try:
        if SELECTED_VOICE is None:
            return jsonify({"error": "No voice selected. Call /save-selected-voice first."}), 400

        # accept both application/json and multipart/form-data (form preferred for files)
        if request.content_type and request.content_type.startswith("multipart/form-data"):
            text = request.form.get("text")
            avatar_id = request.form.get("avatar_id")
            background = request.form.get("background")
            video_type = request.form.get("videoType")
            avatar_file = request.files.get("avatar_image")
        else:
            # fallback to JSON body
            data = request.get_json(force=True)
            text = data.get("text")
            avatar_id = data.get("avatar_id")
            background = data.get("background")
            video_type = data.get("videoType")
            avatar_file = None

        if not text or not avatar_id:
            return jsonify({"error": "Missing text or avatar_id"}), 400

        # If custom avatar file uploaded, save it and prepare base64
        avatar_payload = None
        if avatar_id == "custom" and avatar_file:
            filename = secure_filename(avatar_file.filename)
            save_path = os.path.join(UPLOAD_FOLDER, filename)
            avatar_file.save(save_path)
            with open(save_path, "rb") as f:
                avatar_b64 = base64.b64encode(f.read()).decode("utf-8")
            avatar_payload = {"type": "image", "image_base64": avatar_b64}
        else:
            avatar_payload = {"type": "preset", "avatar_id": avatar_id}

        # 1) Generate TTS audio using the previously selected voice
        voice_spec = VOICE_MAP.get(SELECTED_VOICE, {"lang": "en", "tld": "us"})
        tts = gTTS(text=text, lang=voice_spec["lang"], tld=voice_spec["tld"], slow=False)
        audio_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        tts.save(audio_tmp.name)

        with open(audio_tmp.name, "rb") as f:
            audio_b64 = base64.b64encode(f.read()).decode("utf-8")

        # 2) Construct HeyGen payload
        # NOTE: HeyGen has multiple endpoints/versions; adapt based on the HeyGen API contract you have.
        heygen_payload = {
            "video_inputs": [
                {
                    "type": "avatar",
                    "avatar": avatar_payload,
                    "voice": {
                        "type": "audio",
                        # we pass the SELECTED_VOICE as an identifier; HeyGen may ignore it if audio is present
                        "voice_id": SELECTED_VOICE,
                        "audio_base64": audio_b64
                    },
                    "background": background or "studio",
                    "video_style": video_type or "product-ad"
                }
            ]
        }

        headers = {"X-Api-Key": HEYGEN_API_KEY, "Content-Type": "application/json"}
        gen_resp = requests.post("https://api.heygen.com/v2/video/generate", json=heygen_payload, headers=headers, timeout=60)
        # If HeyGen returns non-JSON or an error body, raise
        try:
            gen_json = gen_resp.json()
        except Exception:
            return jsonify({"error": "HeyGen returned non-JSON", "status": gen_resp.status_code, "text": gen_resp.text}), 500

        # Check expected structure; adapt if your HeyGen account uses different response fields
        if gen_resp.status_code not in (200, 201) or "data" not in gen_json:
            return jsonify({"error": "HeyGen generation failed", "details": gen_json}), 500

        video_id = gen_json["data"].get("video_id") or gen_json["data"].get("id")
        if not video_id:
            # return raw for debugging
            return jsonify({"error": "HeyGen did not return video_id", "details": gen_json}), 500

        # 3) Poll HeyGen status for completion (simple loop with timeout)
        status_url = "https://api.heygen.com/v2/video/status"
        final_video_url = None
        timeout_seconds = 120
        poll_interval = 3
        start = time.time()

        while time.time() - start < timeout_seconds:
            status_resp = requests.get(status_url, params={"video_id": video_id}, headers=headers, timeout=20)
            try:
                status_json = status_resp.json()
            except Exception:
                time.sleep(poll_interval)
                continue

            # HeyGen status field might be 'status' or nested; adapt as needed
            status_field = status_json.get("data", {}).get("status") or status_json.get("status")
            if status_field in ("completed", "done", "finished"):
                final_video_url = status_json.get("data", {}).get("result_url") or status_json.get("result_url")
                break
            elif status_field in ("failed", "error"):
                return jsonify({"error": "HeyGen job failed", "details": status_json}), 500

            time.sleep(poll_interval)

        if not final_video_url:
            # return video_id so frontend can poll longer if needed
            return jsonify({"message": "processing", "video_id": video_id}), 202

        return jsonify({"success": True, "video_url": final_video_url})

    except Exception as e:
        app.logger.exception("generate_heygen_video failed")
        return jsonify({"error": str(e)}), 500

# ==========================
# Optional: expose video status check for frontend polling
# GET /video-status?video_id=...
# ==========================
@app.route("/video-status", methods=["GET"])
def video_status():
    video_id = request.args.get("video_id")
    if not video_id:
        return jsonify({"error": "video_id required"}), 400
    headers = {"X-Api-Key": HEYGEN_API_KEY}
    status_url = "https://api.heygen.com/v2/video/status"
    resp = requests.get(status_url, params={"video_id": video_id}, headers=headers, timeout=20)
    try:
        return jsonify(resp.json())
    except Exception:
        return jsonify({"status_code": resp.status_code, "text": resp.text}), 500

# ==========================
# Run
# ==========================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)
