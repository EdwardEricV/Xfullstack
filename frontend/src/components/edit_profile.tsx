import { useState } from "react";
import AddPhoto from "../assets/addphoto2.svg?react";
import "./edit_profile.css";

type editProps = {
  toggleEditProfile: () => void;
  handleSaveProfile: () => void;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  bio: string;
  setBio: React.Dispatch<React.SetStateAction<string>>;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  setNewPasswordValid: React.Dispatch<React.SetStateAction<string>>;
  profile_image: string;
  profile_banner: string;
  setProfileBanner: React.Dispatch<React.SetStateAction<string>>;
  setProfileImage: React.Dispatch<React.SetStateAction<string>>;
  setProfileBannerFile: React.Dispatch<React.SetStateAction<File | null>>;
  setProfileImageFile: React.Dispatch<React.SetStateAction<File | null>>;
};

export const EditProfile = ({
  toggleEditProfile,
  handleSaveProfile,
  bio,
  name,
  profile_banner,
  profile_image,
  setBio,
  setName,
  setProfileBanner,
  setProfileImage,
  setProfileBannerFile,
  setProfileImageFile,
  setNewPassword,
  setNewPasswordValid,
}: editProps) => {
  const [passValid, setPassValid] = useState("untouched");
  const [pass2Valid, setPass2Valid] = useState("untouched");

  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");

  const [passwordtest1, setPasswordtest1] = useState(false);
  const [passwordtest2, setPasswordtest2] = useState(false);
  const [passwordtest3, setPasswordtest3] = useState(false);
  const [passwordtest4, setPasswordtest4] = useState(false);
  const [passwordtest5, setPasswordtest5] = useState(false);

  const set_pass1 = (password: string): void => {
    setPass1(password);
  };

  const set_pass2 = (password: string): void => {
    setPass2(password);
  };

  const pass2isvalid = (password1: string, password2: string): void => {
    if (password1 === password2) {
      setPass2Valid("valid");
      setNewPasswordValid("valid");
      return;
    }

    setPass2Valid("invalid");
    setNewPasswordValid("invalid");
  };

  const hasNumber = (pass1: string): boolean => {
    const response = /[0-9]/.test(pass1);
    return response;
  };
  const hasLower = (pass1: string): boolean => {
    const response = /[a-z]/.test(pass1);
    return response;
  };
  const hasUpper = (pass1: string): boolean => {
    const response = /[A-Z]/.test(pass1);
    return response;
  };
  const hasSpecial = (pass1: string): boolean => {
    const response = /[!@#$%&*]/.test(pass1);
    return response;
  };
  const verifyQuantity = (pass1: string): boolean => {
    if (pass1.length >= 8 && pass1.length <= 20) {
      return true;
    }
    return false;
  };

  const verify_password = (password: string): void => {
    const number = hasNumber(password);
    const lower = hasLower(password);
    const upper = hasUpper(password);
    const special = hasSpecial(password);
    const quantity = verifyQuantity(password);

    setPasswordtest1(number);
    setPasswordtest2(lower);
    setPasswordtest3(upper);
    setPasswordtest4(special);
    setPasswordtest5(quantity);

    if (number && lower && upper && special && quantity) {
      setPassValid("valid");
      return;
    }

    setPassValid("invalid");
    setNewPasswordValid("invalid");
  };
  return (
  <div className="edit-profile-overlay">
    <div className="edit-profile-modal">

      {/* HEADER */}

      <div className="edit-profile-header">
        <div className="edit-profile-header-left">
          <button
            className="edit-profile-close"
            onClick={toggleEditProfile}
          >
            X
          </button>

          <h1 className="edit-profile-title">
            Edit profile
          </h1>
        </div>

        <button
          className="edit-profile-save"
          onClick={handleSaveProfile}
        >
          Save
        </button>
      </div>

      {/* =========================
          BANNER
      ========================= */}

      <div className="edit-profile-banner">

        <input
          type="file"
          accept="image/*"
          className="edit-profile-hidden-input"
          id="bannerInput"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              setProfileBannerFile(file);
              setProfileBanner(URL.createObjectURL(file));
            }
          }}
        />

        <img
          src={profile_banner}
          className="edit-profile-banner-image"
          alt="Profile banner"
        />

        <div className="edit-profile-image-button-wrapper">
          <button
            className="edit-profile-image-button"
            onClick={() =>
              document.getElementById("bannerInput")?.click()
            }
          >
            <AddPhoto className="pointer-events-none" />
          </button>
        </div>
      </div>

      {/* =========================
          AVATAR + NAME
      ========================= */}

      <div className="edit-profile-avatar-row">

        <div className="edit-profile-avatar-wrapper">

          <input
            type="file"
            accept="image/*"
            className="edit-profile-hidden-input"
            id="imageInput"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                setProfileImageFile(file);
                setProfileImage(URL.createObjectURL(file));
              }
            }}
          />

          <img
            src={profile_image}
            className="edit-profile-avatar-image"
            alt="Profile"
          />

          <div className="edit-profile-image-button-wrapper">
            <button
              className="edit-profile-image-button"
              onClick={() =>
                document.getElementById("imageInput")?.click()
              }
            >
              <AddPhoto className="pointer-events-none" />
            </button>
          </div>

        </div>

        <div className="edit-profile-field edit-profile-name-field">

          <label className="edit-profile-field-label">
            Name
          </label>

          <input
            value={name}
            type="text"
            onChange={(e) => setName(e.target.value)}
          />

        </div>

      </div>

      {/* =========================
          BIO
      ========================= */}

      <div className="edit-profile-field edit-profile-bio-field">

        <label className="edit-profile-field-label">
          Bio
        </label>

        <input
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          type="text"
        />

      </div>

      {/* =========================
          NEW PASSWORD
      ========================= */}

      <div className="edit-profile-field edit-profile-password-field">

        <label className="edit-profile-field-label">
          New Password (optional)
        </label>

        <input
          value={pass1}
          onChange={(e) => {
            const value = e.target.value;

            set_pass1(value);
            verify_password(value);
            pass2isvalid(value, pass2);
            setNewPassword(value);
          }}
          type="password"
          name="password"
          autoComplete="new-password"
        />

        {passValid === "invalid" && (
          <>
            <p
              className={`edit-profile-password-error ${
                passwordtest1 ? "valid" : "invalid"
              }`}
            >
              Password must have at least a number
            </p>

            <p
              className={`edit-profile-password-error ${
                passwordtest2 ? "valid" : "invalid"
              }`}
            >
              Password must have at least a lower letter
            </p>

            <p
              className={`edit-profile-password-error ${
                passwordtest3 ? "valid" : "invalid"
              }`}
            >
              Password must have at least a upper letter
            </p>

            <p
              className={`edit-profile-password-error ${
                passwordtest4 ? "valid" : "invalid"
              }`}
            >
              Password must have at least a special character
            </p>

            <p
              className={`edit-profile-password-error ${
                passwordtest5 ? "valid" : "invalid"
              }`}
            >
              Password must have between 8 and 20 characters
            </p>
          </>
        )}

      </div>

      {/* =========================
          CONFIRM PASSWORD
      ========================= */}

      <div className="edit-profile-field edit-profile-password-field">

        <label className="edit-profile-field-label">
          Confirm Password
        </label>

        <input
          value={pass2}
          onChange={(e) => {
            const value = e.target.value;

            set_pass2(value);
            pass2isvalid(pass1, value);
          }}
          type="password"
          autoComplete="new-password"
        />

        {pass2Valid === "invalid" && (
          <p className="edit-profile-password-match-error">
            Error, passwords do not match
          </p>
        )}

      </div>

    </div>
  </div>
);
};
