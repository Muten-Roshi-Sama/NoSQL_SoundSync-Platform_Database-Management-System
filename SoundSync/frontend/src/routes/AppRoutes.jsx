import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Search from "../pages/Search";
import Library from "../pages/Library";
import Player from "../pages/Player";
import Artist from "../pages/Artist";
import Album from "../pages/Album";
import Playlist from "../pages/Playlist";
import Profile from "../pages/Profile";
import Upload from "../pages/Upload";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes protégées (nécessitent connexion) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/player/:id" element={<Player />} />
        <Route path="/artist/:id" element={<Artist />} />
        <Route path="/album/:id" element={<Album />} />
        <Route path="/playlist/:id" element={<Playlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<Upload />} />
      </Route>
    </Routes>
  );
}
