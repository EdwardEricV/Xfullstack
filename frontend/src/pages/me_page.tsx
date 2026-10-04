import HomeIcon from "../assets/home_blank.svg?react";
import MeIcon from "../assets/me_full.svg?react";
import SettingsIcon from "../assets/settings.svg?react";
import XIcon from "../assets/x_logo.svg?react";
import CommentIcon from "../assets/comment-alt.svg?react";
import LikeIcon from "../assets/heart.svg?react";
import RetweetIcon from "../assets/retweet.svg?react";
import ArrowIcon from "../assets/arrow.svg?react";
import DateIcon from "../assets/date.svg?react";
import BornIcon from "../assets/born.svg?react";
import { api } from "../services/api";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useEffect, useState } from "react";

import type { PostProps } from "../types/postType";
import { useSelectedPostStore } from "../store/SelectedPostStore";
import { CommentInPost } from "../components/comment";
import { EditProfile } from "../components/edit_profile";
import "./me_page.css";

type user = {
  bio: string;
  birthday: string;
  email: string;
  followers_count: number;
  following_count: number;
  id: number;
  name: string;
  profile_banner: string;
  profile_image: string;
  username: string;
  created_at: string;
  is_following: boolean;
};

export const MeProfile = () => {
  const { id } = useParams();
  const months: Record<number, string> = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  const actualUserId = useAuthStore((state) => state.user?.id);
  const SelectedPost = useSelectedPostStore((state) => state.selectedPost);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setSelectedPost = useSelectedPostStore(
    (state) => state.setSelectedPost,
  );
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const navigate = useNavigate();

  const [profileOwner, setProfileOwner] = useState<user | null>(null);
  const [actualUser, setActualUser] = useState<user | null>(null);

  const [userPosts, setUserPosts] = useState<PostProps[] | null>(null);

  const [openedPostMenu, setOpenedPostMenu] = useState<number | null>(null);

  const [editProfile, setEditProfile] = useState(false);
  const [edited, setEdited] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordValid, setNewPasswordValid] = useState("untouched");

  const [profileBanner, setProfileBanner] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [profileBannerFile, setProfileBannerFile] = useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const [following, setFollowing] = useState(false);

  const [searching, setSearching] = useState(false);
  const [searchField, setSearchField] = useState("");

  const isProfileOwner = profileOwner?.id === actualUserId;

  const handleSaveProfile = () => {
    try {
      setEdited((prev) => !prev);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);

      if (profileBannerFile) {
        formData.append("profile_banner", profileBannerFile);
      }
      if (profileImageFile) {
        formData.append("profile_image", profileImageFile);
      }
      if (newPassword === "") {
        setNewPasswordValid("untouched");
      }
      if (newPassword === "") {
        setNewPasswordValid("untouched");
      } else if (newPasswordValid === "valid") {
        formData.append("password", newPassword);
      } else {
        alert("Password Invalid! No Updated!");
        return;
      }
      api.patch(`users/${profileOwner?.id}/`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setEditProfile((prev) => !prev);
    } catch (err) {
      console.log(err);
    }
  };

  const follow = () => {
    try {
      api.post(
        `users/${profileOwner?.id}/follow/`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      setFollowing((prev) => !prev);
    } catch (err) {
      console.log(err);
    }
  };
  const unfollow = () => {
    try {
      api.post(
        `users/${profileOwner?.id}/unfollow/`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      setFollowing((prev) => !prev);
    } catch (err) {
      console.log(err);
    }
  };

  const toggleEditProfile = () => {
    setName(profileOwner?.name ?? "");
    setBio(profileOwner?.bio ?? "");
    setProfileBanner(profileOwner?.profile_banner ?? "");
    setProfileImage(profileOwner?.profile_image ?? "");
    setEditProfile((prev) => !prev);
  };

  const openClosePostMenu = (id: number) => {
    if (openedPostMenu !== null && openedPostMenu === id) {
      setOpenedPostMenu(null);
    } else if (openedPostMenu !== null || openedPostMenu !== id) {
      setOpenedPostMenu(id);
    }
  };

  const FormatDate = (date: string | undefined) => {
    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      return `Born ${months[month]} ${day}, ${year}`;
    }
    return "Erro";
  };

  const formCreatedDate = (date: string | undefined) => {
    if (date) {
      const [year, month] = date.split("-").map(Number);
      return `Joined ${months[month]} ${year}`;
    }
  };

  const deletePost = async (id: number) => {
    setUserPosts(
      (prevPosts) => prevPosts?.filter((post) => post.id !== id) ?? null,
    );
    try {
      await api.delete(`/posts/${id}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const retweet = async (id: number, isRetweetPost: boolean) => {
    if (!actualUser) return;

    let previousPosts: PostProps[] = [];

    setUserPosts((prevPosts) => {
      previousPosts = prevPosts ?? [];

      return (prevPosts ?? [])
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
      setUserPosts(previousPosts);
      console.log(err);
    }
  };

  const like = async (id: number, isRetweetPost: boolean) => {
    if (!actualUser) return;

    let previousPosts: PostProps[] = [];

    setUserPosts((prevPosts) => {
      previousPosts = prevPosts ?? [];

      return (prevPosts ?? []).map((post) => {
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
      setUserPosts(previousPosts);
      console.log(err);
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `http://127.0.0.1:8000${url}`;
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
        const response = await api.get(`/users/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowing(response.data.is_following);
        setProfileOwner(response.data);

        const response2 = await api.get(`/users/${id}/user_posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const actual_user_response = await api.get("/users/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActualUser(actual_user_response.data);

        setUserPosts(response2.data);
      } catch (err) {
        console.log(err);
      }
    };

    handleInit();
  }, [id, accessToken, setAccessToken, edited]);

  return (
  <div
    className="profile-page"
    onClick={() => setSearching(false)}
  >
    <div className="profile-container">

      {/* =========================
          LEFT SIDEBAR
      ========================= */}

      <aside className="profile-sidebar">
        <div className="profile-sidebar-inner">

          <XIcon
            className="profile-logo"
            onClick={() => navigate("/home")}
          />

          <nav className="profile-nav">

            <button
              className="profile-nav-button"
              onClick={() => navigate("/home")}
            >
              <HomeIcon />
              <span>Home</span>
            </button>

            <button className="profile-nav-button">
              <MeIcon />
              <span>Me</span>
            </button>

            <button
              className="profile-nav-button"
              onClick={() => navigate("/settings")}
            >
              <SettingsIcon />
              <span>Settings</span>
            </button>

          </nav>
        </div>
      </aside>

      {/* =========================
          CENTER
      ========================= */}

      <main className="profile-main">

        {/* TOP BAR */}

        <header className="profile-topbar">

          <ArrowIcon
            className="profile-back"
            onClick={() => navigate("/home")}
          />

          <div className="profile-top-info">
            <h1 className="profile-top-name">
              {profileOwner?.name}
            </h1>

            <p className="profile-post-count">
              {userPosts?.length ?? 0} post(s)
            </p>
          </div>

        </header>

        {/* =========================
            BANNER + AVATAR
        ========================= */}

        <div className="profile-banner-wrapper">

          {profileOwner?.profile_banner && (
            <img
              src={getImageUrl(profileOwner.profile_banner)}
              alt="profile banner"
              className="profile-banner"
            />
          )}

          {profileOwner?.profile_image && (
            <img
              src={getImageUrl(profileOwner.profile_image)}
              alt="profile image"
              className="profile-avatar"
            />
          )}

        </div>

        {/* =========================
            PROFILE INFORMATION
        ========================= */}

        <section className="profile-info">

          <div className="profile-info-top">

            <div className="profile-user-info">

              <h1 className="profile-name">
                {profileOwner?.name}
              </h1>

              <span className="profile-username">
                @{profileOwner?.username}
              </span>

              {profileOwner?.bio && (
                <p className="profile-bio">
                  {profileOwner.bio}
                </p>
              )}

            </div>

            {/* PROFILE ACTION */}

            {isProfileOwner ? (
              <button
                className="profile-action-button"
                onClick={toggleEditProfile}
              >
                Edit Profile
              </button>
            ) : (
              <button
                className={`profile-action-button ${
                  following
                    ? "profile-unfollow-button"
                    : "profile-follow-button"
                }`}
                onClick={() => {
                  if (following) {
                    unfollow();
                  } else {
                    follow();
                  }
                }}
              >
                {following ? "Following" : "Follow"}
              </button>
            )}

          </div>

          {/* EDIT PROFILE */}

          {editProfile && (
            <EditProfile
              toggleEditProfile={toggleEditProfile}
              handleSaveProfile={handleSaveProfile}
              bio={bio}
              name={name}
              profile_banner={profileBanner}
              profile_image={profileImage}
              setNewPassword={setNewPassword}
              setNewPasswordValid={setNewPasswordValid}
              setBio={setBio}
              setName={setName}
              setProfileBanner={setProfileBanner}
              setProfileImage={setProfileImage}
              setProfileBannerFile={setProfileBannerFile}
              setProfileImageFile={setProfileImageFile}
            />
          )}

          {/* PROFILE META */}

          <div className="profile-meta">

            <div
              className="profile-meta-item profile-follow-link"
              onClick={() =>
                navigate(`/profile/${id}/followers`)
              }
            >
              <span className="profile-follow-count">
                {profileOwner?.followers_count}
              </span>

              <span>Followers</span>
            </div>

            <div
              className="profile-meta-item profile-follow-link"
              onClick={() =>
                navigate(`/profile/${id}/following`)
              }
            >
              <span className="profile-follow-count">
                {profileOwner?.following_count}
              </span>

              <span>Following</span>
            </div>

            <div className="profile-meta-item">
              <BornIcon />
              <span>
                {FormatDate(profileOwner?.birthday)}
              </span>
            </div>

            <div className="profile-meta-item">
              <DateIcon />
              <span>
                {formCreatedDate(profileOwner?.created_at)}
              </span>
            </div>

          </div>

        </section>

        {/* =========================
            POSTS
        ========================= */}

        <div className="profile-posts">

          {userPosts?.map((post) => {

            /* =========================
               NORMAL POST
            ========================= */

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
                  className="profile-post"
                  key={post.id}
                  onClick={() =>
                    navigate(`/post/${post.id}`)
                  }
                >

                  {actualUser?.id === post.author.id && (
                    <>
                      <button
                        className="profile-post-menu-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openClosePostMenu(post.id);
                        }}
                      >
                        •••
                      </button>

                      {openedPostMenu === post.id && (
                        <div
                          className="profile-post-menu"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          <button
                            className="profile-delete-post"
                            onClick={() =>
                              deletePost(post.id)
                            }
                          >
                            Delete post
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  <img
                    className="profile-post-avatar"
                    src={getImageUrl(
                      post.author.profile_image ||
                        profileOwner?.profile_image ||
                        ""
                    )}
                    alt="profile picture"
                  />

                  <div className="profile-post-content">

                    <div className="profile-post-header">

                      <span className="profile-post-author">
                        {post.author.name}
                      </span>

                      <span className="profile-post-username">
                        @{post.author.username}
                      </span>

                      <span className="profile-post-time">
                        · {CalcTemp(post.created_at)}
                      </span>

                    </div>

                    <p className="profile-post-body">
                      {post.post_body}
                    </p>

                    {post.medias?.map((media) => (
                      <img
                        key={media.id}
                        className="profile-post-media"
                        src={getImageUrl(media.file || "")}
                        alt=""
                      />
                    ))}

                    {/* ACTIONS */}

                    <div className="profile-post-actions">

                      {/* COMMENT */}

                      <div
                        className="profile-post-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(post);
                        }}
                      >
                        <CommentIcon />

                        <span>
                          {post.comments?.length ?? 0}
                        </span>
                      </div>

                      {/* RETWEET */}

                      <div
                        className={`profile-post-action ${
                          isRetweeted ? "retweeted" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          retweet(post.id, false);
                        }}
                      >
                        <RetweetIcon />

                        <span>
                          {post.retweets.length}
                        </span>
                      </div>

                      {/* LIKE */}

                      <div
                        className={`profile-post-action ${
                          isLiked ? "liked" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          like(post.id, false);
                        }}
                      >
                        <LikeIcon />

                        <span>
                          {post.likes.length}
                        </span>
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
                  className="profile-post"
                  key={post.id}
                  onClick={() =>
                    navigate(
                      `/post/${post.retweet_post?.id}`
                    )
                  }
                >

                  {actualUser?.id === post.author.id && (
                    <>
                      <button
                        className="profile-post-menu-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openClosePostMenu(post.id);
                        }}
                      >
                        •••
                      </button>

                      {openedPostMenu === post.id && (
                        <div
                          className="profile-post-menu"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          <button
                            className="profile-delete-post"
                            onClick={() =>
                              deletePost(post.id)
                            }
                          >
                            Delete post
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  <div className="profile-retweet-wrapper">

                    <div className="profile-retweet-label">
                      <RetweetIcon />

                      <span>
                        Retweeted by @{post.author.username}
                      </span>
                    </div>

                    <div className="profile-retweet-post">

                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                        }}
                      >

                        <img
                          className="profile-post-avatar"
                          src={getImageUrl(
                            post.retweet_post?.author
                              ?.profile_image || ""
                          )}
                          alt="profile picture"
                        />

                        <div className="profile-post-content">

                          <div className="profile-post-header">

                            <span className="profile-post-author">
                              {post.retweet_post?.author.name}
                            </span>

                            <span className="profile-post-username">
                              @{post.retweet_post?.author.username}
                            </span>

                            <span className="profile-post-time">
                              ·{" "}
                              {CalcTemp(
                                post.retweet_post?.created_at
                              )}
                            </span>

                          </div>

                          <p className="profile-post-body">
                            {post.retweet_post?.post_body}
                          </p>

                          {post.retweet_post?.medias?.map(
                            (media) => (
                              <img
                                key={media.id}
                                className="profile-post-media"
                                src={getImageUrl(
                                  media.file || ""
                                )}
                                alt=""
                              />
                            )
                          )}

                          <div className="profile-post-actions">

                            <div
                              className="profile-post-action"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPost(post);
                              }}
                            >
                              <CommentIcon />

                              <span>
                                {post.retweet_post?.comments
                                  ?.length ?? 0}
                              </span>
                            </div>

                            <div
                              className={`profile-post-action ${
                                isRetweeted
                                  ? "retweeted"
                                  : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();

                                retweet(
                                  post.retweet_post?.id ??
                                    post.id,
                                  true
                                );
                              }}
                            >
                              <RetweetIcon />

                              <span>
                                {post.retweet_post
                                  ?.retweets.length ?? 0}
                              </span>
                            </div>

                            <div
                              className={`profile-post-action ${
                                isLiked ? "liked" : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();

                                like(
                                  post.retweet_post?.id ??
                                    post.id,
                                  true
                                );
                              }}
                            >
                              <LikeIcon />

                              <span>
                                {post.retweet_post?.likes
                                  .length ??
                                  post.likes.length}
                              </span>
                            </div>

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

          {/* =========================
              COMMENT
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

        </div>

      </main>

      {/* =========================
          RIGHT SIDEBAR
      ========================= */}

      <aside className="profile-right">

        <div className="profile-search">

          <input
            type="text"
            placeholder="Search"
            value={searchField}
            className="profile-search-input"
            onClick={(e) => {
              setSearching(true);
              e.stopPropagation();
            }}
            onChange={(e) =>
              setSearchField(e.target.value)
            }
          />

          {searching && (
            <div
              className="profile-search-menu"
              onClick={(e) => e.stopPropagation()}
            >

              <span
                className="profile-search-option"
                onClick={() =>
                  navigate(
                    `/users/search/?q=${searchField}`
                  )
                }
              >
                Search "{searchField}" in Users
              </span>

              <span
                className="profile-search-option"
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

        <div className="profile-trending">
          <h2>What's happening</h2>
        </div>

      </aside>

    </div>
  </div>
);
};
