import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Player from "../Player";

export default function Layout() {
  return (
    <div className="flex h-screen">
      <Navbar />
      <main className="flex-1 overflow-y-auto bg-neutral-900 text-white">
        <Outlet />
      </main>
      <Player />
    </div>
  );
}
