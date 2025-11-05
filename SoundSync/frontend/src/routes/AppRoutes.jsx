import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout";
import Player from "../components/Player";
import Home from "../pages/Home";
import Login from "../pages/accounts/Login";
import Register from "../pages/accounts/Inscription";
import Songs from "../pages/showcase/Songs";
import Artists from "../pages/showcase/Artists";
import AccountOverview from "../pages/accounts/accountOverview";

export default function AppRoutes() {
  return (
    <Routes>
      
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />  
        <Route path="/" element={<Home />} />
        <Route path="/Songs" element={<Songs />} />
        <Route path="/Artists" element={<Artists />} />
        <Route path="/player/:id" element={<Player />} />
        <Route path="/accountOverview" element={<AccountOverview />} />
      </Route>




      
    </Routes>
  );
}
