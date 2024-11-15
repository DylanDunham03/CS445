import requests
import tempfile
from PIL import Image
import os

STABILITY_API_KEY = "REMOVED"
API_URL = "https://api.stability.ai/v2beta/3d/stable-fast-3d"

def convert_image_to_3d(pil_image, foreground_ratio=0.85):
    """
    Convert a PIL Image to a 3D model using the Stability AI API
    
    Args:
        pil_image (PIL.Image): The input image to convert
        foreground_ratio (float): Ratio for foreground extraction (default: 0.85)
        
    Returns:
        str: Path to the generated 3D model file
    """
    try:
        # Create a temporary file to save the input image
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_img:
            pil_image.save(tmp_img.name)
            
            # Prepare the API request
            headers = {
                "Authorization": f"Bearer {STABILITY_API_KEY}",
            }
            
            files = {
                "image": open(tmp_img.name, "rb")
            }
            
            data = {
                "foreground_ratio": foreground_ratio,
                "texture_resolution": "2048"
            }
            
            # Make the API request
            response = requests.post(
                API_URL,
                headers=headers,
                files=files,
                data=data
            )
            
            # Clean up the temporary input image
            os.unlink(tmp_img.name)
            
            if response.status_code == 200:
                # Save the GLB file
                output_path = tempfile.mktemp(suffix='.glb')
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                print(f"3D model generated successfully: {output_path}")
                return output_path
            else:
                print(f"Error from Stability API: {response.json()}")
                return None
            
    except Exception as e:
        print(f"Error converting image to 3D: {e}")
        return None

def test_3d_conversion():
    """
    Test function that uses a sample image to test the 3D conversion
    """
    try:
        # Use a test image
        test_image = Image.open("image.png")  # Make sure this file exists
        return convert_image_to_3d(test_image)
            
    except Exception as e:
        print(f"Error in test conversion: {str(e)}")
        return None
