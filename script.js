// ==================== INISIALISASI & STATE ====================
const DOM = {
    // Jam
    clockTime: document.getElementById('clock-time'),
    clockDate: document.getElementById('clock-date'),
    clockTimezoneLabel: document.getElementById('clock-timezone-label'),
    timezoneSelect: document.getElementById('timezone-select'),
    toggle12h: document.getElementById('toggle-12h'),
    clockColor: document.getElementById('clock-color'),

    // Alarm
    alarmHour: document.getElementById('alarm-hour'),
    alarmMinute: document.getElementById('alarm-minute'),
    alarmSet: document.getElementById('alarm-set'),
    alarmToggle: document.getElementById('alarm-toggle'),
    alarmStop: document.getElementById('alarm-stop'),
    alarmStatus: document.getElementById('alarm-status'),
    alarmNotification: document.getElementById('alarm-notification'),

    // Stopwatch
    stopwatchDisplay: document.getElementById('stopwatch-display'),
    stopwatchStart: document.getElementById('stopwatch-start'),
    stopwatchPause: document.getElementById('stopwatch-pause'),
    stopwatchReset: document.getElementById('stopwatch-reset'),

    // Countdown
    countdownHour: document.getElementById('countdown-hour'),
    countdownMinute: document.getElementById('countdown-minute'),
    countdownSecond: document.getElementById('countdown-second'),
    countdownDisplay: document.getElementById('countdown-display'),
    countdownStart: document.getElementById('countdown-start'),
    countdownReset: document.getElementById('countdown-reset'),
    countdownNotification: document.getElementById('countdown-notification'),

    // Settings
    darkmodeToggle: document.getElementById('darkmode-toggle'),
    audioTickToggle: document.getElementById('audio-tick-toggle'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
};

// State untuk jam
let currentTimezone = 'Asia/Jakarta';
let use12Hour = false;
let clockInterval;

// State untuk alarm
let alarmTime = { hour: 7, minute: 0 };
let alarmActive = false;
let alarmTriggered = false;
let alarmSoundInterval = null;

// State untuk stopwatch
let stopwatchRunning = false;
let stopwatchStartTime = 0;
let stopwatchElapsed = 0;
let stopwatchInterval = null;

// State untuk countdown
let countdownRunning = false;
let countdownTargetTime = 0;
let countdownInterval = null;
let countdownInitialSeconds = 0;

// Audio context
let audioCtx = null;

// Mapping zona ke label yang bagus
const timezoneLabels = {
    'Asia/Jakarta': 'WIB · Indonesia (Jakarta)',
    'Asia/Makassar': 'WITA · Indonesia (Makassar)',
    'Asia/Jayapura': 'WIT · Indonesia (Jayapura)',
    'UTC': 'UTC · Waktu Universal',
    'Asia/Tokyo': 'JST · Tokyo',
    'America/New_York': 'EST · New York'
};

// ==================== FUNGSI AUDIO ====================
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume jika suspended (dipanggil saat interaksi pertama)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(e => console.warn('Gagal resume audio:', e));
    }
    return audioCtx;
}

function playBeep(frequency = 800, duration = 50, volume = 0.2) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.start();
    osc.stop(audioCtx.currentTime + duration / 1000);
}

function playTickIfEnabled() {
    if (DOM.audioTickToggle.checked) {
        playBeep(600, 20, 0.1);
    }
}

function startAlarmSound() {
    if (alarmSoundInterval) clearInterval(alarmSoundInterval);
    initAudio(); // pastikan audio siap
    if (audioCtx && audioCtx.state === 'running') {
        alarmSoundInterval = setInterval(() => {
            playBeep(1000, 200, 0.3);
        }, 500);
    } else {
        // coba resume dulu
        if (audioCtx) {
            audioCtx.resume().then(() => {
                alarmSoundInterval = setInterval(() => {
                    playBeep(1000, 200, 0.3);
                }, 500);
            }).catch(() => {});
        }
    }
}

function stopAlarmSound() {
    if (alarmSoundInterval) {
        clearInterval(alarmSoundInterval);
        alarmSoundInterval = null;
    }
}

// ==================== FUNGSI BANTU ====================
function pad(num, size = 2) {
    return num.toString().padStart(size, '0');
}

