'use client';
// import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import {
  LogOutIcon,
  MenuIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UploadIcon,
  ImageIcon,
  SunIcon,
  MoonIcon,
  LaptopIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

const sidebarItems = [
  { href: "/home", icon: LayoutDashboardIcon, label: "Home Page" },
  { href: "/social-share", icon: Share2Icon, label: "Social Share" },
  { href: "/video-upload", icon: UploadIcon, label: "Video Upload" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // ✅ mounted state for theme
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme, systemTheme } = useTheme();

  useEffect(() => setMounted(true), []); // ✅ mark mounted after hydration

  const currentTheme = theme === "system" ? systemTheme : theme;

  // Detect screen resize for sidebar
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024; // lg breakpoint
      setSidebarOpen(isDesktop);
    };

    handleResize(); // initialize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogoClick = () => router.push("/");
  const handleSignOut = async () => await signOut();
  const handleNavClick = () => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden" />}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`
          bg-gradient-to-b from-purple-600 via-pink-500 to-orange-400
          shadow-xl z-40 flex flex-col text-white
          fixed inset-y-0 left-0 w-56 sm:w-64 transform transition-transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:flex
        `}
      >
        <div className="flex items-center justify-center py-6 border-b border-white/20">
          <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
        </div>
        <ul className="menu px-2 sm:px-4 py-6 flex-grow space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  pathname === item.href ? "bg-white text-purple-600 shadow-md" : "hover:bg-white/20"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className={`${sidebarOpen ? "block" : "hidden"} text-sm sm:text-base`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {user && (
          <div className="p-2 sm:p-4 border-t border-white/20">
            <button
              onClick={handleSignOut}
              className="btn w-full flex items-center gap-2 text-xs sm:text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white border-none hover:scale-[1.03] hover:shadow-lg"
            >
              <LogOutIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              {sidebarOpen && "Sign Out"}
            </button>
          </div>
        )}
      </motion.aside>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <header className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md">
          <div className="navbar max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-white flex items-center justify-between h-14 sm:h-16">
            {/* Sidebar toggle for mobile */}
            <div className="flex-none lg:hidden">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-square btn-ghost text-white">
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1">
              <Link href="/" onClick={handleLogoClick}>
                <div className="text-lg sm:text-xl font-bold tracking-tight cursor-pointer hover:text-yellow-300 transition-colors">
                  Cloudinary Showcase
                </div>
              </Link>
            </div>

            {/* Right user & theme */}
            <div className="flex-none flex items-center space-x-2 sm:space-x-3 relative">
              {user && isLoaded && mounted && ( // ✅ check mounted before rendering theme buttons
                <>
                  {/* Avatar */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="avatar focus:outline-none"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring ring-pink-400 ring-offset-2 ring-offset-white overflow-hidden">
                        <img
                          src={user.imageUrl}
                          alt={user.username || user.emailAddresses[0].emailAddress}
                        />
                      </div>
                    </button>

                    {/* Dropdown */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: dropdownOpen ? 1 : 0, y: dropdownOpen ? 0 : -10 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200 dark:border-gray-700 ${
                        dropdownOpen ? "block" : "hidden"
                      }`}
                    >
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.fullName || "User"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.emailAddresses[0].emailAddress}
                        </div>
                      </div>
                      <ul className="flex flex-col">
                        <li>
                          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                            User
                          </button>
                        </li>
                        <li>
                          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                            Settings
                          </button>
                        </li>
                        <li>
                          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                            About
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-700 text-red-600 dark:text-red-400"
                          >
                            Sign Out
                          </button>
                        </li>

                        {/* Theme toggles */}
                        <li className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Theme</div>
                          <div className="flex gap-1 justify-between items-center">
                            <button
                              onClick={() => setTheme("light")}
                              className={`p-2 rounded-lg transition-colors ${
                                currentTheme === "light"
                                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                              }`}
                              title="Light mode"
                            >
                              <SunIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setTheme("dark")}
                              className={`p-2 rounded-lg transition-colors ${
                                currentTheme === "dark"
                                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                              }`}
                              title="Dark mode"
                            >
                              <MoonIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setTheme("system")}
                              className={`p-2 rounded-lg transition-colors ${
                                currentTheme === "system"
                                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                              }`}
                              title="System mode"
                            >
                              <LaptopIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      </ul>
                    </motion.div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
