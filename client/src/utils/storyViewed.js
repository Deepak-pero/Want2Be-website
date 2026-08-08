const VIEWED_STORIES_KEY = 'want2be_viewed_stories';

export const markStoryGroupViewed = (userId) => {
    if (!userId) return;
    try {
        const viewed = JSON.parse(localStorage.getItem(VIEWED_STORIES_KEY) || '{}');
        viewed[String(userId)] = Date.now();
        localStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify(viewed));
    } catch {
        // ignore storage errors
    }
};

export const getViewedStoryGroups = () => {
    try {
        return JSON.parse(localStorage.getItem(VIEWED_STORIES_KEY) || '{}');
    } catch {
        return {};
    }
};
