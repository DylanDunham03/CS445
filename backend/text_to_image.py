import requests
import io
from PIL import Image
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev"
headers = {"Authorization": f"Bearer {os.getenv('HUGGING_FACE_ACCESS_TOKEN')}"}

def additional_image_context(prompt: str) -> str:
    """
    Add additional context to the image generation prompt to ensure consistent results
    
    Args:
        prompt (str): The original user prompt
        
    Returns:
        str: Enhanced prompt with additional context
    """
    return f"{prompt}, with a white background, where you can see the full object/character in the frame, with great quality"

def generate_image_from_text(prompt):
    """
    Generate an image from text using the FLUX.1-dev model
    
    Args:
        prompt (str): The text prompt to generate an image from
        
    Returns:
        PIL.Image: The generated image
    """
    def query(payload):
        response = requests.post(API_URL, headers=headers, json=payload)
        return response.content

    try:
        enhanced_prompt = additional_image_context(prompt)
        image_bytes = query({
            "inputs": enhanced_prompt,
        })
        image = Image.open(io.BytesIO(image_bytes))
        return image
    except Exception as e:
        print(f"Error generating image: {e}")
        return None