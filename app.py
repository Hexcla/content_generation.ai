from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import openai
import requests
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
import zipfile
import io
from PIL import Image
import base64
from datetime import datetime
import json
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import bcrypt
from datetime import timedelta
import uuid

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static')
# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Setup JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# In-memory user storage (replace with a database in production)
users = {}

# In-memory content history (replace with a database in production)
content_history = []

# Configure OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Flag to control whether to use image generation
USE_IMAGE_GENERATION = True  # Set to True to enable image generation

def scrape_website(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        # Get text content
        text = soup.get_text()
        
        # Break into lines and remove leading and trailing space
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text[:3000]  # Limit to first 3000 characters
    except Exception as e:
        return str(e)

def get_thumbnail_prompt(style, custom_prompt=""):
    """Generate a prompt for thumbnail creation based on style"""
    if custom_prompt:
        return custom_prompt
        
    base_prompts = {
        "clickbait": "Create a high-contrast, attention-grabbing thumbnail with bold text and exaggerated facial expressions. Include dramatic elements and strong visual hierarchy.",
        
        "professional": "Design a clean, minimal thumbnail with corporate colors (blue, gray). Include a professional headshot or graphic, clear typography, and a subtle gradient background.",
        
        "tutorial": "Create an instructional thumbnail with step numbers, tool icons, and a 'before and after' composition. Use directional elements to show progression.",
        
        "vlog": "Design a lifestyle thumbnail with vibrant colors, personal photos, and an informal, approachable style. Add subtle depth effects and warm tones.",
        
        "gaming": "Create a high-energy gaming thumbnail with game assets, character renders, bright neon effects, action poses, and impact text with stroke effects.",
        
        "news": "Design a formal, information-focused thumbnail with a headline-style text layout, news imagery, red/blue color scheme, and boxed sections for organization.",
        
        "review": "Create a product-focused thumbnail with star ratings, comparison elements, and decisive text ('Worth it?', 'Best ever?'). Include product imagery on a simple background."
    }
    
    return base_prompts.get(style.lower(), base_prompts["clickbait"])

def generate_text_content(scraped_text, tone, keywords, content_type, additional_params):
    try:
        # DEMO MODE: Return mock content instead of calling OpenAI
        return generate_demo_content(scraped_text, tone, keywords, content_type, additional_params)
    except Exception as e:
        return str(e)

def generate_text_with_huggingface(topic, tone, keywords, content_type, additional_params):
    """Generate content using Hugging Face API"""
    import requests
    
    # You can get a free token from huggingface.co
    HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN", "")
    
    # Choose a model based on your needs - these are free to use
    MODELS = {
        'default': "mistralai/Mistral-7B-Instruct-v0.2",
        'small': "google/flan-t5-base",
        'fast': "facebook/bart-large-cnn"
    }
    
    # Select model - if no token, use a smaller model with less strict token limits
    model = MODELS['default'] if HUGGINGFACE_TOKEN else MODELS['small']
    
    # Create a prompt based on content type
    prompt_templates = {
        'blog': f"""Write a {tone} blog post about {topic}. 
                  Include these keywords: {', '.join(keywords)}. 
                  Use markdown formatting.
                  Length: {additional_params.get('length', 'medium')}.""",
        
        'article': f"""Write a {tone} article about {topic}.
                    Include these keywords: {', '.join(keywords)}.
                    Format with proper headings and sections.
                    Length: {additional_params.get('length', 'medium')}.""",
        
        'social': f"""Create {additional_params.get('platform', 'social media')} posts about {topic}.
                   Include these keywords: {', '.join(keywords)}.
                   Write {additional_params.get('post_count', 3)} posts with hashtags.
                   Tone: {tone}.""",
        
        'youtube': f"""Create a YouTube video script about {topic}.
                     Include these keywords: {', '.join(keywords)}.
                     Format with TITLE, DESCRIPTION, and SCRIPT sections.
                     Tone: {tone}.""",
        
        'email': f"""Write a {tone} email about {topic}.
                   Include these keywords: {', '.join(keywords)}.
                   Include subject line and body.
                   Purpose: {additional_params.get('purpose', 'informational')}."""
    }
    
    prompt = prompt_templates.get(content_type, prompt_templates['blog'])
    
    # Set up API request
    headers = {"Authorization": f"Bearer {HUGGINGFACE_TOKEN}"} if HUGGINGFACE_TOKEN else {}
    API_URL = f"https://api-inference.huggingface.co/models/{model}"
    
    max_length = {
        'short': 300,
        'medium': 500,
        'long': 800
    }.get(additional_params.get('length', 'medium').lower(), 500)
    
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_length": max_length,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True
        }
    }
    
    try:
        if HUGGINGFACE_TOKEN:
            response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                if isinstance(response.json(), list):
                    return response.json()[0].get("generated_text", "").replace(prompt, "")
                else:
                    return response.json().get("generated_text", "").replace(prompt, "")
            else:
                print(f"Hugging Face API error: {response.status_code} - {response.text}")
                # Fall back to demo content
                return generate_demo_content(topic, tone, keywords, content_type, additional_params)
        else:
            # No token, use demo content
            print("No Hugging Face token found, using demo content")
            return generate_demo_content(topic, tone, keywords, content_type, additional_params)
            
    except Exception as e:
        print(f"Error calling Hugging Face API: {str(e)}")
        return generate_demo_content(topic, tone, keywords, content_type, additional_params)

