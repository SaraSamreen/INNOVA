"""
Ultimate Product Showcase Generator
- Generates AI models using Stable Diffusion
- Composites YOUR ACTUAL product onto the generated models
- 4 variations: 1 close-up + 3 model poses
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont
import torch
from diffusers import StableDiffusionPipeline
import numpy as np
from rembg import remove
import time

app = Flask(__name__)
CORS(app)

# Directories
OUTPUT_DIR = "generated_showcases"
UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"
for dir_path in [OUTPUT_DIR, UPLOAD_DIR, PROCESSED_DIR]:
    os.makedirs(dir_path, exist_ok=True)

# Global variables
sd_pipeline = None
models_ready = False
models_loading = False

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🖥️  Using device: {device}")

# Model configurations
MODEL_CONFIGS = {
    "model1": {
        "name": "Sophia",
        "seed": 42,
        "style": "professional elegant woman in business attire, natural pose, studio lighting, high fashion photography",
        "hand_pose": "hand extended forward ready to hold item"
    },
    "model2": {
        "name": "Emma",
        "seed": 123,
        "style": "casual friendly woman in casual outfit, natural smile, outdoor lifestyle setting",
        "hand_pose": "hand at hip level holding position"
    },
    "model3": {
        "name": "Aria",
        "seed": 456,
        "style": "modern chic woman in contemporary fashion, confident pose, soft studio lighting",
        "hand_pose": "hand raised near shoulder level"
    },
    "model4": {
        "name": "Zara",
        "seed": 789,
        "style": "bold confident woman in stylish outfit, dynamic pose, dramatic lighting",
        "hand_pose": "hand extended showing item"
    },
    "model5": {
        "name": "Maya",
        "seed": 999,
        "style": "natural fresh woman in simple clothing, relaxed pose, natural daylight",
        "hand_pose": "hand comfortably holding position"
    }
}

def init_models():
    """Initialize Stable Diffusion"""
    global sd_pipeline, models_loading, models_ready
    
    models_loading = True
    print("\n" + "="*70)
    print("📦 Loading Stable Diffusion Model...")
    print("="*70)
    
    try:
        model_id = "runwayml/stable-diffusion-v1-5"
        
        sd_pipeline = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            safety_checker=None,
            requires_safety_checker=False
        )
        sd_pipeline = sd_pipeline.to(device)
        
        if device == "cuda":
            sd_pipeline.enable_attention_slicing()
            sd_pipeline.enable_vae_slicing()
        
        models_ready = True
        models_loading = False
        print("✅ Model loaded successfully!\n")
        return True
        
    except Exception as e:
        print(f"❌ Error loading model: {e}\n")
        models_loading = False
        models_ready = False
        return False

def remove_background(image_path):
    """Remove background from product image"""
    try:
        print("   🔧 Removing background from product...")
        input_image = Image.open(image_path)
        output_image = remove(input_image)
        
        processed_path = os.path.join(PROCESSED_DIR, f"nobg_{os.path.basename(image_path)}")
        output_image.save(processed_path)
        print("   ✅ Background removed")
        return output_image
    except Exception as e:
        print(f"   ⚠️  Background removal failed: {e}")
        return Image.open(image_path).convert("RGBA")

def create_gradient_background(width, height, color1=(245, 245, 250), color2=(235, 235, 245)):
    """Create beautiful gradient background"""
    base = Image.new('RGB', (width, height), color1)
    draw = ImageDraw.Draw(base)
    
    for y in range(height):
        ratio = y / height
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    return base

def add_product_shadow(canvas, product, position, blur=15):
    """Add realistic shadow under product"""
    shadow = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    
    # Create shadow shape
    shadow_draw = ImageDraw.Draw(shadow)
    x, y = position
    shadow_draw.ellipse(
        [x+10, y+product.height-20, x+product.width-10, y+product.height+10],
        fill=(0, 0, 0, 80)
    )
    
    # Blur shadow
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    
    # Composite
    result = Image.alpha_composite(canvas.convert('RGBA'), shadow)
    return result

def create_product_closeup(product_img):
    """Create professional product close-up"""
    print("   📸 Creating product close-up...")
    
    width, height = 768, 768
    
    # Create gradient background
    canvas = create_gradient_background(width, height, (250, 250, 255), (240, 240, 250))
    canvas = canvas.convert('RGBA')
    
    # Resize product to fit nicely
    product_copy = product_img.copy()
    product_copy.thumbnail((550, 550), Image.Resampling.LANCZOS)
    
    # Center product
    x = (width - product_copy.width) // 2
    y = (height - product_copy.height) // 2
    
    # Add shadow
    canvas = add_product_shadow(canvas, product_copy, (x, y), blur=20)
    
    # Paste product
    canvas.paste(product_copy, (x, y), product_copy)
    
    # Add subtle vignette effect
    vignette = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(vignette)
    for i in range(80):
        alpha = int((i / 80) * 25)
        draw.rectangle([i, i, width-i, height-i], outline=(0, 0, 0, alpha))
    canvas = Image.alpha_composite(canvas, vignette)
    
    print("   ✅ Product close-up created")
    return canvas.convert('RGB')

def generate_model_image(model_config, pose_type, seed):
    """Generate AI model image using Stable Diffusion"""
    
    # Build detailed prompt
    if pose_type == "holding":
        pose_desc = f"standing pose, {model_config['hand_pose']}, hand in front of body"
    elif pose_type == "shoulder":
        pose_desc = "three quarter view, hand near shoulder, elegant pose"
    else:  # lifestyle
        pose_desc = "casual standing pose, relaxed posture, natural stance"
    
    prompt = f"professional fashion photography, {model_config['style']}, {pose_desc}, full body visible, plain background, 8k, high detail, photorealistic"
    
    negative_prompt = "blurry, distorted, bad anatomy, deformed hands, extra fingers, disfigured, ugly, low quality, watermark, text, logo, face cut off, cropped"
    
    generator = torch.Generator(device=device).manual_seed(seed)
    
    print(f"   🎨 Generating AI model with Stable Diffusion...")
    
    with torch.no_grad():
        image = sd_pipeline(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=30,
            guidance_scale=7.5,
            generator=generator,
            height=768,
            width=512
        ).images[0]
    
    print(f"   ✅ Model generated")
    return image

def composite_product_on_model(model_image, product_img, pose_type):
    """Intelligently composite YOUR product onto the generated model"""
    
    print(f"   🖼️  Compositing product onto model...")
    
    # Convert model to RGBA
    canvas = model_image.convert('RGBA')
    width, height = canvas.size
    
    # Prepare product
    product_copy = product_img.copy()
    
    # Determine product size and position based on pose
    if pose_type == "holding":
        # Product held in hand (center-bottom area)
        product_copy.thumbnail((220, 220), Image.Resampling.LANCZOS)
        x = (width - product_copy.width) // 2
        y = int(height * 0.52)
        
    elif pose_type == "shoulder":
        # Product on shoulder (upper-right area)
        product_copy.thumbnail((180, 180), Image.Resampling.LANCZOS)
        x = int(width * 0.58)
        y = int(height * 0.28)
        
    else:  # lifestyle
        # Product held casually (side area)
        product_copy.thumbnail((200, 200), Image.Resampling.LANCZOS)
        x = int(width * 0.30)
        y = int(height * 0.55)
    
    # Ensure product stays within bounds
    x = max(0, min(x, width - product_copy.width))
    y = max(0, min(y, height - product_copy.height))
    
    # Add shadow under product
    canvas = add_product_shadow(canvas, product_copy, (x, y), blur=12)
    
    # Paste product with alpha channel
    canvas.paste(product_copy, (x, y), product_copy)
    
    print(f"   ✅ Product composited at position ({x}, {y})")
    return canvas.convert('RGB')

@app.route("/generate-showcase", methods=["POST"])
def generate_showcase():
    global models_ready, models_loading
    
    # Check model status
    if models_loading:
        return jsonify({"error": "Models are still loading. Please wait..."}), 503
    
    if not models_ready:
        return jsonify({"error": "Models not loaded. Please restart the server."}), 503
    
    try:
        # Validate upload
        if 'product_image' not in request.files:
            return jsonify({"error": "No product image uploaded"}), 400
        
        product_file = request.files['product_image']
        model_id = request.form.get('model_id', 'model1')
        
        print(f"\n{'='*70}")
        print(f"🎨 GENERATING PRODUCT SHOWCASE")
        print(f"   Model: {model_id}")
        print(f"{'='*70}")
        
        # Save uploaded product
        product_filename = f"{uuid.uuid4().hex}.png"
        product_path = os.path.join(UPLOAD_DIR, product_filename)
        product_file.save(product_path)
        print(f"✅ Product image saved")
        
        # Remove background from product
        product_nobg = remove_background(product_path)
        
        # Get model configuration
        model_config = MODEL_CONFIGS.get(model_id, MODEL_CONFIGS['model1'])
        base_seed = model_config['seed']
        
        generated_images = []
        
        # ==========================================
        # IMAGE 1: Product Close-up (YOUR PRODUCT)
        # ==========================================
        print(f"\n📸 Image 1/4: Product Close-up")
        closeup = create_product_closeup(product_nobg)
        
        filename1 = f"closeup_{uuid.uuid4().hex}.png"
        filepath1 = os.path.join(OUTPUT_DIR, filename1)
        closeup.save(filepath1, quality=95)
        
        generated_images.append({
            "url": f"http://localhost:5004/showcase/{filename1}",
            "angle": "Product Close-up",
            "index": 0
        })
        
        # ==========================================
        # IMAGES 2-4: AI Models + YOUR Product
        # ==========================================
        poses = [
            ("holding", "Model Holding Product"),
            ("shoulder", "Product on Shoulder"),
            ("lifestyle", "Lifestyle Shot")
        ]
        
        for idx, (pose_type, pose_name) in enumerate(poses, 1):
            print(f"\n📸 Image {idx + 1}/4: {pose_name}")
            
            # Generate AI model
            seed = base_seed + (idx * 100)
            model_img = generate_model_image(model_config, pose_type, seed)
            
            # Composite YOUR product onto the model
            final_img = composite_product_on_model(model_img, product_nobg, pose_type)
            
            # Save result
            filename = f"{model_id}_{pose_type}_{uuid.uuid4().hex}.png"
            filepath = os.path.join(OUTPUT_DIR, filename)
            final_img.save(filepath, quality=95)
            
            generated_images.append({
                "url": f"http://localhost:5004/showcase/{filename}",
                "angle": pose_name,
                "index": idx
            })
        
        print(f"\n✅ Successfully generated all 4 showcase images!")
        print(f"{'='*70}\n")
        
        return jsonify({
            "success": True,
            "images": generated_images,
            "model": model_config['name']
        })
        
    except Exception as e:
        print(f"\n❌ Error in generate_showcase: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/showcase/<filename>")
def serve_showcase(filename):
    """Serve generated images"""
    return send_from_directory(OUTPUT_DIR, filename)

@app.route("/health")
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy" if models_ready else ("loading" if models_loading else "error"),
        "device": device,
        "models_loaded": models_ready
    })

@app.route("/status")
def status():
    """Detailed status endpoint"""
    return jsonify({
        "ready": models_ready,
        "loading": models_loading,
        "device": device,
        "message": "Ready to generate!" if models_ready else (
            "Loading models..." if models_loading else "Models failed to load"
        )
    })

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🚀 ULTIMATE PRODUCT SHOWCASE GENERATOR")
    print("="*70)
    print("✨ Features:")
    print("   • Generates AI models using Stable Diffusion")
    print("   • Uses YOUR actual product image (not random generation)")
    print("   • Removes product background automatically")
    print("   • 1 close-up + 3 model poses with your product")
    print("="*70)
    print("\n🌐 Server: http://localhost:5004")
    print("📁 Output: ./generated_showcases/")
    print("="*70 + "\n")
    
    # Initialize models in background thread
    import threading
    model_thread = threading.Thread(target=init_models)
    model_thread.daemon = True
    model_thread.start()
    
    # Start Flask server
    app.run(host='0.0.0.0', port=5004, debug=False, threaded=True) 