// utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();


// Check if all required environment variables are present
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ MISSING CLOUDINARY CREDENTIALS!');
    console.error('Please check your .env file and make sure all Cloudinary variables are set.');
} else {
    console.log('✅ All Cloudinary credentials found');
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the configuration
cloudinary.api.ping()
    .then(result => {
    })
    .catch(error => {
        console.error('❌ Cloudinary connection test: FAILED');
        console.error('❌ Error:', error.message);
    });

export default cloudinary;