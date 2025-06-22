// --- Sprite Animation Setup ---
const dancer = document.querySelector('#dancer');
const slotsPerRow = 7;
const frameWidth = 180.615; // 120.41 * 1.5
const frameHeight = 447.21; // 298.14 * 1.5
const frameIndices = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13];
const totalFrames = frameIndices.length;
let frameProgress = 0;
const scrollSensitivity = 0.04;
const maxStepPerEvent = 2;

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function getFrameBackgroundPosition(frame) {
    const idx = ((frame % totalFrames) + totalFrames) % totalFrames;
    const spriteIndex = frameIndices[idx];
    let x = (spriteIndex % slotsPerRow) * frameWidth;
    const y = Math.floor(spriteIndex / slotsPerRow) * frameHeight;
    if (idx === 3) {
        x += 5;
    }
    return `-${x}px -${y}px`;
}

function setFrame(frame) {
    anime.set(dancer, {backgroundPosition: getFrameBackgroundPosition(frame)});
}

// --- Mouse Wheel Support ---
window.addEventListener('wheel', (event) => {
    event.preventDefault();
    let delta = event.deltaY * scrollSensitivity;
    delta = clamp(delta, -maxStepPerEvent, maxStepPerEvent);
    frameProgress += delta;
    const frame = Math.round(frameProgress);
    setFrame(frame);
}, { passive: false });

// --- Touch Support ---
let lastTouchY = null;
window.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) {
        lastTouchY = event.touches[0].clientY;
    }
}, { passive: false });
window.addEventListener('touchmove', (event) => {
    if (event.touches.length === 1 && lastTouchY !== null) {
        const currentY = event.touches[0].clientY;
        const deltaY = lastTouchY - currentY;
        lastTouchY = currentY;
        let delta = deltaY * scrollSensitivity * 1.5;
        delta = clamp(delta, -maxStepPerEvent, maxStepPerEvent);
        frameProgress += delta;
        const frame = Math.round(frameProgress);
        setFrame(frame);
        event.preventDefault();
    }
}, { passive: false });
window.addEventListener('touchend', () => {
    lastTouchY = null;
}, { passive: false });

// --- Pink Glow Animation ---
let glowStarted = false;
function startGlowAndShadow() {
    if (!glowStarted) {
        glowStarted = true;
        const glow = document.getElementById('dancer-glow');
        const shadow = document.getElementById('dancer-shadow');
        if (glow) glow.classList.add('active');
        if (shadow) shadow.style.opacity = 0;
        anime({
            targets: {progress: 0},
            progress: 1,
            duration: 2400,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine',
            update: function(anim) {
                const t = anim.animations[0].currentValue;
                const pink = 0.5 + 0.5 * Math.sin(t * Math.PI);
                if (glow) glow.style.opacity = pink;
            }
        });
    }
}

// --- Musik-Button und Musik-Start ---
const musicBtn = document.getElementById('music-btn');
let musicStarted = false;
const sound = new Howl({
    src: ['C-Walk Instrumental - Kurupt.mp3'],
    loop: true,
    volume: 1,
    onplayerror: function(id, err) {
        console.error('Howler play error:', err);
        sound.once('unlock', function() {
            sound.play();
        });
    }
});

function startMusicAndHideButton() {
    if (!musicStarted) {
        sound.mute(false);
        sound.volume(1);
        sound.play();
        musicStarted = true;
        startGlowAndShadow();
        if (musicBtn) {
            musicBtn.classList.add('disappear');
            setTimeout(() => {
                musicBtn.remove();
                // Text-SVG einblenden und animieren
                const textSvg = document.getElementById('text-svg');
                if (textSvg) {
                    textSvg.style.display = 'block';
                    setTimeout(() => {
                        textSvg.classList.add('visible');
                        setTimeout(() => {
                            textSvg.classList.add('animate-up');
                            // Nach der Animation das Text-SVG ausblenden
                            setTimeout(() => {
                                textSvg.style.display = 'none';
                            }, 3700); // 3.5s Animation + etwas Puffer
                        }, 400);
                    }, 10);
                }
            }, 400);
        }
    }
}
if (musicBtn) {
    musicBtn.addEventListener('click', startMusicAndHideButton);
}

// --- Initial Frame anzeigen ---
setFrame(0); 