// Dashboard Mobile Navigation and Interactions
document.addEventListener('DOMContentLoaded', function() {
    // Use global session timer if available, otherwise create new one
    let sessionStartTime = window.globalSessionStartTime || Date.now();
    let sessionTimer = null;
    
    function updateSessionTimer() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - sessionStartTime;
        
        // Convert milliseconds to hours, minutes, seconds
        const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
        
        // Format time as HH:MM:SS
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update desktop timer
        const desktopTimer = document.getElementById('session-timer');
        if (desktopTimer) {
            desktopTimer.textContent = formattedTime;
        }
        
        // Update mobile timer
        const mobileTimer = document.getElementById('mobile-session-timer');
        if (mobileTimer) {
            mobileTimer.textContent = formattedTime;
        }
    }
    
    // Start the session timer
    function startSessionTimer() {
        // Clear any existing timer
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
    
    // Use global timer if available, otherwise initialize local timer
    if (window.globalSessionTimer) {
        // Use the global timer functions
        window.globalSessionTimer.update = updateSessionTimer;
        // The global timer is already running, just update our display
        updateSessionTimer();
        sessionTimer = setInterval(updateSessionTimer, 1000);
    } else {
        // Initialize local session timer
        startSessionTimer();
        
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
            const currentTime = Date.now();
            const sessionDuration = currentTime - sessionStartTime;
            
            // Save session time to localStorage
            const totalSessionTime = parseInt(localStorage.getItem('totalSessionTime') || '0');
            localStorage.setItem('totalSessionTime', (totalSessionTime + sessionDuration).toString());
            localStorage.setItem('lastSessionEnd', currentTime.toString());
        });
    }
    
    // Display total session time from localStorage
    function displayTotalSessionTime() {
        const totalTime = parseInt(localStorage.getItem('totalSessionTime') || '0');
        const hours = Math.floor(totalTime / (1000 * 60 * 60));
        const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
        
        // You can add a tooltip or additional display for total time
        console.log(`Total session time: ${hours}h ${minutes}m`);
    }
    
    // Display total time on page load
    displayTotalSessionTime();
    
    // Add session time to user stats (optional)
    function updateUserStats() {
        const totalTime = parseInt(localStorage.getItem('totalSessionTime') || '0');
        const currentSession = Date.now() - sessionStartTime;
        const totalSessionTime = totalTime + currentSession;
        
        // Convert to hours for display
        const totalHours = Math.floor(totalSessionTime / (1000 * 60 * 60));
        
        // Update any stats display if needed
        const statsElements = document.querySelectorAll('.stat-number');
        statsElements.forEach(element => {
            if (element.textContent.includes('XP')) {
                // You could add session time as additional info
                element.title = `Total session time: ${totalHours}h`;
            }
        });
    }
    
    // Update stats every minute
    setInterval(updateUserStats, 60000);
    // Mobile Navigation Tabs
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    const mobileTabContents = document.querySelectorAll('.mobile-tab-content');

    mobileNavItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all nav items
            mobileNavItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked nav item
            this.classList.add('active');
            
            // Hide all tab contents
            mobileTabContents.forEach(content => content.classList.remove('active'));
            
            // Show target tab content
            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Wire desktop "MY CLUBS" nav to /api/clubs/
    const desktopMyClubsNav = Array.from(document.querySelectorAll('.sidebar-nav .nav-item'))
        .find(node => node && node.textContent && node.textContent.trim().toUpperCase().includes('MY CLUBS'));
    if (desktopMyClubsNav) {
        desktopMyClubsNav.style.cursor = 'pointer';
        desktopMyClubsNav.addEventListener('click', function() {
            window.location.href = '/api/clubs/';
        });
    }

    // Wire mobile "Clubs" tab to /api/clubs/
    const mobileMyClubsTab = document.querySelector('.mobile-nav-item[data-tab="clubs"]');
    if (mobileMyClubsTab) {
        mobileMyClubsTab.style.cursor = 'pointer';
        mobileMyClubsTab.addEventListener('dblclick', function() {
            // Use double-click to allow single click to still switch tabs locally
            window.location.href = '/api/clubs/';
        });
        // Also long-press redirect (for touch)
        let pressTimer;
        mobileMyClubsTab.addEventListener('touchstart', function() {
            pressTimer = setTimeout(() => { window.location.href = '/api/clubs/'; }, 600);
        });
        mobileMyClubsTab.addEventListener('touchend', function() {
            clearTimeout(pressTimer);
        });
    }

    // If club cards have data-id, navigate to that club dashboard
    const clubCardsNavigate = document.querySelectorAll('.club-card[data-club-id]');
    clubCardsNavigate.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const clubId = this.getAttribute('data-club-id');
            if (clubId) {
                window.location.href = `/clubs/${clubId}/dashboard/`;
            }
        });
    });

    // Mobile Widget Interactions
    const mobileWidgets = document.querySelectorAll('.mobile-widget');
    mobileWidgets.forEach(widget => {
        widget.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Task Checkbox Functionality
    const taskCheckboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = this.nextElementSibling;
            if (this.checked) {
                label.style.textDecoration = 'line-through';
                label.style.opacity = '0.6';
            } else {
                label.style.textDecoration = 'none';
                label.style.opacity = '1';
            }
        });
    });

    // Mobile Reel Interactions
    const mobileReelItems = document.querySelectorAll('.mobile-reel-item');
    mobileReelItems.forEach(reel => {
        const playButton = reel.querySelector('.play-button');
        const actionBtns = reel.querySelectorAll('.action-btn');
        
        if (playButton) {
            playButton.addEventListener('click', function() {
                // Simulate video play
                this.style.opacity = '0.5';
                this.textContent = '⏸';
                setTimeout(() => {
                    this.style.opacity = '0.8';
                    this.textContent = '▶';
                }, 2000);
            });
        }
        
        actionBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                this.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
        });
    });

    // Club Card Interactions
    const clubCards = document.querySelectorAll('.club-card');
    clubCards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'translateY(-2px)';
            setTimeout(() => {
                this.style.transform = 'translateY(0)';
            }, 200);
        });
    });

    // Message Item Interactions
    const messageItems = document.querySelectorAll('.message-item');
    messageItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.background = 'rgba(255, 255, 255, 0.08)';
            setTimeout(() => {
                this.style.background = 'rgba(255, 255, 255, 0.05)';
            }, 200);
        });
    });

    // Parallax Effect for Background
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.earth-container, .orbit, .particle');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);

    // Smooth scrolling for mobile
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Notification Badge Animation
    const notificationBadges = document.querySelectorAll('.notification-badge');
    notificationBadges.forEach(badge => {
        badge.addEventListener('click', function() {
            this.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        });
    });

    // Add loading animation for mobile widgets
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe mobile widgets for animation
    mobileWidgets.forEach(widget => {
        widget.style.opacity = '0';
        widget.style.transform = 'translateY(20px)';
        widget.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(widget);
    });

    // Add ripple effect to mobile widgets
    mobileWidgets.forEach(widget => {
        widget.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add ripple effect CSS
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
