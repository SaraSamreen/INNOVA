from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from gtts import gTTS
import os
import uuid
import base64
import io
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import traceback
from pydub import AudioSegment
import json
import subprocess
import shutil
import torch
from transformers import GPTNeoForCausalLM, GPT2Tokenizer
import re

app = Flask(__name__)
CORS(app)

# Directories
AUDIO_DIR = "generated_audio"
AVATAR_DIR = "generated_avatars"
LIPSYNC_DIR = "lipsync_videos"
READY_AVATARS_DIR = "ready_avatars"
TEMP_DIR = "temp_processing"

for dir_path in [AUDIO_DIR, AVATAR_DIR, LIPSYNC_DIR, READY_AVATARS_DIR, TEMP_DIR]:
    os.makedirs(dir_path, exist_ok=True)

# Face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

# Wav2Lip configuration
WAV2LIP_PATH = "Wav2Lip"
WAV2LIP_CHECKPOINT = os.path.join(WAV2LIP_PATH, "checkpoints", "wav2lip_gan.pth")

# ============= GPT-NEO MODEL LOADING =============
print("\n" + "="*50)
print("🤖 Loading GPT-Neo model for script enhancement...")
print("⏳ This may take a few minutes on first run...")

try:
    MODEL_NAME = "EleutherAI/gpt-neo-125M"  # Start with smaller model (125M)
    # Use 1.3B for better quality: "EleutherAI/gpt-neo-1.3B"
    # Use 2.7B for best quality: "EleutherAI/gpt-neo-2.7B"
    
    tokenizer = GPT2Tokenizer.from_pretrained(MODEL_NAME)
    model = GPTNeoForCausalLM.from_pretrained(MODEL_NAME)
    
    # Move to GPU if available
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = model.to(device)
    
    # Set padding token
    tokenizer.pad_token = tokenizer.eos_token
    
    GPT_NEO_AVAILABLE = True
    print(f"✅ GPT-Neo model loaded successfully on {device}!")
    print(f"📦 Model: {MODEL_NAME}")
    print("="*50 + "\n")
except Exception as e:
    GPT_NEO_AVAILABLE = False
    print(f"❌ Failed to load GPT-Neo: {e}")
    print("⚠️  Script enhancement will use fallback method")
    print("="*50 + "\n")

def check_wav2lip_available():
    """Check if Wav2Lip is installed and configured"""
    return os.path.exists(WAV2LIP_PATH) and os.path.exists(WAV2LIP_CHECKPOINT)

# ============= READY-TO-USE AVATARS =============

READY_AVATARS = {
    "avatar1": {
        "id": "avatar1",
        "name": "Professional Woman",
        "image": "avatar1.jpg",
        "style": "realistic",
        "gender": "female"
    },
    "avatar2": {
        "id": "avatar2",
        "name": "Business Man",
        "image": "avatar2.jpg",
        "style": "realistic",
        "gender": "male"
    },
    "avatar3": {
        "id": "avatar3",
        "name": "Creative Artist",
        "image": "avatar3.jpg",
        "style": "realistic",
        "gender": "female"
    },
    "avatar4": {
        "id": "avatar4",
        "name": "Tech Professional",
        "image": "avatar4.jpg",
        "style": "realistic",
        "gender": "male"
    }
}

@app.route("/ready-avatars", methods=["GET"])
def get_ready_avatars():
    """Get list of ready-to-use avatars"""
    avatars_list = []
    for avatar_id, avatar_data in READY_AVATARS.items():
        avatar_path = os.path.join(READY_AVATARS_DIR, avatar_data['image'])
        avatars_list.append({
            **avatar_data,
            "url": f"/ready-avatars/{avatar_data['image']}" if os.path.exists(avatar_path) else None
        })
    return jsonify({"success": True, "avatars": avatars_list})

@app.route("/ready-avatars/<filename>")
def serve_ready_avatar(filename):
    """Serve ready-to-use avatar images"""
    return send_from_directory(READY_AVATARS_DIR, filename)

