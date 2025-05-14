const examTimeoutConfig = {
    defaultTime: 180, // 3 hours in minutes
    extraTime: 60,    // 1 hour extra for visually challenged candidates
    warningTime: 30,  // Warning when 30 minutes remaining
    
    // Check remaining time
    checkRemainingTime: (startTime, duration) => {
        const now = Date.now();
        const endTime = new Date(startTime).getTime() + (duration * 60 * 1000);
        return Math.max(0, Math.floor((endTime - now) / 1000 / 60));
    },
    
    // Extend time for candidates who need it
    extendTime: (currentDuration) => {
        return currentDuration + examTimeoutConfig.extraTime;
    }
};

module.exports = examTimeoutConfig;
