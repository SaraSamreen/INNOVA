from huggingface_hub import InferenceClient
import time

class ReelMakerAI:
    """
    Complete AI assistant for Reel Maker App
    Handles: Script Generation, Captions, Hashtags, Editing
    """
    
    def __init__(self, hf_token):
        self.client = InferenceClient(token=hf_token)
        self.model = "inclusionAI/Ring-1T-preview"
    
    def _generate(self, prompt, max_tokens=400, temperature=0.7):
        """Internal method with error handling and retry logic"""
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                response = self.client.text_generation(
                    prompt,
                    model=self.model,
                    max_new_tokens=max_tokens,
                    temperature=temperature,
                    top_p=0.9,
                    repetition_penalty=1.1
                )
                return response
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(2)  # Wait before retry
                else:
                    return f"Error: Unable to generate content after {max_retries} attempts."
    
    # ========== MODULE 3: AI SCRIPT GENERATOR ==========
    
    def generate_script(self, keywords, tone="professional", duration="30 seconds", style="engaging"):
        """
        FE-2: Generate complete video script with scene breakdown
        
        Args:
            keywords (str): Product keywords/features
            tone (str): Script tone (professional, casual, energetic, etc.)
            duration (str): Video length (15s, 30s, 60s)
            style (str): Script style (engaging, informative, humorous, etc.)
        
        Returns:
            str: Complete video script with scenes
        """
        
        prompt = f"""Create a {duration} video script for a social media reel.

Keywords: {keywords}
Tone: {tone}
Style: {style}

Format the script with:
[SCENE 1 - 0-5s] Hook - Attention-grabbing opening
[SCENE 2 - 5-15s] Problem/Feature - Showcase the product
[SCENE 3 - 15-25s] Benefits - Why they need it
[SCENE 4 - 25-30s] CTA - Clear call-to-action

For each scene, include:
- Visual description
- Voice-over text

Keep it conversational and suitable for vertical video format."""

        return self._generate(prompt, max_tokens=500, temperature=0.7)
    
    def edit_script(self, original_script, instructions):
        """
        FE-3: Edit generated script based on user feedback
        
        Args:
            original_script (str): The original script
            instructions (str): Edit instructions
        
        Returns:
            str: Edited script
        """
        
        prompt = f"""Edit this video script based on the instructions below.

ORIGINAL SCRIPT:
{original_script}

EDIT INSTRUCTIONS:
{instructions}

Provide only the edited script, maintaining the same format and structure:"""

        return self._generate(prompt, max_tokens=500, temperature=0.7)
    
    def suggest_tone_style(self, product_type, target_audience):
        """
        FE-4: AI suggests best tone and style
        
        Args:
            product_type (str): Type of product
            target_audience (str): Target demographic
        
        Returns:
            str: Recommended tone and style
        """
        
        prompt = f"""Suggest the best tone and style for a video about {product_type} targeting {target_audience}.

Provide:
1. Recommended Tone (e.g., professional, casual, energetic, humorous)
2. Recommended Style (e.g., inspirational, informative, entertaining)
3. Brief reasoning (2-3 sentences)

Format:
Tone: [your recommendation]
Style: [your recommendation]
Reasoning: [why this works best]"""

        return self._generate(prompt, max_tokens=200, temperature=0.7)
    
    def summarize_script(self, long_script, target_duration="15 seconds"):
        """
        FE-5: Auto-summarization for shorter versions
        
        Args:
            long_script (str): Original longer script
            target_duration (str): Desired duration
        
        Returns:
            str: Shortened script
        """
        
        prompt = f"""Shorten this video script to {target_duration} while keeping the core message and impact.

ORIGINAL SCRIPT:
{long_script}

Create a condensed version that:
- Maintains the hook and CTA
- Keeps the main benefit/message
- Fits the {target_duration} timeframe

Provide only the shortened script:"""

        return self._generate(prompt, max_tokens=300, temperature=0.7)
    
    # ========== MODULE 9: SOCIAL SYNC ==========
    
    def generate_caption(self, product_info, platform="Instagram", include_emojis=True):
        """
        FE-4: AI Caption Generation
        
        Args:
            product_info (str): Product description/features
            platform (str): Social media platform
            include_emojis (bool): Whether to include emojis
        
        Returns:
            str: Engaging caption
        """
        
        emoji_instruction = "Include 3-5 relevant emojis." if include_emojis else "No emojis."
        
        prompt = f"""Write an engaging {platform} caption for this product:

{product_info}

Requirements:
- Start with an attention-grabbing hook
- Highlight key benefits/features
- {emoji_instruction}
- Include a clear call-to-action
- Keep it under 150 words
- Make it shareable and conversational

Provide only the caption:"""

        return self._generate(prompt, max_tokens=200, temperature=0.8)
    
    def generate_hashtags(self, description, niche="general", count=15, strategy="balanced"):
        """
        FE-5: AI Hashtag Generation
        
        Args:
            description (str): Product/content description
            niche (str): Industry/niche
            count (int): Number of hashtags (10-30)
            strategy (str): "popular" (high reach) or "balanced" (mix) or "niche" (targeted)
        
        Returns:
            str: List of hashtags
        """
        
        if strategy == "popular":
            mix = "Focus on high-volume hashtags (100k+ posts)"
        elif strategy == "niche":
            mix = "Focus on niche-specific hashtags (1k-50k posts)"
        else:  # balanced
            mix = "Mix of: 5 popular (100k+), 7 medium (10k-100k), 3 niche (1k-10k) hashtags"
        
        prompt = f"""Generate {count} strategic hashtags for:

Description: {description}
Niche: {niche}
Strategy: {mix}

Requirements:
- All hashtags must be relevant and trending
- Include both broad and specific tags
- No spaces in hashtags
- Format: #hashtag1 #hashtag2 #hashtag3

Provide only the hashtags, no explanations:"""

        return self._generate(prompt, max_tokens=150, temperature=0.7)
    
    def generate_multiple_captions(self, product_info, platform="Instagram", count=3):
        """
        Generate multiple caption variations for A/B testing
        
        Args:
            product_info (str): Product description
            platform (str): Social platform
            count (int): Number of variations
        
        Returns:
            str: Multiple caption options
        """
        
        prompt = f"""Generate {count} different caption variations for {platform}:

Product: {product_info}

Create {count} unique captions with different approaches:
1. Emotional/Storytelling approach
2. Benefit-focused approach
3. Question/Engagement approach

Label each as "Option 1:", "Option 2:", etc.
Each caption should include emojis and a CTA."""

        return self._generate(prompt, max_tokens=400, temperature=0.9)
    
    # ========== CONVENIENCE METHODS ==========
    
    def generate_complete_post(self, product_name, product_description, 
                              platform="Instagram", hashtag_count=15):
        """
        Generate everything at once: script + caption + hashtags
        
        Args:
            product_name (str): Product name
            product_description (str): Features/benefits
            platform (str): Target platform
            hashtag_count (int): Number of hashtags
        
        Returns:
            dict: Complete content package
        """
        
        print("🎬 Generating video script...")
        script = self.generate_script(
            keywords=product_description,
            tone="engaging and friendly",
            duration="30 seconds"
        )
        
        print("💬 Generating caption...")
        caption = self.generate_caption(
            product_info=f"{product_name} - {product_description}",
            platform=platform
        )
        
        print("#️⃣ Generating hashtags...")
        hashtags = self.generate_hashtags(
            description=product_description,
            niche=product_name,
            count=hashtag_count
        )
        
        return {
            "script": script,
            "caption": caption,
            "hashtags": hashtags,
            "platform": platform
        }


