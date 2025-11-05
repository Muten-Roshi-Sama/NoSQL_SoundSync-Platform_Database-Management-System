import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar"; 



export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white">
      {/* NAVBAR PROVENANT DE Navbar.jsx */}
      <Navbar />

      {/* CONTENU PRINCIPAL */}
      <main className="flex-grow p-6">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-neutral-900 text-center py-4 text-sm text-neutral-400">
        © {new Date().getFullYear()} Soundsync — All rights reserved.
      </footer>
    </div>
  );
}