def generate_demo_content(topic, tone, keywords, content_type, additional_params):
    """Generate demo content without using any API"""
    # Get current date for the content
    today = datetime.now().strftime("%B %d, %Y")
    
    # Format keywords as a comma-separated string
    keyword_text = ', '.join(keywords[:3]) if keywords else 'this topic'
    
    templates = {
        'blog': f"""# {topic.title()}: A {tone.title()} Perspective

*Published on {today}*

## Introduction

Welcome to this {tone} blog post about {topic}. In this article, we'll explore various aspects 
of {topic} and provide useful insights about {keyword_text}.

## Main Points

1. **Understanding {topic}**
   - Key concepts and fundamentals
   - Historical background and development
   - Current trends and innovations

2. **Practical Applications**
   - How {topic} is used in real-world scenarios
   - Case studies and success stories
   - Implementation strategies

3. **Benefits and Advantages**
   - Why {topic} matters in today's context
   - Comparative advantages over alternatives
   - Long-term value and potential

## Conclusion

{topic} offers significant opportunities for those who understand its importance. By focusing on {keyword_text}, 
you can leverage these concepts for better outcomes.

*This is sample content generated in demo mode.*
""",
        
        'article': f"""# Comprehensive Analysis: {topic.title()}

*{today} | {tone.title()} Analysis*

## Executive Summary

This {tone} article examines {topic} in detail, with special emphasis on {keyword_text}. Our analysis 
provides valuable insights for professionals and enthusiasts alike.

## Background

{topic} has evolved significantly over time, becoming an essential element in modern contexts. 
Understanding its origins helps appreciate its current applications.

## Key Findings

1. **Market Impact**
   - Statistical trends show growing interest in {topic}
   - Industry leaders are investing heavily in related technologies
   - Consumer adoption continues to accelerate

2. **Technical Considerations**
   - Implementation requires careful planning
   - Integration with existing systems presents challenges
   - Optimization techniques can significantly improve outcomes

3. **Future Outlook**
   - Predictions indicate continued growth
   - Emerging technologies will enhance capabilities
   - New applications are being discovered regularly

## Recommendations

Based on our analysis of {topic}, we recommend focusing on {keyword_text} to maximize 
value and efficiency.

*This is sample content generated in demo mode.*
""",
        
        'social': f"""# {additional_params.get('platform', 'Social Media').title()} Posts about {topic.title()}

## Post 1:
📣 Just discovered some amazing insights about {topic}! Learning about {keyword_text} has completely 
changed my perspective. What's your experience with this? 
#Learn#{topic.replace(' ', '')} #{keyword_text.replace(', ', ' #').replace(' ', '')} 
#Professional{tone.title()}

## Post 2:
Today's deep dive: {topic} 🔍
Three things I never knew:
✅ It improves efficiency by up to 40%
✅ Industry leaders are rapidly adopting it
✅ It works perfectly with {keyword_text}
Who else is exploring this? Let me know below!
#{topic.replace(' ', '')}Explained #{tone.title()}Thoughts

## Post 3:
🚀 BREAKING: New developments in {topic} are changing everything we thought we knew! 
Particularly how it relates to {keyword_text}. Check out my latest article (link in bio)
for a {tone} breakdown of what this means for you.
#Innovation #{topic.replace(' ', '')} #Future#{keyword_text.replace(', ', '').replace(' ', '')}

*These sample posts were generated in demo mode.*
""",
        
        'youtube': f"""# YouTube Content: {topic.title()}

## TITLE:
{topic.title()}: The Ultimate {tone.title()} Guide You Need To See

## DESCRIPTION:
In this {tone} video, we explore everything you need to know about {topic}. We cover {keyword_text} 
and provide practical insights you can apply immediately.

🔔 SUBSCRIBE for more content on {topic} and related subjects!
👍 LIKE this video if you found it helpful
💬 COMMENT with your questions or experiences with {topic}

## TIMESTAMPS:
0:00 Introduction
1:45 What is {topic}?
4:30 The importance of {keyword_text}
8:15 Practical applications
12:40 Common mistakes to avoid
16:20 Case studies and examples
21:00 Summary and recommendations

## SCRIPT OUTLINE:

### Introduction
- Welcome viewers and introduce the topic
- Explain why {topic} matters in today's context
- Set expectations for what will be covered

### Main Content
- Define {topic} in clear, {tone} terms
- Discuss the history and evolution of {topic}
- Explain the significance of {keyword_text}
- Demonstrate practical applications with visual examples
- Address common misconceptions and mistakes
- Share successful case studies

### Conclusion
- Summarize key points about {topic}
- Provide actionable next steps for viewers
- Invite engagement through comments and questions

## THUMBNAIL DESCRIPTION:
Create an eye-catching thumbnail featuring bold text "{topic.upper()}" with a surprised reaction face. 
Use contrasting colors with arrows pointing to key visual elements related to {keyword_text}.

*This sample YouTube content was generated in demo mode.*
""",
        
        'email': f"""# Email Campaign: {topic.title()}

## SUBJECT LINE:
{topic.title()}: Discover How {keyword_text.title()} Can Transform Your Results

## EMAIL BODY:

Dear [Recipient Name],

I hope this {tone} message finds you well.

I wanted to share some valuable insights about {topic} that our team has recently discovered. As someone interested in [recipient's industry], you'll find these particularly relevant.

### Why {topic} Matters Now

In today's rapidly evolving landscape, understanding {topic} has become more crucial than ever. Our research indicates that organizations focusing on {keyword_text} are seeing remarkable improvements in their outcomes.

### Key Benefits:

1. **Increased Efficiency**: Implement {topic} strategies to streamline your processes
2. **Better Results**: Our clients report 35% better outcomes when applying these principles
3. **Competitive Edge**: Stay ahead by mastering {keyword_text}

### Next Steps

I'd be delighted to schedule a brief call to discuss how these concepts apply specifically to your situation. Alternatively, you can access our free resource guide here: [LINK]

Looking forward to your thoughts on this.

Best regards,
[Your Name]
[Your Position]
[Contact Information]

*This sample email was generated in demo mode.*
"""
    }
    
    # Return the appropriate template or default to blog
    return templates.get(content_type, templates['blog'])

