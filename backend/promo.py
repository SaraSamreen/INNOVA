# backend/main.py — FINAL, CLEAN, WORKING VERSION
import os
import time
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

load_dotenv()

app = Flask(__name__)

# CORS
CORS(app,
     resources={r"/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}},
     supports_credentials=True)

# CONFIG
HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY")
PORT = int(os.getenv("PORT", 5002))
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

if not HEYGEN_API_KEY:
    app.logger.warning("HEYGEN_API_KEY not set!")

# In-memory state
SELECTED_VOICE = None
SELECTED_AVATAR = None

@app.get("/")
def home():
    return jsonify({"status": "ok", "service": "heygen-backend-v3-final"})

# ── LIST AVATARS & VOICES (unchanged, working) ─────────────────────────────────
@app.route("/list-avatars", methods=["GET", "OPTIONS"])
def list_avatars():
    if request.method == "OPTIONS": return "", 204
    if not HEYGEN_API_KEY: return jsonify({"error": "No API key"}), 500

    try:
        resp = requests.get("https://api.heygen.com/v2/avatars",
                          headers={"X-Api-Key": HEYGEN_API_KEY}, timeout=30)
        resp.raise_for_status()
        avatars = resp.json().get("data", {}).get("avatars", [])

        formatted = [{
            "id": a.get("avatar_id"),
            "name": a.get("avatar_name"),
            "preview_image": a.get("preview_image_url"),
            "preview_video": a.get("preview_video_url"),
            "gender": a.get("gender"),
            "is_public": a.get("is_public", False)
        } for a in avatars]

        return jsonify({"avatars": formatted})
    except Exception as e:
        app.logger.exception("list_avatars")
        return jsonify({"error": str(e)}), 500

@app.route("/list-voices", methods=["GET", "OPTIONS"])
def list_voices():
    if request.method == "OPTIONS": return "", 204
    if not HEYGEN_API_KEY: return jsonify({"error": "No API key"}), 500

    try:
        resp = requests.get("https://api.heygen.com/v2/voices",
                          headers={"X-Api-Key": HEYGEN_API_KEY}, timeout=30)
        resp.raise_for_status()
        voices = resp.json().get("data", {}).get("voices", [])

        formatted = [{
            "id": v.get("voice_id"),
            "name": v.get("display_name") or v.get("name"),
            "gender": v.get("gender"),
            "language": v.get("language"),
            "preview_audio": v.get("preview_audio_url")
        } for v in voices]

        return jsonify({"voices": formatted})
    except Exception as e:
        app.logger.exception("list_voices")
        return jsonify({"error": str(e)}), 500

# ── SAVE SELECTIONS ───────────────────────────────────────────────────────────
@app.route("/save-selected-voice", methods=["POST", "OPTIONS"])
def save_selected_voice():
    if request.method == "OPTIONS": return "", 204
    global SELECTED_VOICE
    data = request.get_json() or {}
    voice_id = data.get("voice_id")
    if not voice_id: return jsonify({"error": "voice_id required"}), 400
    SELECTED_VOICE = voice_id
    return jsonify({"message": "voice saved", "voice": voice_id})

@app.route("/save-selected-avatar", methods=["POST", "OPTIONS"])
def save_selected_avatar():
    if request.method == "OPTIONS": return "", 204
    global SELECTED_AVATAR
    data = request.get_json() or {}
    avatar_id = data.get("avatar_id")
    if not avatar_id: return jsonify({"error": "avatar_id required"}), 400
    SELECTED_AVATAR = avatar_id
    return jsonify({"message": "avatar saved", "avatar": avatar_id})

# ── NEW: Upload Custom Background ─────────────────────────────────────────────
@app.route("/upload-background", methods=["POST", "OPTIONS"])
def upload_background():
    if request.method == "OPTIONS": return "", 204
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    filename = secure_filename(file.filename)
    temp_path = os.path.join(UPLOAD_FOLDER, f"bg_{int(time.time())}_{filename}")
    file.save(temp_path)

    try:
        with open(temp_path, "rb") as f:
            resp = requests.post(
                "https://api.heygen.com/v1/background/upload",
                headers={"X-Api-Key": HEYGEN_API_KEY},
                files={"file": f},
                timeout=60
            )
        resp.raise_for_status()
        url = resp.json().get("data", {}).get("background_url")
        if not url:
            return jsonify({"error": "Upload failed", "details": resp.json()}), 500
        return jsonify({"url": url})
    except Exception as e:
        app.logger.exception("upload_background")
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            try: os.remove(temp_path)
            except: pass

# ── FINAL: Generate Video with Dynamic Background ─────────────────────────────
@app.route("/generate-heygen-video", methods=["POST", "OPTIONS"])
def generate_heygen_video():
    if request.method == "OPTIONS": return "", 204

    try:
        # Parse body
        if request.is_json:
            body = request.get_json()
        else:
            body = {
                "text": request.form.get("text"),
                "avatar_id": request.form.get("avatar_id"),
                "voice_id": request.form.get("voice_id"),
                "background": request.form.get("background")
            }

        text = body.get("text", "").strip()
        avatar_id = body.get("avatar_id") or SELECTED_AVATAR
        voice_id = body.get("voice_id") or SELECTED_VOICE
        background_payload = body.get("background")

        if not text:
            return jsonify({"error": "Script is required"}), 400
        if not avatar_id:
            return jsonify({"error": "No avatar selected"}), 400

        # Handle background
        background = {"type": "color", "value": "#FFFFFF"}  # default
        if background_payload:
            if isinstance(background_payload, str):
                try:
                    background_payload = json.loads(background_payload)
                except:
                    pass
            if isinstance(background_payload, dict):
                bg_type = background_payload.get("type")
                bg_value = background_payload.get("value")
                if bg_type in ("color", "image", "template") and bg_value:
                    background = {"type": bg_type, "value": bg_value}

        # Build payload
        video_input = {
            "character": {
                "type": "avatar",
                "avatar_id": avatar_id,
                "avatar_style": "normal"
            },
            "voice": {
                "type": "text",
                "text": text,
                "voice_id": voice_id
            },
            "background": background
        }

        payload = {
            "video_inputs": [video_input],
            "dimension": {"width": 1280, "height": 720},
            "aspect_ratio": "16:9"
        }

        headers = {
            "X-Api-Key": HEYGEN_API_KEY,
            "Content-Type": "application/json"
        }

        # Submit job
        resp = requests.post(
            "https://api.heygen.com/v2/video/generate",
            json=payload,
            headers=headers,
            timeout=60
        )
        resp.raise_for_status()
        data = resp.json()
        video_id = data.get("data", {}).get("video_id")

        if not video_id:
            return jsonify({"error": "No video_id returned", "details": data}), 500

        # Poll for result
        for _ in range(60):  # ~5 minutes
            time.sleep(5)
            status_resp = requests.get(
                "https://api.heygen.com/v2/video/get-status",
                params={"video_id": video_id},
                headers=headers,
                timeout=20
            )
            status_resp.raise_for_status()
            status_data = status_resp.json().get("data", {})
            status = status_data.get("status", "").lower()

            if status in ("completed", "succeeded"):
                video_url = status_data.get("video_url")
                if video_url:
                    return jsonify({"success": True, "video_url": video_url})
            elif status in ("failed", "error"):
                return jsonify({"error": "Generation failed", "details": status_data}), 500

        return jsonify({"message": "processing", "video_id": video_id}), 202

    except Exception as e:
        app.logger.exception("generate_heygen_video")
        return jsonify({"error": str(e)}), 500

# ── Video Status Polling ──────────────────────────────────────────────────────
@app.route("/video-status", methods=["GET", "OPTIONS"])
def video_status():
    if request.method == "OPTIONS": return "", 204
    video_id = request.args.get("video_id")
    if not video_id: return jsonify({"error": "video_id required"}), 400

    try:
        resp = requests.get(
            "https://api.heygen.com/v2/video/get-status",
            params={"video_id": video_id},
            headers={"X-Api-Key": HEYGEN_API_KEY},
            timeout=20
        )
        resp.raise_for_status()
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=True)