# ============= GPT-NEO SCRIPT ENHANCEMENT =============

@app.route("/api/generate-script", methods=["POST"])
def generate_script():
    """
    Enhance user's script using GPT-Neo
    Expected JSON: {
        "inputText": "user's script to be enhanced",
        "actor": "male/female",
        "background": "studio/office/nature/etc",
        "videoType": "product-ad/service-promo/etc"
    }
    """
    try:
        print("\n" + "="*50)
        print("📝 Script Enhancement Request")
        
        data = request.get_json()
        
        # Extract and validate data
        input_text = data.get('inputText', '').strip()
        actor = data.get('actor', '').strip()
        background = data.get('background', '').strip()
        video_type = data.get('videoType', '').strip()
        
        if not all([input_text, actor, background, video_type]):
            return jsonify({
                'success': False,
                'error': 'Missing required fields: inputText, actor, background, or videoType'
            }), 400
        
        print(f"  Actor: {actor}")
        print(f"  Background: {background}")
        print(f"  Video Type: {video_type}")
        print(f"  Original Script: '{input_text[:80]}...'")
        print(f"  Input Length: {len(input_text)} chars")
        
        # Use GPT-Neo if available, otherwise fallback
        if GPT_NEO_AVAILABLE:
            enhanced_script = generate_with_gpt_neo(input_text, actor, background, video_type)
            model_used = MODEL_NAME
        else:
            enhanced_script = generate_fallback_script(input_text, actor, background, video_type)
            model_used = "fallback-enhancement"
        
        print(f"✅ Script enhanced using {model_used}")
        print(f"  Enhanced Script: '{enhanced_script[:80]}...'")
        print(f"  Output Length: {len(enhanced_script)} chars")
        print("="*50 + "\n")
        
        return jsonify({
            'success': True,
            'enhanced_script': enhanced_script,
            'model': model_used
        })
    
    except Exception as e:
        print(f"❌ Script enhancement error: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def generate_with_gpt_neo(input_text, actor, background, video_type):
    """Enhance user's script using GPT-Neo model"""
    try:
        # Format video type nicely
        video_type_display = video_type.replace('-', ' ').title()
        
        # IMPROVED PROMPT ENGINEERING - Focus on enhancement, not creation
        prompt = f"""Task: Enhance this video script to make it more engaging and professional for voice-over.

Original Script: "{input_text}"

Context:
- Video Type: {video_type_display}
- Voice Actor: {actor.capitalize()}
- Background Setting: {background.capitalize()}
- Target Length: 30-45 seconds when spoken

Instructions:
1. Keep the core message and meaning from the original script
2. Make it more conversational and engaging for spoken delivery
3. Add emotional hooks and energy appropriate for the video type
4. Optimize sentence flow and rhythm for voice acting
5. Include a subtle call-to-action if appropriate
6. Write ONLY the words to be spoken - no stage directions, no scene descriptions
7. Keep it natural and authentic

Enhanced Script:"""
        
        # Tokenize with attention mask
        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        ).to(device)
        
        # OPTIMIZED GENERATION PARAMETERS
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                attention_mask=inputs.attention_mask,
                max_length=inputs.input_ids.shape[1] + 200,  # Shorter for focused enhancement
                temperature=0.7,          # Lower for more focused, less random output
                top_p=0.9,                # Nucleus sampling - consider top 90% probability mass
                top_k=40,                 # Consider top 40 tokens
                do_sample=True,           # Enable sampling for creativity
                pad_token_id=tokenizer.eos_token_id,
                repetition_penalty=1.4,   # Higher penalty to avoid repetition
                no_repeat_ngram_size=4,   # Prevent 4-gram repetition
                num_return_sequences=1,
                early_stopping=True       # Stop when natural endpoint reached
            )
        
        # Decode output
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract enhanced script (remove prompt)
        enhanced_script = generated_text[len(prompt):].strip()
        
        # ADVANCED OUTPUT CLEANING
        enhanced_script = clean_generated_script(enhanced_script)
        
        # Fallback if output is too short or problematic
        if len(enhanced_script) < 50:
            print("⚠️  GPT-Neo output too short, using fallback")
            return generate_fallback_script(input_text, actor, background, video_type)
        
        # Verify no stage directions leaked through
        if has_stage_directions(enhanced_script):
            print("⚠️  Stage directions detected, using fallback")
            return generate_fallback_script(input_text, actor, background, video_type)
        
        return enhanced_script
        
    except Exception as e:
        print(f"❌ GPT-Neo enhancement error: {e}")
        return generate_fallback_script(input_text, actor, background, video_type)

