import { create } from "zustand";

import type { PostProps } from "../types/postType";

type SelectedPostState = {
  selectedPost: PostProps | null;
  setSelectedPost: (post: PostProps | null) => void;
};

export const useSelectedPostStore = create<SelectedPostState>((set) => ({
  selectedPost: null,
  setSelectedPost: (post) => set({ selectedPost: post }),
}));