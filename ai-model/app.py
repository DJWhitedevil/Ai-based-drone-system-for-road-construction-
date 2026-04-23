from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import io
import os
import torch
from pathlib import Path

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Simulated AI Model Loading
# In production, you would load a real YOLO/CNN model
class RoadDamageDetector:
    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        # Load your pre-trained model here
        # self.model = torch.hub.load('ultralytics/yolov5', 'yolov5s')
        self.classes = ['crack', 'pothole', 'undamaged']
        self.severity_map = {'crack': 'medium', 'pothole': 'high'}
        
    def detect(self, image_data):
        """
        Detect damages in image
        Returns: {
            'detected': bool,
            'damageType': str,
            'severity': str,
            'confidence': float,
            'boxes': list  # [x, y, w, h]
        }
        """
        try:
            # Convert bytes to image
            image = Image.open(io.BytesIO(image_data))
            image_np = np.array(image)
            
            # Placeholder detection logic
            # In production, run through your model
            result = self._run_inference(image_np)
            return result
            
        except Exception as e:
            return {
                'detected': False,
                'error': str(e),
                'damageType': 'undamaged',
                'severity': 'low',
                'confidence': 0.0
            }
    
    def _run_inference(self, image):
        """Placeholder inference - replace with actual model"""
        # This is a mock implementation
        # In production, use your actual model:
        # results = self.model(image)
        
        # For demo, randomly detect damages
        import random
        
        if random.random() > 0.7:  # 30% chance of damage
            damage_types = ['crack', 'pothole']
            damage_type = random.choice(damage_types)
            severity_levels = ['low', 'medium', 'high']
            severity = random.choice(severity_levels)
            confidence = random.uniform(0.7, 0.99)
            
            return {
                'detected': True,
                'damageType': damage_type,
                'severity': severity,
                'confidence': confidence,
                'boxes': [[100, 100, 50, 50]]
            }
        else:
            return {
                'detected': False,
                'damageType': 'undamaged',
                'severity': 'low',
                'confidence': 1.0,
                'boxes': []
            }

# Initialize detector
detector = RoadDamageDetector()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'device': detector.device,
        'model_loaded': True
    })

@app.route('/detect', methods=['POST'])
def detect_damage():
    """
    Main detection endpoint
    Expects: multipart/form-data with 'file' field containing image
    Returns: {
        'detected': bool,
        'damageType': str (crack/pothole/undamaged),
        'severity': str (low/medium/high),
        'confidence': float (0-1),
        'boxes': list
    }
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read image data
        image_data = file.read()
        
        # Run detection
        result = detector.detect(image_data)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/batch-detect', methods=['POST'])
def batch_detect():
    """
    Batch detection for multiple images
    Expects: JSON with 'images' array (base64 encoded)
    """
    try:
        data = request.get_json()
        
        if 'images' not in data:
            return jsonify({'error': 'No images provided'}), 400
        
        results = []
        for img_data in data['images']:
            # Decode base64
            import base64
            image_bytes = base64.b64decode(img_data.split(',')[1])
            result = detector.detect(image_bytes)
            results.append(result)
        
        return jsonify({'results': results})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    return jsonify({
        'model_type': 'YOLO-based Road Damage Detector',
        'device': detector.device,
        'classes': detector.classes,
        'version': '1.0',
        'supported_formats': ['jpg', 'png', 'jpeg', 'bmp']
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
