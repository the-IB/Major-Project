from flask import Flask, request, Response, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename
from functools import wraps
import os
import cv2
import cvzone
import math
import re
import numpy as np
from ultralytics import YOLO
from modules.sort import *
import logging
import subprocess
import time

# Initialize Flask app
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration
UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv', 'webm'}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Initialize YOLO model
try:
    model = YOLO("models/i1-yolov8s.pt").to("cuda")
    tracker = Sort(max_age=20, min_hits=3, iou_threshold=0.3)
except Exception as e:
    logging.error(f"Failed to initialize YOLO model: {str(e)}")
    raise

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Decorators
def cleanup_files(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        finally:
            temp_files = [
                kwargs.get('input_path', ''),
                kwargs.get('output_path', ''),
                kwargs.get('temp_path', '')
            ]
            for f in temp_files:
                if os.path.exists(f): os.remove(f)
    return wrapper

# Utility functions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_video_file(file):
    # Add explicit file size check
    file.seek(0, os.SEEK_END)
    file_length = file.tell()
    file.seek(0)  # Reset file pointer
    
    if file_length > MAX_FILE_SIZE:
        return False, "File size exceeds 100MB limit"
    
    if not allowed_file(file.filename):
        return False, "File type not allowed"
    
    return True, ""

# Video processing endpoints
@app.route("/process-video", methods=["POST"])
@cleanup_files
def process_video():   
    # Check if any files are present
    if not request.files:
        logger.error("No files in the request")
        return jsonify({"error": "No files uploaded"}), 400
    
    # Check for specific 'video' file
    if 'video' not in request.files:
        logger.error("No 'video' file found in request")
        return jsonify({"error": "No video file uploaded"}), 400
    
    file = request.files['video']
    
    # Validate file
    valid, message = validate_video_file(file)
    if not valid:
        logger.error(f"File validation failed: {message}")
        return jsonify({"error": message}), 400
    
    try:
        filename = secure_filename(file.filename)
        video_path = os.path.join(UPLOAD_FOLDER, filename)
        
        # Ensure upload folder exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        file.save(video_path)
        
        processed_video_path = os.path.join(PROCESSED_FOLDER, filename)
        success, message = process_video_with_yolo(video_path, processed_video_path, filename)
        
        if not success:
            logger.error(f"Video processing failed: {message}")
            return jsonify({"error": message}), 500
        
        socketio.emit('video_processed', {'filename': filename})
        return jsonify({
            "message": "Video processed successfully",
            "processed_video_url": f"/processed/{filename}"
        }), 200
        
    except Exception as e:
        logger.error(f"Error in process-video endpoint: {str(e)}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/processed/<filename>")
def get_processed_video(filename):
    try:
        filename = secure_filename(filename)
        file_path = os.path.join(PROCESSED_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        range_header = request.headers.get('Range', None)
        size = os.path.getsize(file_path)
        
        if range_header:
            byte1, byte2 = 0, None
            m = re.search(r'(\d+)-(\d*)', range_header)
            if m:
                byte1 = int(m.group(1))
                byte2 = int(m.group(2)) if m.group(2) else size - 1
            
            chunk_size = byte2 - byte1 + 1
            
            def generate():
                with open(file_path, 'rb') as f:
                    f.seek(byte1)
                    data = f.read(chunk_size)
                    yield data
            
            response = Response(
                generate(),
                206,
                mimetype='video/mp4',
                direct_passthrough=True
            )
            response.headers.add('Content-Range', f'bytes {byte1}-{byte2}/{size}')
            response.headers.add('Accept-Ranges', 'bytes')
            response.headers.add('Content-Length', str(chunk_size))
            return response
        
        response = send_from_directory(PROCESSED_FOLDER, filename, mimetype='video/mp4')
        response.headers.add('Accept-Ranges', 'bytes')
        return response
    
    except Exception as e:
        logger.error(f"Error serving processed video: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/validate-camera', methods=['POST'])
def validate_camera():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"valid": False, "message": "No data provided"}), 400
        
        url = data.get("url")
        if not url:
            return jsonify({"valid": False, "message": "No URL provided"}), 400

        if not (url.startswith('rtsp://') or url.startswith('http://') or url.startswith('https://')):
            return jsonify({"valid": False, "message": "Invalid URL protocol"}), 400

        cap = cv2.VideoCapture(url)
        if not cap.isOpened():
            return jsonify({"valid": False, "message": "Could not open video stream"}), 400

        start_time = time.time()
        timeout = 5
        success = False
        
        while time.time() - start_time < timeout:
            success, frame = cap.read()
            if success:
                break
            time.sleep(0.1)
        
        cap.release()
        
        if success:
            return jsonify({
                "valid": True,
                "message": "Video stream is accessible"
            }), 200
        else:
            return jsonify({
                "valid": False,
                "message": "Stream opened but no frames received within timeout"
            }), 400
            
    except Exception as e:
        logger.error(f"Error validating camera: {str(e)}")
        return jsonify({
            "valid": False,
            "message": "Internal server error during validation"
        }), 500

def process_video_with_yolo(input_video_path, output_video_path, filename):
    try:
        start_time = time.time()
        socketio.emit('video_processing', {'filename': filename})
        
        cap = cv2.VideoCapture(input_video_path)
        if not cap.isOpened():
            raise Exception("Could not open video file")

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        out = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))

        totalAccidents = []
        processed_frames = 0

        while cap.isOpened():
            success, img = cap.read()
            if not success:
                break

            results = model(img, stream=True)
            detections = np.empty((0, 5))

            for r in results:
                boxes = r.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0]
                    x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                    conf = math.ceil((box.conf[0] * 100)) / 100

                    if conf > 0.4:
                        cvzone.cornerRect(img, (x1, y1, x2 - x1, y2 - y1))
                        cvzone.putTextRect(img, f"Accident {conf}", (x1, y1 - 10), colorR=(0, 165, 255))
                        currentArray = np.array([x1, y1, x2, y2, conf])
                        detections = np.vstack((detections, currentArray))

            trackerResults = tracker.update(detections)

            for result in trackerResults:
                x1, y1, x2, y2, id = result
                x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])

                if id not in totalAccidents:
                    cvzone.cornerRect(img, (x1, y1, x2 - x1, y2 - y1), colorR=(255, 0, 255))
                    cvzone.putTextRect(img, f"ID {id}", (x1, y1 - 10))
                    totalAccidents.append(id)

            out.write(img)
            processed_frames += 1
            
            if processed_frames % max(1, total_frames // 10) == 0:
                progress = int((processed_frames / total_frames) * 100)            
                socketio.emit('processing_progress', {
                    'filename': filename,
                    'progress': progress,
                    'accidents': len(totalAccidents)
                })

        cap.release()
        out.release()
        
        temp_path = output_video_path + ".temp.mp4"
        try:
            subprocess.run([
                'ffmpeg', '-y', '-i', output_video_path,
                '-c:v', 'libx264', '-preset', 'fast',
                '-movflags', '+faststart', '-crf', '23',
                temp_path
            ], check=True)
            os.replace(temp_path, output_video_path)
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg re-encoding failed: {str(e)}")
            if os.path.exists(temp_path):
                os.remove(temp_path)

        processing_time = time.time() - start_time
        logger.info(f"Processed {filename} in {processing_time:.2f} seconds")
        
        return True, f"Processed {processed_frames} frames with {len(totalAccidents)} accidents detected"
    
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        socketio.emit('processing_error', {
            'filename': filename,
            'message': str(e)
        })
        if 'out' in locals(): out.release()
        if 'cap' in locals(): cap.release()
        if os.path.exists(output_video_path):
            os.remove(output_video_path)
        return False, str(e)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)