import cv2
import yt_dlp

# YouTube Live video URL (replace with your stream)
youtube_url = "https://www.youtube.com/watch?v=YOUR_LIVE_STREAM_ID"

# Function to get direct video stream URL
def get_youtube_stream_url(youtube_url):
    ydl_opts = {
        'format': 'best[ext=mp4]',  # Get the best MP4 format
        'quiet': True,
        'noplaylist': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(youtube_url, download=False)
        return info['url'] if 'url' in info else None

# Get the direct streaming URL
stream_url = get_youtube_stream_url(youtube_url)

if stream_url:
    cap = cv2.VideoCapture(stream_url)
    while cap.isOpened():
        success, img = cap.read()
        if not success:
            print("Failed to capture frame.")
            break
        
        # Display the live stream
        cv2.imshow("YouTube Live Stream", img)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
else:
    print("Could not retrieve YouTube live stream URL.")

cap.release()
cv2.destroyAllWindows()