def generate_image(prompt, style="realistic", size="medium", format="url"):
    """Generate an image based on the prompt and style"""
    try:
        # For demo purposes, we'll use Unsplash for free images based on the prompt
        if prompt:
            # Clean the prompt to be URL-friendly
            clean_prompt = prompt.replace(" ", "+")
            # Return a URL for an image from Unsplash based on the prompt
            dimensions = {
                "small": "640x360",
                "medium": "800x450",
                "large": "1280x720"
            }.get(size, "800x450")
            
            # Add style to the prompt if provided
            if style and style != "realistic":
                clean_prompt += "+" + style

            image_url = f"https://source.unsplash.com/{dimensions}/?{clean_prompt}"
            
            return {
                "url": image_url,
                "prompt": prompt,
                "style": style,
                "size": size
            }
        else:
            return {"error": "No prompt provided for image generation"}
    except Exception as e:
        print(f"Error in image generation: {str(e)}")
        return {"error": str(e)}

def generate_video(script, style, duration, resolution):
    try:
        # Implement video generation logic here
        # This is a placeholder that would integrate with a video generation API
        return {
            "message": "Video generation implemented in production",
            "details": {
                "script": script,
                "style": style,
                "duration": duration,
                "resolution": resolution
            }
        }
    except Exception as e:
        return str(e)

