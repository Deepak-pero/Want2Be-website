// components/SearchBar.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../Api/searchApi';
import toast from 'react-hot-toast';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search users
    useEffect(() => {
        const searchUsers = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await searchAPI.searchUsers(query);
                if (response.data.success) {
                    setResults(response.data.users);
                }
            } catch (error) {
                console.error('Search error:', error);
                toast.error('Failed to search users');
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleUserClick = (user) => {
        setShowResults(false);
        setQuery('');
        navigate(`/profile/${user._id}`);
    };

    return (
        <div ref={searchRef} className="relative w-80">
            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    className="w-full px-4 py-2 pl-10 bg-gray-100 border border-gray-300 rounded-lg  focus:bg-white transition-colors"
                />
                
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto z-50">
                    {results.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => handleUserClick(user)}
                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {user.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                {user.bio && (
                                    <p className="text-sm text-gray-500 truncate">{user.bio}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showResults && query.length >= 2 && results.length === 0 && !isLoading && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-4 text-center text-gray-500">
                    No users found
                </div>
            )}
        </div>
    );
};

export default SearchBar;