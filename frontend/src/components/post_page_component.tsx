import { api } from "../services/api";

import HomeIcon from "../assets/home.svg?react";
import MeIcon from "../assets/me.svg?react";
import SettingsIcon from "../assets/settings.svg?react";
import XIcon from "../assets/x_logo.svg?react";
import CommentIcon from "../assets/comment-alt.svg?react";
import LikeIcon from "../assets/heart.svg?react";
import RetweetIcon from "../assets/retweet.svg?react";
import ArrowIcon from "../assets/arrow.svg?react";

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import { CommentInPost } from "./comment";
import { useSelectedPostStore } from "../store/SelectedPostStore";
import { CommentCard } from "./CommentCard";
import "./post_page.css";

import type { PostProps } from "../types/postType";

type commentProps = {
  liked: boolean;
  retweeted: boolean;
  post: PostProps;
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

export const PostPageComponent = ({ liked, retweeted, post }: commentProps) => {
  const { id } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const SelectedPost = useSelectedPostStore((state) => state.selectedPost);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const navigate = useNavigate();
  const setSelectedPost = useSelectedPostStore(
    (state) => state.setSelectedPost,
  );

  const [actualUser, setActualUser] = useState<ActualUser | null>(null);
  const [isLiked, setIsLiked] = useState(liked);
  const [isRetweeted, setIsRetweeted] = useState(retweeted);

  const [postComments, setPostComments] = useState<PostProps["comments"]>(
    post.comments,
  );

  const [likeNumber, setLikeNumber] = useState(post.likes.length);
  const [retweetNumber, setRetweetNumber] = useState(post.retweets.length);

  const [postComment, setpostComment] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [searching, setSearching] = useState(false);
  const [searchField, setSearchField] = useState("");

  const validPost = postComment.length >= 1 && postComment.length <= 500;

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

  const likeNumberCounter = () => {
    if (isLiked) {
      return setLikeNumber((prev) => prev - 1);
    } else {
      return setLikeNumber((prev) => prev + 1);
    }
  };

  const retweetNumberCounter = () => {
    if (isRetweeted) {
      return setRetweetNumber((prev) => prev - 1);
    } else {
      return setRetweetNumber((prev) => prev + 1);
    }
  };

  const handleDeleteComment = (id: number) => {
    setPostComments((prev) => prev?.filter((c) => c.id !== id));
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
  }, [accessToken, navigate, setAccessToken, post]);

  const handlePostComment = () => {
    const handlePostCommentFunc = async () => {
      const formData = new FormData();
      if (image) {
        formData.append("post_body", postComment);
        formData.append("files", image);
      } else {
        formData.append("post_body", postComment);
      }
      try {
        await api.post(`/posts/${post.id}/comment/`, formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const response = await api.get(`/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setPostComments(response.data.comments);
        setpostComment("");
        setSelectedPost(null);
        navigate(`/post/${post.id}`);
      } catch (err) {
        console.log(err);
      }
    };
    handlePostCommentFunc();
  };

  useEffect(() => {
    if (SelectedPost === null) {
      document.body.style.overflow = "auto";
    }
  }, [SelectedPost]);

  return (
  <div
    className="post-page"
    onClick={() => setSearching(false)}
  >
    <div className="post-page-container">

      {/* =========================
          LEFT SIDEBAR
      ========================= */}

      <aside className="post-page-left-sidebar">
        <div className="post-page-navigation">

          <XIcon className="post-page-logo" />

          <button
            className="post-page-nav-button"
            onClick={() => navigate("/home")}
          >
            <HomeIcon className="post-page-nav-icon" />
            <span>Home</span>
          </button>

          <button
            className="post-page-nav-button"
            onClick={() =>
              navigate(`/profile/${actualUser?.id}`)
            }
          >
            <MeIcon className="post-page-nav-icon" />
            <span>Me</span>
          </button>

          <button
            className="post-page-nav-button"
            onClick={() => navigate("/settings")}
          >
            <SettingsIcon className="post-page-nav-icon" />
            <span>Settings</span>
          </button>

        </div>
      </aside>


      {/* =========================
          MAIN
      ========================= */}

      <main className="post-page-main">

        {/* VOLTAR */}

        <div className="post-page-back-container">
          <button
            className="post-page-back-button"
            onClick={() => navigate("/home")}
          >
            <ArrowIcon className="post-page-back-icon" />
            Home
          </button>
        </div>


        {/* =========================
            POST AUTHOR
        ========================= */}

        <div className="post-page-author">

          <img
            className="post-page-author-avatar"
            src={post.author.profile_image}
            alt="profile_picture"
            onClick={() =>
              navigate(`/profile/${post.author.id}`)
            }
          />

          <div className="post-page-author-info">

            <h2
              className="post-page-author-name"
              onClick={() =>
                navigate(`/profile/${post.author.id}`)
              }
            >
              {post.author.name}
            </h2>

            <h2 className="post-page-author-username">
              @{post.author.username}
            </h2>

          </div>

          <h4 className="post-page-post-time">
            · {CalcTemp(post.created_at)}
          </h4>

        </div>


        {/* =========================
            POST BODY
        ========================= */}

        <div
          className="post-page-body"
          key={post.id}
        >
          <h2>{post.post_body}</h2>
        </div>


        {/* =========================
            COMMENT MODAL
        ========================= */}

        {actualUser && accessToken && SelectedPost ? (
          <CommentInPost
            post={SelectedPost}
            user={actualUser.id}
            token={accessToken}
          />
        ) : null}


        {/* =========================
            MEDIA
        ========================= */}

        <div className="post-page-post-content">

          {post.medias &&
            post.medias.map((media) => (
              <img
                className="post-page-media"
                src={media.file}
                alt=""
                key={media.id}
              />
            ))}


          {/* =========================
              ACTIONS
          ========================= */}

          <div className="post-page-actions">

            {/* COMMENT */}

            <div
              className="post-page-action post-page-comment-action"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPost(post);
              }}
            >
              <CommentIcon className="post-page-action-icon post-page-comment-icon" />

              <h2 className="post-page-action-number">
                {post.comments?.length}
              </h2>
            </div>


            {/* RETWEET */}

            <div
              className="post-page-action"
              onClick={(e) => {
                e.stopPropagation();
                retweet(post.id);
              }}
            >
              <RetweetIcon
                className={`post-page-action-icon ${
                  isRetweeted
                    ? "post-page-retweeted"
                    : "post-page-retweet-default"
                }`}
              />

              <h2
                className={`post-page-action-number ${
                  isRetweeted
                    ? "post-page-retweeted-text"
                    : ""
                }`}
              >
                {retweetNumber}
              </h2>
            </div>


            {/* LIKE */}

            <div
              className="post-page-action"
              onClick={(e) => {
                e.stopPropagation();
                like(post.id);
              }}
            >
              <LikeIcon
                className={`post-page-action-icon ${
                  isLiked
                    ? "post-page-liked"
                    : "post-page-like-default"
                }`}
              />

              <h2
                className={`post-page-action-number ${
                  isLiked
                    ? "post-page-liked-text"
                    : ""
                }`}
              >
                {likeNumber}
              </h2>
            </div>

          </div>


          {/* =========================
              REPLY
          ========================= */}

          <div className="post-page-reply-container">

            <div className="post-page-reply-content">

              <div className="post-page-reply-row">

                <img
                  src={actualUser?.profile_image}
                  alt="profile_picture"
                  className="post-page-reply-avatar"
                />

                <textarea
                  placeholder="Post your reply"
                  className="post-page-reply-textarea"
                  onChange={(e) => {
                    setpostComment(e.target.value);

                    e.target.style.height = "auto";
                    e.target.style.height =
                      e.target.scrollHeight + "px";
                  }}
                  onPaste={(e) => {
                    const items = e.clipboardData.items;

                    for (let i = 0; i < items.length; i++) {
                      const item = items[i];

                      if (item.type.startsWith("image")) {
                        const file = item.getAsFile();

                        if (file) {
                          setImage(file);

                          const url =
                            URL.createObjectURL(file);

                          setPreview(url);
                        }
                      }
                    }
                  }}
                  value={postComment}
                />

              </div>


              {preview && (
                <div className="post-page-preview-container">

                  <img
                    src={preview}
                    alt="preview"
                    className="post-page-preview-image"
                  />

                  <div className="post-page-preview-divider" />

                </div>
              )}

            </div>


            <div className="post-page-reply-footer">

              <button
                className={`post-page-reply-button ${
                  validPost
                    ? "post-page-reply-enabled"
                    : "post-page-reply-disabled"
                }`}
                onClick={handlePostComment}
              >
                Reply
              </button>

            </div>

          </div>

        </div>


        {/* =========================
            COMMENTS
        ========================= */}

        <div className="post-page-comments-divider" />

        {postComments?.map((post_comment) => (
          <CommentCard
            post={post_comment}
            onDelete={handleDeleteComment}
            key={post_comment.id}
          />
        ))}

      </main>


      {/* =========================
          RIGHT SIDEBAR
      ========================= */}

      <aside className="post-page-right-sidebar">

        <div className="post-page-right-content">

          <div className="post-page-search-wrapper">

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
              className="post-page-search-input"
            />

            {searching && (
              <div className="post-page-search-results">

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


          <div className="post-page-trending">
            <h2>What's happening</h2>
          </div>

        </div>

      </aside>

    </div>
  </div>
);
};