// Mendapatkan waktu saat ini di zona tertentu
function getCurrentTimeInZone(timeZone) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { timeZone, hour12: false });
    const [hour, minute, second] = timeStr.split(':').map(Number);
    return { hour, minute, second, now };
}

// Update label zona waktu
function updateTimezoneLabel() {
    DOM.clockTimezoneLabel.textContent = timezoneLabels[currentTimezone] || currentTimezone;
}

// ==================== UPDATE JAM UTAMA ====================
function updateClock() {
    const { hour, minute, second, now } = getCurrentTimeInZone(currentTimezone);
    
    // Format jam
    let hourDisplay = hour;
    let ampm = '';
    if (use12Hour) {
        ampm = hour >= 12 ? ' PM' : ' AM';
        hourDisplay = hour % 12 || 12;
    }
    const timeString = `${pad(hourDisplay)}:${pad(minute)}:${pad(second)}${ampm}`;
    DOM.clockTime.textContent = timeString;

    // Efek glow
    DOM.clockTime.classList.add('glow');
    setTimeout(() => DOM.clockTime.classList.remove('glow'), 150);

    // Tanggal lengkap
    const dateString = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: currentTimezone
    });
    DOM.clockDate.textContent = dateString;

    // Cek alarm
    if (alarmActive && !alarmTriggered && hour === alarmTime.hour && minute === alarmTime.minute) {
        triggerAlarm();
    }

    // Tick
    playTickIfEnabled();
}

// ==================== ALARM ====================
function setAlarm() {
    const hour = parseInt(DOM.alarmHour.value, 10);
    const minute = parseInt(DOM.alarmMinute.value, 10);
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        alert('Jam atau menit tidak valid!');
        return;
    }
    alarmTime = { hour, minute };
    DOM.alarmStatus.textContent = `Alarm diset: ${pad(hour)}:${pad(minute)}`;
    DOM.alarmToggle.disabled = false;
    alarmTriggered = false;
    DOM.alarmNotification.classList.add('hidden');
    stopAlarmSound();
}

function toggleAlarm() {
    alarmActive = !alarmActive;
    DOM.alarmToggle.textContent = alarmActive ? 'Nonaktif' : 'Aktif';
    DOM.alarmStatus.textContent = alarmActive ? 'Alarm aktif' : 'Alarm nonaktif';
    if (!alarmActive) {
        alarmTriggered = false;
        DOM.alarmNotification.classList.add('hidden');
        stopAlarmSound();
    }
    // Siapkan audio jika user mengaktifkan alarm
    if (alarmActive) {
        initAudio();
    }
}

function stopAlarm() {
    alarmTriggered = false;
    DOM.alarmNotification.classList.add('hidden');
    stopAlarmSound();
}

function triggerAlarm() {
    if (!alarmActive || alarmTriggered) return;
    alarmTriggered = true;
    DOM.alarmNotification.classList.remove('hidden');
    startAlarmSound();
}

