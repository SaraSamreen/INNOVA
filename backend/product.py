import os
import io
import base64
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image, ImageDraw

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
FRONTEND_PUBLIC = os.path.join(os.path.dirname(__file__), "..", "public")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ---------------------------
# Helpers
# ---------------------------
def decode_base64_to_image(b64_string):
    img_bytes = base64.b64decode(b64_string)
    return Image.open(io.BytesIO(img_bytes)).convert("RGBA")


def encode_image_to_base64(img):
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def image_to_bytes(img):
    """Convert PIL Image to bytes"""
    buf = io.BytesIO()
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img.save(buf, format='JPEG')
    buf.seek(0)
    return buf.getvalue()


# ---------------------------
# Gemini-Powered Product Analysis & Instructions
# ---------------------------
def analyze_product_with_gemini(product_img):
    """
    Use Gemini Vision to analyze the product and create a detailed description
    """
    if not GEMINI_API_KEY:
        return "stylish leather handbag"
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Convert image for Gemini
        product_bytes = image_to_bytes(product_img)
        
        prompt = """Analyze this product image and provide a detailed but concise description 
        focusing on: color, material, style, and key features. 
        Keep it under 20 words. Example: 'beige leather tote bag with gold hardware and structured design'"""
        
        response = model.generate_content([prompt, {"mime_type": "image/jpeg", "data": product_bytes}])
        
        return response.text.strip()
    except Exception as e:
        print(f"Gemini analysis error: {e}")
        return "stylish handbag"


def generate_placement_instructions(model_img, product_img):
    """
    Use Gemini to analyze the model image and suggest optimal product placement
    """
    if not GEMINI_API_KEY:
        return None
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        model_bytes = image_to_bytes(model_img)
        product_desc = analyze_product_with_gemini(product_img)
        
        prompt = f"""Analyze this fashion model image. The goal is to place a {product_desc} 
        in the model's hands naturally. 
        
        Provide:
        1. Where are the model's hands? (percentage from top, percentage from left)
        2. What's the hand position? (front, side, crossed, etc)
        3. Recommended product size (as percentage of image width)
        4. Any rotation needed (degrees)
        
        Format your response as:
        HANDS: X% from left, Y% from top
        POSITION: [description]
        SIZE: [percentage]%
        ROTATION: [degrees]°"""
        
        response = model.generate_content([prompt, {"mime_type": "image/jpeg", "data": model_bytes}])
        
        return response.text
    except Exception as e:
        print(f"Gemini placement error: {e}")
        return None


def parse_gemini_instructions(instructions):
    """Parse Gemini's placement instructions"""
    if not instructions:
        return {"x": 0.5, "y": 0.45, "size": 0.25, "rotation": 0}
    
    try:
        params = {"x": 0.5, "y": 0.45, "size": 0.25, "rotation": 0}
        
        for line in instructions.split('\n'):
            if 'HANDS:' in line:
                # Extract percentages
                parts = line.split(',')
                if len(parts) >= 2:
                    x_part = parts[0].split('%')[0]
                    y_part = parts[1].split('%')[0]
                    params['x'] = float(x_part.split()[-1]) / 100
                    params['y'] = float(y_part.split()[-1]) / 100
            
            elif 'SIZE:' in line:
                size = line.split(':')[1].strip().replace('%', '')
                params['size'] = float(size) / 100
            
            elif 'ROTATION:' in line:
                rotation = line.split(':')[1].strip().replace('°', '')
                params['rotation'] = float(rotation)
        
        return params
    except:
        return {"x": 0.5, "y": 0.45, "size": 0.25, "rotation": 0}


