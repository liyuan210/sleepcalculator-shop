// Sleep Calculator JavaScript Code
// Based on 90-minute sleep cycle algorithm

// Execute after page loads
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000); // Update time every second
    setupTabs();
    setupSmoothScroll();
    setupMobileMenu();
});

// Update current time display
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    const timeDisplay = document.getElementById('current-time-display');
    if (timeDisplay) {
        timeDisplay.textContent = timeString;
    }
}

// Setup tab switching functionality
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove all active states
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active state
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Setup smooth scrolling
function setupSmoothScroll() {
    // Handle smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Calculate optimal wake-up time from current time
function calculateFromNow() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    calculateSleepTimes(hour, minute, 'now-results');
}

// Calculate optimal wake-up time from custom time
function calculateFromCustom() {
    const bedtimeInput = document.getElementById('bedtime').value;
    if (!bedtimeInput) {
        showNotification('Please select a bedtime!', 'warning');
        return;
    }
    
    const [hour, minute] = bedtimeInput.split(':').map(Number);
    calculateSleepTimes(hour, minute, 'custom-results');
}

// Core sleep time calculation function (based on Python code logic)
function calculateSleepTimes(hour, minute, resultElementId) {
    // Add 15 minutes for falling asleep
    minute += 15;
    if (minute >= 60) {
        minute -= 60;
        hour += 1;
    }
    
    // Convert to total minutes
    let totalMinutes = hour * 60 + minute;
    
    const results = [];
    
    // Calculate 6 sleep cycles (90 minutes each)
    for (let i = 0; i < 6; i++) {
        totalMinutes += 90; // Add one sleep cycle
        
        let wakeHour = Math.floor(totalMinutes / 60);
        let wakeMinute = totalMinutes % 60;
        
        // Handle next day cases
        let nextDay = false;
        if (wakeHour >= 24) {
            wakeHour -= 24;
            nextDay = true;
        }
        
        // Format time display
        const timeString = `${wakeHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
        const cycleCount = i + 1;
        const sleepHours = (cycleCount * 90) / 60;
        
        results.push({
            time: timeString,
            cycles: cycleCount,
            hours: sleepHours.toFixed(1),
            isRecommended: i === 5, // Last one is recommended
            nextDay: nextDay
        });
    }
    
    displayResults(results, resultElementId);
    
    // Show success notification
    showNotification('Calculation complete! We recommend choosing the highlighted wake-up time.', 'success');
}

// Display calculation results
function displayResults(results, elementId) {
    const resultElement = document.getElementById(elementId);
    
    let html = '<h4>🌅 Optimal Wake-up Times:</h4>';
    
    results.forEach((result, index) => {
        const recommendedClass = result.isRecommended ? ' recommended' : '';
        const nextDayText = result.nextDay ? ' (next day)' : '';
        
        html += `
            <div class="result-item${recommendedClass}">
                <div>
                    <div class="result-time">${result.time}${nextDayText}</div>
                    <div class="result-cycles">${result.cycles} sleep cycles (${result.hours} hours of sleep)</div>
                </div>
            </div>
        `;
    });
    
    html += '<p style="margin-top: 20px; color: #718096; font-style: italic; text-align: center;">💡 We recommend waking up at the highlighted time for best results!</p>';
    
    resultElement.innerHTML = html;
    
    // Add animation effects
    setTimeout(() => {
        const items = resultElement.querySelectorAll('.result-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = 'all 0.5s ease';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, 50);
            }, index * 100);
        });
    }, 100);
}

// Show notification message
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Styling
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    // Set color based on type
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #38b2ac, #319795)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #ed8936, #dd6b20)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show animation
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto hide
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Format time display
function formatTime(hour, minute) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Add page scroll effects
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// Setup mobile menu functionality
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// Add keyboard support
document.addEventListener('keydown', function(e) {
    // Enter key triggers calculation
    if (e.key === 'Enter') {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            if (activeTab.id === 'now') {
                calculateFromNow();
            } else if (activeTab.id === 'custom') {
                calculateFromCustom();
            }
        }
    }
    
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navMenu = document.querySelector('.nav-menu');
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
}); 