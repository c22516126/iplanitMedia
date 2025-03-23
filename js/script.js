//Elements
const takePhotoButton = document.getElementById('takePhotoButton');
const captureButton = document.getElementById('captureButton');
const video = document.getElementById('video');
const picture = document.getElementById('uploadImg');

const selectPhoto = document.getElementById('selectPhoto');
const inputPhoto = document.getElementById('inputPhoto');

let stream;

//take photo
//start webcam
takePhotoButton.addEventListener('click', async () => {
    
    //make the video and capture button visible
    //hide the picture and take photo button
    picture.style.display = 'none';
    video.style.display = 'block';
    takePhotoButton.style.display = 'none';
    captureButton.style.display = 'block';
    inputPhoto.style.display = 'none';

    try {
        stream = await navigator.mediaDevices.getUserMedia({video: true});
        video.srcObject = stream;
    } catch (err) {
        alert('Error: ', err.message);
    }
}
);
captureButton.addEventListener('click', async () => {
    //dimensions for displaying captured image
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    //draw the video frame on the canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    //convert the canvas to an image
    const data = canvas.toDataURL('image/png');

    //display the image, hide video
    picture.src=data;
    picture.style.display = 'block';
    video.style.display = 'none';
    takePhotoButton.style.display = 'block';
    captureButton.style.display = 'none';

    //stop webcma
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null; //clear the video element
      }
}
)

//select photo
selectPhoto.addEventListener('click', () => {
    inputPhoto.click();
});

inputPhoto.addEventListener('change', () => {
    const file = inputPhoto.files[0];
    if (!file) return

    const reader = new FileReader();

    reader.onload = (e) => {
        picture.src = e.target.result;
        picture.style.display = 'block';
        video.style.display = 'none';
        captureButton.style.display = 'none';
        takePhotoButton.style.display = 'block';
    }

    reader.readAsDataURL(file);
});