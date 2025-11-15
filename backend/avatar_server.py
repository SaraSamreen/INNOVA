import io
import os
import base64
import datetime
import jwt
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
from PIL import Image
from rembg import remove
from google.cloud import aiplatform
from gtts import gTTS
from flask import send_file
import tempfile
from flask import send_from_directory
import requests
import json


load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
bcrypt = Bcrypt(app)
# Create videos directory
VIDEOS_DIR = os.path.join(os.getcwd(), "generated_videos")
AUDIO_DIR = os.path.join(os.getcwd(), "generated_audio")
os.makedirs(VIDEOS_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

@app.route("/videos/<filename>")
def serve_video(filename):
    return send_from_directory(VIDEOS_DIR, filename)

@app.route("/audio/<filename>")
def serve_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)


# Secret key for JWT
app.config['SECRET_KEY'] = os.getenv("JWT_SECRET", "supersecretkey")
D_ID_API_KEY = os.getenv("D_ID_API_KEY")

# MongoDB Setup
mongo_uri = os.getenv("ATLAS_URI")
client = MongoClient(mongo_uri)
db = client["fashion_ai"]
users = db["users"]

# Google Vertex AI Setup
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID")
GCP_REGION = os.getenv("GCP_REGION", "us-central1")
if not GCP_PROJECT_ID:
    raise ValueError("Missing GCP_PROJECT_ID in .env file.")

aiplatform.init(project=GCP_PROJECT_ID, location=GCP_REGION)

# ===================== #
#  HELPER FUNCTIONS     #
# ===================== #
def generate_token(user_id):
    payload = {
        "user_id": str(user_id),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=3)
    }
    token = jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")
    return token

def verify_token(token):
    try:
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        return decoded["user_id"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def image_to_base64(img: Image.Image):
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

# ===================== #
#   AUTHENTICATION API  #
# ===================== #
@app.route("/api/auth/register", methods=["POST"])
def register_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = {
        "name": data.get("name", ""),
        "email": email,
        "password": hashed_pw,
        "phone": "",
        "username": "",
        "socialLinks": {"tiktok": "", "facebook": "", "instagram": ""},
        "privacy": {"twoFactorAuth": False, "dataSharing": False},
        "drafts": []
    }

    result = users.insert_one(new_user)
    token = generate_token(result.inserted_id)

    return jsonify({"message": "User registered", "token": token})

@app.route("/api/auth/login", methods=["POST"])
def login_user():
    data = request.get_json()
    user = users.find_one({"email": data.get("email")})
    if not user or not bcrypt.check_password_hash(user["password"], data.get("password")):
        return jsonify({"message": "Invalid credentials"}), 401

    token = generate_token(user["_id"])
    return jsonify({"message": "Login successful", "token": token})

# ===================== #
#   VOICE PREVIEW API   #
# ===================== #
@app.route("/preview-voice", methods=["POST"])
def preview_voice():
    data = request.get_json()
    text = data.get("text")
    voice_code = data.get("voice")  # you can use this for future voice mapping

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        # Simple TTS using gTTS (Google Text-to-Speech)
        # You can extend this to map 'voice_code' to different TTS accents or engines
        tts = gTTS(text=text, lang="en")  

        # Save to temporary file
        tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        tts.save(tmp_file.name)

        return send_file(tmp_file.name, mimetype="audio/mpeg")
    except Exception as e:
        print("TTS error:", e)
        return jsonify({"error": f"Failed to generate voice preview: {str(e)}"}), 500
  # Add to your .env file

@app.route("/speak", methods=["POST", "OPTIONS"])
def generate_avatar_video():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    data = request.get_json()
    text = data.get("text")
    avatar_id = data.get("avatar_id")
    background = data.get("background")

    if not text or not avatar_id:
        return jsonify({"success": False, "error": "Missing text or avatar"}), 400

    try:
        # Map avatar_id to avatar image path
        avatar_images = {
            "avatar1": "/avatar/avatar1.jpg",
            "avatar2": "/avatar/avatar2.jpg",
            "avatar3": "/avatar/avatar3.jpg",
            "avatar4": "/avatar/avatar4.jpg"
        }

        avatar_image_path = avatar_images.get(avatar_id)
        if not avatar_image_path:
            return jsonify({"success": False, "error": "Invalid avatar"}), 400

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        avatar_full_path = os.path.join(base_dir, "public", avatar_image_path.lstrip("/"))

        with open(avatar_full_path, "rb") as img_file:
            avatar_b64 = base64.b64encode(img_file.read()).decode("utf-8")

        # Prepare Base64 authorization for D-ID API
        auth_header = base64.b64encode(f"{D_ID_API_KEY}:".encode()).decode()
        headers = {
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/json"
        }

        # Call D-ID API
        did_response = requests.post(
            "https://api.d-id.com/talks",
            headers=headers,
            json={
                "script": {
                    "type": "text",
                    "input": text,
                    "provider": {
                        "type": "microsoft",
                        "voice_id": "en-US-JennyNeural"
                    }
                },
                "source_url": f"data:image/jpeg;base64,{avatar_b64}",
                "config": {
                    "fluent": True,
                    "pad_audio": 0
                }
            }
        )

        if did_response.status_code != 201:
            return jsonify({
                "success": False,
                "error": f"D-ID API error: {did_response.text}"
            }), 500

        talk_id = did_response.json()["id"]

        # Poll for video completion
        video_url = None
        for _ in range(30):
            import time
            time.sleep(2)

            status_response = requests.get(
                f"https://api.d-id.com/talks/{talk_id}",
                headers=headers
            )
            status_data = status_response.json()
            if status_data["status"] == "done":
                video_url = status_data["result_url"]
                break

        if not video_url:
            return jsonify({
                "success": False,
                "error": "Video generation timeout"
            }), 500

        return jsonify({"success": True, "video_url": video_url})

    except Exception as e:
        print("Video generation error:", e)
        return jsonify({"success": False, "error": str(e)}), 500

# ===================== #
#   PROFILE MANAGEMENT  #
# ===================== #
@app.route("/api/profile/update", methods=["PUT"])
def update_profile():
    token = request.headers.get("x-auth-token")
    user_id = verify_token(token)
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    update_data = {}

    allowed_fields = [
        "name", "phone", "username",
        "socialLinks", "privacy", "drafts"
    ]
    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]

    users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    updated_user = users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    updated_user["_id"] = str(updated_user["_id"])
    return jsonify({"message": "Profile updated", "user": updated_user})

