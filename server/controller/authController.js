// controllers/authController.js
import User from '../models/User.js';
import Dream from '../models/Dream.js';
import cloudinary from '../utils/cloudinary.js';
import upload from '../middleware/multer.js';
import { generateOTP, sendEmailOTP, sendSMSOTP, validateIndianPhone } from '../utils/otpService.js';
import jwt from 'jsonwebtoken';

// Request OTP
export const requestOTP = async (req, res) => {
    let otpCode;

    try {
        const { name, email, phone, dream, isLogin } = req.body;


        // Handle login flow
        if (isLogin) {
            if (!email && !phone) {
                return res.status(400).json({
                    success: false,
                    message: 'Either email or phone is required for login'
                });
            }

            let user = await User.findOne({
                $or: [
                    { email: email || '' },
                    { phone: phone || '' }
                ].filter(condition => {
                    const value = Object.values(condition)[0];
                    return value !== '';
                })
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found. Please create an account first.'
                });
            }

            otpCode = generateOTP();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

            user.otp = {
                code: otpCode,
                expiresAt: otpExpires
            };

            await user.save();

            let otpResult;
            if (email) {
                otpResult = await sendEmailOTP(email, otpCode);
            } else if (phone) {
                otpResult = await sendSMSOTP(phone, otpCode, 'phone');
            }

            if (!otpResult || !otpResult.success) {
                return res.status(500).json({
                    success: false,
                    message: otpResult?.error || 'Failed to send OTP',
                    developmentOtp: otpCode
                });
            }

            return res.status(200).json({
                success: true,
                message: 'OTP sent successfully for login',
                userId: user._id,
                isLogin: true,
                provider: otpResult.provider,
                developmentOtp: otpCode
            });
        }

        // Handle create account flow - NO DREAM VALIDATION IN USER
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Either email or phone is required'
            });
        }

        if (phone) {
            const validation = validateIndianPhone(phone);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validation.error
                });
            }
        }

        const existingUser = await User.findOne({
            $or: [
                { email: email || '' },
                { phone: phone || '' }
            ].filter(condition => {
                const value = Object.values(condition)[0];
                return value !== '';
            })
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Account already exists with this email or phone. Please login instead.'
            });
        }

        otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Create user WITHOUT dream field
        const user = new User({
            name,
            email: email || undefined,
            phone: phone || undefined,
            otp: {
                code: otpCode,
                expiresAt: otpExpires
            }
        });

        await user.save();

        let otpResult;
        if (email) {
            otpResult = await sendEmailOTP(email, otpCode);
        } else if (phone) {
            otpResult = await sendSMSOTP(phone, otpCode, 'phone');
        }

        if (!otpResult || !otpResult.success) {
            return res.status(500).json({
                success: false,
                message: otpResult?.error || 'Failed to send OTP',
                developmentOtp: otpCode
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully for account creation',
            userId: user._id,
            isLogin: false,
            provider: otpResult.provider,
            developmentOtp: otpCode
        });

    } catch (error) {
        console.error('❌ Request OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            developmentOtp: otpCode
        });
    }
};

// Verify OTP - DREAM GOES DIRECTLY TO DREAM MODEL
export const verifyOTP = async (req, res) => {
    try {
        const { userId, otp, isLogin, dream } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({
                success: false,
                message: 'User ID and OTP are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }


        if (!user.otp || !user.otp.code) {
            return res.status(400).json({
                success: false,
                message: 'OTP not requested or has expired'
            });
        }

        if (user.otp.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        if (user.otp.code !== otp) {
            user.otp.attempts = (user.otp.attempts || 0) + 1;
            await user.save();

            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        user.isVerified = true;
        user.otp = undefined;

        let newDreamPost = null;

        // 🔥 CRITICAL: For new users, store dream DIRECTLY in Dream model
        if (!isLogin && dream && dream.trim()) {

            try {
                // Create dream post directly in Dream model
                const dreamPost = new Dream({
                    content: dream.trim(),
                    user: user._id,
                    dreamType: 'text',
                    likes: [],
                    comments: [],
                    shares: 0,
                    isInitialDream: true
                });

                await dreamPost.save();

                // Populate for response
                newDreamPost = await Dream.findById(dreamPost._id)
                    .populate('user', 'name profilePicture email phone')
                    .lean();


            } catch (dreamError) {
                console.error('❌ Error creating dream post:', dreamError);
                // Don't fail registration if dream creation fails
            }
        } else if (!isLogin) {
            // console.log('ℹ️ No dream provided for new user registration');
        }

        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'dream-app-secret',
            { expiresIn: '7d' }
        );


        // Response - NO DREAM FIELD IN USER OBJECT
        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profilePicture || "",
                bio: user.bio || "",
                isVerified: user.isVerified
            },
            newDream: newDreamPost // Only from Dream model
        });

    } catch (error) {
        console.error('❌ Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Resend OTP
export const resendOTP = async (req, res) => {
    let otpCode;

    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = {
            code: otpCode,
            expiresAt: otpExpires
        };

        await user.save();

        let otpResult;
        if (user.email) {
            otpResult = await sendEmailOTP(user.email, otpCode);
        } else if (user.phone) {
            otpResult = await sendSMSOTP(user.phone, otpCode, 'phone');
        }

        if (!otpResult || !otpResult.success) {
            return res.status(500).json({
                success: false,
                message: otpResult?.error || 'Failed to resend OTP',
                developmentOtp: otpCode
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP resent successfully',
            provider: otpResult.provider,
            developmentOtp: otpCode
        });

    } catch (error) {
        console.error('❌ Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            developmentOtp: otpCode
        });
    }
};

// Get Current User - NO DREAM FIELD
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-otp -__v');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profilePicture,
                bio: user.bio,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }
            // NO DREAM FIELD - Dreams are in Dream model
        });
    } catch (error) {
        console.error('❌ Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


export const updateProfileWithUpload = async (req, res) => {
    try {
        console.log('🔄 Update Profile Request Received');
        console.log('📂 req.file:', req.file ? 'Present' : 'Missing');

        const { name, bio, email, phone } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update text fields
        user.name = name.trim();
        user.bio = bio ? bio.trim() : '';
        user.email = email ? email.trim() : user.email;
        user.phone = phone ? phone.trim() : user.phone;

        // 🔥 IMAGE UPLOAD (CLOUDINARY)
        if (req.file) {

            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                {
                    folder: "profile-pictures",
                }
            );

            user.profilePicture = result.secure_url;
            console.log('✅ Cloudinary image saved:', user.profilePicture);
        }

        // Remove photo
        if (req.body.removePhoto === 'true') {
            user.profilePicture = '';
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                bio: user.bio,
                profilePicture: user.profilePicture,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};