// Sleep Calculator JavaScript Code
// Based on 90-minute sleep cycle algorithm

// Execute after page loads
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000); // Update time every second
    setupTabs();
    setupSmoothScroll();
    setupMobileMenu();
    setupScheduleMode();
});

// Update current time display
function updateCurrentTime() {
    const timezoneSelect = document.getElementById('timezone-now');
    const selectedTimezone = timezoneSelect ? timezoneSelect.value : 'local';
    
    let now;
    if (selectedTimezone === 'local') {
        now = new Date();
    } else {
        now = new Date().toLocaleString("en-US", {timeZone: selectedTimezone});
        now = new Date(now);
    }
    
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
    const timezoneSelect = document.getElementById('timezone-now');
    const selectedTimezone = timezoneSelect ? timezoneSelect.value : 'local';
    
    let now;
    if (selectedTimezone === 'local') {
        now = new Date();
    } else {
        now = new Date().toLocaleString("en-US", {timeZone: selectedTimezone});
        now = new Date(now);
    }
    
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    calculateSleepTimes(hour, minute, 'now-results', selectedTimezone);
}

// Calculate optimal wake-up time from custom time
function calculateFromCustom() {
    const bedtimeInput = document.getElementById('bedtime').value;
    if (!bedtimeInput) {
        showNotification('Please select a bedtime!', 'warning');
        return;
    }
    
    const timezoneSelect = document.getElementById('timezone-custom');
    const selectedTimezone = timezoneSelect ? timezoneSelect.value : 'local';
    
    const [hour, minute] = bedtimeInput.split(':').map(Number);
    calculateSleepTimes(hour, minute, 'custom-results', selectedTimezone);
}

// Core sleep time calculation function (based on Python code logic)
function calculateSleepTimes(hour, minute, resultElementId, timezone = 'local') {
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
    
    displayResults(results, resultElementId, timezone);
    
    // Show success notification
    showNotification('Calculation complete! We recommend choosing the highlighted wake-up time.', 'success');
}

