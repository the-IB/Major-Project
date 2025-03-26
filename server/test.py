from flask import Flask, send_file

app = Flask(__name__)

@app.route('/api/video')
def get_video():
    video_path = "processed/carcrash.mp4"  # Path to your processed video file
    return send_file(video_path, mimetype="video/mp4", as_attachment=False)

if __name__ == '__main__':
    app.run(debug=True)
