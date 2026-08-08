this is code for otpservise.js this is use for fast2sms


// utils/otpService.js
import nodemailer from 'nodemailer';
import axios from 'axios';

// Generate random OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Validate Indian phone number
export const validateIndianPhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');

    const indianMobileRegex = /^[6-9]\d{9}$/;

    if (!indianMobileRegex.test(cleanPhone)) {
        return {
            isValid: false,
            error: 'Invalid Indian mobile number. Must be 10 digits starting with 6,7,8,9.',
            cleanNumber: cleanPhone
        };
    }

    return {
        isValid: true,
        cleanNumber: cleanPhone,
        formatted: `+91 ${cleanPhone}`
    };
};

// Pure Fast2SMS Service - Enhanced Version
export const sendFast2SMSOTP = async (phone, otp) => {
    try {
        // Validate phone number first
        const validation = validateIndianPhone(phone);
        if (!validation.isValid) {
            return {
                success: false,
                provider: 'Fast2SMS',
                error: validation.error
            };
        }

        const cleanPhone = validation.cleanNumber;

        console.log('🚀 Fast2SMS: Sending to', cleanPhone);
        console.log('🔑 OTP:', otp);

        // Check if API key is configured
        if (!process.env.FAST2SMS_API_KEY || process.env.FAST2SMS_API_KEY === 'your_actual_fast2sms_api_key_here') {
            const errorMsg = 'Fast2SMS API key not configured. Get FREE key from: https://fast2sms.com/dashboard.php';
            console.log('❌', errorMsg);
            return {
                success: false,
                provider: 'Fast2SMS',
                error: errorMsg
            };
        }

        console.log('📡 Calling Fast2SMS API...');

        // Enhanced Fast2SMS request with better parameters
        const response = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
                route: 'q', // 'q' for quick transactional route
                message: `Your Dream App verification code is ${otp}. Valid for 10 minutes. - Dream App Team`,
                language: 'english',
                flash: 0, // 0 for normal SMS, 1 for flash SMS
                numbers: cleanPhone
            },
            {
                headers: {
                    'Authorization': process.env.FAST2SMS_API_KEY,
                    'Content-Type': 'application/json',
                    'User-Agent': 'DreamApp/1.0'
                },
                timeout: 30000 // 30 seconds timeout
            }
        );

        console.log('📨 Fast2SMS API Response:', JSON.stringify(response.data, null, 2));

        // Handle different success responses
        if (response.data.return === true || response.data.status === 'success') {
            console.log('✅ Fast2SMS: OTP SENT SUCCESSFULLY!');
            console.log('📱 Delivered to:', cleanPhone);
            console.log('🎯 Request ID:', response.data.request_id);
            console.log('💰 Current Balance:', response.data.balance || 'N/A');

            return {
                success: true,
                provider: 'Fast2SMS',
                requestId: response.data.request_id,
                balance: response.data.balance,
                message: 'OTP sent successfully to your mobile'
            };
        } else {
            console.log('❌ Fast2SMS API Error:', response.data.message);
            return {
                success: false,
                provider: 'Fast2SMS',
                error: response.data.message || 'API returned failure status'
            };
        }

    } catch (error) {
        console.log('💥 Fast2SMS Detailed Error:');
        console.log('   Message:', error.message);
        console.log('   Status:', error.response?.status);
        console.log('   Data:', error.response?.data);

        let errorMessage = 'Network error occurred';

        if (error.response?.status === 401) {
            errorMessage = 'Invalid Fast2SMS API key. Please check your API key.';
        } else if (error.response?.status === 402) {
            errorMessage = 'Insufficient balance in Fast2SMS account.';
        } else if (error.response?.status === 403) {
            errorMessage = 'Fast2SMS account not activated or suspended.';
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            provider: 'Fast2SMS',
            error: errorMessage
        };
    }
};

// Direct SMS service using only Fast2SMS
export const sendRealSMSOTP = async (phone, otp) => {
    try {
        console.log('\n========== FAST2SMS OTP DELIVERY ==========');
        console.log('📱 Target:', phone);
        console.log('🔑 OTP:', otp);
        console.log('🕒 Timestamp:', new Date().toLocaleString());

        // Try Fast2SMS
        console.log('🔄 Step 1: Sending via Fast2SMS...');
        const fast2smsResult = await sendFast2SMSOTP(phone, otp);

        if (fast2smsResult.success) {
            console.log('🎉 SUCCESS! SMS should arrive within seconds.');
            console.log('============================================');
            return fast2smsResult;
        }

        // If Fast2SMS fails, use mock SMS with detailed instructions
        console.log('🔄 Step 2: Fast2SMS failed, using fallback...');
        return await sendEnhancedMockSMS(phone, otp, fast2smsResult.error);

    } catch (error) {
        console.error('❌ Unexpected error in SMS service:', error);
        return await sendEnhancedMockSMS(phone, otp, error.message);
    }
};

// Enhanced Mock SMS with setup instructions
export const sendEnhancedMockSMS = async (phone, otp, originalError = '') => {
    try {
        console.log('\n💡 DEVELOPMENT MODE - MOCK SMS');
        console.log('📱 To:', phone);
        console.log('🔑 OTP Code:', otp);
        console.log('📝 Message: Your Dream App verification code is ' + otp);
        console.log('⏰ Valid for: 10 minutes');
        console.log('❌ Original Error:', originalError);

        console.log('\n🔧 SETUP INSTRUCTIONS:');
        console.log('1. Go to https://fast2sms.com/dashboard.php');
        console.log('2. Sign up and get FREE API key');
        console.log('3. Add API key to your .env file:');
        console.log('   FAST2SMS_API_KEY=your_actual_api_key_here');
        console.log('4. Restart your server');
        console.log('💡 You get 100 FREE SMS per day!');
        console.log('============================================');

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            provider: 'Mock SMS (Fast2SMS not configured)',
            message: 'OTP displayed in console. Setup Fast2SMS for real SMS.',
            otp: otp,
            isFallback: true,
            setupRequired: true,
            setupUrl: 'https://fast2sms.com/dashboard.php'
        };
    } catch (error) {
        return {
            success: false,
            provider: 'Mock SMS',
            error: error.message
        };
    }
};

