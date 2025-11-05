import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white">
      {/* NAVBAR */}
      <nav className="bg-neutral-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo / Titre */}
            <Link
              to="/"
              className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Soundsync
            </Link>

            {/* Liens de navigation (bureau) */}
            <div className="hidden md:flex space-x-6">
              <NavLink
                to="/artists"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-400 font-semibold"
                    : "hover:text-indigo-300 transition-colors"
                }
              >
                Artists
              </NavLink>

              <NavLink
                to="/favorites"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-400 font-semibold"
                    : "hover:text-indigo-300 transition-colors"
                }
              >
                Favorites
              </NavLink>

              <NavLink
                to="/playlists"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-400 font-semibold"
                    : "hover:text-indigo-300 transition-colors"
                }
              >
                Playlists
              </NavLink>
            </div>

            {/* Bouton menu mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isOpen && (
          <div className="md:hidden bg-neutral-800 px-4 pb-3 space-y-2">
            <NavLink
              to="/artists"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "block text-indigo-400 font-semibold"
                  : "block hover:text-indigo-300"
              }
            >
              Artists
            </NavLink>

            <NavLink
              to="/favorites"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "block text-indigo-400 font-semibold"
                  : "block hover:text-indigo-300"
              }
            >
              Favorites
            </NavLink>

            <NavLink
              to="/playlists"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? "block text-indigo-400 font-semibold"
                  : "block hover:text-indigo-300"
              }
            >
              Playlists
            </NavLink>
          </div>
        )}
      </nav>

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