// Display calculation results
function displayResults(results, elementId, timezone = 'local') {
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
    
    // Add sleep quality assessment
    const qualityAssessment = generateSleepQualityAssessment(results);
    html += qualityAssessment;
    
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

// Setup schedule mode switching
function setupScheduleMode() {
    const sameScheduleRadio = document.getElementById('same-schedule');
    const differentScheduleRadio = document.getElementById('different-schedule');
    const sameScheduleSettings = document.getElementById('same-schedule-settings');
    const differentScheduleSettings = document.getElementById('different-schedule-settings');
    
    if (sameScheduleRadio && differentScheduleRadio) {
        sameScheduleRadio.addEventListener('change', function() {
            if (this.checked) {
                sameScheduleSettings.style.display = 'block';
                differentScheduleSettings.style.display = 'none';
            }
        });
        
        differentScheduleRadio.addEventListener('change', function() {
            if (this.checked) {
                sameScheduleSettings.style.display = 'none';
                differentScheduleSettings.style.display = 'block';
            }
        });
    }
}

// Calculate sleep schedule analysis
function calculateSchedule() {
    const scheduleMode = document.querySelector('input[name="schedule-mode"]:checked').value;
    const timezoneSelect = document.getElementById('timezone-schedule');
    const selectedTimezone = timezoneSelect ? timezoneSelect.value : 'local';
    
    let scheduleData = {};
    
    if (scheduleMode === 'same') {
        const bedtime = document.getElementById('daily-bedtime').value;
        if (!bedtime) {
            showNotification('Please select a bedtime!', 'warning');
            return;
        }
        
        const [hour, minute] = bedtime.split(':').map(Number);
        scheduleData = {
            type: 'same',
            bedtime: { hour, minute },
            timezone: selectedTimezone
        };
    } else {
        const weekdayBedtime = document.getElementById('weekday-bedtime').value;
        const weekdayWake = document.getElementById('weekday-wake').value;
        const weekendBedtime = document.getElementById('weekend-bedtime').value;
        const weekendWake = document.getElementById('weekend-wake').value;
        
        if (!weekdayBedtime || !weekdayWake || !weekendBedtime || !weekendWake) {
            showNotification('Please fill in all time fields!', 'warning');
            return;
        }
        
        scheduleData = {
            type: 'different',
            weekday: {
                bedtime: weekdayBedtime.split(':').map(Number),
                wake: weekdayWake.split(':').map(Number)
            },
            weekend: {
                bedtime: weekendBedtime.split(':').map(Number),
                wake: weekendWake.split(':').map(Number)
            },
            timezone: selectedTimezone
        };
    }
    
    analyzeSchedule(scheduleData);
}

// Analyze sleep schedule and provide recommendations
function analyzeSchedule(scheduleData) {
    const resultElement = document.getElementById('schedule-results');
    let html = '';
    
    if (scheduleData.type === 'same') {
        // Calculate optimal wake times for consistent schedule
        const { hour, minute } = scheduleData.bedtime;
        const sleepTimes = calculateOptimalWakeTimes(hour, minute);
        
        html += '<h4>📊 Sleep Schedule Analysis</h4>';
        html += '<div class="sleep-quality-score">';
        html += '<div class="quality-score">85</div>';
        html += '<div class="quality-description">Good Consistency Score</div>';
        html += '<p>Consistent sleep schedule detected. This is excellent for your circadian rhythm!</p>';
        html += '</div>';
        
        html += '<h4>🌅 Recommended Wake Times:</h4>';
        sleepTimes.forEach((time, index) => {
            const recommendedClass = time.isRecommended ? ' recommended' : '';
            html += `
                <div class="result-item${recommendedClass}">
                    <div>
                        <div class="result-time">${time.time}${time.nextDay ? ' (next day)' : ''}</div>
                        <div class="result-cycles">${time.cycles} sleep cycles (${time.hours} hours of sleep)</div>
                    </div>
                </div>
            `;
        });
        
    } else {
        // Analyze different weekday/weekend schedule
        const weekdaySleep = calculateSleepDuration(scheduleData.weekday.bedtime, scheduleData.weekday.wake);
        const weekendSleep = calculateSleepDuration(scheduleData.weekend.bedtime, scheduleData.weekend.wake);
        
        const consistencyScore = calculateConsistencyScore(scheduleData);
        const qualityScore = calculateOverallQuality(weekdaySleep, weekendSleep, consistencyScore);
        
        html += '<h4>📊 Sleep Schedule Analysis</h4>';
        html += '<div class="sleep-quality-score">';
        html += `<div class="quality-score">${qualityScore}</div>`;
        html += `<div class="quality-description">${getQualityDescription(qualityScore)}</div>`;
        
        html += '<div class="quality-factors">';
        html += `
            <div class="quality-factor">
                <div class="factor-name">Weekday Sleep</div>
                <div class="factor-score">${weekdaySleep.toFixed(1)} hours</div>
            </div>
            <div class="quality-factor">
                <div class="factor-name">Weekend Sleep</div>
                <div class="factor-score">${weekendSleep.toFixed(1)} hours</div>
            </div>
            <div class="quality-factor">
                <div class="factor-name">Consistency</div>
                <div class="factor-score">${consistencyScore}/100</div>
            </div>
        `;
        html += '</div>';
        html += '</div>';
        
        // Add recommendations
        html += generateRecommendations(scheduleData, qualityScore);
    }
    
    resultElement.innerHTML = html;
    showNotification('Schedule analysis complete!', 'success');
}

// Calculate optimal wake times
function calculateOptimalWakeTimes(hour, minute) {
    // Add 15 minutes for falling asleep
    minute += 15;
    if (minute >= 60) {
        minute -= 60;
        hour += 1;
    }
    
    let totalMinutes = hour * 60 + minute;
    const results = [];
    
    for (let i = 0; i < 6; i++) {
        totalMinutes += 90;
        
        let wakeHour = Math.floor(totalMinutes / 60);
        let wakeMinute = totalMinutes % 60;
        
        let nextDay = false;
        if (wakeHour >= 24) {
            wakeHour -= 24;
            nextDay = true;
        }
        
        const timeString = `${wakeHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
        const cycleCount = i + 1;
        const sleepHours = (cycleCount * 90) / 60;
        
        results.push({
            time: timeString,
            cycles: cycleCount,
            hours: sleepHours.toFixed(1),
            isRecommended: i === 5,
            nextDay: nextDay
        });
    }
    
    return results;
}

// Calculate sleep duration in hours
function calculateSleepDuration(bedtime, waketime) {
    let bedMinutes = bedtime[0] * 60 + bedtime[1];
    let wakeMinutes = waketime[0] * 60 + waketime[1];
    
    // Handle next day wake time
    if (wakeMinutes < bedMinutes) {
        wakeMinutes += 24 * 60;
    }
    
    return (wakeMinutes - bedMinutes) / 60;
}

// Calculate consistency score
function calculateConsistencyScore(scheduleData) {
    const weekdayBed = scheduleData.weekday.bedtime[0] * 60 + scheduleData.weekday.bedtime[1];
    const weekendBed = scheduleData.weekend.bedtime[0] * 60 + scheduleData.weekend.bedtime[1];
    const weekdayWake = scheduleData.weekday.wake[0] * 60 + scheduleData.weekday.wake[1];
    const weekendWake = scheduleData.weekend.wake[0] * 60 + scheduleData.weekend.wake[1];
    
    const bedtimeDiff = Math.abs(weekdayBed - weekendBed);
    const waketimeDiff = Math.abs(weekdayWake - weekendWake);
    
    // Perfect score if difference is 0, decreases with larger differences
    const bedtimeScore = Math.max(0, 100 - (bedtimeDiff / 60) * 20);
    const waketimeScore = Math.max(0, 100 - (waketimeDiff / 60) * 20);
    
    return Math.round((bedtimeScore + waketimeScore) / 2);
}

// Calculate overall quality score
function calculateOverallQuality(weekdaySleep, weekendSleep, consistencyScore) {
    // Optimal sleep is 7-9 hours
    const weekdayScore = weekdaySleep >= 7 && weekdaySleep <= 9 ? 100 : Math.max(0, 100 - Math.abs(8 - weekdaySleep) * 15);
    const weekendScore = weekendSleep >= 7 && weekendSleep <= 9 ? 100 : Math.max(0, 100 - Math.abs(8 - weekendSleep) * 15);
    
    return Math.round((weekdayScore + weekendScore + consistencyScore) / 3);
}

// Get quality description based on score
function getQualityDescription(score) {
    if (score >= 90) return 'Excellent Sleep Quality';
    if (score >= 80) return 'Good Sleep Quality';
    if (score >= 70) return 'Fair Sleep Quality';
    if (score >= 60) return 'Poor Sleep Quality';
    return 'Very Poor Sleep Quality';
}

// Generate personalized recommendations
function generateRecommendations(scheduleData, qualityScore) {
    let html = '<div class="sleep-recommendations">';
    html += '<h4>💡 Personalized Recommendations</h4>';
    html += '<ul class="recommendations-list">';
    
    const weekdaySleep = calculateSleepDuration(scheduleData.weekday.bedtime, scheduleData.weekday.wake);
    const weekendSleep = calculateSleepDuration(scheduleData.weekend.bedtime, scheduleData.weekend.wake);
    const consistencyScore = calculateConsistencyScore(scheduleData);
    
    if (weekdaySleep < 7) {
        html += '<li>Try to get at least 7 hours of sleep on weekdays for better health and productivity</li>';
    }
    
    if (weekendSleep > 9) {
        html += '<li>Avoid oversleeping on weekends as it can disrupt your circadian rhythm</li>';
    }
    
    if (consistencyScore < 70) {
        html += '<li>Try to maintain more consistent sleep and wake times between weekdays and weekends</li>';
    }
    
    if (qualityScore < 80) {
        html += '<li>Consider creating a relaxing bedtime routine to improve sleep quality</li>';
        html += '<li>Avoid screens 1 hour before bedtime to improve melatonin production</li>';
    }
    
    html += '<li>Keep your bedroom cool (60-67°F) and dark for optimal sleep conditions</li>';
    html += '<li>Avoid caffeine 6 hours before bedtime</li>';
    
    html += '</ul>';
    html += '</div>';
    
    return html;
}

// Generate sleep quality assessment
function generateSleepQualityAssessment(results) {
    const recommendedResult = results.find(r => r.isRecommended);
    const sleepHours = parseFloat(recommendedResult.hours);
    
    // Calculate quality factors
    const durationScore = calculateDurationScore(sleepHours);
    const cycleScore = calculateCycleScore(recommendedResult.cycles);
    const timingScore = calculateTimingScore(recommendedResult.time);
    
    const overallScore = Math.round((durationScore + cycleScore + timingScore) / 3);
    
    let html = '<div class="sleep-quality-score">';
    html += `<div class="quality-score">${overallScore}</div>`;
    html += `<div class="quality-description">${getQualityDescription(overallScore)}</div>`;
    
    html += '<div class="quality-factors">';
    html += `
        <div class="quality-factor">
            <div class="factor-name">Sleep Duration</div>
            <div class="factor-score">${durationScore}/100</div>
        </div>
        <div class="quality-factor">
            <div class="factor-name">Sleep Cycles</div>
            <div class="factor-score">${cycleScore}/100</div>
        </div>
        <div class="quality-factor">
            <div class="factor-name">Wake Timing</div>
            <div class="factor-score">${timingScore}/100</div>
        </div>
    `;
    html += '</div>';
    
    // Add personalized tips
    html += generateSleepTips(sleepHours, overallScore);
    
    html += '</div>';
    
    return html;
}

// Calculate duration score (7-9 hours is optimal)
function calculateDurationScore(hours) {
    if (hours >= 7 && hours <= 9) {
        return 100;
    } else if (hours >= 6 && hours < 7) {
        return 80;
    } else if (hours >= 9 && hours <= 10) {
        return 85;
    } else if (hours >= 5 && hours < 6) {
        return 60;
    } else if (hours > 10 && hours <= 11) {
        return 70;
    } else {
        return 40;
    }
}

// Calculate cycle score (complete cycles are better)
function calculateCycleScore(cycles) {
    // 5-6 cycles are optimal
    if (cycles >= 5 && cycles <= 6) {
        return 100;
    } else if (cycles === 4) {
        return 80;
    } else if (cycles === 3) {
        return 60;
    } else {
        return 40;
    }
}

// Calculate timing score based on wake time
function calculateTimingScore(wakeTime) {
    const [hour, minute] = wakeTime.split(':').map(Number);
    const totalMinutes = hour * 60 + minute;
    
    // Optimal wake time is between 6:00-8:00 AM
    const optimalStart = 6 * 60; // 6:00 AM
    const optimalEnd = 8 * 60;   // 8:00 AM
    
    if (totalMinutes >= optimalStart && totalMinutes <= optimalEnd) {
        return 100;
    } else if (totalMinutes >= 5 * 60 && totalMinutes < optimalStart) {
        return 85; // 5:00-6:00 AM
    } else if (totalMinutes > optimalEnd && totalMinutes <= 9 * 60) {
        return 85; // 8:00-9:00 AM
    } else if (totalMinutes >= 4 * 60 && totalMinutes < 5 * 60) {
        return 70; // 4:00-5:00 AM
    } else if (totalMinutes > 9 * 60 && totalMinutes <= 10 * 60) {
        return 70; // 9:00-10:00 AM
    } else {
        return 50; // Other times
    }
}

// Generate personalized sleep tips
function generateSleepTips(sleepHours, overallScore) {
    let html = '<div class="sleep-recommendations">';
    html += '<h4>💡 Personalized Sleep Tips</h4>';
    html += '<ul class="recommendations-list">';
    
    if (sleepHours < 7) {
        html += '<li>You\'re getting less than the recommended 7-9 hours. Try going to bed 30 minutes earlier</li>';
    } else if (sleepHours > 9) {
        html += '<li>You might be oversleeping. Try waking up 30 minutes earlier to feel more energized</li>';
    }
    
    if (overallScore < 70) {
        html += '<li>Create a consistent bedtime routine to improve sleep quality</li>';
        html += '<li>Keep your bedroom temperature between 60-67°F (15-19°C)</li>';
    }
    
    if (overallScore >= 80) {
        html += '<li>Great sleep schedule! Maintain consistency for best results</li>';
    }
    
    html += '<li>Avoid blue light from screens 1 hour before bedtime</li>';
    html += '<li>Try meditation or deep breathing exercises before sleep</li>';
    
    html += '</ul>';
    html += '</div>';
    
    return html;
} 