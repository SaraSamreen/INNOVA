import os
import base64
import io
from flask import Flask, request, jsonify
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()  # Load .env variables

app = Flask(__name__)

# Initialize Gemini client with API key from env variable
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("Missing GOOGLE_API_KEY environment variable")

client = genai.Client(api_key=api_key)

@app.route("/api/design/generate", methods=["POST"])
def generate_design():
    """
    Accepts JSON: { prompt: str, style: str (optional), options: {...} }
    Returns: { success: bool, images: [base64_str], metadata: { session_id ... } }
    """
    data = request.get_json(force=True, silent=True)
    if not data or "prompt" not in data:
        return jsonify({"success": False, "message": "Missing 'prompt' in request body"}), 400

    prompt = data.get("prompt")
    style = data.get("style", None)
    options = data.get("options", {})

    full_prompt = f"{style}, {prompt}" if style else prompt

    try:
        response = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=full_prompt,
            config=types.GenerateImagesConfig(
                number_of_images=options.get("number_of_images", 1),
            )
        )

        images_b64 = []
        for gen_img in response.generated_images:
            image_bytes = gen_img.image.bytes
            images_b64.append(base64.b64encode(image_bytes).decode("utf-8"))

        session_id = f"dm_{int(os.times()[4]*1000)}"
        metadata = {"session_id": session_id, "prompt": full_prompt}

        return jsonify({"success": True, "images": images_b64, "metadata": metadata}), 200

    except Exception as e:
        print(f"Error generating image: {e}")
        return jsonify({"success": False, "message": "Image generation failed", "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
