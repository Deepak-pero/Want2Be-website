import React from 'react';
import { FaTwitter, FaInstagram, FaLinkedin, FaDiscord, FaGooglePlay} from "react-icons/fa";
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-[#c7c7c7] text-black">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-7">
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8  ">
                    {[
                        { icon: '🤖', title: 'AI Powered', desc: 'Advanced AI analyzes your dreams and creates personalized roadmaps' },
                        { icon: '📈', title: 'Progress Tracking', desc: 'Track your journey with detailed progress metrics and milestones' },
                        { icon: '👥', title: 'Community Support', desc: 'Join dreamers worldwide in achieving their aspirations' }
                    ].map((feature, index) => (
                        <div key={index} className="text-center group">
                            <div className="w-12 h-12 bg-gradient-to-t from-red-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                                <span className="text-xl">{feature.icon}</span>
                            </div>
                            <h5 className="font-semibold text-black mb-2">{feature.title}</h5>
                            <p className="text-black text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
                    {/* Copyright */}
                    <div className="text-black text-sm mb-4 md:mb-0">
                        <p>© 2025 Want2Be. All rights reserved. Navodayans A to Z Services Pvt Ltd</p>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-4">
                        {[
                            { name: 'Twitter', icon: <FaTwitter />, url: '#' },
                            { name: 'Instagram', icon: <FaInstagram />, url: '#' },
                            { name: 'LinkedIn', icon: <FaLinkedin />, url: '#' },
                            { name: 'Discord', icon: <FaDiscord />, url: '#' },
                            { name: 'play store', icon: <FaGooglePlay />, url: 'https://play.google.com/store/apps/details?id=com.yourcompany.want2be' },
                        ].map((social) => (
                            <a
                                key={social.name}
                                href={social.url}
                                className="w-10 h-10 bg-white rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                                title={social.name}
                            >
                                <span className="text-xl">{social.icon}</span>
                            </a>
                        ))}
                    </div>

                    {/* Legal Links */}
                    <div className="flex gap-6 mt-4 md:mt-0">
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                            <button key={item} className="text-black hover:underline text-sm transition-colors duration-300">
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

        </footer>
    );
};

export default Footer;