import { useEffect, useState } from "react";
import { useSelectedPostStore } from "../store/SelectedPostStore";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./comment.css";

import type { PostProps } from "../types/postType";

type Props = {
  post: PostProps;
  user: number;
  token: string;
};

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

export function CommentInPost({ post, user, token }: Props) {
  const [postComment, setpostComment] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [actualUser, setActualUser] = useState<user | null>(null);

  const validPost =
    postComment.length >= 1 && postComment.length <= 500;

  const setSelectedPost = useSelectedPostStore(
    (state) => state.setSelectedPost,
  );

  const navigate = useNavigate();

  function CalcTemp(created_at: string) {
    const now = new Date();
    const postDate = new Date(created_at);
    const time = now.getTime() - postDate.getTime();

    if (time / 1000 < 1) {
      return "1s";
    } else if (time / 1000 < 60) {
      return `${Math.floor(time / 1000)}s`;
    } else if (time / 60000 < 60) {
      return `${Math.floor(time / 60000)}m`;
    } else if (time / 3600000 < 24) {
      return `${Math.floor(time / 3600000)}h`;
    } else {
      return `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`;
    }
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const handleInit = async () => {
      try {
        const response = await api.get(`/users/${user}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setActualUser(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    handleInit();
  }, [user, token]);

  const handlePostComment = async () => {
    if (!validPost) return;

    const formData = new FormData();

    formData.append("post_body", postComment);

    if (image) {
      formData.append("files", image);
    }

    try {
      await api.post(`/posts/${post.id}/comment/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setpostComment("");
      setImage(null);
      setPreview(null);

      setSelectedPost(null);
      navigate(`/post/${post.id}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="comment-overlay">
      <div className="comment-modal">

        {/* HEADER */}

        <div className="comment-header">
          <button
            type="button"
            className="comment-close"
            onClick={() => setSelectedPost(null)}
          >
            X
          </button>
        </div>

        {/* POST ORIGINAL */}

        <div className="comment-original-post">

          <img
            className="comment-author-avatar"
            src={post.author.profile_image}
            alt="profile_picture"
          />

          <div className="comment-original-content">

            <div className="comment-author-line">
              <h2 className="comment-author-name">
                {post.author.name}
              </h2>

              <span className="comment-author-username">
                @{post.author.username}
              </span>

              <span className="comment-post-time">
                · {CalcTemp(post.created_at)}
              </span>
            </div>

            <p className="comment-post-body">
              {post.post_body}
            </p>

            {post.medias &&
              post.medias.map((media) => (
                <img
                  className="comment-post-media"
                  src={media.file}
                  alt=""
                  key={media.id}
                />
              ))}
          </div>
        </div>

        {/* REPLY AREA */}

        <div className="comment-reply-area">

          <div className="comment-reply-row">

            <img
              src={actualUser?.profile_image}
              alt="profile_picture"
              className="comment-current-user-avatar"
            />

            <textarea
              placeholder="Post your reply"
              className="comment-textarea"
              onChange={(e) => {
                setpostComment(e.target.value);

                e.target.style.height = "auto";
                e.target.style.height =
                  `${e.target.scrollHeight}px`;
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

          {/* IMAGE PREVIEW */}

          {preview && (
            <div className="comment-preview-container">
              <img
                src={preview}
                alt="preview"
                className="comment-preview-image"
              />

              <div className="comment-preview-divider" />
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="comment-footer">

          <button
            type="button"
            className={`comment-reply-button ${
              validPost
                ? "comment-reply-enabled"
                : "comment-reply-disabled"
            }`}
            onClick={handlePostComment}
            disabled={!validPost}
          >
            Reply
          </button>

        </div>
      </div>
    </div>
  );
}