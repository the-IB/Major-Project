from flask import Flask, request, Response, render_template
import cv2
import numpy as np
from ultralytics import YOLO
import cvzone
import math
from modules.sort import *
import os

app = Flask(__name__)

# Importing the model
model = YOLO('models/i1-yolov8s.pt')

# Temporary video path
TEMP_VIDEO_PATH = "./uploads/temp_video.mp4"

def generate_frames():
    cap = cv2.VideoCapture(TEMP_VIDEO_PATH)
    tracker = Sort(max_age=20, min_hits=3, iou_threshold=0.3)
    totalAccidents = []

    while True:
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
                w, h = x2 - x1, y2 - y1

                conf = math.ceil((box.conf[0] * 100)) / 100

                if float(conf) > 0.4:
                    cvzone.cornerRect(img, (x1, y1, w, h))
                    cvzone.putTextRect(img, f'Accident {conf}', (max(0, x1), max(35, y1)), colorR=(0, 165, 255))
                    currentArray = np.array([x1, y1, x2, y2, conf])
                    detections = np.vstack((detections, currentArray))

        trackerResults = tracker.update(detections)

        for result in trackerResults:
            x1, y1, x2, y2, id = result
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            id = int(id)
            w, h = x2 - x1, y2 - y1

            if totalAccidents.count(id) == 0:
                cvzone.cornerRect(img, (x1, y1, w, h), colorR=(255, 0, 255))
                cvzone.putTextRect(img, f'{id}', (max(0, x1), max(35, y1)))
                cx, cy = x1 + w // 2, y1 + h // 2
                cv2.circle(img, (cx, cy), 5, (255, 0, 255), cv2.FILLED)
                totalAccidents.append(id)

        # Encode the frame as JPEG
        ret, buffer = cv2.imencode('.jpg', img)
        frame = buffer.tobytes()

        # Yield the frame in byte format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return {"error": "No file part"}, 400

    file = request.files['file']
    if file.filename == '':
        return {"error": "No selected file"}, 400

    # Save the uploaded video temporarily
    os.makedirs("./uploads", exist_ok=True)
    file.save(TEMP_VIDEO_PATH)

    return {"message": "Video uploaded successfully"}, 200

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)