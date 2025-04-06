import React, { useState, useRef, useEffect } from 'react';
import { openDB } from 'idb';
import './css/style.css';

// Initialize IndexedDB
const setupDB = async () => {
  return openDB('ImageGalleryDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
      }
    }
  });
};

const Media = () => {
  const [showWebcam, setShowWebcam] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [savedImages, setSavedImages] = useState([]);

  // Buttons
  const [showTakePhoto, setShowTakePhoto] = useState(true);
  const [showSelectPhoto, setShowSelectPhoto] = useState(true);
  const [showCaptureButton, setShowCaptureButton] = useState(false);

  // Expanded images
  const [expandedImage, setExpandedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFileType, setSelectedFileType] = useState(null);

  // Load saved images on component mount
  useEffect(() => {
    const loadImages = async () => {
      const db = await setupDB();
      const images = await db.getAll('images');
      setSavedImages(images);
    };
    loadImages();
  }, []);

  const handleTakePhoto = () => {
    setShowWebcam(true);
    setShowCaptureButton(true);
    setShowTakePhoto(false);
    setShowSelectPhoto(false);
    setShowConfirmation(false);
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
    setShowWebcam(false);
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
        const result = event.target.result;
        // For audio files
        const isAudio = file.type.startsWith('audio/'); 
        setSelectedImage(result);
        setSelectedFileType(file.type); 
        setShowConfirmation(true);
      };

      if (file.type.startsWith('audio/') || file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      }
    }

    setShowConfirmation(true);
    setShowTakePhoto(false);
    setShowSelectPhoto(false);

  };

  const handleConfirm = async () => {
    if (selectedImage) {
      try {
        await dbOperations.addImage(selectedImage, selectedFileType);

        // Refresh the saved images list
        const images = await dbOperations.getAllImages();
        setSavedImages(images);
        console.log("File saved to database");
      } catch (error) {
        console.error("Error saving file:", error);
      }
    }
    
    setShowConfirmation(false);
    setSelectedImage(null);
    setShowWebcam(false);
    setShowSelectPhoto(true);
    setShowTakePhoto(true);
  };

  const handleDeny = () => {
    setShowTakePhoto(true);
    setShowConfirmation(false);
    setSelectedImage(null);
    setShowWebcam(false);
    setShowSelectPhoto(true);
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
              {showWebcam ? (
                <video 
                  className="uploadVid" 
                  id="video" 
                  ref={videoRef} 
                  autoPlay 
                  style={{ display: showWebcam ? 'block' : 'none' }}
                />
              ) : selectedImage ? (
                  <img 
                    src={selectedImage} 
                    alt="Captured" 
                    className="uploadImg" 
                  /> 
                ) : (
                  <img
                    className="uploadImg" 
                    id="uploadImg" 
                    src="images/uploadimg.png" 
                    alt="select icon" 
                  />
    
              )}
              
              <input 
                type="file" 
                id="inputPhoto" 
                ref={fileInputRef}
                accept="image/*,audio/*" 
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            
            {showTakePhoto && (
              <button className="navButton" id="takePhotoButton" onClick={handleTakePhoto}>
                Take Photo
              </button>
            )}

            
            {showCaptureButton && (
              <button id="captureButton" onClick={handleCapture}>
                Capture
              </button>
            )}
            
            {showSelectPhoto && (
              <button className="navButton" id="selectPhoto" onClick={handleSelectPhoto}>
                Select File
              </button>
            )}

            
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

          {/* Display saved images */}
          <div className="savedImagesContainer">
            <h3>Saved Images</h3>
            <div className="savedImagesGrid">
              {savedImages.map((image) => (
                <div key={image.id} className="savedImageItem">
                  {image.fileType.startsWith('image/') ? (
                    <img 
                      src={image.fileData} 
                      alt={`Saved ${image.id}`} 
                      className="savedImage"
                      onClick={() => {
                        setExpandedImage(image);
                        setShowImageModal(true);
                      }}
                    />
                    ) : image.fileType.startsWith('audio/') ? (
                      <audio controls className="savedAudio">
                        <source src={image.fileData} type={image.fileType} />
                        Your browser does not support the audio element.
                      </audio>
                    ) : null}
                  <p>{new Date(image.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showImageModal && expandedImage && (
      <div className="imageModalOverlay" onClick={() => setShowImageModal(false)}>
        <div className="imageModalContent" onClick={(e) => e.stopPropagation()}>
        {expandedImage.fileType.startsWith('image/') ? (
          <img src={expandedImage.fileData} alt="Expanded" className="imageModalImg" />
            ) : expandedImage.fileType.startsWith('audio/') ? (
              <audio controls className="modalAudioPlayer">
                <source src={expandedImage.fileData} type={expandedImage.fileType} />
                Your browser does not support the audio element.
              </audio>
            ) : null}
          <p className="imageModalDate">{new Date(expandedImage.createdAt).toLocaleString()}</p>
          <button className="deleteButton" onClick={async () => {
            const db = await setupDB();
            await db.delete('images', expandedImage.id);
            const images = await db.getAll('images');
            setSavedImages(images);
            setShowImageModal(false);
          }}>
            Delete
          </button>
          <button onClick={() => setShowImageModal(false)}>Back</button>
        </div>
      </div>
    )}

      
      <div className="footer">
        <img src="images/sjoglogo.png" alt="saint john of god logo" className="sjog" />
      </div>
    </div>
  );
};

export default Media;