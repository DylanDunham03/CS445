import requests
import io
from PIL import Image
import os
from dotenv import load_dotenv
from requests.exceptions import Timeout, RequestException

load_dotenv()

STABILITY_API_KEY = os.getenv('STABILITY_API_KEY')
API_URL = "https://api.stability.ai/v2beta/stable-image/generate/sd3"

# API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev"
# headers = {"Authorization": f"Bearer {os.getenv('HUGGING_FACE_ACCESS_TOKEN')}"}

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
    Generate an image from text using Stability AI's API
    
    Args:
        prompt (str): The text prompt to generate an image from
        
    Returns:
        PIL.Image: The generated image
    """
    try:
        response = requests.post(
            API_URL,
            headers={
                "Authorization": f"Bearer {STABILITY_API_KEY}",
                "Accept": "image/*",
                "Content-Type": "application/json"
            },
            json={
                "prompt": prompt,
                "model": "sd3.5-large-turbo",  # Faster model
                "output_format": "png",
                "aspect_ratio": "1:1",  # Square image for 3D model generation
                "cfg_scale": 7,  # Balance between creativity and prompt adherence
            },
            timeout=30  # 30 second timeout
        )
        
        # Log the response status and headers for debugging
        print(f"Stability AI Response Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Error from Stability AI: {response.text}")
            return None
            
        # Convert response content to PIL Image
        image = Image.open(io.BytesIO(response.content))
        
        # Save the image locally for debugging (optional)
        image.save('debug_generated_image.png')
        
        return image
        
    except Timeout:
        print("Request timed out while generating image")
        return None
    except RequestException as e:
        print(f"Error making request to Stability AI API: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error generating image: {e}")
        return None

# def generate_image_from_text(prompt):
#     """
#     Generate an image from text using the FLUX.1-dev model
    
#     Args:
#         prompt (str): The text prompt to generate an image from
        
#     Returns:
#         PIL.Image: The generated image
#     """
#     def query(payload):
#         try:
#             response = requests.post(
#                 API_URL, 
#                 headers=headers, 
#                 json=payload,
#                 timeout=60  # Set a 60-second timeout
#             )
#             response.raise_for_status()  # Raise an exception for bad status codes
#             return response.content
#         except Timeout:
#             print("Request timed out while generating image")
#             return None
#         except RequestException as e:
#             print(f"Error making request to Hugging Face API: {e}")
#             return None

#     try:
#         enhanced_prompt = additional_image_context(prompt)
#         image_bytes = query({
#             "inputs": enhanced_prompt,
#         })
        
#         if image_bytes is None:
#             return None
            
#         image = Image.open(io.BytesIO(image_bytes))
#         return image
#     except Exception as e:
#         print(f"Error generating image: {e}")
#         return None