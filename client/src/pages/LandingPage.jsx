/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import WelcomeBanner from '../components/WelcomeDreamBar';
import DreamList from '../components/DreamList';
import { dreamAPI } from '../Api/dreamApi';
import { dreamAnalysisAPI } from '../Api/dreamAnalysisApi';
import toast from 'react-hot-toast';
import Login from './Login';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingDream, setPendingDream] = useState('');
  const [analysisCount, setAnalysisCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userStats, setUserStats] = useState({
    totalDreams: 0,
    completedSteps: 0,
    totalSteps: 0,
    achievementRate: 0
  });
  const navigate = useNavigate();

  // Fetch dreams and dynamic data
  useEffect(() => {
    fetchDreams();
    if (isAuthenticated) {
      fetchUserStats();
      fetchRecentActivity();
    }
  }, [isAuthenticated, user]);

  const fetchDreams = async () => {
    try {
      console.log('🔄 Fetching dreams...', { isAuthenticated, userId: user?.id });

      if (isAuthenticated && user) {
        const response = await dreamAPI.getUserDreams();
        if (response.data.success) {
          console.log('✅ User dreams received:', response.data.dreams.length);
          setDreams(response.data.dreams);

          // Fetch analysis count
          try {
            const analysisResponse = await dreamAnalysisAPI.getAnalysisHistory();
            if (analysisResponse.data.success) {
              setAnalysisCount(analysisResponse.data.analyses.length);
            }
          } catch (analysisError) {
            console.log('No analyses yet');
          }
        }
      } else {
        setDreams([]);
      }
    } catch (error) {
      console.error('Error fetching dreams:', error);
      if (isAuthenticated) {
        toast.error('Failed to load your dreams');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Fetch user's analysis history to calculate stats
      const analysisResponse = await dreamAnalysisAPI.getAnalysisHistory();
      if (analysisResponse.data.success) {
        const analyses = analysisResponse.data.analyses;

        let totalSteps = 0;
        let completedSteps = 0;

        analyses.forEach(analysis => {
          if (analysis.analysis?.stepByStepRoadmap) {
            totalSteps += analysis.analysis.stepByStepRoadmap.length;
            completedSteps += analysis.analysis.stepByStepRoadmap.filter(step => step.completed).length;
          }
        });

        const achievementRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        setUserStats({
          totalDreams: dreams.length,
          completedSteps,
          totalSteps,
          achievementRate
        });
      }
    } catch (error) {
      console.log('Error fetching user stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Get recent dreams and analyses for activity feed
      const recentDreams = dreams.slice(0, 3).map(dream => ({
        type: 'dream',
        content: dream.content,
        timestamp: dream.createdAt,
        icon: '🌙'
      }));

      const analysisResponse = await dreamAnalysisAPI.getAnalysisHistory();
      const recentAnalyses = analysisResponse.data.analyses.slice(0, 2).map(analysis => ({
        type: 'analysis',
        content: `Analyzed: ${analysis.dream?.content?.substring(0, 50)}...`,
        timestamp: analysis.analyzedAt,
        icon: '🔮'
      }));

      const activity = [...recentDreams, ...recentAnalyses]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 4);

      setRecentActivity(activity);
    } catch (error) {
      console.log('Error fetching recent activity:', error);
    }
  };

  const handleDreamCreated = (newDream) => {
    console.log('✅ Adding new dream to list:', newDream._id);
    setDreams(prevDreams => [newDream, ...prevDreams]);
    toast.success('🎉 Dream shared successfully!', {
      duration: 3000,
      icon: '🌟'
    });

    // Update stats and activity
    setTimeout(() => {
      fetchUserStats();
      fetchRecentActivity();
    }, 1000);
  };

  const handleDreamSubmit = (dreamContent) => {
    if (!dreamContent.trim()) {
      toast.error('Please share your dream first');
      return;
    }

    if (isAuthenticated) {
      createDream(dreamContent);
    } else {
      setPendingDream(dreamContent);
      setShowAuth(true);
    }
  };

  const createDream = async (content) => {
    try {
      const response = await dreamAPI.createDream({ content });
      if (response.data.success) {
        handleDreamCreated(response.data.dream);
      }
    } catch (error) {
      console.error('Error creating dream:', error);
      toast.error('❌ Failed to share dream');
    }
  };

  const handleAuthSuccess = (newDream = null) => {
    console.log('🔄 Auth success:', { hasNewDream: !!newDream });

    if (newDream) {
      handleDreamCreated(newDream);
    } else if (pendingDream) {
      createDream(pendingDream);
      setPendingDream('');
    }

    setTimeout(() => {
      fetchDreams();
      fetchUserStats();
      fetchRecentActivity();
    }, 500);

    setShowAuth(false);
  };

  const handleLike = async (dreamId, likesCount, isLiked, updatedDream) => {
    if (!isAuthenticated) {
      toast.error('Please login to like dreams');
      return;
    }
    setDreams(prevDreams =>
      prevDreams.map(dream =>
        dream._id === dreamId ? updatedDream : dream
      )
    );
    toast.success(isLiked ? '❤️ Liked!' : '💔 Unliked');
  };

  const handleComment = async (dreamId, updatedDream) => {
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    setDreams(prevDreams =>
      prevDreams.map(dream =>
        dream._id === dreamId ? updatedDream : dream
      )
    );
  };

  const handleShare = async (dreamId, sharesCount) => {
    if (!isAuthenticated) {
      toast.error('Please login to share dreams');
      return;
    }
    setDreams(prevDreams =>
      prevDreams.map(dream =>
        dream._id === dreamId ? { ...dream, shares: sharesCount } : dream
      )
    );
    toast.success('🔗 Dream shared!');
  };

  const handleDelete = (dreamId) => {
    setDreams(prevDreams =>
      prevDreams.filter(dream => dream._id !== dreamId)
    );
    toast.success('🗑️ Dream deleted successfully', {
      icon: '✅'
    });

    // Update stats
    setTimeout(() => {
      fetchUserStats();
      fetchRecentActivity();
    }, 500);
  };

  const handleEdit = (dreamId, updatedDream) => {
    console.log('🔄 EDITING DREAM IN PARENT:', dreamId);

    setDreams(prevDreams => {
      const newDreams = prevDreams.map(dream => {
        if (dream._id === dreamId) {
          return {
            ...updatedDream,
            user: dream.user
          };
        }
        return dream;
      });

      const uniqueDreams = newDreams.filter((dream, index, self) =>
        index === self.findIndex(d => d._id === dream._id)
      );

      return uniqueDreams;
    });

    toast.success('✏️ Dream updated successfully!');
  };

  const handleAnalysisComplete = () => {
    // Update analysis count and stats when new analysis is created
    setAnalysisCount(prev => prev + 1);
    fetchUserStats();
    fetchRecentActivity();
  };

  // Calculate community stats based on user data

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50 pt-16">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Your Dreams</h3>
          <p className="text-gray-600">Preparing your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return <Login onAuthSuccess={handleAuthSuccess} initialDream={pendingDream} />;
  }

  return (
    <div className="min-h-screen">
      <div>
        <WelcomeBanner onDreamCreated={handleDreamSubmit} />

        {/* THREE COLUMN LAYOUT */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT SIDEBAR - 3 columns */}
            <div className="lg:col-span-3 space-y-6">

              {/* Dynamic User Stats Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                  <span>📊</span>
                  Your Dream Journey
                </h3>

                {/* Dynamic Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{dreams.length}</div>
                    <div className="text-sm text-blue-600 font-medium">Dreams</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{analysisCount}</div>
                    <div className="text-sm text-green-600 font-medium">Analyses</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">{userStats.completedSteps}</div>
                    <div className="text-sm text-purple-600 font-medium">Steps Done</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">{userStats.achievementRate}%</div>
                    <div className="text-sm text-orange-600 font-medium">Progress</div>
                  </div>
                </div>

                {/* Progress Overview */}
                {userStats.totalSteps > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Overall Progress</span>
                      <span>{userStats.achievementRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${userStats.achievementRate}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/analysis-history')}
                    className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-200 border border-purple-200 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">📊</span>
                    <span className="font-semibold text-gray-800">Analysis History</span>
                    <span className="ml-auto text-purple-500">→</span>
                  </button>

                  {dreams.length > 0 && (
                    <button
                      onClick={() => document.querySelector('.dream-item')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl transition-all duration-200 border border-blue-200 group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">🎯</span>
                      <span className="font-semibold text-gray-800">Analyze Dreams</span>
                      <span className="ml-auto text-blue-500">↓</span>
                    </button>
                  )}

                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-200 border border-green-200 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">✨</span>
                    <span className="font-semibold text-gray-800">Share New Dream</span>
                    <span className="ml-auto text-green-500">↑</span>
                  </button>
                </div>
              </div>
              {/* Dynamic Recent Activity */}
              {recentActivity.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🕒</span>
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="text-purple-600 text-sm">{activity.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-2">
                            {activity.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()} • {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CENTER COLUMN - 6 columns (Dreams Feed) */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl shadow-xl border overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {isAuthenticated ? 'Your Dreams ✨' : 'Share Your Dreams ✨'}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {isAuthenticated
                        ? `You have ${dreams.length} dream${dreams.length !== 1 ? 's' : ''} - ${analysisCount} with AI analysis`
                        : 'Create an account to start your dream journey'
                      }
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  {isAuthenticated ? (
                    <>
                      {dreams.length === 0 ? (
                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
                          <div className="text-6xl mb-4">🌙</div>
                          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                            No dreams yet
                          </h3>
                          <p className="text-gray-600 text-lg mb-6">
                            Share your first dream to start your journey
                          </p>
                          <p className="text-gray-500">
                            Use the banner above to share what you want to achieve
                          </p>
                        </div>
                      ) : (
                        <div className="dream-list">
                          <DreamList
                            dreams={dreams}
                            onLike={handleLike}
                            onComment={handleComment}
                            onShare={handleShare}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onAnalysisComplete={handleAnalysisComplete}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-300">
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                        Personal Dream Space
                      </h3>
                      <p className="text-gray-600 text-lg mb-6">
                        Sign in to view and manage your personal dreams with AI analysis
                      </p>
                      <button
                        onClick={() => setShowAuth(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
                      >
                        🚀 Start Your Journey
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <span>📈</span>
                  Dream Progress
                </h3>
                <div className="space-y-6">
                  {/* Dream Completion Progress */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Dream Completion</span>
                      <span className="font-semibold">{userStats.achievementRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(userStats.achievementRate, 100)}%`,
                          maxWidth: '100%'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Analysis Rate Progress */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Analysis Rate</span>
                      <span className="font-semibold">
                        {dreams.length > 0 ? Math.round((analysisCount / dreams.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.min(dreams.length > 0 ? Math.round((analysisCount / dreams.length) * 100) : 0, 100)}%`,
                          maxWidth: '100%'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Steps Completed Card */}
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                    <div className="text-2xl font-bold text-orange-600">{userStats.completedSteps}</div>
                    <div className="text-sm text-orange-600 font-medium">Steps Completed</div>
                    <div className="text-xs text-orange-500 mt-1">
                      of {userStats.totalSteps} total steps
                    </div>
                  </div>
                </div>
              </div>
              {/* Quick Tips */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <span>💡</span>
                  Success Tips
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-3 p-2 hover:bg-green-50 rounded-lg transition-colors">
                    <span className="text-green-500 text-lg mt-0.5">🎯</span>
                    <span>Be specific - detailed dreams get better AI analysis</span>
                  </li>
                  <li className="flex items-start gap-3 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                    <span className="text-blue-500 text-lg mt-0.5">📝</span>
                    <span>Use AI analysis to break big dreams into small steps</span>
                  </li>
                  <li className="flex items-start gap-3 p-2 hover:bg-purple-50 rounded-lg transition-colors">
                    <span className="text-purple-500 text-lg mt-0.5">🔄</span>
                    <span>Track progress regularly and celebrate milestones</span>
                  </li>
                  <li className="flex items-start gap-3 p-2 hover:bg-orange-50 rounded-lg transition-colors">
                    <span className="text-orange-500 text-lg mt-0.5">🌟</span>
                    <span>Share your journey - inspire others with your progress</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;



