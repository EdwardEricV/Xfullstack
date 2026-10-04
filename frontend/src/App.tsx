import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { MeProfile } from "./pages/me_page";
import { LoginPage } from "./pages/login_page";
import { RegisterPage } from "./pages/register_page";
import { Feed } from "./pages/feed";
import { PostPage } from "./pages/post_page";
import { SettingsPage } from "./pages/settings";
import { FollowingPage } from "./pages/following_page";
import { FollowersPage } from "./pages/followers_page";
import { SearchPostPage } from "./pages/post_search_page";
import { SearchUserPage } from "./pages/users_search_page copy";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Autenticação */}
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />

        {/* Páginas liberadas para teste */}
        <Route path="/home" element={<Feed />} />

        <Route path="/post/:id" element={<PostPage />} />

        <Route path="/profile/:id" element={<MeProfile />} />

        <Route
          path="/profile/:id/following"
          element={<FollowingPage />}
        />

        <Route
          path="/profile/:id/followers"
          element={<FollowersPage />}
        />

        <Route path="/settings" element={<SettingsPage />} />

        <Route path="/posts/search" element={<SearchPostPage />} />

        <Route path="/users/search" element={<SearchUserPage />} />

        {/* Rota padrão */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;