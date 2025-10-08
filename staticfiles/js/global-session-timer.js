// Global Session Timer - Tracks time across entire app
(function() {
    'use strict';
    
    // Check if session timer is already initialized
    if (window.globalSessionTimer) {
        return;
    }
    
    let sessionStartTime = Date.now();
    let sessionTimer = null;
    let isInitialized = false;
    
    function updateSessionTimer() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - sessionStartTime;
        
        // Convert milliseconds to hours, minutes, seconds
        const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
        
        // Format time as HH:MM:SS
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update any timer elements on the page
        const timerElements = document.querySelectorAll('.session-timer, #session-timer, #mobile-session-timer');
        timerElements.forEach(element => {
            element.textContent = formattedTime;
        });
        
        // Dispatch custom event for other scripts to listen to
        window.dispatchEvent(new CustomEvent('sessionTimerUpdate', {
            detail: {
                formattedTime: formattedTime,
                elapsedTime: elapsedTime,
                hours: hours,
                minutes: minutes,
                seconds: seconds
            }
        }));
    }
    
    // Start the session timer
    function startSessionTimer() {
        if (sessionTimer) {
            clearInterval(sessionTimer);
        }
        
        // Update immediately
        updateSessionTimer();
        
        // Update every second
        sessionTimer = setInterval(updateSessionTimer, 1000);
    }
    
    // Stop the session timer
    function stopSessionTimer() {
        if (sessionTimer) {
            clearInterval(sessionTimer);
            sessionTimer = null;
        }
    }
    
    // Get current session time
    function getCurrentSessionTime() {
        return Date.now() - sessionStartTime;
    }
    
    // Get formatted session time
    function getFormattedSessionTime() {
        const elapsedTime = getCurrentSessionTime();
        const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Save session time to localStorage
    function saveSessionTime() {
        const currentTime = Date.now();
        const sessionDuration = currentTime - sessionStartTime;
        
        // Save session time to localStorage
        const totalSessionTime = parseInt(localStorage.getItem('totalSessionTime') || '0');
        localStorage.setItem('totalSessionTime', (totalSessionTime + sessionDuration).toString());
        localStorage.setItem('lastSessionEnd', currentTime.toString());
        localStorage.setItem('sessionStartTime', sessionStartTime.toString());
    }
    
    // Initialize the global session timer
    function initializeSessionTimer() {
        if (isInitialized) {
            return;
        }
        
        // Check if there's a saved session start time
        const savedSessionStart = localStorage.getItem('sessionStartTime');
        if (savedSessionStart) {
            const savedTime = parseInt(savedSessionStart);
            const timeSinceLastSession = Date.now() - savedTime;
            
            // If less than 30 minutes since last session, continue the timer
            if (timeSinceLastSession < 30 * 60 * 1000) {
                sessionStartTime = savedTime;
            }
        }
        
        // Start the timer
        startSessionTimer();
        isInitialized = true;
        
        // Handle page visibility changes (pause/resume timer)
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                // Page is hidden, pause timer
                stopSessionTimer();
            } else {
                // Page is visible, resume timer
                startSessionTimer();
            }
        });
        
        // Handle page unload (save session time)
        window.addEventListener('beforeunload', function() {
            saveSessionTime();
        });
        
        // Handle page focus/blur
        window.addEventListener('focus', function() {
            startSessionTimer();
        });
        
        window.addEventListener('blur', function() {
            stopSessionTimer();
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSessionTimer);
    } else {
        initializeSessionTimer();
    }
    
    // Expose global session timer API
    window.globalSessionTimer = {
        start: startSessionTimer,
        stop: stopSessionTimer,
        update: updateSessionTimer,
        getCurrentTime: getCurrentSessionTime,
        getFormattedTime: getFormattedSessionTime,
        save: saveSessionTime,
        isInitialized: function() { return isInitialized; }
    };
    
    // Store session start time globally
    window.globalSessionStartTime = sessionStartTime;
    
    // Auto-save session time every 5 minutes
    setInterval(saveSessionTime, 5 * 60 * 1000);
    
})();
