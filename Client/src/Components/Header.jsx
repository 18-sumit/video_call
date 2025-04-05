import React, { useEffect } from "react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Moon, Sun } from "lucide-react"

const Header = () => {
    // state to toggle mobile menu visiblity
    const [isOpen, seIsOpen] = useState(false);
    // Default to dark mode
    const [darkMode, setDarkMode] = useState(true);

    // Apply theme to document when darkMode changes
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    }
    return (
        <header className="dark:bg-gray-900 bg-white shadow-md fixed w-full top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4">
                <nav className="w-full">
                    <div className="flex justify-between items-center h-16">
                        {/* LOGO */}
                        <div className="flex shrink-0">
                            <Link to="/" className="text-2xl font-bold">
                                <span className="text-blue-500">AI</span>
                                <span className="text-emerald-500">Recap</span>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex space-x-6">
                            <NavLink to="/" className="dark:text-gray-200 text-gray-800 hover:text-blue-500 transition-colors">
                                Home
                            </NavLink>
                            <NavLink to="/dashboard" className="dark:text-gray-200 text-gray-800 hover:text-blue-500 transition-colors">
                                Dashboard
                            </NavLink>
                            <NavLink to="/meetings" className="dark:text-gray-200 text-gray-800 hover:text-blue-500 transition-colors">
                                Meetings
                            </NavLink>
                            <NavLink to="/aboutus" className="dark:text-gray-200 text-gray-800 hover:text-blue-500 transition-colors">
                                About Us
                            </NavLink>
                        </div>

                        {/* Toggele theme button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full dark:bg-gray-800 bg-gray-100 dark:text-gray-200 text-gray-800"
                            aria-label="Toggle theme"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};



export default Header;