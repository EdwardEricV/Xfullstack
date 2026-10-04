import { api } from "../services/api";
import HomeIcon from "../assets/home_blank.svg?react";
import MeIcon from "../assets/me_full.svg?react";
import SettingsIcon from "../assets/settings.svg?react";
import XIcon from "../assets/x_logo.svg?react";
import ArrowIcon from "../assets/arrow.svg?react";

import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useEffect, useState } from "react";
import { FollowingFollowers } from "../components/following";

import "./followers_page.css";

type miniUser = {
  id: number;
  username: string;
  name: string;
  profile_image: string;
  bio: string;
  is_following: boolean;
};

type actualUser = {
  bio: string;
  birthday: string;
  created_at: string;
  email: string;
  followers_count: number;
  following_count: number;
  id: number;
  is_following: boolean;
  name: string;
  profile_banner: string;
  profile_image: string;
  username: string;
  followers: miniUser[];
  following: miniUser[];
};

export const FollowersPage = () => {
  const { id } = useParams();

  const actualUser = useAuthStore((state) => state.user?.id);

  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [profileUser, setProfileUser] = useState<actualUser | null>(null);
  const [followings, setFollowing] = useState<miniUser[] | null>(null);

  const follow = async (userId: number) => {
  try {
    await api.post(
      `users/${userId}/follow/`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    setFollowing((prev) =>
      prev?.map((user) =>
        user.id === userId
          ? { ...user, is_following: true }
          : user
      ) ?? null
    );
  } catch (err) {
    console.log(err);
  }
};

const unfollow = async (userId: number) => {
  try {
    await api.post(
      `users/${userId}/unfollow/`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    setFollowing((prev) =>
      prev?.map((user) =>
        user.id === userId
          ? { ...user, is_following: false }
          : user
      ) ?? null
    );
  } catch (err) {
    console.log(err);
  }
};
  useEffect(() => {
    const handleInit = async () => {
      try {
        let token = accessToken;

        if (!token) {
          const res = await api.post(
            "/token/refresh/",
            {},
            { withCredentials: true },
          );
          token = res.data.access;
          setAccessToken(res.data.access);
        }
        const response = await api.get(`/users/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileUser(response.data);
        setFollowing(response.data.followers);
      } catch (err) {
        console.log(err);
      }
    };

    handleInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
  <div className="followers-page">

    <div className="followers-container">


      {/* =================================
          LEFT SIDEBAR
      ================================= */}

      <aside className="followers-sidebar">

        <div className="followers-logo">
          <XIcon />
        </div>


        <nav className="followers-nav">

          {/* HOME */}

          <button
            className="followers-nav-button"
            onClick={() => navigate("/home")}
          >
            <HomeIcon />

            <span>
              Home
            </span>
          </button>


          {/* PROFILE */}

          <button
            className="followers-nav-button"
            onClick={() =>
              navigate(`/profile/${actualUser}`)
            }
          >
            <MeIcon />

            <span>
              Me
            </span>
          </button>


          {/* SETTINGS */}

          <button
            className="followers-nav-button"
            onClick={() =>
              navigate("/settings")
            }
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

      <main className="followers-main">


        {/* PROFILE HEADER */}

        <header className="followers-profile-header">

          <button
            className="followers-back"
            onClick={() => navigate("/home")}
          >
            <ArrowIcon />
          </button>


          <div className="followers-profile-info">

            <h1 className="followers-profile-name">
              {profileUser?.name}
            </h1>

            <p className="followers-profile-username">
              @{profileUser?.username}
            </p>

          </div>

        </header>


        {/* =================================
            TABS
        ================================= */}

        <div className="followers-tabs">

          {/* FOLLOWERS - ACTIVE */}

          <div className="followers-tab followers-tab-active">
            Followers
          </div>


          {/* FOLLOWING */}

          <div
            className="followers-tab"
            onClick={() =>
              navigate(
                `/profile/${id}/following`
              )
            }
          >
            Following
          </div>

        </div>


        {/* =================================
            USERS
        ================================= */}

        <div className="followers-list">

          {followings?.map((following) => (

            <FollowingFollowers
              key={following.id}

              bio={following.bio}

              is_following={
                following.is_following ?? false
              }

              name={
                following.name ?? ""
              }

              profile_image={
                following.profile_image
              }

              username={
                following.username ?? ""
              }

              id={
                following.id ?? -1
              }

              follow={follow}

              unfollow={unfollow}

              actual_user_id={actualUser}
            />

          ))}

        </div>

      </main>


      {/* =================================
          RIGHT SIDEBAR
      ================================= */}

      <aside className="followers-right">

        <div className="followers-search">

          <input
            type="text"
            placeholder="Search"
            className="followers-search-input"
          />

        </div>


        <div className="followers-trending">

          <h2>
            What's happening
          </h2>

        </div>

      </aside>

    </div>

  </div>
);
};
