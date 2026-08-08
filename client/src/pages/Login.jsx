import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../Api/authApi';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Login = ({ onAuthSuccess, initialDream = '' }) => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dream: '',
        contact: ''
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [userId, setUserId] = useState('');
    const [contactType, setContactType] = useState('');
    const inputRefs = useRef([]);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            if (onAuthSuccess) {
                onAuthSuccess();
            } else {
                navigate('/');
            }
        }
    }, [isAuthenticated, navigate, onAuthSuccess]);

    // Pre-fill dream if provided
    useEffect(() => {
        if (initialDream && !isLogin) {
            setFormData(prev => ({
                ...prev,
                dream: initialDream
            }));
        }
    }, [initialDream, isLogin]);

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (value && index < 5) inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pasteData)) {
            const newOtp = [...otp];
            pasteData.split('').forEach((digit, index) => {
                if (index < 6) newOtp[index] = digit;
            });
            setOtp(newOtp);
            inputRefs.current[Math.min(pasteData.length, 5)].focus();
        }
    };

    const getOtpString = () => otp.join('');

    // Detect if input is email or phone
    const detectContactType = (contact) => {
        if (!contact) return null;

        const cleanContact = contact.replace(/\s/g, '');

        // Check if it's a phone number
        // eslint-disable-next-line no-useless-escape
        const phoneRegex = /^\+?[\d\-\(\)]{10,}$/;
        if (phoneRegex.test(cleanContact)) {
            return 'phone';
        }

        // Check if it's an email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(cleanContact)) {
            return 'email';
        }

        return null;
    };

    // Step 1: Request OTP for both login and create account
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        let contactValue, detectedType;

        if (isLogin) {
            // For login: use single contact field
            if (!formData.contact) {
                toast.error('Please enter your email or phone number');
                setLoading(false);
                return;
            }

            contactValue = formData.contact.trim();
            detectedType = detectContactType(contactValue);

            if (!detectedType) {
                toast.error('Please enter a valid email or phone number');
                setLoading(false);
                return;
            }
        } else {
            // For create account: validate all fields
            if (!formData.name || !formData.dream) {
                toast.error('Name and dream are required');
                setLoading(false);
                return;
            }

            if (!formData.email && !formData.phone) {
                toast.error('Please provide either email or phone number');
                setLoading(false);
                return;
            }
            contactValue = formData.email || formData.phone;
            detectedType = formData.email ? 'email' : 'phone';
        }

        try {
            // Prepare request data based on mode
            let requestData;

            if (isLogin) {
                // For login, send only the contact information
                requestData = {
                    [detectedType]: contactValue,
                    isLogin: true
                };
            } else {
                // For create account, send all data
                requestData = {
                    name: formData.name,
                    dream: formData.dream,
                    email: formData.email,
                    phone: formData.phone,
                    isLogin: false
                };
            }

            const response = await authAPI.requestOTP(requestData);
            setUserId(response.data.userId);
            setContactType(detectedType);
            setStep(2);

            toast.success(`OTP sent to your ${detectedType === 'phone' ? 'phone number' : 'email'}`);
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send OTP';

            // 🔥 Handle duplicate account error
            if (message.includes('Account already exists') || error.response?.status === 409) {
                toast.error('Account already exists! Please login instead.');
                // Auto-switch to login mode
                setIsLogin(true);
                setFormData(prev => ({
                    ...prev,
                    contact: contactValue
                }));
            } else if (message.includes('not found') && isLogin) {
                toast.error('Account not found. Please create an account first.');
            } else if (message.includes('Name and dream are required') && isLogin) {
                toast.error('Login failed. Please try creating an account first.');
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    // const handleVerifyOTP = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);

    //     const otpString = getOtpString();
    //     if (otpString.length !== 6) {
    //         toast.error('OTP must be 6 digits');
    //         setLoading(false);
    //         return;
    //     }

    //     try {
    //         const response = await authAPI.verifyOTP({ userId, otp: otpString });
    //         login(response.data.user, response.data.token);
    //         toast.success(isLogin ? 'Welcome back! 🎉' : 'Welcome to Want2Be! 🎉');

    //         // Call the success callback with the new dream data
    //         if (onAuthSuccess) {
    //             onAuthSuccess(response.data.newDream); // Pass the created dream
    //         } else {
    //             navigate('/');
    //         }
    //     } catch (error) {
    //         const message = error.response?.data?.message || 'Failed to verify OTP';
    //         toast.error(message.includes('expired') ? 'OTP expired. Request a new one.' :
    //             message.includes('Invalid') ? 'Invalid OTP. Try again.' : message
    //         );
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // In Login.js - Fix the handleVerifyOTP function
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);

        const otpString = getOtpString();
        if (otpString.length !== 6) {
            toast.error('OTP must be 6 digits');
            setLoading(false);
            return;
        }

        try {
            console.log('🔐 Verifying OTP...', {
                userId,
                otp: otpString,
                isLogin,
                dream: formData.dream // Check if dream exists
            });

            // 🔥 CRITICAL FIX: Include dream in the request for new registrations
            const requestData = {
                userId,
                otp: otpString,
                isLogin
            };

            // For new registration, include the dream from formData
            if (!isLogin) {
                requestData.dream = formData.dream;
                console.log('📝 Sending dream to backend:', formData.dream);
            }

            const response = await authAPI.verifyOTP(requestData);

            console.log('✅ OTP Verification Response:', response.data);
            console.log('📦 New Dream Created:', response.data.newDream);

            login(response.data.user, response.data.token);
            toast.success(isLogin ? 'Welcome back! 🎉' : 'Welcome to Want2Be! 🎉');

            if (onAuthSuccess) {
                onAuthSuccess(response.data.newDream);
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('❌ OTP Verification Error:', error);
            const message = error.response?.data?.message || 'Failed to verify OTP';
            toast.error(message.includes('expired') ? 'OTP expired. Request a new one.' :
                message.includes('Invalid') ? 'Invalid OTP. Try again.' : message
            );
        } finally {
            setLoading(false);
        }
    };


    // Resend OTP
    const handleResendOTP = async () => {
        setLoading(true);
        try {
            await authAPI.resendOTP({ userId });
            toast.success(`OTP resent to your ${contactType}!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    // Reset form when switching between login/create
    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setStep(1);
        setFormData({
            name: '',
            email: '',
            phone: '',
            dream: initialDream || '',
            contact: ''
        });
        setOtp(['', '', '', '', '', '']);
    };

    // Autofocus OTP input on step change
    useEffect(() => {
        if (step === 2 && inputRefs.current[0]) inputRefs.current[0].focus();
    }, [step]);

    // Don't show anything if authenticated
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-green-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[85vh]">

                    {/* Left Side - Hero Content */}
                    <div className="hidden lg:block space-y-14">
                        <div className="space-y-6">
                            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                                Share Your <span className="bg-gradient-to-r from-red-500 to-green-500 bg-clip-text text-transparent font-bold">Dreams</span> with the World
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                                Join our community of dreamers. Share your nightly adventures, connect with like-minded people, and discover the power of collective dreaming.
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid sm:grid-cols-2 gap-4 max-w-md">
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg backdrop-blur-sm border border-white/40">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg">🌙</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm">Share Dreams</h3>
                                    <p className="text-xs text-gray-600">Text & Voice</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg backdrop-blur-sm border border-white/40">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg">💬</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm">Connect</h3>
                                    <p className="text-xs text-gray-600">Like & Comment</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg backdrop-blur-sm border border-white/40">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg">🔒</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm">Secure</h3>
                                    <p className="text-xs text-gray-600">OTP Verified</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg backdrop-blur-sm border border-white/40">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg">⚡</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm">Fast</h3>
                                    <p className="text-xs text-gray-600">Instant Setup</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 pt-2">
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">10K+</div>
                                <div className="text-xs text-gray-600">Dreamers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">50K+</div>
                                <div className="text-xs text-gray-600">Dreams Shared</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">99%</div>
                                <div className="text-xs text-gray-600">Satisfaction</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Auth Form */}
                    <div className="w-full flex justify-center lg:justify-end">
                        <div className="w-full max-w-md">
                            {/* Step 1 Form */}
                            {step === 1 && (
                                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6">
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-bold text-black mb-2">
                                            {isLogin ? 'Sign In' : 'Create Account'}
                                        </h2>
                                        <p className="text-gray-600 text-sm">
                                            {isLogin ? 'Sign in to continue your journey' : 'Start your dream journey in seconds'}
                                        </p>
                                        {initialDream && !isLogin && (
                                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-green-700 text-xs">
                                                    ✨ Your dream is ready to be shared!
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <form onSubmit={handleRequestOTP} className="space-y-4">
                                        {/* Only show name and dream for CREATE ACCOUNT */}
                                        {!isLogin && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                        Full Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200 bg-white/70"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                        Your Dream *
                                                    </label>
                                                    <textarea
                                                        name="dream"
                                                        value={formData.dream}
                                                        onChange={handleInputChange}
                                                        rows="2"
                                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200 bg-white/70 resize-none"
                                                        placeholder="What's your dream or aspiration?"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                {isLogin ? 'Email or Phone Number *' : 'Contact Method *'}
                                            </label>

                                            {isLogin ? (
                                                // Single input for LOGIN
                                                <input
                                                    type="text"
                                                    name="contact"
                                                    value={formData.contact}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200 bg-white/70"
                                                    placeholder="Enter your email or phone number"
                                                />
                                            ) : (
                                                // Separate inputs for CREATE ACCOUNT
                                                <>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200 bg-white/70 mb-2"
                                                        placeholder="Email address"
                                                    />
                                                    <div className="text-center">
                                                        <span className="text-xs text-gray-500 bg-white/70 px-2 py-1 rounded-full">or</span>
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black focus:outline-none transition-all duration-200 bg-white/70 mt-2"
                                                        placeholder="Phone number"
                                                        maxLength="15"
                                                    />
                                                </>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-red-100 to-green-100 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-2"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <LoadingSpinner size="small" color="white" />
                                                    <span className="ml-2">Sending Code...</span>
                                                </div>
                                            ) : isLogin ? 'Sign In →' : 'Create Account →'}
                                        </button>
                                    </form>

                                    <div className="mt-4 text-center">
                                        <p className="text-xs text-gray-500">
                                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                                            <button
                                                type="button"
                                                onClick={toggleAuthMode}
                                                className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                                            >
                                                {isLogin ? 'Create Account' : 'Sign In'}
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 2 OTP Verification */}
                            {step === 2 && (
                                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex items-center text-gray-600 hover:text-gray-800 mb-4 text-sm transition-colors duration-200 group"
                                    >
                                        <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Back to {isLogin ? 'sign in' : 'sign up'}
                                    </button>

                                    <div className="text-center mb-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-1">Enter Verification Code</h2>
                                        <p className="text-gray-600 text-xs">Sent to your {contactType}</p>
                                        <p className="text-gray-900 font-semibold text-base mt-1 bg-white/70 rounded-lg py-1.5 px-3 inline-block">
                                            {isLogin ? formData.contact : (formData.email || formData.phone)}
                                        </p>
                                    </div>

                                    <form onSubmit={handleVerifyOTP}>
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                                                6-Digit Code
                                            </label>
                                            <div className="flex justify-center gap-2 mb-3" onPaste={handlePaste}>
                                                {otp.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        ref={(el) => (inputRefs.current[index] = el)}
                                                        type="text"
                                                        value={digit}
                                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                                        className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 bg-white shadow-sm"
                                                        maxLength="1"
                                                        inputMode="numeric"
                                                        pattern="[0-9]*"
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 text-center">
                                                Enter code sent to your {contactType}
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || getOtpString().length !== 6}
                                            className="w-full bg-gradient-to-r from-red-200 to-green-200 text-black font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mb-3"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <LoadingSpinner size="small" color="white" />
                                                    <span className="ml-2">Verifying...</span>
                                                </div>
                                            ) : isLogin ? 'Sign In →' : 'Create Account →'}
                                        </button>

                                        <div className="text-center mb-4">
                                            <button
                                                type="button"
                                                onClick={handleResendOTP}
                                                disabled={loading}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                                            >
                                                Didn't receive code? Resend OTP
                                            </button>
                                        </div>

                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                                            <p className="text-amber-700 text-xs font-medium">
                                                ⏰ Code expires in 10 minutes
                                            </p>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;