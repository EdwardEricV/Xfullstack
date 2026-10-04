import { useNavigate } from "react-router-dom";
import "./following.css";

type miniUser = {
  id: number;
  username: string;
  name: string;
  profile_image: string | undefined;
  bio: string | undefined;
  is_following: boolean;
  follow: (id: number) => void;
  unfollow: (id: number) => void;
  actual_user_id: number | undefined;
};

export const FollowingFollowers = ({
  bio,
  is_following,
  name,
  profile_image,
  username,
  id,
  follow,
  unfollow,
  actual_user_id,
}: miniUser) => {

  const navigate = useNavigate();

  return (
    <div className="follow-user-card">

      {/* =========================
          AVATAR
      ========================= */}

      <div
        className="follow-user-avatar-wrapper"
        onClick={() => navigate(`/profile/${id}`)}
      >
        <img
          className="follow-user-avatar"
          src={profile_image}
          alt="profile_picture"
        />
      </div>


      {/* =========================
          CONTENT
      ========================= */}

      <div className="follow-user-content">

        <div className="follow-user-header">

          {/* USER INFO */}

          <div className="follow-user-info">

            <span
              className="follow-user-name"
              onClick={() =>
                navigate(`/profile/${id}`)
              }
            >
              {name}
            </span>

            <span className="follow-user-username">
              @{username}
            </span>

          </div>


          {/* =========================
              FOLLOW BUTTON
          ========================= */}

          {actual_user_id !== id && (

            <button
              className={`follow-user-button ${
                is_following
                  ? "follow-user-button-unfollow"
                  : "follow-user-button-follow"
              }`}
              onClick={(e) => {

                e.stopPropagation();

                if (is_following) {
                  unfollow(id);
                } else {
                  follow(id);
                }

              }}
            >
              {is_following
                ? "Following"
                : "Follow"}
            </button>

          )}

        </div>


        {/* =========================
            BIO
        ========================= */}

        {bio && (
          <p className="follow-user-bio">
            {bio}
          </p>
        )}

      </div>

    </div>
  );
};