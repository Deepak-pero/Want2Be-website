// utils/otpService.js
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import axios from 'axios';

// Generate random OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Validate Indian phone number
export const validateIndianPhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');

    // Indian mobile numbers: 10 digits, starting with 6-9
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

// Fast2SMS Free SMS Service (100 free SMS per day)
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

        console.log('📱 Sending Fast2SMS to:', cleanPhone);

        // Check if API key is configured
        if (!process.env.FAST2SMS_API_KEY) {
            return {
                success: false,
                provider: 'Fast2SMS',
                error: 'Fast2SMS API key not configured'
            };
        }

        const response = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
                route: 'otp',
                variables_values: otp,
                numbers: cleanPhone,
                flash: 0
            },
            {
                headers: {
                    'Authorization': process.env.FAST2SMS_API_KEY,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );

        console.log('📡 Fast2SMS Response:', response.data);

        if (response.data.return === true) {
            console.log('✅ Fast2SMS: OTP sent successfully! Request ID:', response.data.request_id);
            return {
                success: true,
                provider: 'Fast2SMS',
                requestId: response.data.request_id,
                message: 'SMS OTP sent via Fast2SMS'
            };
        }

        console.log('❌ Fast2SMS failed:', response.data.message);
        return {
            success: false,
            provider: 'Fast2SMS',
            error: response.data.message || 'Unknown error from Fast2SMS'
        };

    } catch (error) {
        console.log('❌ Fast2SMS error:', error.response?.data || error.message);
        return {
            success: false,
            provider: 'Fast2SMS',
            error: error.response?.data?.message || error.message
        };
    }
};

// Enhanced SMS service with multiple fallbacks
export const sendRealSMSOTP = async (phone, otp) => {
    try {
        // Validate phone number first
        const validation = validateIndianPhone(phone);
        if (!validation.isValid) {
            console.log('❌ Invalid phone number:', validation.error);
            return await sendMockSMSOTP(phone, otp);
        }

        const cleanPhone = validation.cleanNumber;

        // Try Fast2SMS first (FREE)
        console.log('🔄 Trying Fast2SMS (Free)...');
        const fast2smsResult = await sendFast2SMSOTP(cleanPhone, otp);

        if (fast2smsResult.success) {
            return fast2smsResult;
        }

        // Fallback to Twilio if configured
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            // console.log('🔄 Fast2SMS failed, trying Twilio...');
            const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

            // Twilio needs +91 country code
            const twilioPhoneNumber = `+91${cleanPhone}`;

            await client.messages.create({
                body: `Your Dream App OTP code is: ${otp}. This OTP will expire in 10 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: twilioPhoneNumber
            });

            console.log('✅ Twilio SMS sent successfully to:', twilioPhoneNumber);
            return {
                success: true,
                provider: 'Twilio',
                message: 'SMS OTP sent via Twilio'
            };
        }

        // Final fallback to mock SMS
        console.log('🔄 All SMS services failed, using mock SMS...');
        return await sendMockSMSOTP(phone, otp);

    } catch (error) {
        console.error('❌ All SMS services failed:', error.message);
        console.log('🔄 Using mock SMS as final fallback...');
        return await sendMockSMSOTP(phone, otp);
    }
};

// Mock SMS service for development
export const sendMockSMSOTP = async (phone, otp) => {
    try {
        console.log('📱 Mock SMS OTP:', {
            to: phone,
            otp: otp,
            message: `Your Dream App OTP code is: ${otp}. This OTP will expire in 10 minutes.`
        });

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            provider: 'Mock SMS',
            message: 'OTP displayed in console (development mode)',
            otp: otp,
            isFallback: true
        };
    } catch (error) {
        console.error('Mock SMS error:', error);
        return {
            success: false,
            provider: 'Mock SMS',
            error: error.message
        };
    }
};

// Enhanced Email service with better error handling
export const sendEmailOTP = async (email, otp) => {
    try {
        // If email credentials not configured, use mock email
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
            subject: 'Your Dream App OTP Code',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Want2Be App</h1>
          </div>
          <div style="padding: 30px 20px;">
            <h2 style="color: #333; text-align: center;">Verification Code</h2>
            <p style="color: #666; text-align: center; font-size: 16px;">Your OTP code for verification is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; padding: 15px 30px; background: #f8f9fa; border: 2px dashed #4F46E5; border-radius: 8px;">
                <span style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px;">${otp}</span>
              </div>
            </div>
            <p style="color: #999; text-align: center; font-size: 14px;">
              This OTP will expire in 10 minutes.<br>
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0; ">
              © 2025 Want2Be App. All rights reserved.
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
        console.log('🔄 Falling back to mock email...');
        return await sendMockEmailOTP(email, otp);
    }
};

// Mock email service for development
export const sendMockEmailOTP = async (email, otp) => {
    try {
        console.log('📧 Mock Email OTP:', {
            to: email,
            otp: otp,
            message: `Your Dream App OTP code is: ${otp}`
        });

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            provider: 'Mock Email',
            message: 'OTP displayed in console (development mode)',
            otp: otp,
            isFallback: true
        };
    } catch (error) {
        console.error('Mock email error:', error);
        return {
            success: false,
            provider: 'Mock Email',
            error: error.message
        };
    }
};

// Main OTP sender function that chooses the right method
export const sendSMSOTP = async (contact, otp, type = 'email') => {
    try {
        // Auto-detect type if not provided
        if (!type) {
            type = contact.includes('@') ? 'email' : 'phone';
        }

        console.log(`\n========== SENDING ${type.toUpperCase()} OTP ==========`);
        console.log('📧 Contact:', contact);
        console.log('🔑 OTP:', otp);

        if (type === 'email') {
            return await sendEmailOTP(contact, otp);
        } else if (type === 'phone') {
            return await sendRealSMSOTP(contact, otp);
        }

        return {
            success: false,
            error: 'Invalid OTP type. Use "email" or "phone".'
        };
    } catch (error) {
        console.error('Send OTP error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};




