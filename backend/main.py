"""
Updated Flask Backend with GPT-Neo Integration
Add this to your existing backend/main.py file
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import GPTNeoForCausalLM, GPT2Tokenizer
import torch

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load GPT-Neo model once at startup
print("Loading GPT-Neo model... This may take a few minutes on first run.")
model_name = "EleutherAI/gpt-neo-1.3B"  # You can use 125M, 1.3B, or 2.7B
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model = GPTNeoForCausalLM.from_pretrained(model_name)

# Move to GPU if available
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)
print(f"GPT-Neo model loaded successfully on {device}!")

@app.route('/api/generate-script', methods=['POST'])
def generate_script():
    """
    Generate enhanced script using GPT-Neo
    Expected JSON: {
        "inputText": "user script",
        "actor": "male/female",
        "background": "studio/office/etc",
        "videoType": "informative/storytelling/etc"
    }
    """
    try:
        data = request.get_json()
        
        # Extract data from request
        input_text = data.get('inputText', '')
        actor = data.get('actor', '')
        background = data.get('background', '')
        video_type = data.get('videoType', '')
        
        # Validate inputs
        if not input_text or not actor or not background or not video_type:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create the prompt
        prompt = f"""Task: Enhance this script for an AI-generated video.

Actor: {actor}
Background: {background}
Video Type: {video_type}

Original Script: {input_text}

Enhanced Professional Script:"""
        
        # Tokenize input
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=1024).to(device)
        
        # Generate enhanced script
        with torch.no_grad():
            outputs = model.generate(
                inputs.input_ids,
                max_length=inputs.input_ids.shape[1] + 500,  # Generate 500 more tokens
                temperature=0.8,
                top_p=0.9,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
                repetition_penalty=1.2,
                no_repeat_ngram_size=3
            )
        
        # Decode output
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the enhanced part (remove the prompt)
        enhanced_script = generated_text[len(prompt):].strip()
        
        return jsonify({
            'success': True,
            'enhanced_script': enhanced_script,
            'model': model_name
        })
    
    except Exception as e:
        print(f"Error generating script: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': model_name,
        'device': device
    })

# Add your other existing routes here...

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)