def clean_generated_script(text):
    """
    Advanced cleaning to remove all artifacts and stage directions
    Returns only the spoken words
    """
    # Remove common instruction artifacts
    unwanted_phrases = [
        'Enhanced Script:', 'Here is the enhanced script:', 'Here\'s the enhanced script:',
        'The script should be:', 'Script:', 'Voiceover:',
        '[Music]', '[SFX]', '[Sound effects]', '[Sound]',
        'Instructions:', 'Note:', 'Notes:',
        'Scene:', 'Action:', 'Camera:', 'Shot:',
        'Narrator:', 'Voice-over:', 'VO:',
        'Stage directions:', 'Direction:', 'Directions:',
        'Actor:', 'Actress:', 'Speaker:',
        'Fade in:', 'Fade out:', 'Cut to:',
        'Background:', 'Setting:', 'Location:',
        'Video Type:', 'Context:', 'Task:',
        'Original Script:', 'Enhanced version:',
    ]
    
    # Remove unwanted phrases (case insensitive)
    for phrase in unwanted_phrases:
        text = re.sub(re.escape(phrase), '', text, flags=re.IGNORECASE)
    
    # Remove content in brackets [like this]
    text = re.sub(r'\[.*?\]', '', text)
    
    # Remove content in parentheses (like this)
    text = re.sub(r'\(.*?\)', '', text)
    
    # Remove markdown headers (# Header)
    text = re.sub(r'^#+\s+.*$', '', text, flags=re.MULTILINE)
    
    # Remove bullet points and numbered lists
    text = re.sub(r'^\s*[-*•]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
    
    # Remove multiple newlines and extra spaces
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    text = ' '.join(lines)
    
    # Remove multiple spaces
    text = ' '.join(text.split())
    
    # Remove colons at the start (from labels)
    text = text.lstrip(':').strip()
    
    # Remove quotes if entire text is quoted
    if text.startswith('"') and text.endswith('"'):
        text = text[1:-1].strip()
    if text.startswith("'") and text.endswith("'"):
        text = text[1:-1].strip()
    
    # Limit length (max ~450 characters for 45 seconds at normal speech rate ~150 WPM)
    if len(text) > 450:
        # Try to cut at sentence boundary
        sentences = text.split('.')
        result = ""
        for sentence in sentences:
            if len(result) + len(sentence) + 2 <= 450:
                result += sentence.strip() + '. '
            else:
                break
        text = result.strip() if result else text[:450]
    
    # Ensure proper punctuation at end
    if text and text[-1] not in '.!?':
        text += '.'
    
    return text.strip()

def has_stage_directions(text):
    """
    Check if text contains stage directions or screenplay elements
    Returns True if stage directions detected
    """
    stage_direction_indicators = [
        'enters', 'exits', 'walks', 'runs', 'sits', 'stands',
        'camera', 'zoom', 'pan', 'close-up', 'wide shot',
        'fade in', 'fade out', 'cut to', 'dissolve',
        'scene opens', 'actor picks up', 'character',
        'on screen', 'in frame', 'off camera',
        'voice over', 'v.o.', 'o.s.',
    ]
    
    text_lower = text.lower()
    
    # Check for common stage direction patterns
    for indicator in stage_direction_indicators:
        if indicator in text_lower:
            return True
    
    # Check for bracketed content (usually stage directions)
    if '[' in text or ']' in text:
        return True
    
    return False

def generate_fallback_script(input_text, actor, background, video_type):
    """
    Fallback script enhancement using intelligent improvements
    Enhances user's script without GPT-Neo
    """
    # Clean and prepare the input
    script = input_text.strip()
    
    # Ensure proper sentence ending
    if script and script[-1] not in '.!?':
        script += '.'
    
    # Add conversational elements based on video type
    enhancements = {
        'product-ad': {
            'opening': ['Imagine', 'Picture this', 'What if', 'Introducing'],
            'emphasis': ['amazing', 'revolutionary', 'game-changing', 'incredible'],
            'closing': ['Experience the difference today!', 'Try it now!', 'Don\'t miss out!', 'Get yours today!']
        },
        'service-promo': {
            'opening': ['Looking for', 'Need', 'Searching for', 'Want'],
            'emphasis': ['professional', 'expert', 'trusted', 'proven'],
            'closing': ['Let\'s work together.', 'We\'re here to help.', 'Contact us today.', 'Get started now.']
        },
        'brand-awareness': {
            'opening': ['Meet', 'Discover', 'Learn about', 'This is'],
            'emphasis': ['passionate', 'dedicated', 'committed', 'authentic'],
            'closing': ['That\'s who we are.', 'Join our story.', 'Be part of something special.', 'Welcome to our family.']
        },
        'social-reel': {
            'opening': ['Hey!', 'Check this out!', 'You won\'t believe this!', 'Wait for it!'],
            'emphasis': ['awesome', 'insane', 'wild', 'epic'],
            'closing': ['Follow for more!', 'Share this!', 'Tag a friend!', 'Drop a comment!']
        }
    }
    
    # Get enhancements for video type
    video_type_key = video_type if video_type in enhancements else 'product-ad'
    enhance = enhancements[video_type_key]
    
    # Check if script needs an opening hook
    needs_opening = len(script) < 80 and not any(script.startswith(word) for word in ['hey', 'imagine', 'what', 'looking', 'need'])
    
    if needs_opening:
        import random
        opening = random.choice(enhance['opening'])
        script = f"{opening}... {script}"
    
    # Add emphasis words naturally (only if script is very short)
    if len(script) < 100:
        import random
        emphasis = random.choice(enhance['emphasis'])
        # Add emphasis before first noun if possible
        words = script.split()
        if len(words) > 3:
            script = f"{' '.join(words[:2])} {emphasis} {' '.join(words[2:])}"
    
    # Add call-to-action if missing
    needs_cta = not any(word in script.lower() for word in ['try', 'get', 'order', 'buy', 'discover', 'experience', 'contact', 'join', 'follow', 'share'])
    
    if needs_cta:
        import random
        closing = random.choice(enhance['closing'])
        script = f"{script.rstrip('.')}. {closing}"
    
    # Add conversational flow for social-reel
    if video_type == 'social-reel' and '!' not in script:
        # Replace first period with exclamation
        script = script.replace('.', '!', 1)
    
    # Ensure proper length (30-45 seconds = ~300-450 chars)
    if len(script) > 450:
        sentences = script.split('.')
        script = '. '.join(sentences[:3]) + '.'
    
    # Add minimal context if still too short
    if len(script) < 100:
        if video_type == 'product-ad':
            script += ' You deserve the best.'
        elif video_type == 'service-promo':
            script += ' We make it easy for you.'
        elif video_type == 'brand-awareness':
            script += ' Quality you can trust.'
        elif video_type == 'social-reel':
            script += ' It\'s that simple!'
    
    return script.strip()

# ============= FACE DETECTION =============

def detect_face_features(image):
    """Detect face and features in image"""
    try:
        img_array = np.array(image)
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        if len(faces) > 0:
            largest_face = max(faces, key=lambda f: f[2] * f[3])
            x, y, w, h = largest_face
            
            face_roi_gray = gray[y:y+h, x:x+w]
            eyes = eye_cascade.detectMultiScale(face_roi_gray, scaleFactor=1.1, minNeighbors=10)
            eyes_abs = [(x + ex, y + ey, ew, eh) for ex, ey, ew, eh in eyes]
            
            return True, largest_face, eyes_abs
        else:
            return False, None, None
            
    except Exception as e:
        print(f"❌ Face detection error: {e}")
        return False, None, None

# ============= CARTOON AVATAR CREATION =============

def get_dominant_skin_tone(image, face_rect):
    """Extract dominant skin tone from face region"""
    try:
        x, y, w, h = face_rect
        center_x = x + w // 2
        center_y = y + h // 2
        sample_size = min(w, h) // 4
        
        img_array = np.array(image)
        sample = img_array[
            max(0, center_y - sample_size):min(img_array.shape[0], center_y + sample_size),
            max(0, center_x - sample_size):min(img_array.shape[1], center_x + sample_size)
        ]
        
        avg_color = np.mean(sample, axis=(0, 1)).astype(int)
        return tuple(avg_color)
    except:
        return (255, 220, 177)

def get_hair_color(image, face_rect):
    """Detect hair color from region above face"""
    try:
        x, y, w, h = face_rect
        hair_region = np.array(image)[max(0, y - h // 3):y, x:x + w]
        
        if hair_region.size > 0:
            avg_color = np.mean(hair_region, axis=(0, 1)).astype(int)
            avg_color = (avg_color * 0.7).astype(int)
            return tuple(avg_color)
        return (50, 30, 20)
    except:
        return (50, 30, 20)

def lighten_color(color, factor=1.2):
    return tuple(min(255, int(c * factor)) for c in color)

def darken_color(color, factor=0.8):
    return tuple(int(c * factor) for c in color)

def create_cartoon_avatar(image, face_rect, eyes):
    """Create a professional cartoon avatar"""
    try:
        canvas_size = (512, 512)
        avatar = Image.new('RGB', canvas_size, (173, 216, 230))
        draw = ImageDraw.Draw(avatar)
        
        skin_tone = get_dominant_skin_tone(image, face_rect)
        hair_color = get_hair_color(image, face_rect)
        
        x, y, w, h = face_rect
        scale = min(400 / max(w, h), 1.5)
        new_w = int(w * scale)
        
        center_x = canvas_size[0] // 2
        face_y = 180
        face_size = int(new_w * 0.95)
        face_left = center_x - face_size // 2
        
        # BODY
        shirt_color = (0, 128, 128)
        body_width = new_w * 1.3
        body_height = 180
        neck_width = new_w // 3
        neck_height = 60
        neck_top = face_y + face_size - 30
        
        draw.rectangle(
            [center_x - neck_width // 2, neck_top, center_x + neck_width // 2, neck_top + neck_height],
            fill=darken_color(skin_tone, 0.9)
        )
        
        body_top = neck_top + neck_height - 20
        draw.rounded_rectangle(
            [center_x - body_width // 2, body_top, center_x + body_width // 2, body_top + body_height],
            radius=30, fill=shirt_color
        )
        
        # FACE
        draw.ellipse(
            [face_left, face_y, face_left + face_size, face_y + face_size],
            fill=skin_tone, outline=darken_color(skin_tone, 0.85), width=2
        )
        
        # HAIR
        hair_top = face_y - face_size // 3
        hair_width = face_size * 1.1
        draw.ellipse(
            [center_x - hair_width // 2, hair_top, center_x + hair_width // 2, face_y + face_size // 2],
            fill=hair_color
        )
        
        # EYES
        eye_y = face_y + face_size // 3
        eye_spacing = face_size // 4
        eye_width = face_size // 7
        eye_height = face_size // 9
        iris_color = (100, 180, 200)
        
        for side in [-1, 1]:
            ex = center_x + side * eye_spacing
            draw.ellipse([ex - eye_width, eye_y, ex + eye_width, eye_y + eye_height * 2],
                        fill=(255, 255, 255), outline=(0, 0, 0), width=2)
            draw.ellipse([ex - eye_width // 2, eye_y + eye_height // 3, 
                         ex + eye_width // 2, eye_y + eye_height // 3 + eye_height],
                        fill=iris_color)
            draw.ellipse([ex - eye_width // 4, eye_y + eye_height // 2, 
                         ex + eye_width // 4, eye_y + eye_height], fill=(0, 0, 0))
        
        # MOUTH
        mouth_y = face_y + face_size * 0.65
        mouth_width = face_size // 4
        draw.arc([center_x - mouth_width, mouth_y, center_x + mouth_width, mouth_y + mouth_width // 2],
                start=0, end=180, fill=(200, 100, 100), width=3)
        
        return avatar
    except Exception as e:
        print(f"❌ Cartoon avatar error: {e}")
        return image

# ============= WAV2LIP INTEGRATION =============

def run_wav2lip(face_image_path, audio_path):
    """Run Wav2Lip to generate realistic lip-sync video"""
    try:
        if not check_wav2lip_available():
            print("⚠️  Wav2Lip not available, using basic lip-sync")
            return None
        
        print("🎬 Running Wav2Lip for realistic lip-sync...")
        
        output_path = os.path.join(TEMP_DIR, f"wav2lip_{uuid.uuid4()}.mp4")
        
        cmd = [
            "python", os.path.join(WAV2LIP_PATH, "inference.py"),
            "--checkpoint_path", WAV2LIP_CHECKPOINT,
            "--face", face_image_path,
            "--audio", audio_path,
            "--outfile", output_path,
            "--resize_factor", "1",
            "--fps", "25"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0 and os.path.exists(output_path):
            final_path = os.path.join(LIPSYNC_DIR, os.path.basename(output_path))
            shutil.move(output_path, final_path)
            print(f"✅ Wav2Lip completed: {final_path}")
            return final_path
        else:
            print(f"❌ Wav2Lip failed: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Wav2Lip error: {e}")
        traceback.print_exc()
        return None

# ============= BASIC LIP-SYNC (FALLBACK) =============

def create_basic_lipsync(avatar_path, audio_path, face_rect):
    """Basic lip-sync animation (fallback if Wav2Lip unavailable)"""
    try:
        print("🎬 Creating basic lip-sync animation...")
        
        avatar = cv2.imread(avatar_path)
        if avatar is None:
            return None
            
        height, width = avatar.shape[:2]
        
        audio = AudioSegment.from_mp3(audio_path)
        duration_ms = len(audio)
        frame_duration = 50
        frames = []
        
        for i in range(0, duration_ms, frame_duration):
            chunk = audio[i:i+frame_duration]
            if len(chunk) == 0:
                frames.append({'time': i, 'mouth': 'closed'})
                continue
            
            loudness = chunk.dBFS
            if loudness > -15:
                mouth_state = 'wide_open'
            elif loudness > -25:
                mouth_state = 'open'
            elif loudness > -35:
                mouth_state = 'half'
            else:
                mouth_state = 'closed'
            
            frames.append({'time': i, 'mouth': mouth_state})
        
        fps = 20
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        video_id = str(uuid.uuid4())
        video_path = os.path.join(LIPSYNC_DIR, f"{video_id}.mp4")
        
        out = cv2.VideoWriter(video_path, fourcc, fps, (width, height))
        
        if not out.isOpened():
            return None
        
        x, y, w, h = face_rect
        mx = x + w // 2
        my = y + int(h * 0.65)
        
        for frame_data in frames:
            frame = avatar.copy()
            overlay = frame.copy()
            
            mouth_state = frame_data['mouth']
            mw = int(w * 0.25)
            
            if mouth_state == 'wide_open':
                mh = int(h * 0.22)
                cv2.ellipse(overlay, (mx, my), (mw, mh), 0, 0, 360, (80, 50, 50), -1)
            elif mouth_state == 'open':
                mh = int(h * 0.16)
                cv2.ellipse(overlay, (mx, my), (mw, mh), 0, 0, 360, (70, 45, 45), -1)
            elif mouth_state == 'half':
                mh = int(h * 0.10)
                cv2.ellipse(overlay, (mx, my), (mw, mh), 0, 0, 360, (60, 40, 40), -1)
            else:
                cv2.ellipse(overlay, (mx, my), (mw, 3), 0, 0, 180, (100, 70, 70), -1)
            
            frame = cv2.addWeighted(overlay, 0.8, frame, 0.2, 0)
            out.write(frame)
        
        out.release()
        print(f"✅ Basic lip-sync created: {video_path}")
        return video_path
        
    except Exception as e:
        print(f"❌ Basic lip-sync error: {e}")
        return None

# ============= AVATAR CONVERSION ENDPOINT =============

@app.route("/convert-avatar", methods=["POST"])
def convert_avatar():
    """Convert uploaded image to cartoon avatar"""
    try:
        print("\n" + "="*50)
        print("📥 Avatar conversion request")
        
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        image_data = data.get("image")
        style = data.get("style", "cartoon")
        
        if not image_data:
            return jsonify({"success": False, "error": "No image data"}), 400
        
        if "base64," in image_data:
            image_data = image_data.split("base64,")[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        face_detected, face_rect, eyes = detect_face_features(image)
        
        if not face_detected:
            return jsonify({
                "success": False,
                "error": "No face detected",
                "message": "Please upload an image with a visible face"
            }), 400
        
        print(f"✅ Face detected, creating {style} avatar...")
        
        if style == "cartoon":
            result_image = create_cartoon_avatar(image, face_rect, eyes)
        else:
            result_image = create_cartoon_avatar(image, face_rect, eyes)
        
        file_id = str(uuid.uuid4())
        filepath = os.path.join(AVATAR_DIR, f"{file_id}.png")
        result_image.save(filepath, quality=95)
        
        face_data_path = os.path.join(AVATAR_DIR, f"{file_id}_face.json")
        with open(face_data_path, 'w') as f:
            json.dump({
                'face_rect': [int(x) for x in face_rect],
                'image_size': list(result_image.size),
                'type': 'custom'
            }, f)
        
        print(f"✅ Avatar saved: {filepath}")
        print("="*50 + "\n")
        
        return jsonify({
            "success": True,
            "avatar_url": f"/avatars/{file_id}.png",
            "avatar_id": file_id,
            "style": style,
            "type": "custom"
        })
        
    except Exception as e:
        print(f"❌ Conversion error: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

# ============= TEXT-TO-SPEECH WITH LIP-SYNC =============
@app.route("/speak", methods=["POST"])
def speak():
    try:
        data = request.get_json()
        text = data.get("text")
        avatar_id = data.get("avatar_id")
        use_ready_avatar = data.get("use_ready_avatar", False)

        if not text:
            return jsonify({"success": False, "error": "No text provided"}), 400

        # --- AUDIO GENERATION ---
        os.makedirs("static/audio", exist_ok=True)
        audio_id = str(uuid.uuid4())
        audio_path = f"static/audio/{audio_id}.mp3"

        print("🔊 Generating speech with gTTS...")
        tts = gTTS(text=text, lang="en")
        tts.save(audio_path)
        print("✅ Audio generated:", audio_path)

        # --- AVATAR IMAGE SELECTION ---
        os.makedirs("static/avatars", exist_ok=True)
        avatar_path = None
        avatar_dir = "static/avatars"

        if avatar_id:
            # Try ready avatar first (jpg)
            candidate_jpg = os.path.join(avatar_dir, f"{avatar_id}.jpg")
            candidate_png = os.path.join(avatar_dir, f"{avatar_id}.png")
            if use_ready_avatar and os.path.exists(candidate_jpg):
                avatar_path = candidate_jpg
                print("🧍 Using ready avatar:", avatar_path)
            elif os.path.exists(candidate_png):
                avatar_path = candidate_png
                print("🧍 Using custom avatar:", avatar_path)

        if not avatar_path or not os.path.exists(avatar_path):
            return jsonify({
                "success": False,
                "audio_url": f"/{audio_path}",
                "warning": "Avatar not found"
            }), 200

        # --- BACKGROUND GENERATION ---
        os.makedirs("static/backgrounds", exist_ok=True)
        bg_id = str(uuid.uuid4())
        background_path = f"static/backgrounds/{bg_id}.jpg"
        try:
            avatar_img = Image.open(avatar_path)
            blurred_bg = avatar_img.filter(ImageFilter.GaussianBlur(25))
            blurred_bg.save(background_path)
            print("🖼️ Background generated:", background_path)
        except Exception as bg_err:
            print("⚠️ Background generation failed:", bg_err)
            background_path = None

        # --- LIP SYNC VIDEO GENERATION (Wav2Lip or fallback) ---
        os.makedirs("static/videos", exist_ok=True)
        video_id = str(uuid.uuid4())
        output_video_path = f"static/videos/{video_id}.mp4"

        try:
            if shutil.which("python") and os.path.exists("Wav2Lip/inference.py"):
                # Wav2Lip available
                print("🎬 Running Wav2Lip for lip-sync...")
                subprocess.run([
                    "python", "Wav2Lip/inference.py",
                    "--checkpoint_path", "Wav2Lip/checkpoints/wav2lip_gan.pth",
                    "--face", avatar_path,
                    "--audio", audio_path,
                    "--outfile", output_video_path
                ], check=True)
                print("✅ Lip-sync video created:", output_video_path)
            else:
                # fallback — static avatar + audio only
                print("⚠️ Wav2Lip not installed — creating fallback static video.")
                create_static_video_with_audio(avatar_path, audio_path, output_video_path)
        except Exception as lip_err:
            print("❌ Lip-sync generation failed:", lip_err)
            traceback.print_exc()
            output_video_path = None

        # --- RESPONSE ---
        response = {
            "success": True,
            "audio_url": f"/{audio_path}" if os.path.exists(audio_path) else None,
            "lipsync_url": f"/{output_video_path}" if output_video_path and os.path.exists(output_video_path) else None,
            "background_url": f"/{background_path}" if background_path and os.path.exists(background_path) else None
        }

        print("✅ Returning response:", response)
        return jsonify(response), 200

    except Exception as e:
        print("❌ Error in /speak:", traceback.format_exc())
        return jsonify({"success": False, "error": str(e)}), 500

# ============= FILE SERVING =============

@app.route("/avatars/<filename>")
def get_avatar(filename):
    """Serve generated avatars"""
    return send_from_directory(AVATAR_DIR, filename)

@app.route("/audio/<filename>")
def get_audio(filename):
    """Serve generated audio"""
    return send_from_directory(AUDIO_DIR, filename)

@app.route("/lipsync/<filename>")
def get_lipsync(filename):
    """Serve lip-sync videos"""
    return send_from_directory(LIPSYNC_DIR, filename)

@app.route("/health", methods=["GET"])
def health_check():
    """Health check"""
    return jsonify({
        "status": "healthy",
        "features": {
            "custom_avatars": True,
            "ready_avatars": True,
            "gpt_neo_script_enhancement": GPT_NEO_AVAILABLE,
            "wav2lip": check_wav2lip_available(),
            "basic_lipsync": True,
            "tts": True
        },
        "model": MODEL_NAME if GPT_NEO_AVAILABLE else "N/A",
        "device": device if GPT_NEO_AVAILABLE else "N/A"
    })

if __name__ == "__main__":
    print("🚀 Advanced Avatar Backend Starting...")
    print("📡 Server: http://localhost:5001")
    print("=" * 50)
    print("Features:")
    print("  ✅ Custom Avatar Creation (Photo → Cartoon)")
    print("  ✅ Ready-to-Use Professional Avatars")
    print(f"  {'✅' if GPT_NEO_AVAILABLE else '⚠️ '} GPT-Neo Script Enhancement ({MODEL_NAME if GPT_NEO_AVAILABLE else 'Not Available'})")
    print(f"  {'✅' if check_wav2lip_available() else '⚠️ '} Wav2Lip Realistic Lip-Sync")
    print("  ✅ Basic Lip-Sync (Fallback)")
    print("  ✅ Text-to-Speech")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5001, debug=True, threaded=True)