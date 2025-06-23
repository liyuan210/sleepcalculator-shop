// 睡眠计算器 JavaScript 代码
// 基于 90 分钟睡眠周期算法

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000); // 每秒更新时间
    setupTabs();
    setupSmoothScroll();
});

// 更新当前时间显示
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    const timeDisplay = document.getElementById('current-time-display');
    if (timeDisplay) {
        timeDisplay.textContent = timeString;
    }
}

// 设置标签页切换功能
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // 移除所有活动状态
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // 添加活动状态
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// 设置平滑滚动
function setupSmoothScroll() {
    // 处理导航链接的平滑滚动
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

// 从当前时间计算最佳起床时间
function calculateFromNow() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    calculateSleepTimes(hour, minute, 'now-results');
}

// 从自定义时间计算最佳起床时间
function calculateFromCustom() {
    const bedtimeInput = document.getElementById('bedtime').value;
    if (!bedtimeInput) {
        showNotification('请选择睡觉时间！', 'warning');
        return;
    }
    
    const [hour, minute] = bedtimeInput.split(':').map(Number);
    calculateSleepTimes(hour, minute, 'custom-results');
}

// 核心睡眠时间计算函数（基于 Python 代码逻辑）
function calculateSleepTimes(hour, minute, resultElementId) {
    // 添加 15 分钟入睡时间
    minute += 15;
    if (minute >= 60) {
        minute -= 60;
        hour += 1;
    }
    
    // 转换为总分钟数
    let totalMinutes = hour * 60 + minute;
    
    const results = [];
    
    // 计算 6 个睡眠周期（每个 90 分钟）
    for (let i = 0; i < 6; i++) {
        totalMinutes += 90; // 添加一个睡眠周期
        
        let wakeHour = Math.floor(totalMinutes / 60);
        let wakeMinute = totalMinutes % 60;
        
        // 处理跨天情况
        let nextDay = false;
        if (wakeHour >= 24) {
            wakeHour -= 24;
            nextDay = true;
        }
        
        // 格式化时间显示
        const timeString = `${wakeHour.toString().padStart(2, '0')}:${wakeMinute.toString().padStart(2, '0')}`;
        const cycleCount = i + 1;
        const sleepHours = (cycleCount * 90) / 60;
        
        results.push({
            time: timeString,
            cycles: cycleCount,
            hours: sleepHours.toFixed(1),
            isRecommended: i === 5, // 最后一个是推荐的
            nextDay: nextDay
        });
    }
    
    displayResults(results, resultElementId);
    
    // 显示成功通知
    showNotification('计算完成！建议选择推荐的起床时间。', 'success');
}

// 显示计算结果
function displayResults(results, elementId) {
    const resultElement = document.getElementById(elementId);
    
    let html = '<h4>🌅 最佳起床时间：</h4>';
    
    results.forEach((result, index) => {
        const recommendedClass = result.isRecommended ? ' recommended' : '';
        const nextDayText = result.nextDay ? ' 次日' : '';
        
        html += `
            <div class="result-item${recommendedClass}">
                <div>
                    <div class="result-time">${result.time}${nextDayText}</div>
                    <div class="result-cycles">${result.cycles} 个睡眠周期 (${result.hours} 小时睡眠)</div>
                </div>
            </div>
        `;
    });
    
    html += '<p style="margin-top: 20px; color: #718096; font-style: italic; text-align: center;">💡 建议选择最后一个时间点起床，效果最佳！</p>';
    
    resultElement.innerHTML = html;
    
    // 添加动画效果
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

// 显示通知消息
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 样式
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
    
    // 根据类型设置颜色
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
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
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

// 格式化时间显示
function formatTime(hour, minute) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// 添加页面滚动效果
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

// 添加键盘支持
document.addEventListener('keydown', function(e) {
    // Enter 键触发计算
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
}); 