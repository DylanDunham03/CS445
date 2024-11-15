import requests
import io
from PIL import Image

API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev"
headers = {"Authorization": "Bearer REMOVED"}

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
        image_bytes = query({
            "inputs": prompt,
        })
        image = Image.open(io.BytesIO(image_bytes))
        return image
    except Exception as e:
        print(f"Error generating image: {e}")
        return None
