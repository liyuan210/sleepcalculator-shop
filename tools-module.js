/**
 * Tools Module
 * - Reverse bedtime calculator
 * - LocalStorage persistence for tools page
 * - Global functions to unify logic and reduce inline duplication
 */

// Utilities
function toTimeString(date) {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function parseTimeToDate(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function minutesDiff(fromDate, minutes) {
  const d = new Date(fromDate);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

// LocalStorage helpers
function saveInputValue(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const tag = el.tagName.toLowerCase();
  let value = '';
  if (tag === 'input' || tag === 'select' || tag === 'textarea') {
    value = el.value;
  }
  try {
    localStorage.setItem('tools:' + id, value);
  } catch (_) {}
}

function loadInputValue(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const value = localStorage.getItem('tools:' + id);
  if (value !== null) {
    el.value = value;
  }
}

// Attach persistence listeners
function enablePersistence(ids) {
  ids.forEach(id => {
    loadInputValue(id);
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => saveInputValue(id));
    el.addEventListener('input', () => saveInputValue(id));
  });
}

// Global functions for Tools page
function toolsCalculateSleepTime() {
  const mode = document.getElementById('sleepMode').value;
  let bedTime;

  if (mode === 'now') {
    bedTime = new Date();
    bedTime.setMinutes(bedTime.getMinutes() + 15);
  } else {
    const timeInput = document.getElementById('sleepTime').value;
    if (!timeInput) {
      showNotification && showNotification('请选择就寝时间', 'warning');
      return;
    }
    const [hours, minutes] = timeInput.split(':').map(Number);
    bedTime = new Date();
    bedTime.setHours(hours, minutes + 15, 0, 0);
  }

  let timesHtml = '<h4>推荐起床时间：</h4>';
  for (let i = 1; i <= 6; i++) {
    const wakeTime = minutesDiff(bedTime, i * 90);
    const timeStr = toTimeString(wakeTime);
    const isRecommended = i === 6;
    timesHtml += '<div style="padding: 10px; margin: 5px 0; background: ' + (isRecommended ? '#f0fff4' : '#fff') + '; border-radius: 8px; border: 2px solid ' + (isRecommended ? '#48bb78' : '#e2e8f0') + ';"><strong>' + timeStr + '</strong> (' + (i * 1.5) + ' 小时)' + (isRecommended ? ' <span style="color: #48bb78;">推荐</span>' : '') + '</div>';
  }

  const result = document.getElementById('sleepTimes');
  const box = document.getElementById('sleepResult');
  if (result && box) {
    result.innerHTML = timesHtml;
    box.style.display = 'block';
  }
}

function toolsAssessSleepQuality() {
  const fallAsleep = parseInt(document.getElementById('fallAsleepTime').value);
  const wakeups = parseInt(document.getElementById('nightWakeups').value);
  const feeling = document.getElementById('morningFeeling').value;

  let score = 100;
  if (fallAsleep > 15) score -= (fallAsleep - 15);
  score -= wakeups * 15;

  switch (feeling) {
    case 'good': score -= 10; break;
    case 'fair': score -= 20; break;
    case 'poor': score -= 30; break;
  }

  score = Math.max(0, score);

  const level = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 55 ? 'Fair' : 'Poor';
  const advice = score >= 85 ? 'Your sleep quality is excellent!' :
                 score >= 70 ? 'Good sleep quality, with room for improvement.' :
                 score >= 55 ? 'There\'s room for improvement. Consider adjusting your sleep routine.' :
                               'We recommend consulting a doctor to improve your sleep habits.';

  const el = document.getElementById('qualityScore');
  const box = document.getElementById('qualityResult');
  if (el && box) {
    el.innerHTML = '<h4>Sleep Quality: ' + level + ' (' + score + ' points)</h4><p>' + advice + '</p>';
    box.style.display = 'block';
  }
}

function toolsCheckEnvironment() {
  const temp = document.getElementById('roomTemp').value;
  const noise = document.getElementById('noiseLevel').value;
  const light = document.getElementById('lightLevel').value;

  let score = 0;
  const suggestions = [];

  if (temp === 'optimal') score += 33;
  else suggestions.push('Adjust room temperature to 18-22°C');

  if (noise === 'quiet') score += 33;
  else suggestions.push('Reduce noise interference');

  if (light === 'dark') score += 34;
  else suggestions.push('Use blackout curtains');

  const level = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs Improvement';
  let resultHtml = '<h4>Environment Score: ' + level + ' (' + score + ' points)</h4>';
  if (suggestions.length > 0) {
    resultHtml += '<p><strong>Improvement Suggestions:</strong><br>• ' + suggestions.join('<br>• ') + '</p>';
  }

  const el = document.getElementById('environmentScore');
  const box = document.getElementById('environmentResult');
  if (el && box) {
    el.innerHTML = resultHtml;
    box.style.display = 'block';
  }
}

// Reverse bedtime calculator
function calculateBedtimeTool() {
  const wakeStr = document.getElementById('reverseWakeTime').value;
  const mode = document.getElementById('reverseMode').value;
  const fallMinutes = parseInt(document.getElementById('reverseFallAsleep').value) || 15;

  if (!wakeStr) {
    showNotification && showNotification('请输入目标起床时间', 'warning');
    return;
  }

  const wakeDate = parseTimeToDate(wakeStr);

  let bedtimes = [];

  if (mode === 'cycles') {
    const cycles = parseInt(document.getElementById('reverseCycles').value) || 5;
    // 显示从3到6个周期的多组建议，围绕选择值
    const options = [Math.max(3, cycles - 1), cycles, Math.min(6, cycles + 1)];
    const unique = Array.from(new Set(options)).sort((a,b)=>a-b);
    unique.forEach(c => {
      const totalBack = c * 90 + fallMinutes;
      const bedtime = minutesDiff(wakeDate, -totalBack);
      bedtimes.push({
        label: `${c} 个睡眠周期（${(c*1.5).toFixed(1)} 小时）`,
        time: toTimeString(bedtime)
      });
    });
  } else {
    const hours = parseFloat(document.getElementById('desiredSleepHours').value) || 7.5;
    const totalBack = Math.round(hours * 60) + fallMinutes;
    const bedtime = minutesDiff(wakeDate, -totalBack);
    bedtimes.push({
      label: `${hours.toFixed(1)} 小时睡眠`,
      time: toTimeString(bedtime)
    });
    // 额外给出 7.0 / 8.0 小时参考
    [7.0, 8.0].forEach(h => {
      const tb = Math.round(h * 60) + fallMinutes;
      const bt = minutesDiff(wakeDate, -tb);
      bedtimes.push({
        label: `${h.toFixed(1)} 小时睡眠`,
        time: toTimeString(bt)
      });
    });
  }

  let html = '<h4>推荐就寝时间：</h4>';
  bedtimes.forEach((b, i) => {
    const recommended = i === 1; // 中间项作为推荐
    html += '<div style="padding: 10px; margin: 5px 0; background: ' + (recommended ? '#f0fff4' : '#fff') + '; border-radius: 8px; border: 2px solid ' + (recommended ? '#48bb78' : '#e2e8f0') + ';"><strong>' + b.time + '</strong>（' + b.label + '）' + (recommended ? ' <span style="color: #48bb78;">推荐</span>' : '') + '</div>';
  });

  const el = document.getElementById('reverseTimes');
  const box = document.getElementById('reverseResult');
  if (el && box) {
    el.innerHTML = html;
    box.style.display = 'block';
  }
}

// Toggle controls based on reverse mode
function setupReverseModeToggle() {
  const modeSel = document.getElementById('reverseMode');
  const cyclesSel = document.getElementById('reverseCycles');
  const hoursInput = document.getElementById('desiredSleepHours');
  if (!modeSel) return;

  const update = () => {
    if (modeSel.value === 'cycles') {
      if (cyclesSel) cyclesSel.style.display = '';
      if (hoursInput) hoursInput.style.display = 'none';
    } else {
      if (cyclesSel) cyclesSel.style.display = 'none';
      if (hoursInput) hoursInput.style.display = '';
    }
  };

  modeSel.addEventListener('change', update);
  update();
}

// Init
function initToolsModule() {
  // Persistence
  enablePersistence([
    'sleepMode','sleepTime',
    'fallAsleepTime','nightWakeups','morningFeeling',
    'bedTime','wakeTime','fallAsleepDuration',
    'reverseWakeTime','reverseMode','reverseCycles','desiredSleepHours','reverseFallAsleep'
  ]);

  // Hook mobile menu from global script if present
  if (typeof setupMobileMenu === 'function') {
    setupMobileMenu();
  }

  // Reverse calculator mode toggle
  setupReverseModeToggle();
}

document.addEventListener('DOMContentLoaded', initToolsModule);