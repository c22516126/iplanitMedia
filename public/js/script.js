//Elements
const takePhotoButton = document.getElementById('takePhotoButton');
const captureButton = document.getElementById('captureButton');
const video = document.getElementById('video');
const picture = document.getElementById('uploadImg');
const confirmButton = document.getElementById('confirmButton');
const denyButton = document.getElementById('denyButton');

//select photo elements
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

    confirmDeny();

    //stop webcam
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
        confirmDeny();
    }
    reader.readAsDataURL(file);
});

//display confirm/deny buttons, hide other buttons
function confirmDeny() {
    confirmButton.style.display = 'inline';
    denyButton.style.display = 'inline';
    takePhotoButton.style.display = 'none';
    selectPhoto.style.display = 'none';
    inputPhoto.style.display = 'none';
}

confirmButton.addEventListener('click', () => {
    retake();
});

denyButton.addEventListener('click', () => {
    retake();
});

function retake() {
    picture.src = 'images/uploadimg.png';
    picture.style.display = 'block';
    takePhotoButton.style.display = 'block';
    selectPhoto.style.display = 'block';
    captureButton.style.display = 'none';
    confirmButton.style.display = 'none';
    denyButton.style.display = 'none';
    inputPhoto.style.display = 'none';
    video.style.display = 'none';
}