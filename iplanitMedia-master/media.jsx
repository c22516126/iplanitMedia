import React, { useState, useRef } from 'react';
import './css/style.css';

const Media = () => {
  const [showWebcam, setShowWebcam] = useState(false);
  const [showCaptureButton, setShowCaptureButton] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleTakePhoto = () => {
    setShowWebcam(true);
    setShowCaptureButton(true);
    setSelectedImage(null);
    
    // Access webcam
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          videoRef.current.srcObject = stream;
          videoRef.current.style.display = 'block';
        })
        .catch(error => {
          console.error("Error accessing webcam:", error);
        });
    }
  };

  const handleCapture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    
    const imageUrl = canvas.toDataURL('image/png');
    setSelectedImage(imageUrl);
    setShowConfirmation(true);
    setShowCaptureButton(false);
    
    // Stop webcam
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    videoRef.current.style.display = 'none';
  };

  const handleSelectPhoto = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        setShowConfirmation(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    // Handle confirmed image
    console.log("Image confirmed:", selectedImage);
    setShowConfirmation(false);
    setSelectedImage(null);
    setShowWebcam(false);
  };

  const handleDeny = () => {
    setShowConfirmation(false);
    setSelectedImage(null);
    setShowWebcam(false);
  };

  return (
    <div className="container">
      <div className="containerTop">
        <img src="images/pfp.png" alt="profile picture" className="pfp" />
        <button className="navButton">Messages</button>
        <button className="navButton">Media</button>
        <button className="navButton">Calendar</button>
      </div>
      
      <div className="containerBottom">
        <div className="sideButtons">
          <button className="navButton">Plan</button>
          <button className="navButton">Goals</button>
          <button className="navButton">Notes</button>
        </div>
        
        <div className="mediaBoxes">
          <div className="selectContainer">
            <div id="webcamContainer">
              {selectedImage ? (
                <img src={selectedImage} alt="Captured" className="uploadImg" />
              ) : (
                <>
                  <img 
                    className="uploadImg" 
                    id="uploadImg" 
                    src="images/uploadimg.png" 
                    alt="select icon" 
                  />
                  <video 
                    className="uploadVid" 
                    id="video" 
                    ref={videoRef} 
                    autoPlay 
                    style={{ display: showWebcam ? 'block' : 'none' }}
                  />
                </>
              )}
              
              <input 
                type="file" 
                id="inputPhoto" 
                ref={fileInputRef}
                accept="image/*" 
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            
            <button className="navButton" id="takePhotoButton" onClick={handleTakePhoto}>
              Take Photo
            </button>
            
            {showCaptureButton && (
              <button id="captureButton" onClick={handleCapture}>
                Capture
              </button>
            )}
            
            <button className="navButton" id="selectPhoto" onClick={handleSelectPhoto}>
              Select Photo
            </button>
            
            {showConfirmation && (
              <div className="checkContainer">
                <button className="checkButton" id="confirmButton" onClick={handleConfirm}>
                  <img src="images/confirm.png" alt="Confirm" />
                </button>
                <button className="checkButton" id="denyButton" onClick={handleDeny}>
                  <img src="images/deny.png" alt="Deny" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="footer">
        <img src="images/sjoglogo.png" alt="saint john of god logo" className="sjog" />
      </div>
    </div>
  );
};

export default Media;