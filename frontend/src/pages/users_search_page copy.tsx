import { api } from "../services/api";
import BackIcon from "../assets/arrow.svg?react";
import HomeIcon from "../assets/home_blank.svg?react";
import MeIcon from "../assets/me_full.svg?react";
import SettingsIcon from "../assets/settings.svg?react";
import XIcon from "../assets/x_logo.svg?react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useEffect, useState } from "react";
import { FollowingFollowers } from "../components/following";
import "./search_user_page.css";

type miniUser = {
  id: number;
  username: string;
  name: string;
  profile_image: string;
  bio: string;
  is_following: boolean;
};

export const SearchUserPage = () => {
  const [searchParams] = useSearchParams();
  
  const q = searchParams.get("q");
  const actualUser = useAuthStore((state) => state.user?.id);

  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [followings, setFollowing] = useState<miniUser[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchField, setSearchField] = useState("");

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
        const response = await api.get(`/users/search_users/?q=${q}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data)
        setFollowing(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    handleInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  return (
  <div
    className="search-user-page"
    onClick={() => setSearching(false)}
  >
    <div className="search-user-page-container">

      {/* =========================
          LEFT SIDEBAR
      ========================= */}

      <aside className="search-user-left-sidebar">
        <div className="search-user-navigation">

          <XIcon className="search-user-logo" />

          <button
            className="search-user-nav-button"
            onClick={() => navigate("/home")}
          >
            <HomeIcon className="search-user-nav-icon" />

            <h2>Home</h2>
          </button>

          <button
            className="search-user-nav-button"
            onClick={() => navigate(`/profile/${actualUser}`)}
          >
            <MeIcon className="search-user-nav-icon" />

            <h2>Me</h2>
          </button>

          <button
            className="search-user-nav-button"
            onClick={() => navigate("/settings")}
          >
            <SettingsIcon className="search-user-nav-icon" />

            <h2>Settings</h2>
          </button>

        </div>
      </aside>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="search-user-main">

        <div className="search-user-header">

          <button
            className="search-user-back-button"
            onClick={() => navigate("/home")}
          >
            <BackIcon className="search-user-back-icon" />

            <h2>
              Results for "{q}"
            </h2>
          </button>

        </div>


        {/* RESULTADOS */}

        <div className="search-user-results">

          {followings?.map((following) => (
            <FollowingFollowers
              key={following.id}
              bio={following.bio}
              is_following={following.is_following ?? false}
              name={following.name ?? ""}
              profile_image={following.profile_image}
              username={following.username ?? ""}
              id={following.id ?? -1}
              follow={follow}
              unfollow={unfollow}
              actual_user_id={actualUser}
            />
          ))}

        </div>

      </main>


      {/* =========================
          RIGHT SIDEBAR
      ========================= */}

      <aside className="search-user-right-sidebar">

        <div className="search-user-right-content">

          {/* SEARCH */}

          <div className="search-user-search-wrapper">

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
              className="search-user-search-input"
            />


            {searching && (
              <div className="search-user-search-results">

                <span
                  onClick={() =>
                    navigate(
                      `/users/search/?q=${searchField}`
                    )
                  }
                >
                  Search "{searchField}" in Users
                </span>

                <span
                  onClick={() =>
                    navigate(
                      `/posts/search/?q=${searchField}`
                    )
                  }
                >
                  Search "{searchField}" in Posts
                </span>

              </div>
            )}

          </div>


          {/* WHAT'S HAPPENING */}

          <div className="search-user-trending">

            <h2>
              What's happening
            </h2>

          </div>

        </div>

      </aside>

    </div>
  </div>
);
};
