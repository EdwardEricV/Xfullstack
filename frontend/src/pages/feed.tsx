import { useState, useEffect } from "react";
import { useAuthStore } from "../store/AuthStore";
import { useNavigate } from "react-router-dom";
import { CommentInPost } from "../components/comment";
import { useSelectedPostStore } from "../store/SelectedPostStore";
import { useSearchParams } from "react-router-dom";

import { api } from "../services/api";
import HomeIcon from "../assets/home.svg?react";
import MeIcon from "../assets/me.svg?react";
import SettingsIcon from "../assets/settings.svg?react";
import XIcon from "../assets/x_logo.svg?react";
import CommentIcon from "../assets/comment-alt.svg?react";
import LikeIcon from "../assets/heart.svg?react";
import RetweetIcon from "../assets/retweet.svg?react";

import type { PostProps } from "../types/postType";
import "./feed.css";

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

export function Feed() {
  //consts
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const SelectedPost = useSelectedPostStore((state) => state.selectedPost);
  const setSelectedPost = useSelectedPostStore(
    (state) => state.setSelectedPost,
  );
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const feedType = searchParams.get("feed");
  const isFollowingFeed = feedType === "following";

  //states
  const [actualUser, setActualUser] = useState<ActualUser | null>(null);
  const [postMessage, setPostMessage] = useState("");
  const [Posts, setPosts] = useState<PostProps[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [openedPostMenu, setOpenedPostMenu] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchField, setSearchField] = useState("");

  //functions
  const validPost = postMessage.length >= 1 && postMessage.length <= 500;

  const clearPostImage = () => {
    setImage(null);
    setPreview(null);
  };

  const openClosePostMenu = (id: number) => {
    if (openedPostMenu !== null && openedPostMenu === id) {
      setOpenedPostMenu(null);
    } else if (openedPostMenu !== null || openedPostMenu !== id) {
      setOpenedPostMenu(id);
    }
  };

  const deletePost = async (id: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    try {
      await api.delete(`/posts/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (err) {
      console.log(err);
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

  // UseEffects
  useEffect(() => {
    const handleInit = async () => {
      try {
        let token = accessToken;

        if (!token) {
          console.log("Sem token — modo de teste");
          return;
        }

        const response = await api.get("/feed/", {
          params: {
            feed: isFollowingFeed ? "following" : "for_you",
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPosts(response.data);

        const actual_user_response = await api.get("/users/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setActualUser(actual_user_response.data);
      } catch (err) {
        console.log(err);
      }
    };

    handleInit();
  }, [accessToken, navigate, setAccessToken, isFollowingFeed]);

  useEffect(() => {
    if (SelectedPost === null) {
      document.body.style.overflow = "auto";
    }
  }, [SelectedPost]);

  //functions
  const handlePost = async () => {
    const formData = new FormData();
    if (image) {
      formData.append("post_body", postMessage);
      formData.append("files", image);
    } else {
      formData.append("post_body", postMessage);
    }
    try {
      await api.post("/posts/", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const response = await api.get("/posts/", {
        params: { feed: isFollowingFeed ? "following" : "for_you" },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setPosts(response.data.results);
      setImage(null);
      setPreview(null);
      setPostMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  const retweet = async (id: number, isRetweetPost: boolean) => {
    if (!actualUser) return;

    let previousPosts: PostProps[] = [];

    setPosts((prevPosts) => {
      previousPosts = prevPosts;

      return prevPosts
        .map((post) => {
          if (isRetweetPost) {
            if (post.retweet_post?.id !== id) return post;

            const alreadyRetweeted = post.retweet_post.retweets.includes(
              actualUser.id,
            );

            return {
              ...post,
              retweet_post: {
                ...post.retweet_post,
                retweets: alreadyRetweeted
                  ? post.retweet_post.retweets.filter(
                    (uid) => uid !== actualUser.id,
                  )
                  : [...post.retweet_post.retweets, actualUser.id],
              },
            };
          } else {
            if (post.id !== id) return post;

            const alreadyRetweeted = post.retweets.includes(actualUser.id);

            return {
              ...post,
              retweets: alreadyRetweeted
                ? post.retweets.filter((uid) => uid !== actualUser.id)
                : [...post.retweets, actualUser.id],
            };
          }
        })
        .filter((post): post is PostProps => post !== null);
    });

    try {
      await api.post(
        `/posts/${id}/retweet/`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    } catch (err) {
      setPosts(previousPosts);
      console.log(err);
    }
  };

  const like = async (id: number, isRetweetPost: boolean) => {
    if (!actualUser) return;

    let previousPosts: PostProps[] = [];

    setPosts((prevPosts) => {
      previousPosts = prevPosts;

      return prevPosts.map((post) => {
        if (isRetweetPost) {
          if (post.retweet_post?.id !== id) return post;

          const alreadyLiked = post.retweet_post.likes.includes(actualUser.id);

          return {
            ...post,
            retweet_post: {
              ...post.retweet_post,
              likes: alreadyLiked
                ? post.retweet_post.likes.filter((uid) => uid !== actualUser.id)
                : [...post.retweet_post.likes, actualUser.id],
            },
          };
        } else {
          if (post.id !== id) return post;

          const alreadyLiked = post.likes.includes(actualUser.id);

          return {
            ...post,
            likes: alreadyLiked
              ? post.likes.filter((uid) => uid !== actualUser.id)
              : [...post.likes, actualUser.id],
          };
        }
      });
    });

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
    } catch (err) {
      setPosts(previousPosts);
      console.log(err);
    }
  };

  // Body
  return (
    <div className="feed-page">
      <div className="feed-container">

        {/* =========================
          LEFT SIDEBAR
      ========================= */}

        <aside className="feed-sidebar">

          <div className="feed-logo">
            <XIcon />
          </div>

          <nav className="feed-nav">

            <button
              className="feed-nav-button"
              onClick={() => navigate("/home")}
            >
              <HomeIcon />
              <span>Home</span>
            </button>

            <button
              className="feed-nav-button"
              onClick={() => navigate(`/profile/${actualUser?.id}`)}
            >
              <MeIcon />
              <span>Me</span>
            </button>

            <button
              className="feed-nav-button"
              onClick={() => navigate("/settings")}
            >
              <SettingsIcon />
              <span>Settings</span>
            </button>

          </nav>

        </aside>


        {/* =========================
          CENTER
      ========================= */}

        <main className="feed-main">

          {/* HEADER */}

          {isFollowingFeed ? (

            <div className="feed-header">

              <div
                className="feed-tab"
                onClick={() => navigate("/home")}
              >
                For you
              </div>

              <div className="feed-tab feed-tab-active">
                Following
              </div>

            </div>

          ) : (

            <div className="feed-header">

              <div className="feed-tab feed-tab-active">
                For you
              </div>

              <div
                className="feed-tab"
                onClick={() => navigate("/home?feed=following")}
              >
                Following
              </div>

            </div>

          )}


          {/* =========================
            COMPOSER
        ========================= */}

          <div className="feed-composer">

            <div className="feed-composer-row">

              <img
                src={actualUser?.profile_image}
                alt="profile_picture"
                className="feed-avatar"
              />

              <textarea
                placeholder="What's happening?"
                className="feed-textarea"
                value={postMessage}
                onChange={(e) => {
                  setPostMessage(e.target.value);

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
              />

            </div>


            {/* PREVIEW */}

            {preview && (
              <div className="feed-preview-wrapper">

                <button
                  className="feed-preview-remove"
                  onClick={clearPostImage}
                >
                  ×
                </button>

                <img
                  src={preview}
                  alt="preview"
                  className="feed-preview"
                />

              </div>
            )}


            {/* POST BUTTON */}

            <div className="feed-composer-footer">

              <button
                disabled={!validPost}
                className="feed-submit"
                onClick={handlePost}
              >
                Post
              </button>

            </div>

          </div>


          {/* =========================
            POSTS
        ========================= */}

          {Posts.map((post) => {

            /* =====================
               NORMAL POST
            ===================== */

            if (
              post.parent_post === null &&
              post.retweet_post === null
            ) {

              const isLiked = actualUser
                ? post.likes.includes(actualUser.id)
                : false;

              const isRetweeted = actualUser
                ? post.retweets.includes(actualUser.id)
                : false;

              return (
                <article
                  className="feed-post"
                  key={post.id}
                  onClick={() =>
                    navigate(`/post/${post.id}`)
                  }
                >

                  {/* DELETE BUTTON */}

                  {actualUser?.id === post.author.id && (
                    <button
                      className="feed-post-menu-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openClosePostMenu(post.id);
                      }}
                    >
                      •••
                    </button>
                  )}


                  {/* DELETE MENU */}

                  {openedPostMenu === post.id && (
                    <div className="feed-post-menu">

                      <button
                        className="feed-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePost(post.id);
                        }}
                      >
                        Delete post
                      </button>

                    </div>
                  )}


                  {/* AVATAR */}

                  <img
                    className="feed-avatar"
                    src={post.author.profile_image}
                    alt="profile_picture"
                    onClick={(e) => {
                      e.stopPropagation();

                      navigate(
                        `/profile/${post.author.id}`
                      );
                    }}
                  />


                  {/* CONTENT */}

                  <div className="feed-post-content">

                    <div className="feed-post-header">

                      <h2
                        className="feed-post-name"
                        onClick={(e) => {
                          e.stopPropagation();

                          navigate(
                            `/profile/${post.author.id}`
                          );
                        }}
                      >
                        {post.author.name}
                      </h2>

                      <span className="feed-post-username">
                        @{post.author.username}
                      </span>

                      <span className="feed-post-time">
                        · {CalcTemp(post.created_at)}
                      </span>

                    </div>


                    <p className="feed-post-body">
                      {post.post_body}
                    </p>


                    {/* IMAGES */}

                    {post.medias &&
                      post.medias.map((media) => (
                        <img
                          className="feed-post-image"
                          src={media.file}
                          alt=""
                          key={media.id}
                        />
                      ))}


                    {/* ACTIONS */}

                    <div className="feed-post-actions">

                      {/* COMMENTS */}

                      <button
                        className="feed-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(post);
                        }}
                      >
                        <CommentIcon />

                        <span>
                          {post.comments?.length ?? 0}
                        </span>
                      </button>


                      {/* RETWEET */}

                      <button
                        className="feed-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          retweet(post.id, false);
                        }}
                      >
                        <RetweetIcon
                          className={
                            isRetweeted
                              ? "feed-icon-retweeted"
                              : ""
                          }
                        />

                        <span
                          className={
                            isRetweeted
                              ? "feed-count-retweeted"
                              : ""
                          }
                        >
                          {post.retweets.length}
                        </span>

                      </button>


                      {/* LIKE */}

                      <button
                        className="feed-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          like(post.id, false);
                        }}
                      >
                        <LikeIcon
                          className={
                            isLiked
                              ? "feed-icon-liked"
                              : ""
                          }
                        />

                        <span
                          className={
                            isLiked
                              ? "feed-count-liked"
                              : ""
                          }
                        >
                          {post.likes.length}
                        </span>

                      </button>

                    </div>

                  </div>

                </article>
              );
            }


            /* =====================
               RETWEET
            ===================== */

            if (
              post.retweet_post !== null &&
              post.retweet_post !== undefined &&
              post.parent_post === null
            ) {

              const isLiked = actualUser
                ? post.retweet_post.likes.includes(
                  actualUser.id
                )
                : false;

              const isRetweeted = actualUser
                ? post.retweet_post.retweets.includes(
                  actualUser.id
                )
                : false;

              return (
                <article
                  className="feed-post"
                  key={post.id}
                  onClick={() =>
                    navigate(
                      `/post/${post.retweet_post?.id}`
                    )
                  }
                >

                  {actualUser?.id === post.author.id && (
                    <button
                      className="feed-post-menu-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openClosePostMenu(post.id);
                      }}
                    >
                      •••
                    </button>
                  )}


                  {openedPostMenu === post.id && (
                    <div className="feed-post-menu">

                      <button
                        className="feed-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePost(post.id);
                        }}
                      >
                        Delete post
                      </button>

                    </div>
                  )}


                  <div className="feed-retweet-wrapper">

                    <div className="feed-retweet-label">

                      <RetweetIcon />

                      <span>
                        Retweeted by @{post.author.username}
                      </span>

                    </div>


                    <div className="feed-retweet-post">

                      <img
                        className="feed-avatar"
                        src={
                          post.retweet_post?.author
                            .profile_image
                        }
                        alt="profile_picture"
                      />


                      <div className="feed-post-content">

                        <div className="feed-post-header">

                          <h2 className="feed-post-name">
                            {post.retweet_post?.author.name}
                          </h2>

                          <span className="feed-post-username">
                            @
                            {
                              post.retweet_post?.author
                                .username
                            }
                          </span>

                          <span className="feed-post-time">
                            ·{" "}
                            {CalcTemp(
                              post.retweet_post?.created_at
                            )}
                          </span>

                        </div>


                        <p className="feed-post-body">
                          {post.retweet_post?.post_body}
                        </p>


                        {post.retweet_post?.medias &&
                          post.retweet_post.medias.map(
                            (media) => (
                              <img
                                className="feed-post-image"
                                src={media.file}
                                alt=""
                                key={media.id}
                              />
                            )
                          )}


                        <div className="feed-post-actions">

                          <button
                            className="feed-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPost(post);
                            }}
                          >
                            <CommentIcon />

                            <span>
                              {
                                post.retweet_post
                                  ?.comments?.length ?? 0
                              }
                            </span>
                          </button>


                          <button
                            className="feed-action"
                            onClick={(e) => {
                              e.stopPropagation();

                              retweet(
                                post.retweet_post?.id ??
                                post.id,
                                true
                              );
                            }}
                          >
                            <RetweetIcon
                              className={
                                isRetweeted
                                  ? "feed-icon-retweeted"
                                  : ""
                              }
                            />

                            <span
                              className={
                                isRetweeted
                                  ? "feed-count-retweeted"
                                  : ""
                              }
                            >
                              {
                                post.retweet_post
                                  ?.retweets.length ?? 0
                              }
                            </span>
                          </button>


                          <button
                            className="feed-action"
                            onClick={(e) => {
                              e.stopPropagation();

                              like(
                                post.retweet_post?.id ??
                                post.id,
                                true
                              );
                            }}
                          >
                            <LikeIcon
                              className={
                                isLiked
                                  ? "feed-icon-liked"
                                  : ""
                              }
                            />

                            <span
                              className={
                                isLiked
                                  ? "feed-count-liked"
                                  : ""
                              }
                            >
                              {
                                post.retweet_post?.likes
                                  .length ??
                                post.likes.length
                              }
                            </span>

                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                </article>
              );
            }

            return null;
          })}

        </main>


        {/* =========================
          COMMENTS
      ========================= */}

        {actualUser &&
          accessToken &&
          SelectedPost && (
            <CommentInPost
              post={SelectedPost}
              user={actualUser.id}
              token={accessToken}
            />
          )}


        {/* =========================
          RIGHT SIDEBAR
      ========================= */}

        <aside className="feed-right">

          <div className="feed-search">

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
              className="feed-search-input"
            />


            {searching && (
              <div className="feed-search-menu">

                <div
                  className="feed-search-option"
                  onClick={() =>
                    navigate(
                      `/users/search/?q=${searchField}`
                    )
                  }
                >
                  Search "{searchField}" in Users
                </div>

                <div
                  className="feed-search-option"
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


          <div className="feed-trending">

            <h2>What's happening</h2>

          </div>

        </aside>

      </div>
    </div>
  );
}
