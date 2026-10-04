import { api } from "../services/api";
import { PageNotFound } from "../components/page_not_found";
import { PostPageComponent } from "../components/post_page_component";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useEffect, useState } from "react";

import type { PostProps } from "../types/postType";

export function PostPage() {
  // consts
  const { id } = useParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  // States
  const [exist, setExist] = useState("untouched");
  const [post, setPost] = useState<PostProps | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isRetweeted, setIsRetweeted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actualUser, setActualUser] = useState(-1);
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);

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

        const headers = { Authorization: `Bearer ${token}` };

        const [postRes, meRes] = await Promise.all([
          api.get(`/posts/${id}/`, { headers }),
          api.get(`/users/me/`, { headers }),
        ]);

        setPost(postRes.data);
        setExist("found");
        setIsLiked(postRes.data.likes.includes(meRes.data.id));
        setIsRetweeted(postRes.data.retweets.includes(meRes.data.id));
        setActualUser(meRes.data.id);
      } catch (err) {
        console.log(err);
        setExist("notfound");
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="bg-black h-screen">
      {loading ? (
        false
      ) : exist === "notfound" || post == null ? (
        <PageNotFound id={actualUser} />
      ) : (
        <PostPageComponent
          post={post}
          liked={isLiked}
          retweeted={isRetweeted}
        />
      )}
    </div>
  );
}
