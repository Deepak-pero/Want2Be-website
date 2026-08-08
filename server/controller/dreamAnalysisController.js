// controllers/dreamAnalysisController.js
import axios from 'axios';
import Dream from '../models/Dream.js';
import User from '../models/User.js'
import DreamAnalysis from '../models/DreamAnalysis.js'; // New model

export const analyzeDream = async (req, res) => {
    try {
        const { dreamId } = req.body;

        if (!dreamId) {
            return res.status(400).json({
                success: false,
                message: 'Dream ID is required'
            });
        }

        const dream = await Dream.findById(dreamId).populate('user', 'name');
        if (!dream) {
            return res.status(404).json({
                success: false,
                message: 'Dream not found'
            });
        }

        // Check if analysis already exists
        const existingAnalysis = await DreamAnalysis.findOne({ dream: dreamId });
        if (existingAnalysis) {
            return res.json({
                success: true,
                analysis: existingAnalysis,
                message: 'Analysis retrieved from cache'
            });
        }

        // 🔥 IMPROVED PROMPT - More specific and actionable
        const prompt = `
        Analyze this life dream/aspiration and provide a COMPREHENSIVE, ACTIONABLE roadmap. Be SPECIFIC and PRACTICAL.

        USER'S DREAM: "${dream.content}"

        Provide analysis in this EXACT JSON format:
        {
            "summary": "Brief but insightful summary of what this dream represents",
            "emotionalSignificance": "What this dream reveals about the user's deepest desires and values",
            "stepByStepRoadmap": [
                {
                    "step": 1,
                    "title": "Specific, actionable step title",
                    "description": "Detailed, practical description with concrete actions",
                    "timeline": "Realistic timeframe (e.g., '1-2 weeks', '1-3 months')",
                    "resourcesNeeded": ["Specific resources", "Tools required"],
                    "successIndicators": ["Measurable success metrics"]
                }
            ],
            "potentialChallenges": [
                {
                    "challenge": "Specific potential obstacle",
                    "solution": "Practical solution strategy"
                }
            ],
            "skillDevelopment": ["Specific skills needed to develop", "Learning resources"],
            "milestoneCelebrations": ["What to celebrate at each stage", "Reward ideas"],
            "motivationalQuote": "Highly relevant inspirational quote with author",
            "immediateNextSteps": ["3-5 concrete actions to start TODAY"],
            "longTermVision": "What success looks like in 1 year, 3 years, 5 years"
        }

        Make it PERSONALIZED, ACTIONABLE, and INSPIRING. Focus on PRACTICAL steps.
        `;

        const chatGPTResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-4", // Use GPT-4 for better quality
                messages: [
                    {
                        role: "system",
                        content: "You are an expert life coach and success strategist. You provide highly specific, actionable, and personalized roadmaps for achieving life dreams. You're practical, inspiring, and focus on measurable progress."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 3000,
                temperature: 0.8
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const analysisText = chatGPTResponse.data.choices[0].message.content;

        let analysisData;
        try {
            analysisData = JSON.parse(analysisText);
        } catch (parseError) {
            // Fallback analysis
            analysisData = createFallbackAnalysis(dream.content);
        }

        // Save analysis to database
        const dreamAnalysis = new DreamAnalysis({
            dream: dreamId,
            user: dream.user._id,
            analysis: analysisData,
            analyzedAt: new Date()
        });

        await dreamAnalysis.save();

        // Update user's analysis count
        await User.findByIdAndUpdate(dream.user._id, {
            $inc: { analysisCount: 1 }
        });

        res.json({
            success: true,
            analysis: dreamAnalysis,
            message: 'Dream analyzed successfully! 🎉'
        });

    } catch (error) {
        console.error('Dream analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze dream'
        });
    }
};


// In dreamAnalysisController.js - Update getAnalysisHistory
export const getAnalysisHistory = async (req, res) => {
    try {
        const analyses = await DreamAnalysis.find({ user: req.userId })
            .populate('dream', 'content createdAt') // Make sure this is working
            .sort({ analyzedAt: -1 });

        // console.log('📊 Sending analysis history:', analyses.length, 'analyses');

        res.json({
            success: true,
            analyses,
            count: analyses.length
        });
    } catch (error) {
        console.error('Error fetching analysis history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analysis history'
        });
    }
};