import { dreamAPI } from '../Api/dreamApi';
import toast from 'react-hot-toast';

export const shareDreamToPlatform = async (dream, onShareCountUpdate) => {
    const userId = dream.user?._id || dream.user?.id;
    const shareUrl = userId
        ? `${window.location.origin}/profile/${userId}`
        : window.location.origin;

    const preview = dream.content?.length > 120
        ? `${dream.content.substring(0, 120)}...`
        : dream.content;

    const shareText = `"${preview}" — shared from Want2Be ✨`;
    const shareData = {
        title: `${dream.user?.name || 'Someone'}'s Dream on Want2Be`,
        text: shareText,
        url: shareUrl
    };

    try {
        if (navigator.share && navigator.canShare?.(shareData)) {
            await navigator.share(shareData);
        } else if (navigator.share) {
            await navigator.share({ title: shareData.title, text: shareText, url: shareUrl });
        } else {
            await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
            toast.success('Link copied! Paste it anywhere to share 🔗');
        }

        const res = await dreamAPI.shareDream(dream._id);
        if (res.data.success && onShareCountUpdate) {
            onShareCountUpdate(dream._id, res.data.shares);
        }

        return true;
    } catch (error) {
        if (error?.name === 'AbortError') return false;

        try {
            await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
            toast.success('Link copied to clipboard! 🔗');

            const res = await dreamAPI.shareDream(dream._id);
            if (res.data.success && onShareCountUpdate) {
                onShareCountUpdate(dream._id, res.data.shares);
            }
            return true;
        } catch {
            toast.error('Failed to share dream');
            return false;
        }
    }
};