# ========== USAGE EXAMPLES ==========

if __name__ == "__main__":
    # Initialize
    ai = ReelMakerAI(hf_token="hf_YOUR_TOKEN_HERE")
    
    print("="*70)
    print("🎥 REEL MAKER AI - COMPLETE DEMO")
    print("="*70)
    
    # Example 1: Generate complete content package
    print("\n📦 EXAMPLE 1: Complete Post Generation")
    print("-"*70)
    
    content = ai.generate_complete_post(
        product_name="Wireless Earbuds Pro",
        product_description="noise cancellation, 24h battery, premium sound quality, water-resistant",
        platform="Instagram",
        hashtag_count=15
    )
    
    print("\n📝 SCRIPT:")
    print(content["script"])
    print("\n💬 CAPTION:")
    print(content["caption"])
    print("\n#️⃣ HASHTAGS:")
    print(content["hashtags"])
    
    # Example 2: Individual features
    print("\n" + "="*70)
    print("📝 EXAMPLE 2: Script Generation & Editing")
    print("-"*70)
    
    # Generate script
    script = ai.generate_script(
        keywords="protein powder, muscle building, post-workout, natural ingredients",
        tone="energetic and motivational",
        duration="30 seconds"
    )
    print("\nOriginal Script:")
    print(script)
    
    # Edit script
    edited = ai.edit_script(
        original_script=script,
        instructions="Make it more humorous and add a funny opening hook"
    )
    print("\nEdited Script:")
    print(edited)
    
    # Example 3: Caption variations
    print("\n" + "="*70)
    print("💬 EXAMPLE 3: Multiple Caption Variations")
    print("-"*70)
    
    captions = ai.generate_multiple_captions(
        product_info="Smart fitness watch with heart rate monitor and sleep tracking",
        platform="TikTok",
        count=3
    )
    print(captions)
    
    # Example 4: Tone suggestions
    print("\n" + "="*70)
    print("🎯 EXAMPLE 4: Tone & Style Suggestions")
    print("-"*70)
    
    suggestion = ai.suggest_tone_style(
        product_type="eco-friendly yoga mat",
        target_audience="health-conscious millennials aged 25-35"
    )
    print(suggestion)