# ---------------------------
# AI-Enhanced Product Placement
# ---------------------------
def smart_product_placement(model_img, product_img):
    """
    Use Gemini to intelligently place the product on the model
    """
    try:
        # Remove background from product
        from rembg import remove as remove_bg
        buffer = io.BytesIO()
        product_img.save(buffer, format="PNG")
        result = remove_bg(buffer.getvalue())
        product_img = Image.open(io.BytesIO(result)).convert("RGBA")
    except:
        print("rembg not available, using original product image")
    
    # Get AI-powered placement instructions
    print("Getting Gemini placement analysis...")
    instructions = generate_placement_instructions(model_img, product_img)
    params = parse_gemini_instructions(instructions)
    
    print(f"Placement params: {params}")
    
    # Resize product based on AI recommendation
    target_width = int(model_img.width * params['size'])
    pw, ph = product_img.size
    scale = target_width / pw
    new_size = (target_width, int(ph * scale))
    product_img = product_img.resize(new_size, Image.LANCZOS)
    
    # Rotate if needed
    if params['rotation'] != 0:
        product_img = product_img.rotate(params['rotation'], expand=True)
    
    # Calculate position based on AI analysis
    x = int(model_img.width * params['x']) - (product_img.width // 2)
    y = int(model_img.height * params['y']) - (product_img.height // 2)
    
    # Ensure product stays inside frame
    x = max(0, min(x, model_img.width - product_img.width))
    y = max(0, min(y, model_img.height - product_img.height))
    
    # Create composite
    composite = model_img.copy()
    composite.paste(product_img, (x, y), product_img)
    
    return composite


# ---------------------------
# Fallback: Simple Overlay
# ---------------------------
def simple_overlay(model_img, product_img):
    """Simple overlay for when Gemini is not available"""
    try:
        from rembg import remove as remove_bg
        buffer = io.BytesIO()
        product_img.save(buffer, format="PNG")
        result = remove_bg(buffer.getvalue())
        product_img = Image.open(io.BytesIO(result)).convert("RGBA")
    except:
        pass

    target_width = int(model_img.width * 0.25)
    pw, ph = product_img.size
    scale = target_width / pw
    new_size = (target_width, int(ph * scale))
    product_img = product_img.resize(new_size, Image.LANCZOS)

    x = (model_img.width - product_img.width) // 2
    y = int(model_img.height * 0.45)

    composite = model_img.copy()
    composite.paste(product_img, (x, y), product_img)
    
    return composite


# ---------------------------
# ROUTE: Generate Final Image
# ---------------------------
@app.route("/generate-final", methods=["POST"])
def generate_final():
    try:
        data = request.get_json()
        model_path = data.get("model_image_path")
        product_b64 = data.get("product_image")
        use_ai = data.get("use_ai", True)  # Default to using AI if available

        if not model_path or not product_b64:
            return jsonify({"error": "model_image_path and product_image required"}), 400

        # Load model image
        clean_path = model_path.lstrip("/")
        full_model_path = os.path.join(FRONTEND_PUBLIC, clean_path)
        
        if not os.path.exists(full_model_path):
            return jsonify({"error": f"Model image not found at {full_model_path}"}), 404

        model_img = Image.open(full_model_path).convert("RGBA")
        product_img = decode_base64_to_image(product_b64)

        # Choose generation method
        if use_ai and GEMINI_API_KEY:
            print("Using Gemini AI-Enhanced Placement")
            final = smart_product_placement(model_img, product_img)
            method = "gemini"
        else:
            print("Using Simple Overlay")
            final = simple_overlay(model_img, product_img)
            method = "simple"

        # Convert to base64
        final_b64 = encode_image_to_base64(final)

        return jsonify({
            "success": True,
            "final": final_b64,
            "method_used": method
        }), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ---------------------------
# ROUTE: Analyze Product (Optional endpoint for testing)
# ---------------------------
@app.route("/analyze-product", methods=["POST"])
def analyze_product():
    try:
        data = request.get_json()
        product_b64 = data.get("product_image")
        
        if not product_b64:
            return jsonify({"error": "product_image required"}), 400
        
        product_img = decode_base64_to_image(product_b64)
        description = analyze_product_with_gemini(product_img)
        
        return jsonify({
            "success": True,
            "description": description
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------
# Run Server
# ---------------------------
if __name__ == "__main__":
    print(f"Starting server...")
    print(f"FRONTEND_PUBLIC: {FRONTEND_PUBLIC}")
    
    if GEMINI_API_KEY:
        print("✓ Gemini API configured - AI placement available")
    else:
        print("⚠ Gemini API not configured - using simple overlay")
        print("Add GEMINI_API_KEY to .env file to enable AI features")
    
    app.run(host="0.0.0.0", port=5002, debug=True)