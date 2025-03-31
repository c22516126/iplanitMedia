import React, { useState, useRef, useEffect } from 'react';
import { openDB } from 'idb';
import './globals.css';
import './css/style.css';
import NavBar from './components/NavBar';
import ProfileArea from './components/ProfileArea';
import LogoutDialog from './components/LogoutDialog';
import ProfileDialog from './components/ProfileDialog';
import Image from 'next/image';
import LogoutIcon from '@/public/logout.svg';

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
  // Media component state
  const [showWebcam, setShowWebcam] = useState(false);
  const [showCaptureButton, setShowCaptureButton] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [savedImages, setSavedImages] = useState([]);
  
  // Navigation state
  const [fontSize, setFontSize] = useState(16);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profilePic, setProfilePic] = useState("/profile_placeholder.png");
  const [name, setName] = useState("Patrick");

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load saved images
  useEffect(() => {
    const loadImages = async () => {
      const db = await setupDB();
      const images = await db.getAll('images');
      setSavedImages(images);
    };
    loadImages();
  }, []);

  // Font size effect
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // Media functions (keep your existing functions)
  const handleTakePhoto = () => {
    setShowWebcam(true);
    setShowCaptureButton(true);
    setSelectedImage(null);
    
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
        const db = await setupDB();
        await db.add('images', {
          imageData: selectedImage,
          createdAt: new Date()
        });
        
        const images = await db.getAll('images');
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

  const handleProfileSave = (newPic, newName) => {
    setProfilePic(newPic);
    setName(newName);
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div>iplanit</div>
        <div className="logout" onClick={() => setShowLogoutDialog(true)}>
          <Image src={LogoutIcon} alt="Logout Icon" />
          <a>Logout</a>
        </div>
      </div>

      <div className="container">
        <ProfileArea 
          onEditProfile={() => setShowProfileDialog(true)} 
          profilePic={profilePic} 
          name={name} 
        />

        <NavBar fontSize={fontSize} first3={true} />
        <NavBar fontSize={fontSize} last3={true} />
        
        {/* Media Content */}
        <div className="media-content">
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

          {/* Saved Images Gallery */}
          <div className="savedImagesContainer">
            <h3>Saved Images</h3>
            <div className="savedImagesGrid">
              {savedImages.map((image) => (
                <div key={image.id} className="savedImageItem">
                  <img 
                    src={image.imageData} 
                    alt={`Saved ${image.id}`} 
                    className="savedImage"
                  />
                  <p>{new Date(image.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <img src="images/sjoglogo.png" alt="saint john of god logo" className="sjog" />
      </div>

      {/* Dialogs */}
      <LogoutDialog showDialog={showLogoutDialog} setShowDialog={setShowLogoutDialog} />
      <ProfileDialog 
        showDialog={showProfileDialog} 
        setShowDialog={setShowProfileDialog} 
        profilePic={profilePic} 
        name={name} 
        onSave={handleProfileSave} 
      />
    </>
  );
};

export default Media;