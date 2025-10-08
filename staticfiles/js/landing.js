// Landing page JavaScript for animations and interactions

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-items a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add click animation to CTA button
    const ctaBtn = document.querySelector('.cta-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', function(e) {
            // Create ripple effect
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
    }

    // Parallax effect for background elements
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.bg-animation');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.card, .hero h1, .hero p');
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // Add stagger animation to cards
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.2}s`;
    });

    // Global session timer is handled by global-session-timer.js

    // Translation functionality
    const langButtons = document.querySelectorAll('.lang-btn');
    let currentLang = 'en';

    function translatePage(lang) {
        const t = translations[lang];
        if (!t) return;

        // Update navigation
        document.querySelectorAll('.nav-items a')[0].textContent = t.about;
        document.querySelectorAll('.nav-items a')[1].textContent = t.features;
        document.querySelectorAll('.nav-items a')[2].textContent = t.institutions;
        document.querySelectorAll('.nav-items a')[3].textContent = t.showcase;
        document.querySelector('.join-btn').textContent = t.join;

        // Update hero section
        document.querySelector('.hero p').innerHTML = `ONE PLACE <span class="highlight">for</span> ${t.heroSubtitle.split('for')[1] || t.heroSubtitle}`;

        // Update cards
        const cards = document.querySelectorAll('.card');
        if (cards.length >= 2) {
            cards[0].querySelector('h3').textContent = t.boostCollaboration;
            cards[0].querySelector('p').textContent = t.boostDescription;
            cards[0].querySelector('.card-btn-text').textContent = t.discoverMore;
            
            cards[1].querySelector('h3').textContent = t.understandConnections;
            cards[1].querySelector('p').textContent = t.connectionsDescription;
            cards[1].querySelector('.card-btn-text').textContent = t.discoverMore;
        }

        // Update CTA button
        document.querySelector('.cta-btn').textContent = t.joinMovement;

        // Update additional cards
        const additionalCards = document.querySelectorAll('.additional-cards .card');
        const cardTitles = [t.studyGroups, t.eventCalendar, t.fileSharing, t.realtimeChat, t.progressTracking, t.mobileApp];
        const cardDescriptions = [t.studyGroupsDesc, t.eventCalendarDesc, t.fileSharingDesc, t.realtimeChatDesc, t.progressTrackingDesc, t.mobileAppDesc];
        
        additionalCards.forEach((card, index) => {
            if (cardTitles[index]) {
                card.querySelector('h3').textContent = cardTitles[index];
                card.querySelector('p').textContent = cardDescriptions[index];
            }
        });

        // Update features section
        if (document.querySelector('.features-section h2')) {
            document.querySelector('.features-section h2').textContent = t.whyChooseVenti;
        }

        const featureItems = document.querySelectorAll('.feature-item');
        const featureTitles = [t.academicFocus, t.innovation, t.globalCommunity];
        const featureDescriptions = [t.academicFocusDesc, t.innovationDesc, t.globalCommunityDesc];

        featureItems.forEach((item, index) => {
            if (featureTitles[index]) {
                item.querySelector('h3').textContent = featureTitles[index];
                item.querySelector('p').textContent = featureDescriptions[index];
            }
        });

        // Update statistics
        const statLabels = document.querySelectorAll('.stat-label');
        const labelTexts = [t.activeStudents, t.studyGroups, t.universities, t.satisfactionRate];
        
        statLabels.forEach((label, index) => {
            if (labelTexts[index]) {
                label.textContent = labelTexts[index];
            }
        });

        currentLang = lang;
    }

    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            langButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected language and translate
            const selectedLang = this.getAttribute('data-lang');
            translatePage(selectedLang);
        });
    });
});

// Add ripple effect CSS dynamically
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
