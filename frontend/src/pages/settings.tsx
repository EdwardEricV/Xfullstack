import HomeIcon from "../assets/home_blank.svg?react";
import MeIcon from "../assets/me.svg?react";
import SettingsIcon from "../assets/settings_full.svg?react";
import XIcon from "../assets/x_logo.svg?react";

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../services/api";
import { useState } from "react";
import { DeletingPost } from "../components/delete_overlay";

import "./settings.css";

export const SettingsPage = () => {
  const actualUserId = useAuthStore(
    (state) => state.user?.id
  );

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const navigate = useNavigate();

  const logout = useAuthStore(
    (state) => state.logout
  );

  const [deleting, setDeleting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchField, setSearchField] = useState("");


  /* =====================================
     DELETE ACCOUNT
  ===================================== */

  const deleteAccount = async () => {
    try {
      await api.delete(
        `/users/${actualUserId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      logout();

      navigate("/signin");

    } catch (err) {
      console.log(err);
    }
  };


  /* =====================================
     DELETE MODAL
  ===================================== */

  const deletingset = () => {
    setDeleting((prev) => !prev);
  };


  return (
    <div
      className="settings-page"
      onClick={() => setSearching(false)}
    >

      <div className="settings-container">


        {/* =================================
            LEFT SIDEBAR
        ================================= */}

        <aside className="settings-sidebar">

          <div className="settings-logo">
            <XIcon />
          </div>


          <nav className="settings-nav">

            {/* HOME */}

            <button
              className="settings-nav-button"
              onClick={() => navigate("/home")}
            >
              <HomeIcon />

              <span>
                Home
              </span>
            </button>


            {/* PROFILE */}

            <button
              className="settings-nav-button"
              onClick={() =>
                navigate(
                  `/profile/${actualUserId}`
                )
              }
            >
              <MeIcon />

              <span>
                Me
              </span>
            </button>


            {/* SETTINGS */}

            <button
              className="settings-nav-button settings-nav-button-active"
            >
              <SettingsIcon />

              <span>
                Settings
              </span>
            </button>

          </nav>

        </aside>


        {/* =================================
            CENTER
        ================================= */}

        <main className="settings-main">


          {/* HEADER */}

          <header className="settings-header">

            <h1>
              Settings
            </h1>

          </header>


          {/* CONTENT */}

          <div className="settings-content">

            <div className="settings-card">


              {/* LOG OUT */}

              <button
                className="settings-option"
                onClick={() => {
                  logout();
                  navigate("/signup");
                }}
              >

                <div className="settings-option-content">

                  <span className="settings-option-title">
                    Log Out
                  </span>

                  <span className="settings-option-description">
                    Sign out of your account
                  </span>

                </div>

                <span className="settings-option-arrow">
                  →
                </span>

              </button>


              {/* DELETE ACCOUNT */}

              <button
                className="settings-option settings-option-danger"
                onClick={deletingset}
              >

                <div className="settings-option-content">

                  <span className="settings-option-title">
                    Delete Account
                  </span>

                  <span className="settings-option-description">
                    Permanently delete your account
                  </span>

                </div>

                <span className="settings-option-arrow">
                  →
                </span>

              </button>

            </div>

          </div>

        </main>


        {/* =================================
            DELETE MODAL
        ================================= */}

        {deleting && (
          <DeletingPost
            cancel={deletingset}
            deleteAccount={deleteAccount}
          />
        )}


        {/* =================================
            RIGHT SIDEBAR
        ================================= */}

        <aside className="settings-right">

          <div className="settings-search">


            {/* SEARCH */}

            <input
              onClick={(e) => {
                setSearching(true);
                e.stopPropagation();
              }}
              onChange={(e) =>
                setSearchField(e.target.value)
              }
              value={searchField}
              type="text"
              placeholder="Search"
              className="settings-search-input"
            />


            {/* SEARCH OPTIONS */}

            {searching && (
              <div className="settings-search-menu">

                <div
                  className="settings-search-option"
                  onClick={() =>
                    navigate(
                      `/users/search/?q=${searchField}`
                    )
                  }
                >
                  Search "{searchField}" in Users
                </div>


                <div
                  className="settings-search-option"
                  onClick={() =>
                    navigate(
                      `/posts/search/?q=${searchField}`
                    )
                  }
                >
                  Search "{searchField}" in Posts
                </div>

              </div>
            )}

          </div>


          {/* WHAT'S HAPPENING */}

          <div className="settings-trending">

            <h2>
              What's happening
            </h2>

          </div>

        </aside>

      </div>

    </div>
  );
};