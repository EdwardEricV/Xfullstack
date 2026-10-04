import { api } from "../services/api";
import BackIcon from "../assets/arrow.svg?react";
import HomeIcon from "../assets/home.svg?react";
import MeIcon from "../assets/me.svg?react";
import SettingsIcon from "../assets/settings.svg?react";
import XIcon from "../assets/x_logo.svg?react";
import CommentIcon from "../assets/comment-alt.svg?react";
import LikeIcon from "../assets/heart.svg?react";
import RetweetIcon from "../assets/retweet.svg?react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useEffect, useState } from "react";
import { CommentInPost } from "../components/comment";
import type { PostProps } from "../types/postType";
import { useSelectedPostStore } from "../store/SelectedPostStore";
import "./search_post_page.css";

export const SearchPostPage = () => {
  const [searchParams] = useSearchParams();
  
  const q = searchParams.get("q");
  const actualUser = useAuthStore((state) => state.user?.id);

  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const accessToken = useAuthStore((state) => state.accessToken);
  const SelectedPost = useSelectedPostStore((state) => state.selectedPost);
  const setSelectedPost = useSelectedPostStore(
    (state) => state.setSelectedPost,
  );

  const [Posts, setPosts] = useState<PostProps[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchField, setSearchField] = useState("");
  const [openedPostMenu, setOpenedPostMenu] = useState<number | null>(null);

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
                actualUser,
              );
  
              return {
                ...post,
                retweet_post: {
                  ...post.retweet_post,
                  retweets: alreadyRetweeted
                    ? post.retweet_post.retweets.filter(
                        (uid) => uid !== actualUser,
                      )
                    : [...post.retweet_post.retweets, actualUser],
                },
              };
            } else {
              if (post.id !== id) return post;
  
              const alreadyRetweeted = post.retweets.includes(actualUser);
  
              return {
                ...post,
                retweets: alreadyRetweeted
                  ? post.retweets.filter((uid) => uid !== actualUser)
                  : [...post.retweets, actualUser],
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
  
            const alreadyLiked = post.retweet_post.likes.includes(actualUser);
  
            return {
              ...post,
              retweet_post: {
                ...post.retweet_post,
                likes: alreadyLiked
                  ? post.retweet_post.likes.filter((uid) => uid !== actualUser)
                  : [...post.retweet_post.likes, actualUser],
              },
            };
          } else {
            if (post.id !== id) return post;
  
            const alreadyLiked = post.likes.includes(actualUser);
  
            return {
              ...post,
              likes: alreadyLiked
                ? post.likes.filter((uid) => uid !== actualUser)
                : [...post.likes, actualUser],
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
        const response = await api.get(`/posts/search_posts/?q=${q}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data)
        setPosts(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    handleInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  return (
  <div
    className="search-post-page"
    onClick={() => setSearching(false)}
  >
    <div className="search-post-container">

      {/* =========================
          LEFT SIDEBAR
      ========================= */}

      <aside className="search-post-left-sidebar">

        <div className="search-post-navigation">

          <XIcon className="search-post-logo" />

          <button
            className="search-post-nav-button"
            onClick={() => navigate("/home")}
          >
            <HomeIcon className="search-post-nav-icon" />
            <h2>Home</h2>
          </button>

          <button
            className="search-post-nav-button"
            onClick={() => navigate(`/profile/${actualUser}`)}
          >
            <MeIcon className="search-post-nav-icon" />
            <h2>Me</h2>
          </button>

          <button
            className="search-post-nav-button"
            onClick={() => navigate("/settings")}
          >
            <SettingsIcon className="search-post-nav-icon" />
            <h2>Settings</h2>
          </button>

        </div>

      </aside>


      {/* =========================
          MAIN
      ========================= */}

      <main className="search-post-main">

        {/* HEADER */}

        <div className="search-post-header">

          <button
            className="search-post-back-button"
            onClick={() => navigate("/home")}
          >
            <BackIcon className="search-post-back-icon" />

            <h2>
              Results for "{q}"
            </h2>
          </button>

        </div>


        {/* =========================
            POSTS
        ========================= */}

        <div className="search-post-results">

          {Posts?.map((post) => {

            /* =========================
               POST NORMAL
            ========================= */

            if (
              post.parent_post === null &&
              post.retweet_post === null
            ) {

              const isLiked = actualUser
                ? post.likes.includes(actualUser)
                : false;

              const isRetweeted = actualUser
                ? post.retweets.includes(actualUser)
                : false;

              return (
                <article
                  className="search-post-card"
                  key={post.id}
                  onClick={() =>
                    navigate(`/post/${post.id}`)
                  }
                >

                  {/* MENU */}

                  {actualUser === post.author.id && (
                    <button
                      className="search-post-menu-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openClosePostMenu(post.id);
                      }}
                    >
                      •••
                    </button>
                  )}

                  {openedPostMenu === post.id && (
                    <div className="search-post-menu">

                      <button
                        className="search-post-delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePost(post.id);
                        }}
                      >
                        Delete post
                      </button>

                    </div>
                  )}


                  {/* AUTHOR AVATAR */}

                  <img
                    className="search-post-avatar"
                    src={post.author.profile_image}
                    alt="profile_picture"
                    onClick={(e) => {
                      e.stopPropagation();

                      navigate(
                        `/profile/${post.author.id}`
                      );
                    }}
                  />


                  <div className="search-post-content">

                    {/* AUTHOR */}

                    <div className="search-post-author-line">

                      <h2
                        className="search-post-author-name"
                        onClick={(e) => {
                          e.stopPropagation();

                          navigate(
                            `/profile/${post.author.id}`
                          );
                        }}
                      >
                        {post.author.name}
                      </h2>

                      <h2 className="search-post-username">
                        @{post.author.username}
                      </h2>

                      <h4 className="search-post-time">
                        · {CalcTemp(post.created_at)}
                      </h4>

                    </div>


                    {/* BODY */}

                    <h2 className="search-post-body">
                      {post.post_body}
                    </h2>


                    {/* MEDIA */}

                    {post.medias &&
                      post.medias.map((media) => (
                        <img
                          className="search-post-media"
                          src={media.file}
                          alt=""
                          key={media.id}
                        />
                      ))}


                    {/* ACTIONS */}

                    <div className="search-post-actions">

                      {/* COMMENT */}

                      <div
                        className="search-post-action search-post-comment-action"
                        onClick={(e) => {
                          e.stopPropagation();

                          setSelectedPost(post);
                        }}
                      >
                        <CommentIcon className="search-post-action-icon search-post-comment-icon" />

                        <h2 className="search-post-action-number">
                          {post.comments?.length}
                        </h2>
                      </div>


                      {/* RETWEET */}

                      <div
                        className="search-post-action"
                        onClick={(e) => {
                          e.stopPropagation();

                          retweet(post.id, false);
                        }}
                      >
                        <RetweetIcon
                          className={`search-post-action-icon ${
                            isRetweeted
                              ? "search-post-retweeted"
                              : "search-post-retweet-default"
                          }`}
                        />

                        <h2
                          className={`search-post-action-number ${
                            isRetweeted
                              ? "search-post-retweeted-text"
                              : ""
                          }`}
                        >
                          {post.retweets.length}
                        </h2>
                      </div>


                      {/* LIKE */}

                      <div
                        className="search-post-action"
                        onClick={(e) => {
                          e.stopPropagation();

                          like(post.id, false);
                        }}
                      >
                        <LikeIcon
                          className={`search-post-action-icon ${
                            isLiked
                              ? "search-post-liked"
                              : "search-post-like-default"
                          }`}
                        />

                        <h2
                          className={`search-post-action-number ${
                            isLiked
                              ? "search-post-liked-text"
                              : ""
                          }`}
                        >
                          {post.likes.length}
                        </h2>
                      </div>

                    </div>

                  </div>

                </article>
              );
            }


            /* =========================
               RETWEET
            ========================= */

            if (
              post.retweet_post !== null &&
              post.retweet_post !== undefined &&
              post.parent_post === null
            ) {

              const isLiked = actualUser
                ? post.retweet_post?.likes.includes(actualUser)
                : false;

              const isRetweeted = actualUser
                ? post.retweet_post?.retweets.includes(actualUser)
                : false;

              return (
                <article
                  className="search-post-card search-post-retweet-card"
                  key={post.id}
                  onClick={() =>
                    navigate(
                      `/post/${post.retweet_post?.id}`
                    )
                  }
                >

                  {/* MENU */}

                  {actualUser === post.author.id && (
                    <button
                      className="search-post-menu-button"
                      onClick={(e) => {
                        e.stopPropagation();

                        openClosePostMenu(post.id);
                      }}
                    >
                      •••
                    </button>
                  )}


                  {openedPostMenu === post.id && (
                    <div className="search-post-menu">

                      <button
                        className="search-post-delete-button"
                        onClick={(e) => {
                          e.stopPropagation();

                          deletePost(post.id);
                        }}
                      >
                        Delete post
                      </button>

                    </div>
                  )}


                  <div className="search-post-retweet-content">

                    {/* RETWEET LABEL */}

                    <div className="search-post-retweet-label">

                      <RetweetIcon className="search-post-retweet-label-icon" />

                      <h1>
                        Retweeted by @{post.author.username}
                      </h1>

                    </div>


                    {/* ORIGINAL POST */}

                    <div className="search-post-original-retweet">

                      <img
                        className="search-post-avatar"
                        src={
                          post.retweet_post?.author.profile_image
                        }
                        alt="profile_picture"
                      />


                      <div className="search-post-content">

                        {/* AUTHOR */}

                        <div className="search-post-author-line">

                          <h2 className="search-post-author-name">
                            {post.retweet_post?.author.name}
                          </h2>

                          <h2 className="search-post-username">
                            @{post.retweet_post?.author.username}
                          </h2>

                          <h4 className="search-post-time">
                            ·{" "}
                            {CalcTemp(
                              post.retweet_post?.created_at
                            )}
                          </h4>

                        </div>


                        {/* BODY */}

                        <h2 className="search-post-body">
                          {post.retweet_post?.post_body}
                        </h2>


                        {/* MEDIA */}

                        {post.retweet_post?.medias &&
                          post.retweet_post.medias.map(
                            (media) => (
                              <img
                                className="search-post-media"
                                src={media.file}
                                alt=""
                                key={media.id}
                              />
                            )
                          )}


                        {/* ACTIONS */}

                        <div className="search-post-actions">

                          {/* COMMENT */}

                          <div
                            className="search-post-action search-post-comment-action"
                            onClick={(e) => {
                              e.stopPropagation();

                              setSelectedPost(post);
                            }}
                          >
                            <CommentIcon className="search-post-action-icon search-post-comment-icon" />

                            <h2 className="search-post-action-number">
                              {post.retweet_post?.comments?.length ?? 0}
                            </h2>
                          </div>


                          {/* RETWEET */}

                          <div
                            className="search-post-action"
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
                              className={`search-post-action-icon ${
                                isRetweeted
                                  ? "search-post-retweeted"
                                  : "search-post-retweet-default"
                              }`}
                            />

                            <h2
                              className={`search-post-action-number ${
                                isRetweeted
                                  ? "search-post-retweeted-text"
                                  : ""
                              }`}
                            >
                              {
                                post.retweet_post?.retweets
                                  .length
                              }
                            </h2>

                          </div>


                          {/* LIKE */}

                          <div
                            className="search-post-action"
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
                              className={`search-post-action-icon ${
                                isLiked
                                  ? "search-post-liked"
                                  : "search-post-like-default"
                              }`}
                            />

                            <h2
                              className={`search-post-action-number ${
                                isLiked
                                  ? "search-post-liked-text"
                                  : ""
                              }`}
                            >
                              {
                                post.retweet_post?.likes
                                  .length ??
                                post.likes.length
                              }
                            </h2>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                </article>
              );
            }

            return null;
          })}

        </div>

      </main>


      {/* =========================
          COMMENT MODAL
      ========================= */}

      {actualUser && accessToken && SelectedPost ? (
        <CommentInPost
          post={SelectedPost}
          user={actualUser}
          token={accessToken}
        />
      ) : null}


      {/* =========================
          RIGHT SIDEBAR
      ========================= */}

      <aside className="search-post-right-sidebar">

        <div className="search-post-right-content">

          <div className="search-post-search-wrapper">

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
              className="search-post-search-input"
            />

            {searching && (
              <div className="search-post-search-results">

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


          <div className="search-post-trending">
            <h2>What's happening</h2>
          </div>

        </div>

      </aside>

    </div>
  </div>
);
};
