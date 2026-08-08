// pages/AnalysisHistory.jsx
import React, { useState, useEffect } from 'react';
import { dreamAnalysisAPI } from '../Api/dreamAnalysisApi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const AnalysisHistory = () => {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnalysisHistory();
    }, []);

    const fetchAnalysisHistory = async () => {
        try {
            const response = await dreamAnalysisAPI.getAnalysisHistory();
            if (response.data.success) {
                console.log('📊 Analysis history:', response.data.analyses);
                setAnalyses(response.data.analyses);
            }
        } catch (error) {
            console.error('Failed to fetch analysis history:', error);
        } finally {
            setLoading(false);
        }
    };

    // Safe function to get dream content
    const getDreamContent = (analysis) => {
        if (!analysis || !analysis.dream) {
            return 'Dream content not available';
        }
        return analysis.dream.content || 'Dream content not available';
    };

    // Safe function to get analysis data
    const getAnalysisData = (analysis) => {
        if (!analysis || !analysis.analysis) {
            return {
                summary: 'Analysis not available',
                stepByStepRoadmap: [],
                keyInsights: []
            };
        }
        return analysis.analysis;
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dream Analysis History</h1>
                    <p className="text-gray-600">Your personalized dream roadmaps and insights</p>
                </div>

                {analyses.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
                        <div className="text-6xl mb-4">🔮</div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Analysis Yet</h3>
                        <p className="text-gray-600 mb-6 text-lg">
                            Analyze your dreams to see personalized roadmaps here
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                        >
                            Go Analyze Dreams
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {analyses.map((analysis, index) => {
                            const analysisData = getAnalysisData(analysis);
                            const dreamContent = getDreamContent(analysis);

                            return (
                                <div key={analysis._id || index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-xl mb-2 line-clamp-2">
                                                {dreamContent}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>
                                                    Analyzed on {analysis.analyzedAt ? new Date(analysis.analyzedAt).toLocaleDateString() : 'Unknown date'}
                                                </span>
                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                    {analysisData.stepByStepRoadmap?.length || 0} Steps
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-800 mb-2 text-lg">Summary</h4>
                                        <p className="text-gray-700 leading-relaxed">
                                            {analysisData.summary || 'No summary available'}
                                        </p>
                                    </div>

                                    {/* Key Insights */}
                                    {analysisData.keyInsights && analysisData.keyInsights.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-gray-800 mb-3 text-lg">Key Insights</h4>
                                            <div className="grid gap-2">
                                                {analysisData.keyInsights.slice(0, 3).map((insight, insightIndex) => (
                                                    <div key={insightIndex} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                        <span className="text-blue-500 text-lg">💡</span>
                                                        <span className="text-gray-700">{insight}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Motivational Quote */}
                                    {analysisData.motivationalQuote && (
                                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-4">
                                            <p className="text-yellow-800 italic text-center text-lg">
                                                "{analysisData.motivationalQuote}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {/* Navigate to detailed view */ }}
                                                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                            >
                                                <span>📖</span>
                                                View Full Analysis
                                            </button>
                                            <button
                                                onClick={() => {/* Re-analyze functionality */ }}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <span>🔄</span>
                                                Re-analyze
                                            </button>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {analysisData.stepByStepRoadmap?.length || 0} action steps
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Stats Footer */}
                {analyses.length > 0 && (
                    <div className="mt-8 text-center">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 inline-block">
                            <div className="flex gap-8">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{analyses.length}</div>
                                    <div className="text-sm text-gray-600">Total Analyses</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {analyses.filter(a => a.analysis?.stepByStepRoadmap?.length > 0).length}
                                    </div>
                                    <div className="text-sm text-gray-600">With Action Plans</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {new Set(analyses.map(a => a.dream?._id).filter(Boolean)).size}
                                    </div>
                                    <div className="text-sm text-gray-600">Unique Dreams</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisHistory;