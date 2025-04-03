import Image from "next/image";
import ProfilePic from "@/public/profile_placeholder.png";
import PersonIcon from "@/public/person.svg";

export default function ProfileArea({ profilePic, name, onEditProfile }) {
    return (
        <div className="profile-area">
            <div className="profile-circle" onClick={onEditProfile} style={{ cursor: "pointer" }}>
                <Image src={profilePic} alt="Profile image"  width={50} height={50} />
                <div className="icon">
                    <Image src={PersonIcon} alt="Person icon" />
                </div>
            </div>
            <div className="profile-area-name">
                <p onClick={onEditProfile}>{name}</p>
            </div>

            {/* <div className="profile-area-btns">
              <button className="smaller" onClick={decreaseFontSize}>
                <Image src={TextDecreaseIcon} alt="Text Decrease Icon" />
              </button>
              <button onClick={increaseFontSize}>
                <Image src={TextIncreaseIcon} alt="Text Increase Icon" />
              </button>
            </div> */}
        </div>
    );
}
