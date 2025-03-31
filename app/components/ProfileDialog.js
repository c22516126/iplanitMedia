import { useState } from "react";
import Image from "next/image";
import PersonIcon from "@/public/person.svg";
import CloseIcon from "@/public/close.svg";
import TickIcon from "@/public/check.svg";

export default function ProfileDialog({ showDialog, setShowDialog, profilePic, name, onSave }) {
    const [newName, setNewName] = useState(name);
    const [newProfilePic, setNewProfilePic] = useState(profilePic);

    const handleSave = () => {
        onSave(newProfilePic, newName);
        setShowDialog(false);
    };

    // console.log(showDialog);
    
    const handleFileUpload = (e) => {
        const imageUrl = URL.createObjectURL(e.target.files[0]);
        setNewProfilePic(imageUrl);
    };

    return (
        <>
            {showDialog && (
                <div className="dialog-bg" onClick={() => setShowDialog(false)}>
                    <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
                        {/* <h2>Edit Profile</h2> */}
                        <p className="title">
                            <span className="logout-icon"><Image src={PersonIcon} alt="PersonIcon" /></span>
                            Profile
                        </p>
                        <div className="upload-picture">
                            <label htmlFor="fileInput" className="upload-btn">
                                {newProfilePic && <Image src={newProfilePic} alt="Profile" width={250} height={250} />}
                                <br />
                                Change Picture
                            </label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload} 
                                hidden
                                id="fileInput"
                            />
                            {/* {newProfilePic && <Image src={newProfilePic} alt="Profile" width={50} height={50} />} */}
                            {/* <Image src={profilePic} alt="Profile Pic" /> */}
                        </div>
                        <div>
                            <label>Name:</label>
                            <input 
                                type="text" 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)} 
                            />
                        </div>
                        <div className="dialog-buttons">
                            <button className="no" onClick={() => setShowDialog(false)}>
                                <span className="invert"><Image src={CloseIcon} alt="Close Icon"/></span>
                                Cancel
                            </button>
                            <button className="yes" onClick={handleSave}>
                                <span><Image src={TickIcon} alt="Tick Icon"/></span>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
