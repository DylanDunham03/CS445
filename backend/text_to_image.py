import requests
import io
from PIL import Image
import os
from dotenv import load_dotenv
from requests.exceptions import Timeout, RequestException

load_dotenv()

STABILITY_API_KEY = os.getenv('STABILITY_API_KEY')
# API_URL = "https://api.stability.ai/v2beta/stable-image/generate/sd3"
API_URL = "https://api.stability.ai/v2beta/stable-image/generate/ultra"

# API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev"
# headers = {"Authorization": f"Bearer {os.getenv('HUGGING_FACE_ACCESS_TOKEN')}"}

def additional_image_context(prompt: str) -> str:
    """
    Add additional context to the image generation prompt to ensure consistent results
    for 3D model generation.
    
    Args:
        prompt (str): The original user prompt
        
    Returns:
        str: Enhanced prompt with additional context
    """
    context = (
        f"{prompt}, "
        "(centered composition:1.3), "
        "(pure white background:1.4), "
        "(8k uhd:1.2), "
        "(highly detailed:1.3), "
        "(front three-quarter view:1.2), "
        "(full object in frame:1.3), "
        "(product photography style:1.2), "
        "(crisp focus:1.3), "
        "(no shadows:1.2), "
        "(minimalist composition:1.2), "
        "(isolated object:1.4)"
    )
    
    print(f"Generated prompt: {context}")
    return context

def generate_image_from_text(prompt):
    """
    Generate an image from text using Stability AI's Ultra API
    
    Args:
        prompt (str): The text prompt to generate an image from
        
    Returns:
        PIL.Image: The generated image
    """
    try:
        # Following the exact format from Stability AI documentation
        response = requests.post(
            API_URL,
            headers={
                "Authorization": f"Bearer {STABILITY_API_KEY}",
                "Accept": "image/*",
                "stability-client-id": "3DModel-GPT",
            },
            files={"none": ""},  # Required empty files parameter
            data={
                "prompt": additional_image_context(prompt),
                "output_format": "png",
                "aspect_ratio": "1:1",
                "negative_prompt": "blurry, low quality, distorted, deformed, disfigured, bad anatomy, extra limbs, watermark, signature, text"
            },
            timeout=60
        )
        
        print(f"Stability AI Response Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Error from Stability AI: {response.text}")
            return None
            
        # Convert response content to PIL Image
        image = Image.open(io.BytesIO(response.content))
        
        # Save the image locally for debugging
        image.save('debug_generated_image.png')
        print(f"Debug image saved as 'debug_generated_image.png'")
        
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