// client/src/pages/CreateReel.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reelAPI } from '../Api/reelApi';
import toast from 'react-hot-toast';

const CreateReel = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [mediaType, setMediaType] = useState(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const isVideo = selectedFile.type.startsWith('video/');
        const isImage = selectedFile.type.startsWith('image/');

        if (!isVideo && !isImage) {
            toast.error('Only images and videos allowed');
            return;
        }

        // Size limits
        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            toast.error(isVideo ? 'Video max 50MB' : 'Image max 10MB');
            return;
        }

        setFile(selectedFile);
        setMediaType(isVideo ? 'video' : 'image');
        setPreview(URL.createObjectURL(selectedFile));
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        try {
            setIsUploading(true);

            const formData = new FormData();
            formData.append('media', file);
            formData.append('caption', caption);

            const response = await reelAPI.createReel(formData);

            if (response.data.success) {
                toast.success('Reel posted! 🎉');
                navigate('/reels');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        ←
                    </button>
                    <h1 className="text-xl font-bold">Create Reel</h1>
                    <div className="w-10"></div>
                </div>

                {/* Upload Area */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {!preview ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-pink-500 transition-colors"
                        >
                            <div className="text-6xl mb-4">📸</div>
                            <p className="text-lg font-semibold mb-2">
                                Select Image or Video
                            </p>
                            <p className="text-sm text-gray-500">
                                JPG, PNG, MP4, MOV - Image max 10MB, Video max 50MB
                            </p>
                        </div>
                    ) : (
                        <div className="relative rounded-2xl overflow-hidden bg-black">
                            {mediaType === 'video' ? (
                                <video
                                    src={preview}
                                    controls
                                    className="w-full max-h-[500px] object-contain"
                                />
                            ) : (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full max-h-[500px] object-contain"
                                />
                            )}
                            <button
                                onClick={() => {
                                    setFile(null);
                                    setPreview(null);
                                    setMediaType(null);
                                }}
                                className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                {/* Caption */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <label className="block text-sm font-semibold mb-2">
                        Caption
                    </label>
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write a caption... #hashtags"
                        rows="4"
                        maxLength="500"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">
                        {caption.length}/500
                    </p>
                </div>

                {/* Post Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isUploading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Uploading...
                        </span>
                    ) : (
                        '🚀 Post Reel'
                    )}
                </button>
            </div>
        </div>
    );
};

export default CreateReel;