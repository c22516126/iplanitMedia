"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Dashboard from "./components/media";
import NavBar from "./components/NavBar";
import ProfileArea from "./components/ProfileArea";
import LogoutDialog from "./components/LogoutDialog";
import ProfileDialog from "./components/ProfileDialog";
import TextIncreaseIcon from "@/public/text_increase.svg";
import TextDecreaseIcon from "@/public/text_decrease.svg";
import LogoutIcon from "@/public/logout.svg";

export default function Home() {
  const [fontSize, setFontSize] = useState(16);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profilePic, setProfilePic] = useState("/profile_placeholder.png");
  const [name, setName] = useState("Patrick");

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  const increaseFontSize = () => {
    setFontSize(Math.min(fontSize + 1, 28));
  };

  const decreaseFontSize = () => {
    setFontSize(Math.max(fontSize - 1, 10));
  };

  const handleProfileSave = (newPic, newName) => {
    setProfilePic(newPic);
    setName(newName);
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="top-bar">
        <div>iplanit</div>
        <div className="logout" onClick={() => setShowLogoutDialog(true)} style={{ cursor: 'pointer' }}>
          <Image src={LogoutIcon} alt="Logout Icon" />
          <a>Logout</a>
        </div>
      </div>

      <div className="container">
        <ProfileArea onEditProfile={() => setShowProfileDialog(true)} profilePic={profilePic} name={name} />

        <NavBar fontSize={fontSize} first3={true} />
        <NavBar fontSize={fontSize} last3={true} />
        
        <Dashboard />
      </div>

      {/* Dialogs */}
      <LogoutDialog showDialog={showLogoutDialog} setShowDialog={setShowLogoutDialog} />
      <ProfileDialog showDialog={showProfileDialog} setShowDialog={setShowProfileDialog} profilePic={profilePic} name={name} onSave={handleProfileSave} />

      <div className="text-change-btns">
        <button onClick={decreaseFontSize}>
          <Image className="smaller" src={TextDecreaseIcon} alt="Test Decrase Icon" />
        </button>
        <button onClick={increaseFontSize}>
          <Image className="bigger" src={TextIncreaseIcon} alt="Test Decrase Icon" />
        </button>
      </div>
    </div>
  );
}