// Email Service (unchanged)
export const sendEmailOTP = async (email, otp) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email credentials not configured, using mock email');
            return await sendMockEmailOTP(email, otp);
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `Dream App <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Dream App Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0;">Dream App</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Verification Code</p>
                    </div>
                    <div style="padding: 40px 20px; text-align: center;">
                        <h2 style="color: #333; margin-bottom: 20px;">Your Verification Code</h2>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; display: inline-block;">
                            <div style="font-size: 42px; font-weight: bold; color: #4F46E5; letter-spacing: 8px;">
                                ${otp}
                            </div>
                        </div>
                        <p style="color: #666; margin-top: 30px;">
                            Enter this code in the app to verify your account.
                        </p>
                        <p style="color: #999; font-size: 14px; margin-top: 20px;">
                            This code will expire in 10 minutes.
                        </p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully to:', email);
        return {
            success: true,
            provider: 'Email',
            message: 'Email OTP sent successfully'
        };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return await sendMockEmailOTP(email, otp);
    }
};

// Mock email service
export const sendMockEmailOTP = async (email, otp) => {
    try {
        console.log('\n💡 MOCK EMAIL - FOR DEVELOPMENT');
        console.log('📧 To:', email);
        console.log('🔑 OTP Code:', otp);

        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            provider: 'Mock Email',
            message: 'OTP displayed in console',
            otp: otp,
            isFallback: true
        };
    } catch (error) {
        return {
            success: false,
            provider: 'Mock Email',
            error: error.message
        };
    }
};

// Main OTP sender function
export const sendSMSOTP = async (contact, otp, type = 'email') => {
    try {
        if (!type) {
            type = contact.includes('@') ? 'email' : 'phone';
        }

        console.log(`\n🎯 SENDING ${type.toUpperCase()} OTP`);
        console.log('📞 Contact:', contact);
        console.log('🔐 OTP:', otp);

        if (type === 'email') {
            return await sendEmailOTP(contact, otp);
        } else if (type === 'phone') {
            return await sendRealSMSOTP(contact, otp);
        }

        return {
            success: false,
            error: 'Invalid OTP type'
        };
    } catch (error) {
        console.error('Send OTP error:', error);
        return {
            success: false,
            error: error.message
        };
    }


this is for authcontroller.js

// controllers/authController.js
import User from '../models/user.js';
import { generateOTP, sendEmailOTP, sendSMSOTP, validateIndianPhone } from '../utils/otpService.js';
import jwt from 'jsonwebtoken';

// Request OTP
export const requestOTP = async (req, res) => {
    let otpCode;

    try {
        const { name, email, phone, dream } = req.body;

        console.log('\n📥 OTP Request:', { name, email: email || 'N/A', phone: phone || 'N/A', dream });

        // Validation
        if (!name || !dream) {
            return res.status(400).json({
                success: false,
                message: 'Name and dream are required'
            });
        }

        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Either email or phone is required'
            });
        }

        // Phone validation
        if (phone) {
            const validation = validateIndianPhone(phone);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: validation.error
                });
            }
        }

        // Generate OTP
        otpCode = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        console.log('🔑 Generated OTP:', otpCode);

        // Find or create user
        let user = await User.findOne({
            $or: [
                { email: email || '' },
                { phone: phone || '' }
            ].filter(condition => Object.values(condition)[0] !== '')
        });

        if (user) {
            user.otp = { code: otpCode, expiresAt: otpExpires };
            user.dream = dream;
            console.log('🔄 Updating user:', user._id);
        } else {
            user = new User({
                name,
                email: email || undefined,
                phone: phone || undefined,
                dream,
                otp: { code: otpCode, expiresAt: otpExpires }
            });
            console.log('🆕 Creating new user');
        }

        await user.save();

        // Send OTP
        let otpResult;
        if (email) {
            console.log('📧 Sending Email OTP...');
            otpResult = await sendEmailOTP(email, otpCode);
        } else {
            console.log('📱 Sending SMS OTP via Fast2SMS...');
            otpResult = await sendSMSOTP(phone, otpCode, 'phone');
        }

        // Response
        const response = {
            success: otpResult.success,
            message: otpResult.success ? 'OTP sent successfully' : (otpResult.error || 'Failed to send OTP'),
            userId: user._id,
            provider: otpResult.provider,
            developmentOtp: otpCode,
            ...(otpResult.setupRequired && {
                setupUrl: 'https://fast2sms.com/dashboard.php',
                setupInstructions: 'Get FREE API key from Fast2SMS for real SMS delivery'
            })
        };

        const statusCode = otpResult.success ? 200 : 500;
        res.status(statusCode).json(response);

    } catch (error) {
        console.error('💥 Request OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            developmentOtp: otpCode
        });
    }
};

// Verify OTP (unchanged)
export const verifyOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;

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
                message: 'OTP not requested'
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

        // Success
        user.isVerified = true;
        user.otp = undefined;
        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'dream-app-secret',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                dream: user.dream,
                isVerified: true
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Other functions remain the same...
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
                dream: user.dream,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


