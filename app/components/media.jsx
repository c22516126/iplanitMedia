import React, { useState, useRef, useEffect } from 'react';
import { openDB } from 'idb';

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

// DB operations
const dbOperations = {
  getAllImages: async () => {
    const db = await setupDB();
    return db.getAll('images');
  },
  addImage: async (image) => {
    const db = await setupDB();
    return db.add('images', {
      ...image,
      createdAt: new Date()
    });
  },
  deleteImage: async (id) => {
    const db = await setupDB();
    return db.delete('images', id);
  }
};

const Media = () => {
  const [showWebcam, setShowWebcam] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [savedImages, setSavedImages] = useState([]);

  // Buttons
  const [showCaptureButton, setShowCaptureButton] = useState(false);
  const [showSelectPhoto, setShowSelectPhoto] = useState(true);
  const [showTakePhoto, setShowTakePhoto] = useState(true);

  // Expanded images
  const [showImageModal, setShowImageModal] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load saved images on component mount and cleanup
  useEffect(() => {
    const loadImages = async () => {
      try {
        const images = await dbOperations.getAllImages();
        setSavedImages(images);
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };
    loadImages();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleTakePhoto = () => {
    setShowWebcam(true);
    setShowCaptureButton(true);
    setShowTakePhoto(false);
    setShowSelectPhoto(false);
    setShowConfirmation(false);
    setSelectedImage(null);
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.style.display = 'block';
          }
        })
        .catch(error => {
          console.error("Error accessing webcam:", error);
          alert("Could not access webcam. Please check permissions.");
          setShowWebcam(false);
          setShowCaptureButton(false);
        });
    } else {
      alert("Webcam access is not supported in your browser.");
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

    setShowConfirmation(true);
    setShowTakePhoto(false);
    setShowSelectPhoto(false);
  };

  const handleConfirm = async () => {
    if (selectedImage) {
      try {
        await dbOperations.addImage({
          imageData: selectedImage
        });
        
        const images = await dbOperations.getAllImages();
        setSavedImages(images);
      } catch (error) {
        console.error("Error saving image:", error);
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
    <div className="media-component">
      <div className="media-content-wrapper">
        <div className="selectContainer">
          <div id="webcamContainer">
            {showWebcam && !selectedImage ? (
              // Display webcam
              <video 
                className="uploadVid" 
                id="video" 
                ref={videoRef} 
                autoPlay 
                style={{ display: showWebcam ? 'block' : 'none' }}
              />
            ) : (
              // Display captured image 
              selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt="Captured" 
                  className="uploadImg" 
                />
              ) : (
                // Display placeholder image 
                <img
                  className="uploadImg" 
                  id="uploadImg" 
                  src="images/uploadimg.png" 
                  alt="select icon" 
                />
              )
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

          <div className="media-buttons">

            {showTakePhoto && (
              <button className="navButton" onClick={handleTakePhoto}>
                Take Photo
              </button>
            )}

            {showCaptureButton && (
              <button className="navButton" id="captureButton" onClick={handleCapture}>
                Capture
              </button>
            )}
            
            <div className="file-input-wrapper">
              
              {showSelectPhoto && (
                <button className="navButton" id="selectPhoto" onClick={handleSelectPhoto}>
                  Select Photo
                </button>
              )}

              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            
            {showConfirmation && (
              <div className="checkContainer">
                <button className="checkButton" onClick={handleConfirm}>
                  <img src="/images/confirm.png" alt="Confirm" />
                </button>
                <button className="checkButton" onClick={handleDeny}>
                  <img src="/images/deny.png" alt="Deny" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="savedImagesContainer">
          <h3>Saved Images</h3>
          <div className="savedImagesGrid">
            {savedImages.map((image) => (
              <div key={image.id} className="savedImageItem">
                <img 
                  src={image.imageData} 
                  alt={`Saved ${image.id}`} 
                  className="savedImage"
                  onClick={() => {
                    setExpandedImage(image);
                    setShowImageModal(true);
                  }}
                />
                <p>{new Date(image.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showImageModal && expandedImage && (
      <div className="imageModalOverlay" onClick={() => setShowImageModal(false)}>
        <div className="imageModalContent" onClick={(e) => e.stopPropagation()}>
          <img src={expandedImage.imageData} alt="Expanded" className="imageModalImg" />
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
          <button className="backButton" onClick={() => setShowImageModal(false)}>Back</button>
        </div>
      </div>
    )}

      {/* Modal remains the same */}
    </div>
  );
};

export default Media;