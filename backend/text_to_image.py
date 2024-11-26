import requests
import io
from PIL import Image
import os
from dotenv import load_dotenv
from requests.exceptions import Timeout, RequestException

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
    return f"{prompt}, with a white background, where you can see the full object/character in the frame, with great quality, the object is show from a slight angle"

def generate_image_from_text(prompt):
    """
    Generate an image from text using the FLUX.1-dev model
    
    Args:
        prompt (str): The text prompt to generate an image from
        
    Returns:
        PIL.Image: The generated image
    """
    def query(payload):
        try:
            response = requests.post(
                API_URL, 
                headers=headers, 
                json=payload,
                timeout=60  # Set a 60-second timeout
            )
            response.raise_for_status()  # Raise an exception for bad status codes
            return response.content
        except Timeout:
            print("Request timed out while generating image")
            return None
        except RequestException as e:
            print(f"Error making request to Hugging Face API: {e}")
            return None

    try:
        enhanced_prompt = additional_image_context(prompt)
        image_bytes = query({
            "inputs": enhanced_prompt,
        })
        
        if image_bytes is None:
            return None
            
        image = Image.open(io.BytesIO(image_bytes))
        return image
    except Exception as e:
        print(f"Error generating image: {e}")
        return None