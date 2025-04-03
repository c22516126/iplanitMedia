import React, { useState, useRef, useEffect } from 'react';
import { openDB } from 'idb';
import '../css/style.css';

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
  const [showCaptureButton, setShowCaptureButton] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

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
                    src="images/uploadimg.png" 
                    alt="select icon" 
                  />
                  <video 
                    className="uploadVid" 
                    ref={videoRef} 
                    autoPlay 
                    style={{ display: showWebcam ? 'block' : 'none' }}
                  />
                </>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            
            <button className="navButton" onClick={handleTakePhoto}>
              Take Photo
            </button>
            
            {showCaptureButton && (
              <button id="captureButton" onClick={handleCapture}>
                Capture
              </button>
            )}
            
            <button className="navButton" onClick={handleSelectPhoto}>
              Select Photo
            </button>
            
            {showConfirmation && (
              <div className="checkContainer">
                <button className="checkButton" onClick={handleConfirm}>
                  <img src="images/confirm.png" alt="Confirm" />
                </button>
                <button className="checkButton" onClick={handleDeny}>
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
      </div>

      {showImageModal && expandedImage && (
        <div className="imageModalOverlay" onClick={() => setShowImageModal(false)}>
          <div className="imageModalContent" onClick={(e) => e.stopPropagation()}>
            <img src={expandedImage.imageData} alt="Expanded" className="imageModalImg" />
            <p className="imageModalDate">{new Date(expandedImage.createdAt).toLocaleString()}</p>
            <button className="deleteButton" onClick={async () => {
              await dbOperations.deleteImage(expandedImage.id);
              const images = await dbOperations.getAllImages();
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