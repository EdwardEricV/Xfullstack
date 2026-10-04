export type PostProps = {
  author: {
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
  };

  comments?: PostProps[];
  comments_count?: number;

  created_at: string;
  id: number;

  likes: number[];
  likes_count: number;

  parent_post: number | null;

  retweet_post: PostProps | null;

  medias: {
    id: number;
    file: string;
    order: number;
  }[];

  post_body: string;

  retweets: number[];
};
