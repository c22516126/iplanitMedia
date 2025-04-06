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
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [savedFiles, setSavedFiles] = useState([]);

  // Buttons
  const [showCaptureButton, setShowCaptureButton] = useState(false);
  const [showSelectPhoto, setShowSelectPhoto] = useState(true);
  const [showTakePhoto, setShowTakePhoto] = useState(true);

  // Expanded images
  const [showImageModal, setShowImageModal] = useState(false);
  const [expandedFile, setExpandedFile] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load saved images on component mount and cleanup
  useEffect(() => {
    const loadImages = async () => {
      try {
        const images = await dbOperations.getAllImages();
        setSavedFiles(images);
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
    setSelectedFile(null);
    
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
    setSelectedFileType('image/png'); 
    setSelectedFile(imageUrl);
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
    if (file && (file.type.startsWith('image/') || file.type.startsWith('audio/'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile(event.target.result);
        setSelectedFileType(file.type);  // ✅ this line ensures correct typing
        setShowConfirmation(true);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Invalid file");
    }
  
    setShowConfirmation(true);
    setShowTakePhoto(false);
    setShowSelectPhoto(false);
  };
  
  const handleConfirm = async () => {
    if (!selectedFile || !selectedFileType) {
      alert("File or file type missing. Please try again.");
      return;
    }
  
    try {
      await dbOperations.addImage({
        imageData: selectedFile,
        fileType: selectedFileType
      });
  
      const files = await dbOperations.getAllImages();
      setSavedFiles(files);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  
    setShowConfirmation(false);
    setSelectedFile(null);
    setShowWebcam(false);
    setShowSelectPhoto(true);
    setShowTakePhoto(true);
  };
  

  const handleDeny = () => {
    setShowTakePhoto(true);
    setShowConfirmation(false);
    setSelectedFile(null);
    setShowWebcam(false);
    setShowSelectPhoto(true);
  };
  
  return (
    <div className="media-component">
      <div className="media-content-wrapper">
        <div className="selectContainer">
          <div id="webcamContainer">
            {showWebcam && !selectedFile ? (
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
              selectedFile ? (
                <img 
                  src={selectedFile} 
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
              accept="image/*,audio/*" 
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          <div className="media-buttons">

            {showTakePhoto && (
              <button className="navButton" id="takePhotoButton" onClick={handleTakePhoto}>
                <img src="images/cam2.png"/> Take Photo
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
                  Select File
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
          {savedFiles.map((file) => (
            <div key={file.id} className="savedImageItem">
              {file.fileType?.startsWith('image/') ? (
                <img 
                  src={file.fileData || file.imageData} 
                  alt={`Saved ${file.id}`} 
                  className="savedImage"
                  onClick={() => {
                    setExpandedFile(file);
                    setShowImageModal(true);
                  }}
                />
              ) : file.fileType?.startsWith('audio/') ? (
                <audio controls className="savedAudio">
                  <source src={file.fileData || file.imageData} type={file.fileType} />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <p>Unsupported file type</p>
              )}
              <p>{file.createdAt ? new Date(file.createdAt).toLocaleString() : 'Unknown date'}</p>
            </div>
          ))}
          </div>
        </div>
      </div>

      {showImageModal && expandedFile && (
        <div className="imageModalOverlay" onClick={() => setShowImageModal(false)}>
          <div className="imageModalContent" onClick={(e) => e.stopPropagation()}>
            {expandedFile?.fileType?.startsWith('image/') ? (
              <img
                src={expandedFile.fileData || expandedFile.imageData}
                alt="Expanded"
                className="imageModalImg"
              />
            ) : expandedFile?.fileType?.startsWith('audio/') ? (
              <audio controls className="modalAudioPlayer">
                <source
                  src={expandedFile.fileData || expandedFile.imageData}
                  type={expandedFile.fileType}
                />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p>Unsupported file type</p>
            )}
            <p className="imageModalDate">
              {new Date(expandedFile.createdAt).toLocaleString()}
            </p>
            <button
              className="deleteButton"
              onClick={async () => {
                await dbOperations.deleteImage(expandedFile.id);
                const files = await dbOperations.getAllImages();
                setSavedFiles(files);
                setShowImageModal(false);
              }}
            >
              Delete
            </button>
            <button
              className="backButton"
              onClick={() => setShowImageModal(false)}
            >
              Back
            </button>
          </div>
        </div>
      )}


      {/* Modal remains the same */}
    </div>
  );
};

export default Media;