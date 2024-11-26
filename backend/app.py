from flask import Flask, jsonify, request
from flask_cors import CORS
from text_to_image import generate_image_from_text
from image_to_3d import convert_image_to_3d
import io
import shutil
import os
from PIL import Image
import base64
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://cs-445.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range", "X-Content-Range"]
    }
})

# Add this at the top of the file after the imports
recent_requests = {}
DEDUP_WINDOW = 2  # seconds

@app.route('/api/generate-from-text', methods=['POST'])
def generate_from_text():
    text = request.form.get('text')
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    # Check for duplicate request
    current_time = datetime.now()
    if text in recent_requests:
        last_request_time = recent_requests[text]
        if current_time - last_request_time < timedelta(seconds=DEDUP_WINDOW):
            print(f"Duplicate request detected for text: {text}")
            return jsonify({"error": "Duplicate request"}), 429
    
    # Update the request timestamp
    recent_requests[text] = current_time
    recent_requests.clear()
    recent_requests[text] = current_time
    
    print(f"Processing text input: {text}")
    
    # Generate image from text
    generated_image = generate_image_from_text(text)
    
    if generated_image is None:
        return jsonify({"error": "Failed to generate image. The request may have timed out or the service may be temporarily unavailable."}), 503
    
    # Print image information
    print(f"Generated image size: {generated_image.size}")
    print(f"Generated image mode: {generated_image.mode}")

    # Save the image locally for inspection
    generated_image.save('generated_image.png')
    print("Image saved as 'generated_image.png'")
    
    # Convert image to 3D model
    model_path = convert_image_to_3d(generated_image)
    
    if model_path is None:
        return jsonify({"error": "Failed to generate 3D model"}), 500
    
    # Save the 3D model to a permanent location
    # Create output directory if it doesn't exist
    os.makedirs('output_models', exist_ok=True)
    
    # Create a unique filename based on the text input
    safe_filename = "".join(x for x in text if x.isalnum() or x in (' ','-','_'))[:30]
    output_path = f'output_models/{safe_filename}.glb'
    
    # Copy the model file to our output directory
    shutil.copy2(model_path, output_path)
    print(f"3D model saved to: {output_path}")

    # Read the 3D model file
    with open(output_path, 'rb') as f:
        model_data = f.read()
        model_base64 = base64.b64encode(model_data).decode('utf-8')

    # After generating the image, convert it to base64
    buffered = io.BytesIO()
    generated_image.save(buffered, format="PNG")
    image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    return jsonify({
        "message": f"Processing text: {text}",
        "model_path": output_path,
        "model": model_base64,
        "thumbnail": f"data:image/png;base64,{image_base64}"
    })

@app.route('/api/generate-from-image', methods=['POST'])
def generate_from_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    image = request.files['image']
    if image.filename == '':
        return jsonify({"error": "No image selected"}), 400
    
    print(f"Received image file: {image.filename}")
    
    try:
        # Convert uploaded file to PIL Image
        pil_image = Image.open(image)
        
        # Convert uploaded image to base64
        buffered = io.BytesIO()
        pil_image.save(buffered, format="PNG")
        image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # Convert image to 3D model
        model_path = convert_image_to_3d(pil_image)
        
        if model_path is None:
            return jsonify({"error": "Failed to generate 3D model"}), 500
        
        # Save the 3D model to a permanent location
        os.makedirs('output_models', exist_ok=True)
        
        # Create a unique filename based on the original image name
        safe_filename = "".join(x for x in image.filename if x.isalnum() or x in (' ','-','_'))[:30]
        output_path = f'output_models/{safe_filename}.glb'
        
        # Copy the model file to our output directory
        shutil.copy2(model_path, output_path)
        print(f"3D model saved to: {output_path}")
        
        # Read the 3D model file
        with open(output_path, 'rb') as f:
            model_data = f.read()
            model_base64 = base64.b64encode(model_data).decode('utf-8')
        
        return jsonify({
            "message": f"Processing image: {image.filename}",
            "model_path": output_path,
            "model": model_base64,
            "thumbnail": f"data:image/png;base64,{image_base64}"
        })
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500

@app.route('/api/test-3d-conversion', methods=['GET'])
def test_3d_endpoint():
    from image_to_3d import test_3d_conversion as convert_test_image
    
    model_path = convert_test_image()
    
    if model_path is None:
        return jsonify({"error": "Failed to generate 3D model"}), 500
    
    # Save the 3D model to a permanent location
    os.makedirs('output_models', exist_ok=True)
    output_path = f'output_models/test_model.glb'
    
    # Copy the model file to our output directory
    shutil.copy2(model_path, output_path)
    print(f"Test 3D model saved to: {output_path}")
    
    # Read the 3D model file
    with open(output_path, 'rb') as f:
        model_data = f.read()
        model_base64 = base64.b64encode(model_data).decode('utf-8')
    
    return jsonify({
        "message": "Test 3D model generated",
        "model_path": output_path,
        "model": model_base64
    })

@app.route('/api/get-example-model', methods=['GET'])
def get_example_model():
    output_path = './output_models/legomanpng.glb'
    image_path = 'lego.png'

    try:
        # Read and convert the image to base64
        with open(image_path, 'rb') as f:
            image_data = f.read()
            image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Read the 3D model file
        with open(output_path, 'rb') as f:
            model_data = f.read()
            model_base64 = base64.b64encode(model_data).decode('utf-8')
        
        return jsonify({
            "message": "Example model loaded",
            "model": model_base64,
            "thumbnail": f"data:image/png;base64,{image_base64}"
        })
    except Exception as e:
        print(f"Error loading example model: {str(e)}")
        return jsonify({"error": f"Error loading example model: {str(e)}"}), 500
    
@app.route('/api/get-example-models', methods=['GET'])
def get_example_models():
    examples = [
        {
            'model_path': './output_models/legomanpng.glb',
            'image_path': 'lego.png',
            'name': 'Lego Man'
        },
        {
            'model_path': './output_models/monkey holding a banana.glb',  
            'image_path': 'monkey holding a banana.png',
            'name': 'monkey holding a banana'
        },
        {
            'model_path': './output_models/nike shoes.glb',  # Add your model paths
            'image_path': 'nike shoes.png',
            'name': 'Nike Shoes'
        }
    ]
    
    try:
        models_data = []
        for example in examples:
            # Read and convert the image to base64
            with open(example['image_path'], 'rb') as f:
                image_data = f.read()
                image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Read the 3D model file
            with open(example['model_path'], 'rb') as f:
                model_data = f.read()
                model_base64 = base64.b64encode(model_data).decode('utf-8')
            
            models_data.append({
                "name": example['name'],
                "model": model_base64,
                "thumbnail": f"data:image/png;base64,{image_base64}"
            })
        
        return jsonify({
            "message": "Example models loaded",
            "models": models_data
        })
    except Exception as e:
        print(f"Error loading example models: {str(e)}")
        return jsonify({"error": f"Error loading example models: {str(e)}"}), 500

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)