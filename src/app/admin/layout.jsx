"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProtectedRoute from "./ProtectedRoute";

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: "⌂",
  },
  {
    name: "Profile",
    href: "/admin/profile",
    icon: "👤",
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: "💼",
  },
  {
    name: "Skills",
    href: "/admin/skills",
    icon: "⚡",
  },
  {
    name: "Experience",
    href: "/admin/experience",
    icon: "🚀",
  },
  {
    name: "Education",
    href: "/admin/education",
    icon: "🎓",
  },
  {
    name: "Resume",
    href: "/admin/resume",
    icon: "📄",
  },
  {
    name: "Messages",
    href: "/admin/messages",
    icon: "✉️",
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login page ko protected layout se bahar rakho
  if (pathname === "/admin/login") {
    return children;
  }

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("adminToken");
    router.replace("/admin/login");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-white">

        {/* MOBILE HEADER */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-4">

          <div>
            <h1 className="font-bold text-lg">
              Portfolio Admin
            </h1>
            <p className="text-xs text-slate-500">
              Management Panel
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl"
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
        </header>

        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-black/60"
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`
            fixed
            top-0
            left-0
            z-50
            h-screen
            w-72
            bg-slate-900
            border-r
            border-white/10
            flex
            flex-col
            transition-transform
            duration-300

            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >

          {/* LOGO */}
          <div className="h-20 px-6 flex items-center border-b border-white/10">

            <div>
              <h1 className="text-xl font-bold">
                Portfolio Admin
              </h1>

              <p className="text-xs text-slate-500 mt-1">
                Management Panel
              </p>
            </div>

          </div>

          {/* MENU */}
          <div className="flex-1 overflow-y-auto px-4 py-6">

            <p className="px-3 text-xs uppercase tracking-widest text-slate-500 mb-4">
              Management
            </p>

            <nav className="space-y-2">

              {menuItems.map((item) => {

                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full
                      flex
                      items-center
                      gap-4
                      px-4
                      py-3
                      rounded-xl
                      text-left
                      transition

                      ${
                        isActive
                          ? "bg-white text-slate-950"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >

                    <span className="text-lg w-6 text-center">
                      {item.icon}
                    </span>

                    <span className="font-medium">
                      {item.name}
                    </span>

                    {isActive && (
                      <span className="ml-auto">
                        →
                      </span>
                    )}

                  </button>
                );

              })}

            </nav>

            {/* VIEW PORTFOLIO */}
            <div className="mt-6 pt-6 border-t border-white/10">

              <button
                onClick={() => {
                  window.open(
                    "http://localhost:3000",
                    "_blank"
                  );

                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
              >

                <span className="text-lg w-6 text-center">
                  🌐
                </span>

                <span className="font-medium">
                  View Portfolio
                </span>

                <span className="ml-auto">
                  ↗
                </span>

              </button>

            </div>

          </div>

          {/* LOGOUT */}
          <div className="p-4 border-t border-white/10">

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition"
            >

              <span className="text-lg w-6 text-center">
                ⎋
              </span>

              <span className="font-medium">
                Logout
              </span>

            </button>

          </div>

        </aside>

        {/* MAIN CONTENT */}
        <main className="lg:ml-72 min-h-screen">

          <div className="pt-20 lg:pt-0 p-5 md:p-8 lg:p-10">

            {children}

          </div>

        </main>

      </div>
    </ProtectedRoute>
  );
}