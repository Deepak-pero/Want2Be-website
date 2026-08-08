/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Stories from './Stories';
import toast from 'react-hot-toast';

const WelcomeDreamBar = ({ onDreamCreated, hasExistingDreams = false }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const textareaRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('📝 WelcomeDreamBar - Submitting dream:', content);

        if (!content.trim()) {
            toast.error('Please share your dream first');
            return;
        }

        onDreamCreated(content);
        setContent('');
    };

    const autoResizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    };

    const handleVoiceClick = () => {
        if (isRecording) {
            stopVoiceRecognition();
            return;
        }

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();

            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'en-US';
            recognitionInstance.maxAlternatives = 1;

            recognitionInstance.onstart = () => {
                setIsRecording(true);
                toast.loading('Listening... Click again to stop 🎤');
            };

            recognitionInstance.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setContent((prev) => prev + (prev ? ' ' : '') + transcript);
                toast.success('Voice captured! 🎯');
                setTimeout(() => stopVoiceRecognition(), 500);
            };

            recognitionInstance.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error !== 'aborted') {
                    toast.error('Voice recognition failed. Please try again.');
                }
                stopVoiceRecognition();
            };

            recognitionInstance.onend = () => {
                stopVoiceRecognition();
            };

            recognitionInstance.start();
            setRecognition(recognitionInstance);
        } else {
            toast.error('Speech recognition not supported in your browser');
        }
    };

    const stopVoiceRecognition = () => {
        if (recognition) {
            try {
                recognition.stop();
            } catch (error) {
                console.log('Recognition already stopped');
            }
            setRecognition(null);
        }
        setIsRecording(false);
        toast.dismiss();
    };

    const handleTextClick = () => {
        textareaRef.current?.focus();
        toast('Start typing your dream... ✍️');
    };

    useEffect(() => {
        return () => {
            if (recognition) stopVoiceRecognition();
        };
    }, [recognition]);

    // If user already has dreams
    if (hasExistingDreams) {
        return (
            <div className="w-full">
                {/* Stories - Directly under navbar */}
                <div className="sticky top-16 z-30 bg-white/10 backdrop-blur-sm border-b border-white/10">
                    <Stories />
                </div>

                {/* Banner Only */}
                <div className="w-full relative min-h-[250px] sm:min-h-[300px] md:min-h-[400px] border-b border-gray-200 py-8 sm:py-10 md:py-12 lg:py-16 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: 'url("https://images.pexels.com/photos/7869041/pexels-photo-7869041.jpeg")'
                        }}
                    >
                        <div className="absolute inset-0 bg-black/40"></div>
                    </div>

                    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
                        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
                                Hi, {user?.name || 'Dreamer'}! 👋
                            </h2>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-3 sm:mb-4 md:mb-6">
                                Welcome to{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-green-400 font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                                    Want2Be
                                </span>
                            </p>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-4 sm:mb-6">
                                "Where Your Dream Finds its Way"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Stories - Directly under navbar */}
            <div className="sticky top-16 z-30 bg-white/10 backdrop-blur-sm border-b border-white/10">
                <Stories />
            </div>

            {/* Banner with Background Image */}
            <div className="w-full relative min-h-[350px] sm:min-h-[450px] md:min-h-[550px] lg:min-h-[600px] border-b border-gray-200 py-8 sm:py-10 md:py-12 lg:py-16 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: 'url("https://images.pexels.com/photos/7869041/pexels-photo-7869041.jpeg")'
                    }}
                >
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
                    <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-12">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
                            Hi, {user?.name || 'Dreamer'}! 👋
                        </h2>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-3 sm:mb-4 md:mb-6">
                            Welcome to{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-green-600 font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                                Want2Be
                            </span>
                        </p>
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-4 sm:mb-6">
                            Where Your Dream Finds its Way
                        </p>
                    </div>
                </div>
            </div>

            {/* Dream Input Form */}
            <div className="max-w-[95%] sm:max-w-2xl mx-auto px-2 sm:px-4 -mt-48 sm:-mt-10 md:-mt-16 lg:-mt-80 relative z-20 mb-6 sm:mb-8 md:mb-12">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-5 md:p-6 lg:p-8">
                    <div className="text-center mb-4 sm:mb-5 md:mb-6 lg:mb-8">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Share Your Dream Journey</h2>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white shadow-xl border border-gray-200 rounded-xl sm:rounded-2xl px-1 sm:px-4 md:px-5 lg:px-6 py-4 sm:py-6 md:py-8 lg:py-10 w-full max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[40vw] min-w-[260px] sm:min-w-[280px] mx-auto"
                    >
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => {
                                setContent(e.target.value);
                                autoResizeTextarea();
                            }}
                            placeholder="What do you Want2Be and What's Your Dream ?"
                            className="w-full resize-none text-gray-800 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-black focus:border-black focus:outline-none placeholder-gray-400 text-sm sm:text-base mb-3 sm:mb-4"
                            rows="2"
                            maxLength="500"
                        />

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
                                <button
                                    type="button"
                                    onClick={handleVoiceClick}
                                    className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg border font-medium text-xs sm:text-sm transition-colors duration-200 ${isRecording
                                        ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                                        }`}
                                >
                                    🎤 {isRecording ? 'Stop' : 'Voice'}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !content.trim()}
                                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-red-400 to-green-400 hover:from-red-500 hover:to-green-500 text-black font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs sm:text-sm md:text-base w-full sm:w-auto justify-center"
                            >
                                {isSubmitting ? 'Sharing...' : '🚀 Start Journey'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WelcomeDreamBar;