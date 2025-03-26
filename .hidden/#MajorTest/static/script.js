document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('videoFile');
    const videoContainer = document.getElementById('videoContainer');
    const videoStream = document.getElementById('videoStream');
    const loading = document.getElementById('loading');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');

    if (!fileInput.files.length) {
        alert('Please select a video file.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    // Show loading message
    loading.classList.remove('hidden');
    videoContainer.classList.add('hidden');
    errorSection.classList.add('hidden');

    try {
        // Upload the video file
        const uploadResponse = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload video.');
        }

        // Start streaming the processed video
        videoStream.src = "/video_feed";
        videoContainer.classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'An error occurred while processing the video.';
        errorSection.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
});