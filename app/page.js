"use client";


import { useState, useEffect } from 'react';
import { openDB } from 'idb';
import './globals.css';
import './style.css';
import NavBar from './components/NavBar';
import ProfileArea from './components/ProfileArea';
import LogoutDialog from './components/LogoutDialog';
import ProfileDialog from './components/ProfileDialog';
import Image from 'next/image';
import LogoutIcon from '@/public/logout.svg';
import Media from './components/Media'; // Import the Media component

// Initialize IndexedDB for page-specific operations
const setupDB = async () => {
  return openDB('AppDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('userSettings')) {
        db.createObjectStore('userSettings', { keyPath: 'id' });
      }
    }
  });
};

const Page = () => {
  // Navigation and user interface state
  const [fontSize, setFontSize] = useState(16);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profilePic, setProfilePic] = useState("/profile_placeholder.png");
  const [name, setName] = useState("Patrick");

  // Font size effect
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

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
        
        {/* Media Component Integration */}
        <Media />
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

export default Page;