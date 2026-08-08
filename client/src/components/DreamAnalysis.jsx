/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { dreamAnalysisAPI } from '../Api/dreamAnalysisApi';
import toast from 'react-hot-toast';

const DreamAnalysis = ({ dream, onAnalysisComplete, showOnProfile = false }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [activeTab, setActiveTab] = useState('roadmap');

    if (showOnProfile) return null;

    const handleAnalyze = async () => {
        setLoading(true);
        toast.loading('🧠 AI is analyzing your dream...', { duration: 3000 });
        try {
            const response = await dreamAnalysisAPI.analyzeDream(dream._id);
            if (response.data.success) {
                setAnalysis(response.data.analysis);
                setShowAnalysis(true);
                toast.success('🎉 Dream analyzed successfully!');
                if (onAnalysisComplete) onAnalysisComplete(response.data.analysis);
            }
        } catch (error) {
            toast.error('❌ Failed to analyze dream.');
        } finally {
            setLoading(false);
        }
    };

    const markStepCompleted = (index) => {
        const updated = { ...analysis };
        updated.analysis.stepByStepRoadmap[index].completed = true;
        setAnalysis(updated);
        toast.success(`✅ Step ${index + 1} marked complete!`);
    };

    // 🔮 Simple Button Before Analysis
    if (!showAnalysis) {
        return (
            <div className="mt-6 flex justify-start">
                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className={`relative group overflow-hidden px-6 py-3 rounded-xl font-semibold 
          text-black shadow-lg bg-gradient-to-r from-red-400 to-green-400 transform hover:scale-105 transition-all duration-300 ${loading ? 'opacity-70' : ''}`}
                >
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></span>
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Analyzing...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🔮</span> Analyze My Dream
                        </div>
                    )}
                </button>
            </div>
        );
    }

    // 🌈 After Analysis Display
    return (
        <div className="mt-8 relative">
            {/* Background Glow */}
            <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-purple-200/40 via-pink-200/40 to-blue-200/30 rounded-3xl"></div>

            {/* Main Container */}
            <div className="relative backdrop-blur-xl bg-white/70 border border-purple-200 rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-blue-400 text-white p-6 rounded-t-3xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">Your Dream Roadmap</h2>
                            <p className="text-purple-100 text-sm opacity-90">AI-powered guidance to help you achieve your dream</p>
                        </div>
                        <button
                            onClick={() => setShowAnalysis(false)}
                            className="text-white hover:text-purple-200 text-xl transition"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 bg-purple-800/40 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${analysis.progress.completionPercentage}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-sm text-purple-100 mt-1">
                        <span>Progress: {analysis.progress.completionPercentage}%</span>
                        <span>
                            {analysis.progress.completedSteps}/{analysis.progress.totalSteps} steps
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white/70 backdrop-blur-lg">
                    {['roadmap', 'challenges', 'skills', 'vision'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-4 text-sm font-semibold capitalize transition-all duration-300 ${activeTab === tab
                                ? 'text-purple-700 border-b-2 border-purple-600 bg-purple-50'
                                : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab === 'roadmap' && '🚀 Roadmap'}
                            {tab === 'challenges' && '🛡️ Challenges'}
                            {tab === 'skills' && '💪 Skills'}
                            {tab === 'vision' && '🎯 Vision'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 max-h-[420px] overflow-y-auto bg-gradient-to-b from-white/80 to-purple-50/60">
                    {/* Roadmap */}
                    {activeTab === 'roadmap' && (
                        <div className="space-y-6">
                            {analysis.analysis.stepByStepRoadmap.map((step, index) => (
                                <div
                                    key={index}
                                    className={`p-5 rounded-2xl border-l-4 ${step.completed
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-purple-500 bg-white'
                                        } shadow-md transition hover:shadow-lg`}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 flex items-center justify-center text-white font-bold rounded-full ${step.completed ? 'bg-green-500' : 'bg-purple-600'
                                                    }`}
                                            >
                                                {step.completed ? '✓' : step.step}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{step.title}</h4>
                                                <p className="text-sm text-gray-500">{step.timeline}</p>
                                            </div>
                                        </div>
                                        {!step.completed && (
                                            <button
                                                onClick={() => markStepCompleted(index)}
                                                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm transition"
                                            >
                                                Mark Complete
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-700 mb-3">{step.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {step.actionItems?.map((item, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Challenges */}
                    {activeTab === 'challenges' && (
                        <div className="space-y-4">
                            {analysis.analysis.potentialChallenges.map((challenge, index) => (
                                <div
                                    key={index}
                                    className="p-5 rounded-xl border border-orange-200 bg-orange-50 shadow-sm"
                                >
                                    <h4 className="font-semibold text-orange-700 mb-2">
                                        ⚠️ {challenge.challenge}
                                    </h4>
                                    <p className="text-gray-700">
                                        <span className="font-medium text-orange-600">Solution:</span>{' '}
                                        {challenge.solution}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Skills */}
                    {activeTab === 'skills' && (
                        <div className="space-y-3">
                            {analysis.analysis.skillDevelopment.map((skill, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl border border-blue-200 bg-blue-50 flex items-center gap-2"
                                >
                                    <span className="text-blue-500">💪</span>
                                    <span className="font-semibold text-gray-800">{skill}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Vision */}
                    {activeTab === 'vision' && (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-5 rounded-xl">
                                <h4 className="font-bold text-purple-800 mb-2">🌟 Long-Term Vision</h4>
                                <p className="text-gray-700">{analysis.analysis.longTermVision}</p>
                            </div>
                            <div className="bg-white border border-gray-200 p-5 rounded-xl">
                                <h4 className="font-bold text-gray-800 mb-2">💖 Emotional Significance</h4>
                                <p className="text-gray-700">{analysis.analysis.emotionalSignificance}</p>
                            </div>
                            {analysis.analysis.motivationalQuote && (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-center">
                                    <p className="italic text-yellow-800 text-lg">
                                        "{analysis.analysis.motivationalQuote}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DreamAnalysis;
