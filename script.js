// Sleep Calculator - Core Script
// Based on 90-minute sleep cycle algorithm

document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    setupTabs();
    setupMobileMenu();
    setupAutoCalculate();
    calculateFromNow();
});

// --- Current Time Display ---

function updateCurrentTime() {
    var now = new Date();
    var timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    var display = document.getElementById('current-time-display');
    if (display) {
        display.textContent = timeString;
    }
}

// --- Tab Switching ---

function setupTabs() {
    var tabBtns = document.querySelectorAll('.tab-btn');
    var tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var targetTab = this.getAttribute('data-tab');

            tabBtns.forEach(function(b) { b.classList.remove('active'); });
            tabContents.forEach(function(c) { c.classList.remove('active'); });

            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            if (targetTab === 'now') {
                calculateFromNow();
            } else if (targetTab === 'custom') {
                var bedtimeInput = document.getElementById('bedtime');
                if (bedtimeInput && bedtimeInput.value) {
                    calculateFromCustom();
                }
            }
        });
    });
}

// --- Auto-Calculate on Input Change ---

function setupAutoCalculate() {
    var bedtimeInput = document.getElementById('bedtime');
    if (bedtimeInput) {
        bedtimeInput.addEventListener('input', function() {
            if (this.value) {
                calculateFromCustom();
            }
        });
    }
}

// --- Calculate From Current Time ---

function calculateFromNow() {
    var now = new Date();
    calculateSleepTimes(now.getHours(), now.getMinutes(), 'now-results');
}

// --- Calculate From Custom Bedtime ---

function calculateFromCustom() {
    var bedtimeInput = document.getElementById('bedtime');
    if (!bedtimeInput || !bedtimeInput.value) return;

    var parts = bedtimeInput.value.split(':').map(Number);
    calculateSleepTimes(parts[0], parts[1], 'custom-results');
}

// --- Core Calculation ---

function calculateSleepTimes(hour, minute, resultElementId) {
    // Add 15 minutes to fall asleep
    minute += 15;
    if (minute >= 60) {
        minute -= 60;
        hour += 1;
    }

    var totalMinutes = hour * 60 + minute;
    var results = [];

    for (var i = 0; i < 6; i++) {
        totalMinutes += 90;

        var wakeHour = Math.floor(totalMinutes / 60);
        var wakeMinute = totalMinutes % 60;
        var nextDay = false;

        if (wakeHour >= 24) {
            wakeHour -= 24;
            nextDay = true;
        }

        var timeString = String(wakeHour).padStart(2, '0') + ':' + String(wakeMinute).padStart(2, '0');
        var cycleCount = i + 1;
        var sleepHours = (cycleCount * 90) / 60;

        results.push({
            time: timeString,
            cycles: cycleCount,
            hours: sleepHours.toFixed(1),
            isRecommended: i === 5,
            nextDay: nextDay
        });
    }

    displayResults(results, resultElementId);
}

// --- Display Results ---

function displayResults(results, elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;

    var html = '';

    results.forEach(function(result) {
        var cls = result.isRecommended ? 'result-item recommended' : 'result-item';
        var badge = result.isRecommended ? '<span class="rec-badge">Recommended</span>' : '';
        var nextDayText = result.nextDay ? ' (next day)' : '';

        html += '<div class="' + cls + '">' +
            '<div class="result-left">' +
                '<span class="result-time">' + result.time + nextDayText + '</span>' +
                '<span class="result-cycles">' + result.cycles + ' sleep cycles &middot; ' + result.hours + ' hours</span>' +
            '</div>' +
            badge +
        '</div>';
    });

    // Add quality insight for the recommended result
    var best = results[results.length - 1];
    var hours = parseFloat(best.hours);
    var qualityNote = hours >= 7 && hours <= 9
        ? 'This falls within the recommended 7-9 hours for adults.'
        : hours < 7
            ? 'Note: This is less than the recommended 7-9 hours. Consider an earlier bedtime.'
            : 'Note: This exceeds 9 hours. Oversleeping may leave you feeling groggy.';

    html += '<p class="quality-note">' + qualityNote + ' Based on <a href="blog/sleep-cycle-science.html">90-minute sleep cycle science</a>.</p>';

    el.innerHTML = html;
}

// --- Mobile Menu (also used by tools page) ---

function setupMobileMenu() {
    var mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    var navMenu = document.querySelector('.nav-menu');

    if (!mobileMenuBtn || !navMenu) return;

    mobileMenuBtn.addEventListener('click', function() {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    var navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    document.addEventListener('click', function(e) {
        if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// --- Notification Helper (used by tools page) ---

function showNotification(message, type) {
    type = type || 'info';

    var notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.textContent = message;

    var bgColor;
    switch (type) {
        case 'success':
            bgColor = 'linear-gradient(135deg, #38b2ac, #319795)';
            break;
        case 'warning':
            bgColor = 'linear-gradient(135deg, #ed8936, #dd6b20)';
            break;
        default:
            bgColor = 'linear-gradient(135deg, #667eea, #764ba2)';
    }

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
        transition: 'all 0.3s ease',
        background: bgColor
    });

    document.body.appendChild(notification);

    setTimeout(function() {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// --- Navbar Scroll Effect ---

window.addEventListener('scroll', function() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// --- Keyboard Support ---

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        var activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            if (activeTab.id === 'now') {
                calculateFromNow();
            } else if (activeTab.id === 'custom') {
                calculateFromCustom();
            }
        }
    }

    if (e.key === 'Escape') {
        var mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        var navMenu = document.querySelector('.nav-menu');
        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
});