# ===================== #
#   AI IMAGE ROUTES     #
# ===================== #
POSE_PROMPTS = {
    "front": "A professional AI avatar model facing camera holding the uploaded product, studio lighting, white background",
    "left": "A professional AI avatar in left profile holding the product elegantly, white background, soft lighting",
    "right": "A professional AI avatar in right profile holding the product confidently, white background, soft lighting",
    "freestyle": "A creative lifestyle AI avatar presenting the product in an aesthetic pose, cinematic lighting"
}

@app.route("/api/ai/generate", methods=["POST"])
def generate_ai_images():
    data = request.get_json()
    product_image_b64 = data.get("product_image")

    if not product_image_b64:
        return jsonify({"error": "Missing product image"}), 400

    product_image = Image.open(io.BytesIO(base64.b64decode(product_image_b64))).convert("RGBA")
    results = {}

    for pose_name, prompt in POSE_PROMPTS.items():
        try:
            model = aiplatform.ImageGenerationModel.from_pretrained("google/cog-image-alpha")
            response = model.predict(
                prompt=prompt,
                max_output_tokens=256,
                image_dimensions=(1024, 1024)
            )
            model_image = response.images[0].convert("RGBA")
        except Exception as e:
            return jsonify({"error": f"Gemini generation failed: {str(e)}"}), 500

        model_no_bg = remove(model_image)
        model_no_bg.paste(product_image, (100, 500), product_image)
        results[pose_name] = image_to_base64(model_no_bg)

    return jsonify({"results": results})

@app.route("/api/ai/remove-bg", methods=["POST"])
def remove_bg():
    data = request.get_json()
    image_b64 = data.get("image")

    if not image_b64:
        return jsonify({"error": "Missing image"}), 400

    img = Image.open(io.BytesIO(base64.b64decode(image_b64)))
    result = remove(img)
    result_b64 = image_to_base64(result)
    return jsonify({"result": result_b64})

# ===================== #
#   TEST / HEALTH API   #
# ===================== #
@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({"message": "Backend is running!"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# ===================== #
#       MAIN ENTRY      #
# ===================== #
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5002))
    print(f"🚀 Server running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port)