def generate_music(description, genre, duration, format):
    try:
        # Implement music generation logic here
        # This is a placeholder that would integrate with a music generation API
        return {
            "message": "Music generation implemented in production",
            "details": {
                "description": description,
                "genre": genre,
                "duration": duration,
                "format": format
            }
        }
    except Exception as e:
        return str(e)

def chat_with_ai(message, mode="Creative", feature="Brainstorming"):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"You are an AI assistant in {mode} mode, specialized in {feature}."},
                {"role": "user", "content": message}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return str(e)

@app.route('/api/generate', methods=['POST'])
def generate_content_endpoint():
    data = request.json
    topic = data.get('topic', '')
    tone = data.get('tone', 'professional')
    content_type = data.get('content_type', 'blog')
    keywords = data.get('keywords', [])
    additional_params = data.get('additional_params', {})
    
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    
    try:
        # Generate content
        content = generate_text_with_huggingface(topic, tone, keywords, content_type, additional_params)
        
        # Generate an image if requested
        image_data = {}
        if additional_params.get('generate_image', True) and USE_IMAGE_GENERATION:
            image_prompt = f"{topic} {' '.join(keywords[:3])}"
            style = additional_params.get('image_style', 'realistic')
            size = additional_params.get('image_size', 'medium')
            image_data = generate_image(image_prompt, style, size)
            
            # If image generation was successful, add the image to the content
            if 'url' in image_data and not content.strip().endswith("```"):
                image_url = image_data['url']
                if not "![" in content:  # Only add image if not already included
                    content += f"\n\n![Generated Image for {topic}]({image_url})"
        
        # Add to history (in a real app, this would be stored in a database)
        timestamp = datetime.now().isoformat()
        content_id = str(uuid.uuid4())
        history_item = {
            "id": content_id,
            "topic": topic,
            "tone": tone,
            "content_type": content_type,
            "keywords": keywords,
            "content": content,
            "timestamp": timestamp,
            "image_data": image_data
        }
        content_history.append(history_item)
        
        # Only keep the last 50 items to prevent memory issues
        if len(content_history) > 50:
            content_history.pop(0)
        
        # Return the generated content
        return jsonify({
            "content": content, 
            "timestamp": timestamp,
            "id": content_id,
            "image": image_data.get("url") if image_data and "url" in image_data else None
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/download', methods=['POST'])
def download():
    data = request.json
    content = data.get('content')
    
    if not content:
        return jsonify({"error": "Content is required"}), 400
    
    # Create a ZIP file in memory
    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w') as zf:
        # Add content as markdown file
        zf.writestr('content.md', content)
        
        # Add image if available
        if 'image_url' in data and data['image_url']:
            try:
                response = requests.get(data['image_url'])
                zf.writestr('image.png', response.content)
            except:
                pass
    
    memory_file.seek(0)
    
    return send_file(
        memory_file,
        mimetype='application/zip',
        as_attachment=True,
        download_name='generated-content.zip'
    )

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('fullName')

        if not email or not password or not full_name:
            return jsonify({'error': 'Missing required fields'}), 400

        if email in users:
            return jsonify({'error': 'User already exists'}), 400

        # Hash the password
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Store user
        users[email] = {
            'password': hashed,
            'full_name': full_name
        }

        # Create access token
        access_token = create_access_token(identity=email)

        return jsonify({
            'token': access_token,
            'user': {
                'email': email,
                'fullName': full_name
            }
        }), 201

    except Exception as e:
        print(f"Error in signup: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Missing email or password'}), 400

        user = users.get(email)
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Create access token
        access_token = create_access_token(identity=email)

        return jsonify({
            'token': access_token,
            'user': {
                'email': email,
                'fullName': user['full_name']
            }
        })

    except Exception as e:
        print(f"Error in login: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/validate', methods=['GET'])
@jwt_required()
def validate_token():
    try:
        current_user_email = get_jwt_identity()
        user = users.get(current_user_email)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'email': current_user_email,
            'fullName': user['full_name']
        })

    except Exception as e:
        print(f"Error in validate_token: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        # In a real app, this would filter by user ID
        return jsonify({
            "history": content_history
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/history/<content_id>', methods=['GET'])
def get_content_by_id(content_id):
    try:
        for entry in content_history:
            if entry["id"] == content_id:
                return jsonify(entry)
        
        return jsonify({"error": "Content not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add a new function for Hugging Face image generation
def generate_image_huggingface(prompt, style, size, format):
    """Generate images using Hugging Face Stable Diffusion"""
    import requests
    import base64
    from io import BytesIO
    from PIL import Image
    import random
    
    # Get token from environment
    HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN", "")
    
    if not HUGGINGFACE_TOKEN:
        # Return placeholder image URL if no token
        return {
            "url": f"https://placehold.co/600x400/4287f5/ffffff?text={prompt.replace(' ', '+')}",
            "format": format
        }
    
    # Choose an image generation model
    MODELS = {
        'default': "stabilityai/stable-diffusion-xl-base-1.0",
        'realistic': "runwayml/stable-diffusion-v1-5",
        'artistic': "CompVis/stable-diffusion-v1-4"
    }
    
    # Select model based on style
    if style.lower() in ['realistic', 'photorealistic', 'photograph']:
        model = MODELS['realistic']
    elif style.lower() in ['artistic', 'creative', 'stylized']:
        model = MODELS['artistic']
    else:
        model = MODELS['default']
    
    # Parse size (default to 512x512 if invalid)
    try:
        width, height = size.lower().split('x')
        width, height = int(width), int(height)
        # Cap dimensions for free API usage
        width = min(width, 512)
        height = min(height, 512)
    except:
        width, height = 512, 512
    
    # Construct the API endpoint URL
    API_URL = f"https://api-inference.huggingface.co/models/{model}"
    
    # Add style to prompt for better results
    enhanced_prompt = f"{prompt}. Style: {style}. Highly detailed, professional quality."
    
    # Set up headers with authorization
    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_TOKEN}"
    }
    
    try:
        # Make the API request
        response = requests.post(
            API_URL,
            headers=headers,
            json={
                "inputs": enhanced_prompt,
                "parameters": {
                    "negative_prompt": "blurry, distorted, low quality, ugly, poorly rendered",
                    "num_inference_steps": 30,
                    "guidance_scale": 7.5
                }
            }
        )
        
        # Check if the request was successful
        if response.status_code == 200:
            # Return image URL for a remote image
            if isinstance(response.content, bytes):
                # Generate a unique filename
                filename = f"generated_{random.randint(1000, 9999)}.{format.lower()}"
                file_path = os.path.join('static', 'generated', filename)
                
                # Ensure directory exists
                os.makedirs(os.path.join('static', 'generated'), exist_ok=True)
                
                # Save the image
                image = Image.open(BytesIO(response.content))
                image.save(file_path)
                
                # Return URL to the saved image
                return {
                    "url": f"/static/generated/{filename}",
                    "format": format
                }
                
        # Handle errors or unsuccessful responses
        return {
            "url": f"https://placehold.co/600x400/4287f5/ffffff?text=Generation+Failed",
            "format": format,
            "error": f"Status code: {response.status_code}"
        }
        
    except Exception as e:
        print(f"Error in image generation: {str(e)}")
        return {
            "url": f"https://placehold.co/600x400/4287f5/ffffff?text=Error",
            "format": format,
            "error": str(e)
        }

# Add a route for serving static files
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    app.run(debug=True, port=port) 