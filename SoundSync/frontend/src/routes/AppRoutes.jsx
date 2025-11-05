import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Player from "../components/Player";
import Home from "../pages/Home";
import Login from "../pages/accounts/Login";
import Register from "../pages/accounts/Inscription";
import Songs from "../pages/showcase/Songs";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Songs" element={<Songs />} />
      {/* Routes protégées (nécessitent connexion) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        
        <Route path="/player/:id" element={<Player />} />
      </Route>
    </Routes>
  );
}
