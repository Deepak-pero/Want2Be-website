// import React, { useState, useEffect } from 'react';

// const PlayStorePopup = () => {
//     const [isVisible, setIsVisible] = useState(false);

//     useEffect(() => {
//         // Get current user from localStorage
//         const user = JSON.parse(localStorage.getItem('user') || 'null');

//         if (!user) return;

//         // Create unique key for this user
//         const userId = user._id || user.id || user.email;
//         const popupKey = `playstore_popup_${userId}`;

//         // Check if popup was already shown for this user
//         const alreadyShown = localStorage.getItem(popupKey);

//         if (!alreadyShown) {
//             // Show popup after 2 seconds
//             const timer = setTimeout(() => {
//                 setIsVisible(true);
//             }, 2000);

//             return () => clearTimeout(timer);
//         }
//     }, []);

//     const handleInstall = () => {
//         // Replace with your Play Store URL
//         window.open('https://play.google.com/store/apps/details?id=com.yourcompany.want2be', '_blank');
//         handleClose();
//     };

//     const handleClose = () => {
//         setIsVisible(false);

//         // Save that popup was shown for this user
//         const user = JSON.parse(localStorage.getItem('user') || 'null');
//         if (user) {
//             const userId = user._id || user.id || user.email;
//             const popupKey = `playstore_popup_${userId}`;
//             localStorage.setItem(popupKey, 'shown');
//         }
//     };

//     if (!isVisible) return null;

//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">

//                 {/* Close button */}
//                 <button
//                     onClick={handleClose}
//                     className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl"
//                 >
//                     ×
//                 </button>

//                 {/* Icon */}
//                 <div className="text-center mb-4">
//                     <div className="text-5xl mb-2">📱</div>
//                     <h2 className="text-xl font-bold text-gray-800">Get the App</h2>
//                     <p className="text-gray-600 text-sm mt-1">
//                         Download our app for better experience
//                     </p>
//                 </div>

//                 {/* Features */}
//                 <div className="flex justify-around mb-5 py-3 border-t border-b border-gray-100">
//                     <div className="text-center">
//                         <div className="text-lg">⚡</div>
//                         <div className="text-xs text-gray-600">Faster</div>
//                     </div>
//                     <div className="text-center">
//                         <div className="text-lg">📶</div>
//                         <div className="text-xs text-gray-600">Offline</div>
//                     </div>
//                     <div className="text-center">
//                         <div className="text-lg">🔔</div>
//                         <div className="text-xs text-gray-600">Alerts</div>
//                     </div>
//                 </div>

//                 {/* Buttons */}
//                 <button
//                     onClick={handleInstall}
//                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition mb-2"
//                 >
//                     Install from Play Store
//                 </button>

//                 <button
//                     onClick={handleClose}
//                     className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition"
//                 >
//                     Maybe Later
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default PlayStorePopup;



import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PlayStorePopup = () => {
    const { user, isAuthenticated } = useAuth();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only proceed if user is authenticated
        if (!isAuthenticated || !user) return;

        // Get stable user identifier (use email or _id)
        const userId = user._id || user.id || user.email;

        // Create unique key for this user
        const popupKey = `playstore_popup_${userId}`;

        // Check if popup was already shown for this user
        const alreadyShown = localStorage.getItem(popupKey);

        console.log('Popup check:', { userId, alreadyShown }); // Debug log

        if (!alreadyShown) {
            // Show popup after 2 seconds
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [user, isAuthenticated]); // Re-run when user changes

    const handleInstall = () => {
        // Replace with your Play Store URL
        window.open('https://play.google.com/store/apps/details?id=com.yourcompany.want2be', '_blank');
        handleClose();
    };

    const handleClose = () => {
        setIsVisible(false);

        // Save that popup was shown for this user
        if (user) {
            const userId = user._id || user.id || user.email;
            const popupKey = `playstore_popup_${userId}`;
            localStorage.setItem(popupKey, 'shown');
            console.log('Popup saved for user:', userId); // Debug log
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                >
                    ×
                </button>

                <div className="text-center mb-4">
                    <div className="text-5xl mb-2">📱</div>
                    <h2 className="text-xl font-bold text-gray-800">Get the App</h2>
                    <p className="text-gray-600 text-sm mt-1">Better experience on mobile</p>
                </div>

                <div className="flex justify-around mb-5 py-3 border-t border-b border-gray-100">
                    <div className="text-center">
                        <div className="text-lg">⚡</div>
                        <div className="text-xs text-gray-600">Faster</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg">📶</div>
                        <div className="text-xs text-gray-600">Offline</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg">🔔</div>
                        <div className="text-xs text-gray-600">Alerts</div>
                    </div>
                </div>

                <button
                    onClick={handleInstall}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition mb-2"
                >
                    Install from Play Store
                </button>

                <button
                    onClick={handleClose}
                    className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition"
                >
                    Maybe Later
                </button>
            </div>
        </div>
    );
};

export default PlayStorePopup;