// ==================== STOPWATCH ====================
function updateStopwatch() {
    const now = Date.now();
    const elapsed = stopwatchElapsed + (stopwatchRunning ? now - stopwatchStartTime : 0);
    const totalMs = elapsed;
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);
    DOM.stopwatchDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(ms, 2)}`;
}

function startStopwatch() {
    if (stopwatchRunning) return;
    stopwatchRunning = true;
    stopwatchStartTime = Date.now();
    stopwatchInterval = setInterval(updateStopwatch, 10);
}

function pauseStopwatch() {
    if (!stopwatchRunning) return;
    stopwatchRunning = false;
    stopwatchElapsed += Date.now() - stopwatchStartTime;
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    updateStopwatch();
}

function resetStopwatch() {
    stopwatchRunning = false;
    stopwatchElapsed = 0;
    stopwatchStartTime = 0;
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    updateStopwatch();
}

// ==================== COUNTDOWN ====================
function updateCountdown() {
    if (!countdownRunning) return;
    const now = Date.now();
    const remaining = countdownTargetTime - now;
    if (remaining <= 0) {
        countdownRunning = false;
        clearInterval(countdownInterval);
        countdownInterval = null;
        DOM.countdownDisplay.textContent = '00:00:00';
        DOM.countdownNotification.classList.remove('hidden');
        // Bunyi notifikasi
        initAudio();
        if (audioCtx && audioCtx.state === 'running') {
            playBeep(1200, 500, 0.4);
        } else if (audioCtx) {
            audioCtx.resume().then(() => playBeep(1200, 500, 0.4));
        }
        return;
    }
    const totalSec = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    DOM.countdownDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function startCountdown() {
    // Jika sedang running, reset dulu
    if (countdownRunning) {
        resetCountdown();
    }
    const hour = parseInt(DOM.countdownHour.value, 10) || 0;
    const minute = parseInt(DOM.countdownMinute.value, 10) || 0;
    const second = parseInt(DOM.countdownSecond.value, 10) || 0;
    const totalSeconds = hour * 3600 + minute * 60 + second;
    if (totalSeconds <= 0) {
        alert('Masukkan waktu > 0');
        return;
    }
    countdownInitialSeconds = totalSeconds;
    countdownTargetTime = Date.now() + totalSeconds * 1000;
    countdownRunning = true;
    DOM.countdownNotification.classList.add('hidden');
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdown, 100);
    updateCountdown();

    initAudio(); // siapkan audio untuk notifikasi nanti
}

function resetCountdown() {
    countdownRunning = false;
    clearInterval(countdownInterval);
    countdownInterval = null;
    DOM.countdownDisplay.textContent = '00:00:00';
    DOM.countdownNotification.classList.add('hidden');
    DOM.countdownHour.value = 0;
    DOM.countdownMinute.value = 0;
    DOM.countdownSecond.value = 0;
}

// ==================== THEME & CUSTOM COLOR ====================
function toggleDarkMode() {
    const isDark = DOM.darkmodeToggle.checked;
    if (isDark) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    }
    localStorage.setItem('darkMode', isDark ? 'dark' : 'light');
}

function applyClockColor(color) {
    DOM.clockTime.style.color = color;
    localStorage.setItem('clockColor', color);
}

// ==================== FULLSCREEN ====================
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn('Fullscreen gagal:', err);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// ==================== INIT & EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi audio (masih suspended, akan aktif saat interaksi)
    initAudio();

    // Load preferensi
    const savedDark = localStorage.getItem('darkMode');
    if (savedDark === 'light') {
        DOM.darkmodeToggle.checked = false;
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    } else {
        DOM.darkmodeToggle.checked = true;
    }

    const savedColor = localStorage.getItem('clockColor');
    if (savedColor) {
        DOM.clockColor.value = savedColor;
        applyClockColor(savedColor);
    } else {
        applyClockColor(DOM.clockColor.value);
    }

    // Set label zona awal
    updateTimezoneLabel();

    // Event listeners untuk jam
    DOM.timezoneSelect.addEventListener('change', (e) => {
        currentTimezone = e.target.value;
        updateTimezoneLabel();
        updateClock();
    });
    DOM.toggle12h.addEventListener('change', (e) => {
        use12Hour = e.target.checked;
        updateClock();
    });
    DOM.clockColor.addEventListener('input', (e) => applyClockColor(e.target.value));

    // Alarm
    DOM.alarmSet.addEventListener('click', setAlarm);
    DOM.alarmToggle.addEventListener('click', toggleAlarm);
    DOM.alarmStop.addEventListener('click', stopAlarm);

    // Stopwatch
    DOM.stopwatchStart.addEventListener('click', startStopwatch);
    DOM.stopwatchPause.addEventListener('click', pauseStopwatch);
    DOM.stopwatchReset.addEventListener('click', resetStopwatch);

    // Countdown
    DOM.countdownStart.addEventListener('click', startCountdown);
    DOM.countdownReset.addEventListener('click', resetCountdown);

    // Settings
    DOM.darkmodeToggle.addEventListener('change', toggleDarkMode);
    DOM.fullscreenBtn.addEventListener('click', toggleFullscreen);
    DOM.audioTickToggle.addEventListener('change', () => {
        // Coba aktifkan audio jika di-check
        if (DOM.audioTickToggle.checked) {
            initAudio();
        }
    });

    // Mulai interval jam
    updateClock();
    clockInterval = setInterval(updateClock, 1000);

    // Bersihkan interval saat halaman ditutup
    window.addEventListener('beforeunload', () => {
        clearInterval(clockInterval);
        clearInterval(stopwatchInterval);
        clearInterval(countdownInterval);
        stopAlarmSound();
    });
});