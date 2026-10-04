import { api } from "../services/api";

import CommentIcon from "../assets/comment-alt.svg?react";
import LikeIcon from "../assets/heart.svg?react";
import RetweetIcon from "../assets/retweet.svg?react";

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";

import { useSelectedPostStore } from "../store/SelectedPostStore";

import type { PostProps } from "../types/postType";
import "./comment_card.css";

type commentProps = {
  post: PostProps;
  onDelete: (id: number) => void;
};

type ActualUser = {
  id: number;
  name: string;
  email: string;
  username: string;
  profile_image: string;
  profile_banner: string;
  bio: string;
  followers_count: number;
  following_count: number;
  birthday: string;
};

export const CommentCard = ({ post, onDelete }: commentProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const SelectedPost = useSelectedPostStore((state) => state.selectedPost);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const navigate = useNavigate();
  const setSelectedPost = useSelectedPostStore(
    (state) => state.setSelectedPost,
  );

  const [actualUser, setActualUser] = useState<ActualUser | null>(null);

  const [likeNumber, setLikeNumber] = useState(post.likes.length);
  const [retweetNumber, setRetweetNumber] = useState(post.retweets.length);
  const [openedPostMenu, setOpenedPostMenu] = useState<number | null>(null);

  const [isLiked, setIsLiked] = useState(
    post.likes.includes(actualUser?.id ?? -1),
  );
  const [isRetweeted, setIsRetweeted] = useState(
    post.retweets.includes(actualUser?.id ?? -1),
  );

  const like = async (id: number) => {
    if (!actualUser) return;
    try {
      await api.post(
        `/posts/${id}/like_unlike_post/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setIsLiked(!isLiked);
      likeNumberCounter();
    } catch (err) {
      console.log(err);
    }
  };

  const retweet = async (id: number) => {
    if (!actualUser) return;

    try {
      await api.post(
        `/posts/${id}/retweet/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setIsRetweeted(!isRetweeted);
      retweetNumberCounter();
    } catch (err) {
      console.log(err);
    }
  };

  const openClosePostMenu = (id: number) => {
    if (openedPostMenu !== null && openedPostMenu === id) {
      setOpenedPostMenu(null);
    } else if (openedPostMenu !== null || openedPostMenu !== id) {
      setOpenedPostMenu(id);
    }
  };

  const deletePost = async (id: number) => {
    try {
      await api.delete(`/posts/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      onDelete(id);
    } catch (err) {
      console.log(err);
    }
  };

  const likeNumberCounter = () => {
    if (isLiked) {
      return setLikeNumber((prev: number) => prev - 1);
    } else {
      return setLikeNumber((prev: number) => prev + 1);
    }
  };

  const retweetNumberCounter = () => {
    if (isRetweeted) {
      return setRetweetNumber((prev: number) => prev - 1);
    } else {
      return setRetweetNumber((prev: number) => prev + 1);
    }
  };

  const CalcTemp = (created_at: string) => {
    const now = new Date();
    const postDate = new Date(created_at);
    const time = now.getTime() - postDate.getTime();
    if (time / 1000 < 1) {
      return "1s";
    } else if (time / 1000 < 60) {
      return `${Math.floor(time / 1000)}s`; //seconds
    } else if (time / 60000 < 60) {
      return `${Math.floor(time / 60000)}m`; //minutes
    } else if (time / 3600000 < 24) {
      return `${Math.floor(time / 3600000)}h`; //hours
    } else {
      return `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`; //day
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
        const actual_user_response = await api.get("/users/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActualUser(actual_user_response.data);
      } catch (err) {
        console.log(err);
        navigate("/signin");
      }
    };
    handleInit();
  }, [accessToken, navigate, setAccessToken]);

  useEffect(() => {
    if (SelectedPost === null) {
      document.body.style.overflow = "auto";
    }
  }, [SelectedPost]);

  console.log(post);

  return (
  <div
    className="comment-card"
    key={post.id}
    onClick={() => navigate(`/post/${post.id}`)}
  >
    {actualUser?.id === post.author.id && (
      <button
        className="comment-card-menu-button"
        onClick={(e) => {
          e.stopPropagation();
          openClosePostMenu(post.id);
        }}
      >
        •••
      </button>
    )}

    {openedPostMenu === post.id && (
      <div className="comment-card-menu">
        <button
          className="comment-card-delete-button"
          onClick={(e) => {
            e.stopPropagation();
            deletePost(post.id);
          }}
        >
          Delete post
        </button>
      </div>
    )}

    <img
      className="comment-card-avatar"
      src={post.author.profile_image}
      alt="profile_picture"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/profile/${post.author.id}`);
      }}
    />

    <div className="comment-card-content">
      <div className="comment-card-author-line">
        <h2
          className="comment-card-author-name"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${post.author.id}`);
          }}
        >
          {post.author.name}
        </h2>

        <h2 className="comment-card-username">
          @{post.author.username}
        </h2>

        <h4 className="comment-card-time">
          · {CalcTemp(post.created_at)}
        </h4>
      </div>

      <h2 className="comment-card-body">
        {post.post_body}
      </h2>

      {post.medias &&
        post.medias.map((media) => (
          <img
            className="comment-card-media"
            src={media.file}
            alt=""
            key={media.id}
          />
        ))}

      <div className="comment-card-actions">
        {/* Comentários */}
        <div
          className="comment-card-action comment-card-comment-action"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPost(post);
          }}
        >
          <CommentIcon className="comment-card-icon comment-card-comment-icon" />

          <h2 className="comment-card-action-number">
            {post.comments_count}
          </h2>
        </div>

        {/* Retweet */}
        <div
          className="comment-card-action"
          onClick={(e) => {
            e.stopPropagation();
            retweet(post.id);
          }}
        >
          <RetweetIcon
            className={`comment-card-icon ${
              isRetweeted
                ? "comment-card-retweeted"
                : "comment-card-retweet-default"
            }`}
          />

          <h2
            className={`comment-card-action-number ${
              isRetweeted
                ? "comment-card-retweeted-text"
                : ""
            }`}
          >
            {retweetNumber}
          </h2>
        </div>

        {/* Like */}
        <div
          className="comment-card-action"
          onClick={(e) => {
            e.stopPropagation();
            like(post.id);
          }}
        >
          <LikeIcon
            className={`comment-card-icon ${
              isLiked
                ? "comment-card-liked"
                : "comment-card-like-default"
            }`}
          />

          <h2
            className={`comment-card-action-number ${
              isLiked
                ? "comment-card-liked-text"
                : ""
            }`}
          >
            {likeNumber}
          </h2>
        </div>
      </div>
    </div>
  </div>
);
};
