import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SearchBar from "./SearchBar";
import NotificationBell from "./NotificationBell"; // Add this import

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef(null);

    // Scroll behavior logic - FIXED
    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 30) {
            // Scrolled down - make navbar solid white
            setIsScrolled(true);
        } else {
            // At top - make navbar less transparent
            setIsScrolled(false);
        }
        setLastScrollY(currentScrollY);
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Logout function
    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully!");
        navigate("/login");
        setIsProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const navigateToProfile = () => {
        navigate("/profile");
        setIsProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
    };

    const getUserInitials = (userName) => {
        if (!userName) return "U";
        return userName
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const renderUserAvatar = (userData, size = "w-10 h-10", showInitials = true) => {
        if (user.profilePicture) {
            return (
                <img
                    src={user.profilePicture}
                    alt="Profile"
                    className={`${size} rounded-full object-cover border-2 border-white shadow-md cursor-pointer transition-all duration-300 hover:scale-105`}
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            );
        }

        if (showInitials) {
            return (
                <div className={`${size} bg-gradient-to-br from-red-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold border-2 border-white shadow-md cursor-pointer transition-all duration-300 hover:scale-105`}>
                    {getUserInitials(userData?.name)}
                </div>
            );
        }

        return null;
    };

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled
                ? "bg-white/20 backdrop-blur-md border-b border-border" // Scrolled down - solid white
                : "bg-white shadow-lg border-b border-gray-200" // At top - less transparent
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => navigate(isAuthenticated ? "/" : "/login")}
                    >
                        <div className="h-12 w-12 rounded-md overflow-hidden flex items-center justify-center">
                            <img
                                src="/logo.png"
                                alt="Want2Be Logo"
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <span className="bg-gradient-to-r from-red-600 via-orange-500 to-green-600 font-bold text-2xl bg-clip-text text-transparent">
                            Want2Be
                        </span>
                    </div>

                    {/* Desktop Search Bar - Center */}
                    {isAuthenticated && (
                        <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
                            <SearchBar />
                        </div>
                    )}

                    {/* Desktop Links */}
                    <div className="hidden lg:flex items-center gap-6">
                        {isAuthenticated ? (
                            <>
                                <NavItem to="/" text="Community" />
                                <NavItem to="/" text="Resources" />
                                <NavItem to="/" text="About" />

                                {/* 🔔 NOTIFICATION BELL - Add here */}
                                <NotificationBell />

                                {/* Profile Dropdown */}
                                <div className="relative" ref={profileDropdownRef}>
                                    <div
                                        onClick={toggleProfileDropdown}
                                        className="cursor-pointer"
                                    >
                                        {renderUserAvatar(user)}
                                    </div>

                                    {/* Modern Dropdown Menu */}
                                    {isProfileDropdownOpen && (
                                        <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 backdrop-blur-lg py-2 animate-in fade-in-80 zoom-in-95">
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    {renderUserAvatar(user, "w-12 h-12")}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {user?.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {user?.email || user?.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dropdown Options */}
                                            <div className="py-1">
                                                <button
                                                    onClick={navigateToProfile}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                                                >
                                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>My Profile</span>
                                                </button>

                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    <span>Signout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <NavLink
                                to="/login"
                                className="bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2"
                            >
                                Sign In
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </NavLink>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMobileMenuOpen ? (
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

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-200 shadow-xl rounded-b-2xl">
                        <div className="px-2 pt-2 pb-4 space-y-1">
                            {/* Mobile Search Bar */}
                            {isAuthenticated && (
                                <div className="px-3 mb-4">
                                    <SearchBar />
                                </div>
                            )}

                            {isAuthenticated ? (
                                <>
                                    <MobileNavLink to="/" text="Community" onClick={closeMobileMenu} />
                                    <MobileNavLink to="/" text="Resources" onClick={closeMobileMenu} />
                                    <MobileNavLink to="/" text="About" onClick={closeMobileMenu} />

                                    {/* 🔔 MOBILE NOTIFICATION BELL - Add here */}
                                    <div className="px-3 py-2">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Notifications</span>
                                            <NotificationBell />
                                        </div>
                                    </div>

                                    <div className="px-3 py-4 border-t border-gray-200 mt-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            {renderUserAvatar(user, "w-12 h-12")}
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                                <p className="text-xs text-gray-500">{user?.email || user?.phone}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                navigateToProfile();
                                                closeMobileMenu();
                                            }}
                                            className="w-full flex items-center gap-3 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium mb-2 transition-all duration-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            My Profile
                                        </button>

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                closeMobileMenu();
                                            }}
                                            className="w-full flex items-center gap-3 bg-red-50 hover:bg-red-100 text-red-600 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <NavLink
                                    to="/login"
                                    onClick={closeMobileMenu}
                                    className="block w-full bg-blue-500 text-white text-center py-3 rounded-lg text-sm font-medium transition-all duration-300 items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Sign In
                                </NavLink>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

// Desktop NavLink
const NavItem = ({ to, text }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `text-black hover:text-red-600 text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg  ${isActive ? "text-black font-semibold " : ""
            }`
        }
    >
        {text}
    </NavLink>
);

// Mobile NavLink
const MobileNavLink = ({ to, text, onClick }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className="block text-gray-700 hover:text-red-600 text-base font-medium transition-all duration-200 px-4 py-3 rounded-lg hover:bg-red-50 mx-2"
    >
        {text}
    </NavLink>
);

export default Navbar;