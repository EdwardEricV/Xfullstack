import { useState } from "react";
import HomeIcon from "../assets/home.svg?react";
import MeIcon from "../assets/me.svg?react";
import SettingsIcon from "../assets/settings.svg?react";
import XIcon from "../assets/x_logo.svg?react";
import { useNavigate } from "react-router-dom";
import "./page_not_found.css";

type actualUser = {
  id: number;
};

export const PageNotFound = ({ id }: actualUser) => {
  const [searching, setSearching] = useState(false);
  const [searchField, setSearchField] = useState("");
  const navigate = useNavigate();
  return (
    <div className="bg-black h-screen text-[#E7E9EA] flex justify-center overflow-hidden"onClick={() => setSearching(false)}>
      <div className="flex w-full max-w-[1300px]">
        {/* Left Side */}
        <div className="w-[275px] px-2 border-r border-stone-800 sticky top-0 h-screen">
          <div className="top-0 py-2 mr-8">
            <XIcon className="fill-[#E7E9EA] w-8 h-8 ml-3 mb-4 cursor-pointer" />
            <button
              className="hover:bg-stone-800 cursor-pointer p-3 flex items-center gap-5 rounded-full transition-colors duration-300"
              onClick={() => navigate("/home")}
            >
              <HomeIcon className="fill-[#E7E9EA] w-8 h-8" />
              <h2 className="text-xl">Home</h2>
            </button>
            <button
              className="hover:bg-stone-800 cursor-pointer p-3 flex items-center gap-5 rounded-full transition-colors duration-300"
              onClick={() => navigate(`/profile/${id}`)}
            >
              <MeIcon className="fill-[#E7E9EA] w-8 h-8" />
              <h2 className="text-xl">Me</h2>
            </button>
            <button className="hover:bg-stone-800 cursor-pointer p-3 flex items-center gap-5 rounded-full transition-colors duration-300"
            onClick={() => navigate("/settings")}>
              <SettingsIcon className="fill-[#E7E9EA] w-8 h-8" />
              <h2 className="text-xl">Settings</h2>
            </button>
          </div>
        </div>

        {/* mid side */}
        <div className="flex flex-col items-center bg-black min-h-screen text-[#E7E9EA] justify-center">
          <img src="https://http.cat/images/404.jpg" alt="" />
          <h1 className="font-bold text-[24px]">Erro, Post not found.</h1>
        </div>
        {/* right side */}
        <div className="px-2 border-l border-stone-800 w-[420px] px-4 sticky top-0 h-screen overflow-y-auto">
          <div className="top-0 pt-2">
            <div className="bg-zinc-900 border border-stone-800 rounded-full px-4 py-2 focus-within:border-blue-500 relative">
              <input
              onClick={(e) => {
                  setSearching(true)
                  e.stopPropagation()
                }}
                onChange={(e) => setSearchField(e.target.value)}
                value={searchField}
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none w-full text-sm text-white placeholder-gray-400"
              />
              {
                searching &&
                <div className="p-2 flex flex-col absolute top-full bg-[#16181C] left-0 w-full flex rounded-xl shadow-[0_0_20px_4px_rgba(255,255,255,0.08)]">
                  <span className="p-1 font-bold hover:underline rounded-full cursor-pointer" onClick={() => navigate(`/users/search/?q=${searchField}`)}>Search "{searchField}" in Users</span>
                  <span className="p-1 font-bold hover:underline rounded-full cursor-pointer" onClick={() => navigate(`/posts/search/?q=${searchField}`)}>Search "{searchField}" in Posts</span>
                </div>
              }
            </div>

            <div className="bg-zinc-900 border border-stone-800 rounded-xl mt-4 p-4">
              <h2 className="font-bold text-lg">What's happening</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
